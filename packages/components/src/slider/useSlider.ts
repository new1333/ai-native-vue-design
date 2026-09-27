/**
 * useSlider —— Slider 的取值状态机与双路径交互 composable（headless）。
 *
 * 收口三类逻辑，保持 SFC 薄：
 *   1. 取值规范化：range 判别（单值宽处理为 [min, value]）、越界钳制、step 对齐
 *      （含浮点精度修正）、双柄次序约束（互相钳制不交叉）；
 *   2. 键盘路径（WAI-ARIA slider 模式）：←/↓ 减、→/↑ 加，PageUp/PageDown 大步长，
 *      Home/End 直达柄边界；处理即 preventDefault 并提交 update:modelValue + change；
 *   3. 拖拽路径（仅客户端）：pointerdown 定柄（轨道点击取最近柄并跳值）→ document 上挂
 *      pointermove / pointerup / pointercancel → 移动连续发 update:modelValue，
 *      抬起时值有变化才发一次 change。
 *
 * SSR 安全：不访问任何浏览器 API；rect 测量与 document 监听只出现在客户端事件回调
 * （pointerdown 及仅由其调用的函数）内；cleanup 供 onBeforeUnmount 兜底清理拖拽监听。
 */
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SLIDER_MAX_DEFAULT, SLIDER_MIN_DEFAULT, SLIDER_PAGE_STEP_FACTOR, SLIDER_STEP_DEFAULT } from './Slider.constants'
import type { SliderHandle, SliderProps, SliderValue } from './Slider.types'

/** useSlider 的 emit 契约（与 SliderEmits 一致，供 defineEmits 结果直接传入）。 */
export interface UseSliderEmit {
  (event: 'update:modelValue', value: SliderValue): void
  (event: 'change', value: SliderValue): void
}

/** useSlider 选项。 */
export interface UseSliderOptions {
  /** 已解析的响应式 props（withDefaults 结果）。 */
  props: SliderProps
  /** 事件发射器。 */
  emit: UseSliderEmit
  /** 轨道（可点击命中区）元素引用：指针取值用它测量几何。 */
  trackEl: Ref<HTMLElement | null>
  /** 聚焦柄元素（仅客户端事件回调中调用）。 */
  focusHandle: (handle: SliderHandle) => void
}

