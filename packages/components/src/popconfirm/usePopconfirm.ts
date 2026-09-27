/**
 * usePopconfirm —— Popconfirm 的气泡交互 composable：
 *
 *   1. 开合状态机（非受控，显隐内部管理）：点击触发元素开合；确认/取消由 SFC 在
 *      emit 对应事件后调用 close；Esc（触发元素或气泡内）关闭并焦点回归触发元素；
 *      打开期间 document 上的 mousedown 落在触发元素/气泡之外时关闭（焦点在气泡内
 *      则焦点回归触发元素，否则不抢焦点）。
 *   2. 定位（策略同 tooltip/popover 家族）：按触发元素 rect 计算 fixed 坐标——与
 *      触发元素的间距在 calc 内引用 --ui-space-2 token，居中/贴边用结构性 translate
 *      百分比，无需测量气泡自身尺寸；打开与打开期间方向切换、滚动（capture）/
 *      resize 跟随重排（策略同 popover/）。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除，回调内逻辑仅由用户事件触达。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { POPCONFIRM_GAP, POPCONFIRM_KEY_ESCAPE } from './Popconfirm.constants'
import type { PopconfirmPlacement } from './Popconfirm.types'

/** usePopconfirm 选项（均为 getter，保持对 props / ref 的响应式依赖）。 */
export interface UsePopconfirmOptions {
  /** 气泡方向。 */
  placement: () => PopconfirmPlacement
  /** 触发元素 getter（开合锚点 / 定位基准 / 焦点还原目标）。 */
  trigger: () => HTMLElement | null
  /** 气泡元素 getter（外部 mousedown 命中判定）。 */
  card: () => HTMLElement | null
  /** 是否提供了确认内容（title/description 均为空不弹层）。 */
  hasContent: () => boolean
}

/** usePopconfirm 返回值。 */
export interface UsePopconfirmReturn {
  /** 当前是否弹出。 */
  isOpen: Readonly<Ref<boolean>>
  /** 气泡内联定位样式（打开后由 rect 计算；关闭时为空）。 */
  floatingStyle: ComputedRef<CSSProperties>
  /** 按触发元素当前 rect 重算气泡位置（打开/方向切换/滚动/resize 时调用）。 */
  updatePosition: () => void
  /** 请求打开（无内容不弹层）。 */
  open: () => void
  /** 关闭；restoreFocus=true 时焦点回归触发元素。 */
  close: (restoreFocus: boolean) => void
  /** 触发元素点击开合。 */
  toggle: () => void
  /** 触发元素 keydown：打开时 Esc 关闭（焦点回归）。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 气泡 keydown：打开时 Esc 关闭（焦点回归）。 */
  onCardKeydown: (event: KeyboardEvent) => void
}

/** Popconfirm 气泡交互 composable（仅在 setup 中调用）。 */
export function usePopconfirm(options: UsePopconfirmOptions): UsePopconfirmReturn {
  const isOpen = ref(false)
  const position = ref<CSSProperties>({})

  /**
   * 按触发元素 rect 计算气泡定位（策略同 tooltip/popover/）：fixed 坐标取自 rect
   * （测量数据），与触发元素的间距走 --ui-space-2 token（calc 内引用，无裸值）；
   * 居中对齐用结构性 translate 百分比（无需二段测量气泡自身尺寸）。
   */
  function updatePosition(): void {
    const trigger = options.trigger()
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const centerX = `${rect.left + rect.width / 2}px`
    const centerY = `${rect.top + rect.height / 2}px`

    switch (options.placement()) {
      case 'top':
        position.value = {
          left: centerX,
          top: `calc(${rect.top}px - ${POPCONFIRM_GAP})`,
          transform: 'translate(-50%, -100%)',
        }
        break
      case 'bottom':
        position.value = {
          left: centerX,
          top: `calc(${rect.bottom}px + ${POPCONFIRM_GAP})`,
          transform: 'translate(-50%, 0)',
        }
        break
      case 'left':
        position.value = {
          left: `calc(${rect.left}px - ${POPCONFIRM_GAP})`,
          top: centerY,
          transform: 'translate(-100%, -50%)',
        }
        break
      case 'right':
        position.value = {
          left: `calc(${rect.right}px + ${POPCONFIRM_GAP})`,
          top: centerY,
          transform: 'translate(0, -50%)',
        }
        break
    }
  }

  /** 请求打开：title/description 均为空（无内容）不弹层。 */
  function open(): void {
    if (isOpen.value || !options.hasContent()) return
    isOpen.value = true
  }

  /** 关闭；restoreFocus=true 时焦点回归触发元素。 */
  function close(restoreFocus: boolean): void {
    if (!isOpen.value) return
    isOpen.value = false
    if (restoreFocus) options.trigger()?.focus()
  }

  /** 触发元素点击开合（点击时焦点已随原生行为落在触发元素上，无需还原）。 */
  function toggle(): void {
    if (isOpen.value) close(false)
    else open()
  }

  /** Esc 关闭（触发元素与气泡共用）：打开时关闭并焦点回归触发元素。 */
  function onEscapeKeydown(event: KeyboardEvent): void {
    if (event.key === POPCONFIRM_KEY_ESCAPE && isOpen.value) {
      event.preventDefault()
      close(true)
    }
  }

  /**
   * 外部 mousedown：目标落在触发元素与气泡之外时关闭（触发元素上仍走 click 开合，
   * 避免 mousedown 关闭 + click 重开的二次触发）；焦点当前在气泡内则回归触发元素，
   * 否则不抢焦点（用户已把注意力移向别处）。
   */
  function onDocumentMousedown(event: MouseEvent): void {
    if (!isOpen.value) return
    const target = event.target
    if (!(target instanceof Node)) return
    if (options.trigger()?.contains(target)) return
    if (options.card()?.contains(target)) return
    close(options.card()?.contains(document.activeElement) === true)
  }

  // 打开与打开期间的方向变化：等 Teleport 内容落地后按 rect 重排。
  watch(
    [isOpen, () => options.placement()],
    ([open]) => {
      if (open) void nextTick().then(updatePosition)
    },
  )

  /* ── 全局监听（onMounted 常驻绑定、onBeforeUnmount 移除，回调以 isOpen 守卫，同 popover/） ── */

  /** 滚动（capture 捕获任意祖先滚动容器）与视口变化时跟随重定位。 */
  function onViewportChange(): void {
    if (!isOpen.value) return
    updatePosition()
  }

  onMounted(() => {
    document.addEventListener('mousedown', onDocumentMousedown)
    document.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentMousedown)
    document.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
  })

  return {
    isOpen,
    floatingStyle: computed(() => position.value),
    updatePosition,
    open,
    close,
    toggle,
    onTriggerKeydown: onEscapeKeydown,
    onCardKeydown: onEscapeKeydown,
  }
}
