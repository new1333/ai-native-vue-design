/**
 * useTooltip —— Tooltip 的浮层交互 composable：显示延迟/立即隐藏的状态机。
 * 方向定位（anchored 四向 + token 间距 + 结构性 translate）与 Esc 关闭收口于
 * shared 浮层引擎 useFloatingLayer（anchored 策略）；纯提示浮层不跟随滚动/resize
 * （不启用 followViewport），Esc 映射为 hideNow（立即隐藏）。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；setTimeout 只出现在由客户端
 * 生命周期与用户事件触发的函数内部（引擎侧监听只在 onMounted 注册）。
 */
import { ref } from 'vue'
import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import { TOOLTIP_GAP, TOOLTIP_SHOW_DELAY_MS } from './Tooltip.constants'
import type { TooltipPlacement } from './Tooltip.types'

/** useTooltip 选项（均为 getter，保持对 props / ref 的响应式依赖）。 */
export interface UseTooltipOptions {
  /** 浮层方向。 */
  placement: () => TooltipPlacement
  /** 触发元素（挂载后可测量 rect；null 时跳过定位）。 */
  trigger: () => HTMLElement | null
  /** 是否提供了提示内容（无内容不弹层）。 */
  hasContent: () => boolean
}

/** useTooltip 返回值。 */
export interface UseTooltipReturn {
  /** 当前是否显示浮层。 */
  isOpen: Readonly<Ref<boolean>>
  /** 浮层内联定位样式（打开后由 rect 计算；关闭时为空）。 */
  floatingStyle: ComputedRef<CSSProperties>
  /** 延迟显示（hover/focus 进入路径；已显示或已在等待中则幂等）。 */
  showWithDelay: () => void
  /** 立即隐藏（离开/失焦/Esc 路径；同时取消未到期的显示计时）。 */
  hideNow: () => void
  /** 触发元素 keydown 处理器（Esc 立即隐藏）。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 清理计时器并复位状态（onBeforeUnmount 调用）。 */
  dispose: () => void
}

/** Tooltip 浮层交互 composable。 */
export function useTooltip(options: UseTooltipOptions): UseTooltipReturn {
  const isOpen = ref(false)

  let showTimer: ReturnType<typeof setTimeout> | null = null

  function clearShowTimer(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer)
      showTimer = null
    }
  }

  function showWithDelay(): void {
    if (isOpen.value || showTimer !== null) return
    if (!options.hasContent()) return
    showTimer = setTimeout(() => {
      showTimer = null
      isOpen.value = true
    }, TOOLTIP_SHOW_DELAY_MS)
  }

  function hideNow(): void {
    clearShowTimer()
    isOpen.value = false
  }

  // 定位与 Esc 关闭收口于 shared 浮层引擎：anchored 策略（GAP 走 --ui-space-2 token，
  // calc 内引用）；纯提示浮层不跟随滚动/resize；Esc（打开时）→ hideNow 立即隐藏。
  const layer = useFloatingLayer({
    isOpen: () => isOpen.value,
    anchor: options.trigger,
    strategy: 'anchored',
    placement: options.placement,
    gap: TOOLTIP_GAP,
    onRequestClose: () => hideNow(),
  })

  function dispose(): void {
    clearShowTimer()
    isOpen.value = false
  }

  return {
    isOpen,
    floatingStyle: layer.floatingStyle,
    showWithDelay,
    hideNow,
    onTriggerKeydown: layer.onKeydown,
    dispose,
  }
}
