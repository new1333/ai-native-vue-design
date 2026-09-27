/**
 * useSplitter —— Splitter 的尺寸状态机 composable（headless）。
 *
 * 收口四类逻辑，保持 Splitter.vue 薄：
 *   1. 尺寸模型：面板尺寸为百分比（0-100）、总和恒为 100；受控（modelValue）/
 *      非受控两态，外部值经 normalize（长度与合法性校验 + 归一化）后采纳；
 *      面板数量由 Splitter 在渲染函数中经 syncPaneCount 同步（仅数量变化时
 *      重建尺寸），保证 SSR 首屏与动态增删面板时尺寸即时正确；
 *   2. 约束求解：相邻两面板成对调整（总和不变）时按双方 min/max clamp，
 *      可折叠面板在拖拽越过吸附阈值时折叠为 0 / 拖回时展开；
 *   3. 交互：指针拖拽（px → 百分比按容器主轴尺寸换算，ResizeObserver 缓存）+
 *      键盘（WAI-ARIA window splitter：方向键 / Home / End / Enter 折叠切换）；
 *   4. 事件：尺寸变化回调（update:modelValue + resize 同载荷）与
 *      折叠转变回调（collapse，0 ↔ 非 0 边沿触发）。
 *
 * SSR 安全：setup 与模块顶层不访问任何浏览器 API；ResizeObserver 只在
 * onMounted 建立、onBeforeUnmount 断开；拖拽的 window 监听只会在客户端
 * 事件回调（pointerdown）中挂载，并在 pointerup / 卸载时移除。
 */
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import {
  SPLITTER_COLLAPSE_KEY,
  SPLITTER_COLLAPSIBLE_DEFAULT,
  SPLITTER_COLLAPSE_SNAP_FACTOR,
  SPLITTER_END_KEY,
  SPLITTER_HOME_KEY,
  SPLITTER_KEYS_HORIZONTAL,
  SPLITTER_KEYS_VERTICAL,
  SPLITTER_MAX_DEFAULT,
  SPLITTER_MIN_DEFAULT,
  SPLITTER_SIZE_EPSILON,
  SPLITTER_SNAP_THRESHOLD_PERCENT,
  SPLITTER_STEP_PERCENT,
} from './Splitter.constants'
import type { SplitterCollapsePayload, SplitterDirection, SplitterPaneSpec } from './Splitter.types'

/** useSplitter 选项。 */
export interface UseSplitterOptions {
  /** 分割方向（响应式）。 */
  direction: MaybeRefOrGetter<SplitterDirection>
  /** 生效约束（按 panes prop 归一，可短于面板数；越界索引回退缺省约束）。 */
  specs: MaybeRefOrGetter<SplitterPaneSpec[]>
  /** 受控尺寸（百分比数组）；undefined 为非受控。 */
  modelValue: MaybeRefOrGetter<number[] | undefined>
  /** 根元素 getter（供 ResizeObserver 与拖拽测量；仅客户端事件/生命周期内调用）。 */
  getRoot: () => HTMLElement | null
  /** 尺寸变更回调（emit update:modelValue + resize）。 */
  onChange: (sizes: number[]) => void
  /** 折叠状态转变回调（emit collapse）。 */
  onCollapse: (payload: SplitterCollapsePayload) => void
}

/** 单个分隔条的 aria 位置契约（role=separator 的取值）。 */
export interface SplitterHandleAria {
  /** 当前位置（主面板尺寸百分比，四舍五入整数）。 */
  'aria-valuenow': number
  /** 最小位置（主面板生效 min）。 */
  'aria-valuemin': number
  /** 最大位置（主面板在相邻面板约束内的生效 max）。 */
  'aria-valuemax': number
  /** 位置文本（`n%`）。 */
  'aria-valuetext': string
}

/** useSplitter 返回值。 */
export interface UseSplitterReturn {
  /** 当前各面板尺寸（百分比，总和 100）。 */
  sizes: Ref<number[]>
  /** 正在拖拽的分隔条序号；非拖拽时为 null。 */
  draggingHandle: Ref<number | null>
  /** 面板是否折叠（尺寸为 0）。 */
  isCollapsed: (index: number) => boolean
  /**
   * 渲染期同步面板数量（由 Splitter 渲染函数调用）：仅数量变化时按受控值
   * 重建尺寸，同一渲染轮次内即时生效（SSR 首屏正确；写入被数量守卫，
   * 恰好一轮额外渲染后收敛，无循环）。
   */
  syncPaneCount: (count: number) => void
  /** 分隔条 handleIndex 的 aria 位置契约（主面板 = 其前面板）。 */
  handleAria: (handleIndex: number) => SplitterHandleAria
  /** 拖拽入口：分隔条 pointerdown（内含 window 监听挂载与清理）。 */
  onHandlePointerDown: (handleIndex: number, event: PointerEvent) => void
  /** 键盘入口：分隔条 keydown（方向键 / Home / End / Enter）。 */
  onHandleKeydown: (handleIndex: number, event: KeyboardEvent) => void
}