/** useSlider 返回值（供 Slider.vue 模板与暴露方法使用）。 */
export interface UseSliderReturn {
  /** 内部统一为 [低值, 高值]：单柄模式 pair[0] 即取值，pair[1] 恒为 max（供填充与边界计算）。 */
  pair: ComputedRef<[number, number]>
  /** 拖拽中的柄（用于交互态 class 与提交判断）。 */
  dragging: Ref<SliderHandle | null>
  /** 值 → 轨道百分比（0–100，两位小数）。 */
  percentOf: (value: number) => number
  /** 柄的可取值边界：低柄上界为高柄当前值，高柄下界为低柄当前值（单柄为 min/max 全域）。 */
  handleBounds: (handle: SliderHandle) => { min: number; max: number }
  /** 提交某柄的新值：钳制到柄边界后发 update:modelValue；commit 为 true 时同发 change。 */
  commitValue: (handle: SliderHandle, value: number, commit?: boolean) => void
  /** 轨道 pointerdown：跳值到指针位置 + 以最近柄开始拖拽。 */
  onTrackPointerDown: (event: PointerEvent) => void
  /** 柄 pointerdown：不跳值，直接开始拖拽（stopPropagation 防止轨道二次处理）。 */
  onHandlePointerDown: (handle: SliderHandle, event: PointerEvent) => void
  /** 柄 keydown：方向键/PageUp/PageDown/Home/End 步进。 */
  onHandleKeydown: (handle: SliderHandle, event: KeyboardEvent) => void
  /** 卸载清理：移除残留的 document 拖拽监听（onBeforeUnmount 调用）。 */
  cleanup: () => void
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

/** 非有限值（undefined / NaN 等）统一视为缺失。 */
function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** step 的小数位数（浮点步长的精度修正位数）。 */
function stepDecimals(step: number): number {
  const text = String(step)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

/** 钳制 + 按 step 对齐（Math.round 抑制浮点误差，toFixed 修正小数尾巴）。 */
function snapValue(value: number, min: number, max: number, step: number): number {
  const clamped = clamp(value, min, max)
  if (!(step > 0)) return clamped
  const snapped = min + Math.round((clamped - min) / step) * step
  return clamp(Number(snapped.toFixed(stepDecimals(step))), min, max)
}

/** 两个滑块值是否相等（number 或二元组逐位比较）。 */
function valuesEqual(a: SliderValue, b: SliderValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1]
  if (!Array.isArray(a) && !Array.isArray(b)) return a === b
  return false
}

export function useSlider(options: UseSliderOptions): UseSliderReturn {
  const { props, emit, trackEl, focusHandle } = options

  /** 取值锁：disabled 与 loading 拦截一切取值路径（loading 不落 disabled，保持可聚焦）。 */
  const locked = computed(() => props.disabled === true || props.loading === true)

  /** 拖拽中的柄。 */
  const dragging = ref<SliderHandle | null>(null)

  /** 拖拽会话起点值：抬起时与之比较，值有变化才提交 change。 */
  let dragStartValue: SliderValue | null = null

  /**
   * 内部统一为 [低值, 高值]。
   * - 单柄：pair[0] 为受控值（缺省/非法回落 min），pair[1] 恒为 max；
   * - range：二元组逐位钳制 + 对齐后升序；收到单值宽处理为 [min, value]。
   */
  const pair = computed<[number, number]>(() => {
    const min = props.min ?? SLIDER_MIN_DEFAULT
    const max = props.max ?? SLIDER_MAX_DEFAULT
    const step = props.step ?? SLIDER_STEP_DEFAULT
    const raw = props.modelValue
    if (props.range === true) {
      const lowRaw = toNumber(Array.isArray(raw) ? raw[0] : min)
      const highRaw = toNumber(Array.isArray(raw) ? raw[1] : raw)
      const low = snapValue(lowRaw ?? min, min, max, step)
      const high = snapValue(highRaw ?? max, min, max, step)
      return low <= high ? [low, high] : [high, low]
    }
    const value = toNumber(Array.isArray(raw) ? raw[0] : raw)
    return [snapValue(value ?? min, min, max, step), max]
  })

  function percentOf(value: number): number {
    const min = props.min ?? SLIDER_MIN_DEFAULT
    const max = props.max ?? SLIDER_MAX_DEFAULT
    if (!(max > min)) return 0
    const percent = ((value - min) / (max - min)) * 100
    return Math.round(clamp(percent, 0, 100) * 100) / 100
  }

  function handleBounds(handle: SliderHandle): { min: number; max: number } {
    const min = props.min ?? SLIDER_MIN_DEFAULT
    const max = props.max ?? SLIDER_MAX_DEFAULT
    if (props.range !== true) return { min, max }
    return handle === 'min'
      ? { min, max: pair.value[1] }
      : { min: pair.value[0], max }
  }

  /** 当前值的事件载荷形状：range 为二元组，单柄为 number。 */
  function currentPayload(): SliderValue {
    return props.range === true ? [pair.value[0], pair.value[1]] : pair.value[0]
  }

  function commitValue(handle: SliderHandle, value: number, commit = false): void {
    if (locked.value) return
    const bounds = handleBounds(handle)
    const next = clamp(value, bounds.min, bounds.max)
    const current = handle === 'min' ? pair.value[0] : pair.value[1]
    if (next === current) return
    const payload: SliderValue = props.range === true
      ? (handle === 'min' ? [next, pair.value[1]] : [pair.value[0], next])
      : next
    emit('update:modelValue', payload)
    if (commit) emit('change', payload)
  }

  /** 轨道点击跳值后的柄归属：取距指针值更近的柄（等距取低值柄）。 */
  function pickHandle(pointerValue: number): SliderHandle {
    if (props.range !== true) return 'min'
    const distanceLow = Math.abs(pointerValue - pair.value[0])
    const distanceHigh = Math.abs(pointerValue - pair.value[1])
    return distanceLow <= distanceHigh ? 'min' : 'max'
  }

  /** 指针位置 → 值轴取值（垂直方向自下而上增大）；对齐 step 并钳制到 [min, max]。 */
  function valueFromPointer(event: PointerEvent): number | null {
    const track = trackEl.value
    if (!track) return null
    const rect = track.getBoundingClientRect()
    const vertical = props.vertical === true
    const size = vertical ? rect.height : rect.width
    if (!(size > 0)) return null
    const min = props.min ?? SLIDER_MIN_DEFAULT
    const max = props.max ?? SLIDER_MAX_DEFAULT
    const ratio = vertical
      ? (rect.bottom - event.clientY) / size
      : (event.clientX - rect.left) / size
    return snapValue(min + clamp(ratio, 0, 1) * (max - min), min, max, props.step ?? SLIDER_STEP_DEFAULT)
  }

  function beginDrag(handle: SliderHandle, event: PointerEvent): void {
    dragging.value = handle
    dragStartValue = currentPayload()
    // 指针交互把焦点移上柄，键盘可无缝接管（客户端事件回调内的 DOM API）。
    focusHandle(handle)
    event.preventDefault()
    document.addEventListener('pointermove', onDragMove)
    document.addEventListener('pointerup', onDragEnd)
    document.addEventListener('pointercancel', onDragEnd)
  }

  function stopDrag(): void {
    dragging.value = null
    dragStartValue = null
    document.removeEventListener('pointermove', onDragMove)
    document.removeEventListener('pointerup', onDragEnd)
    document.removeEventListener('pointercancel', onDragEnd)
  }

  function onDragMove(event: PointerEvent): void {
    const handle = dragging.value
    if (handle === null) return
    const pointerValue = valueFromPointer(event)
    if (pointerValue !== null) commitValue(handle, pointerValue)
  }

  function onDragEnd(): void {
    const handle = dragging.value
    const start = dragStartValue
    stopDrag()
    if (handle === null || start === null) return
    const final = currentPayload()
    if (!valuesEqual(final, start)) emit('change', final)
  }

  function onTrackPointerDown(event: PointerEvent): void {
    if (locked.value) return
    const pointerValue = valueFromPointer(event)
    if (pointerValue === null) return
    const handle = pickHandle(pointerValue)
    commitValue(handle, pointerValue)
    beginDrag(handle, event)
  }

  function onHandlePointerDown(handle: SliderHandle, event: PointerEvent): void {
    if (locked.value) return
    // 柄上按下不跳值；阻断向轨道冒泡的二次 pointerdown。
    event.stopPropagation()
    beginDrag(handle, event)
  }

  function onHandleKeydown(handle: SliderHandle, event: KeyboardEvent): void {
    if (locked.value) return
    const bounds = handleBounds(handle)
    const current = handle === 'min' ? pair.value[0] : pair.value[1]
    const step = props.step ?? SLIDER_STEP_DEFAULT
    const pageStep = step * SLIDER_PAGE_STEP_FACTOR
    let target: number | null = null
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        target = snapValue(current + step, bounds.min, bounds.max, step)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        target = snapValue(current - step, bounds.min, bounds.max, step)
        break
      case 'PageUp':
        target = snapValue(current + pageStep, bounds.min, bounds.max, step)
        break
      case 'PageDown':
        target = snapValue(current - pageStep, bounds.min, bounds.max, step)
        break
      case 'Home':
        target = bounds.min
        break
      case 'End':
        target = bounds.max
        break
      default:
        return
    }
    event.preventDefault()
    commitValue(handle, target, true)
  }

  return {
    pair,
    dragging,
    percentOf,
    handleBounds,
    commitValue,
    onTrackPointerDown,
    onHandlePointerDown,
    onHandleKeydown,
    cleanup: stopDrag,
  }
}