export function useSplitter(options: UseSplitterOptions): UseSplitterReturn {
  const sizes = ref<number[]>([])
  const draggingHandle = ref<number | null>(null)
  /** 容器主轴尺寸（px）缓存；0 表示尚未测得。 */
  const containerExtent = ref(0)
  /** 面板数量（由渲染期 syncPaneCount 维护）。 */
  const paneCount = ref(0)

  /** 折叠前面板尺寸备忘（APG：Enter 展开时恢复折叠前的位置）。 */
  const restoreSizes = new Map<number, number>()

  let resizeObserver: ResizeObserver | undefined
  let dragStartPointer = 0
  let dragStartSizes: number[] = []

  // ── 尺寸模型 ──────────────────────────────────────────────

  function equalSizes(count: number): number[] {
    return count <= 0 ? [] : Array.from({ length: count }, () => 100 / count)
  }

  /** 校正外部尺寸：缺省 / 长度不符 / 含非法值时回退均分；总和归一为 100（0 项保持 0）。 */
  function normalize(input: readonly number[] | undefined, count: number): number[] {
    const valid =
      input !== undefined &&
      input.length === count &&
      input.every((value) => Number.isFinite(value) && value >= 0)
    const source = valid ? [...input] : equalSizes(count)
    const sum = source.reduce((acc, value) => acc + value, 0)
    if (sum <= SPLITTER_SIZE_EPSILON) return equalSizes(count)
    return source.map((value) => (value / sum) * 100)
  }

  function sizesEqual(a: readonly number[], b: readonly number[]): boolean {
    return (
      a.length === b.length &&
      a.every((value, index) => Math.abs(value - (b[index] ?? NaN)) <= SPLITTER_SIZE_EPSILON)
    )
  }

  function adopt(external: readonly number[] | undefined): void {
    const next = normalize(external, paneCount.value)
    if (!sizesEqual(next, sizes.value)) sizes.value = next
  }

  adopt(toValue(options.modelValue))

  watch(
    () => toValue(options.modelValue),
    (external) => {
      // 拖拽中以本地状态为准，不采纳外部值；pointerup 后由最终值自然对齐。
      if (draggingHandle.value === null) adopt(external)
    },
  )

  // ── 约束求解 ──────────────────────────────────────────────

  function specAt(index: number): SplitterPaneSpec {
    return (
      toValue(options.specs)[index] ?? {
        min: SPLITTER_MIN_DEFAULT,
        max: SPLITTER_MAX_DEFAULT,
        collapsible: SPLITTER_COLLAPSIBLE_DEFAULT,
      }
    )
  }

  function isCollapsed(index: number): boolean {
    return (sizes.value[index] ?? 0) <= SPLITTER_SIZE_EPSILON
  }

  function syncPaneCount(count: number): void {
    if (paneCount.value === count) return
    paneCount.value = count
    // 数量变化（增删 SplitterPane）：按受控值重建尺寸（非受控回退均分）。
    adopt(toValue(options.modelValue))
  }

  /** 折叠吸附阈值：min 的一半；min 为 0 时用固定小阈值。 */
  function collapseThreshold(spec: SplitterPaneSpec): number {
    return spec.min > 0 ? spec.min * SPLITTER_COLLAPSE_SNAP_FACTOR : SPLITTER_SNAP_THRESHOLD_PERCENT
  }

  /**
   * 成对调整的取值域：handle h 两侧面板 A（前）/ B（后）总和不变，
   * A 的目标值 ∈ [lo, hi]。已折叠面板不参与 min 约束（允许停在 0），
   * 展开时由 clamp 落到双方约束内。
   */
  function pairBounds(handleIndex: number, total: number): { lo: number; hi: number } {
    const specA = specAt(handleIndex)
    const specB = specAt(handleIndex + 1)
    const minA = isCollapsed(handleIndex) ? 0 : specA.min
    const minB = isCollapsed(handleIndex + 1) ? 0 : specB.min
    const lo = Math.max(minA, total - specB.max)
    const hi = Math.min(specA.max, total - minB)
    // min/max 配置冲突（lo > hi）时收敛到 minA，避免越界抖动。
    if (lo > hi) {
      const settled = Math.min(minA, total)
      return { lo: settled, hi: settled }
    }
    return { lo, hi }
  }

  function commit(next: number[]): void {
    const prev = sizes.value
    if (sizesEqual(prev, next)) return
    const transitions: SplitterCollapsePayload[] = []
    for (let i = 0; i < Math.min(prev.length, next.length); i += 1) {
      const wasCollapsed = (prev[i] ?? 0) <= SPLITTER_SIZE_EPSILON
      const nowCollapsed = (next[i] ?? 0) <= SPLITTER_SIZE_EPSILON
      if (!wasCollapsed && nowCollapsed) {
        if (!restoreSizes.has(i)) restoreSizes.set(i, prev[i] ?? 0)
        transitions.push({ index: i, collapsed: true })
      } else if (wasCollapsed && !nowCollapsed) {
        restoreSizes.delete(i)
        transitions.push({ index: i, collapsed: false })
      }
    }
    sizes.value = next
    for (const payload of transitions) options.onCollapse(payload)
    options.onChange(next)
  }

  function commitPair(handleIndex: number, sizeA: number, sizeB: number): void {
    const next = [...sizes.value]
    next[handleIndex] = sizeA
    next[handleIndex + 1] = sizeB
    commit(next)
  }

  /**
   * 成对调整：handle h 移动 deltaPercent（正 = 主面板 A 增大、B 减小）。
   * snap = true（拖拽路径）启用折叠吸附；键盘路径 snap = false（精确调整）。
   */
  function applyPair(handleIndex: number, base: readonly number[], deltaPercent: number, snap: boolean): void {
    const specA = specAt(handleIndex)
    const specB = specAt(handleIndex + 1)
    const total = (base[handleIndex] ?? 0) + (base[handleIndex + 1] ?? 0)
    const nextA = (base[handleIndex] ?? 0) + deltaPercent

    if (snap) {
      // 主面板拖向折叠：越过吸附阈值 → 折叠为 0，空间全部让给 B。
      if (specA.collapsible && deltaPercent < 0 && nextA < collapseThreshold(specA)) {
        commitPair(handleIndex, 0, total)
        return
      }
      // 次面板被压向折叠：越过吸附阈值 → 折叠为 0，空间全部给 A。
      if (specB.collapsible && deltaPercent > 0 && total - nextA < collapseThreshold(specB)) {
        commitPair(handleIndex, total, 0)
        return
      }
    }
    const { lo, hi } = pairBounds(handleIndex, total)
    const clamped = Math.min(Math.max(nextA, lo), hi)
    commitPair(handleIndex, clamped, total - clamped)
  }

  /**
   * Enter 折叠 / 恢复主面板（APG window splitter）：主面板可折叠才生效；
   * 已折叠时恢复到折叠前位置（无备忘时回退为 min 与均分中的较大者），
   * 恢复空间取自相邻次面板（受其约束，空间不足时部分展开）。
   */
  function toggleCollapse(handleIndex: number): void {
    const specA = specAt(handleIndex)
    if (!specA.collapsible) return
    if (isCollapsed(handleIndex)) {
      const count = Math.max(paneCount.value, 1)
      const restore = restoreSizes.get(handleIndex) ?? Math.max(specA.min, 100 / count)
      applyPair(handleIndex, sizes.value, restore, false)
    } else {
      collapsePane(handleIndex)
    }
  }

  /**
   * 折叠面板 index：尺寸清 0；腾出的空间优先让给相邻伙伴（受其 max 约束），
   * 余量均摊给其余未折叠面板（同样受 max 约束），最终残余并入伙伴，
   * 保证总和恒为 100（极端 max 配置下可能突破伙伴 max，优先保证布局完整）。
   */
  function collapsePane(index: number): void {
    const current = [...sizes.value]
    const freed = current[index] ?? 0
    if (freed <= SPLITTER_SIZE_EPSILON) return
    restoreSizes.set(index, freed)
    current[index] = 0

    const partner = index + 1 < current.length ? index + 1 : index - 1
    if (partner < 0) {
      commit(current)
      return
    }
    const capacity = Math.max(0, specAt(partner).max - (current[partner] ?? 0))
    const give = Math.min(freed, capacity)
    current[partner] = (current[partner] ?? 0) + give
    let rest = freed - give
    if (rest > SPLITTER_SIZE_EPSILON) {
      const receivers: number[] = []
      current.forEach((size, i) => {
        if (i !== index && i !== partner && size > SPLITTER_SIZE_EPSILON) receivers.push(i)
      })
      if (receivers.length > 0) {
        const share = rest / receivers.length
        for (const i of receivers) current[i] = (current[i] ?? 0) + share
        rest = 0
      }
      if (rest > SPLITTER_SIZE_EPSILON) current[partner] = (current[partner] ?? 0) + rest
    }
    commit(current)
  }

  // ── 键盘（WAI-ARIA window splitter）────────────────────────

  function onHandleKeydown(handleIndex: number, event: KeyboardEvent): void {
    const keys =
      toValue(options.direction) === 'vertical' ? SPLITTER_KEYS_VERTICAL : SPLITTER_KEYS_HORIZONTAL
    const base = sizes.value

    if (event.key === keys.decrease || event.key === keys.increase) {
      event.preventDefault()
      const delta = event.key === keys.decrease ? -SPLITTER_STEP_PERCENT : SPLITTER_STEP_PERCENT
      applyPair(handleIndex, base, delta, false)
      return
    }
    if (event.key === SPLITTER_HOME_KEY || event.key === SPLITTER_END_KEY) {
      event.preventDefault()
      const total = (base[handleIndex] ?? 0) + (base[handleIndex + 1] ?? 0)
      const { lo, hi } = pairBounds(handleIndex, total)
      const target = event.key === SPLITTER_HOME_KEY ? lo : hi
      applyPair(handleIndex, base, target - (base[handleIndex] ?? 0), false)
      return
    }
    if (event.key === SPLITTER_COLLAPSE_KEY) {
      event.preventDefault()
      toggleCollapse(handleIndex)
    }
  }

  // ── 拖拽（pointer）─────────────────────────────────────────

  /** 读取并缓存容器主轴尺寸（拖拽 px → % 的换算基准；仅客户端事件路径调用）。 */
  function ensureExtent(): number {
    if (containerExtent.value > SPLITTER_SIZE_EPSILON) return containerExtent.value
    const root = options.getRoot()
    if (!root) return 0
    const rect = root.getBoundingClientRect()
    const extent = toValue(options.direction) === 'vertical' ? rect.height : rect.width
    containerExtent.value = extent
    return extent
  }

  function removeDragListeners(): void {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  }

  function onPointerMove(event: PointerEvent): void {
    const handle = draggingHandle.value
    if (handle === null) return
    const current =
      toValue(options.direction) === 'vertical' ? event.clientY : event.clientX
    const extent = containerExtent.value
    const deltaPercent =
      extent > SPLITTER_SIZE_EPSILON ? ((current - dragStartPointer) / extent) * 100 : 0
    applyPair(handle, dragStartSizes, deltaPercent, true)
  }

  function onPointerUp(): void {
    if (draggingHandle.value === null) return
    draggingHandle.value = null
    removeDragListeners()
  }

  function onHandlePointerDown(handleIndex: number, event: PointerEvent): void {
    if (draggingHandle.value !== null) return
    // 仅响应主键（鼠标左键 / 触摸 / 笔），右键不做拖拽。
    if (event.pointerType === 'mouse' && event.button !== 0) return
    ensureExtent()
    dragStartPointer =
      toValue(options.direction) === 'vertical' ? event.clientY : event.clientX
    dragStartSizes = [...sizes.value]
    draggingHandle.value = handleIndex
    // 全程监听挂在 window：指针移出分隔条仍持续跟踪；up/cancel 后移除。
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    // 阻止拖拽选中文本等默认行为。
    event.preventDefault()
  }

  // ── aria 位置契约 ─────────────────────────────────────────

  function handleAria(handleIndex: number): SplitterHandleAria {
    const size = sizes.value[handleIndex] ?? 0
    const total = size + (sizes.value[handleIndex + 1] ?? 0)
    const { lo, hi } = pairBounds(handleIndex, total)
    const now = Math.round(size)
    return {
      'aria-valuenow': now,
      'aria-valuemin': Math.round(lo),
      'aria-valuemax': Math.round(hi),
      'aria-valuetext': `${now}%`,
    }
  }

  // ── 生命周期（浏览器 API 只出现在这里）────────────────────

  onMounted(() => {
    const root = options.getRoot()
    if (!root || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      // 忽略 0 尺寸回调（容器暂时不可见时保留最近一次有效测量）。
      if (!rect || (rect.width <= 0 && rect.height <= 0)) return
      containerExtent.value =
        toValue(options.direction) === 'vertical' ? rect.height : rect.width
    })
    resizeObserver.observe(root)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = undefined
    removeDragListeners()
    draggingHandle.value = null
  })

  return {
    sizes,
    draggingHandle,
    isCollapsed,
    syncPaneCount,
    handleAria,
    onHandlePointerDown,
    onHandleKeydown,
  }
}
