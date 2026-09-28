/**
 * useHoverCard —— HoverCard 的浮层交互 composable：
 *
 *   1. hover + focus 双触发的开合状态机：进入（mouseenter/focusin，两路径同构、
 *      不可关闭任一条——保键盘可达）经 openDelay 延迟开启；离开（mouseleave/focusout）
 *      经 closeDelay 宽限关闭，宽限期内移回触发元素或移入卡片（mouseenter）即取消。
 *      焦点从触发元素移入卡片（focusout relatedTarget 落在卡片内）同样保持打开。
 *      两条计时互斥：进入清待关闭、离开清待开启。
 *   2. 定位与 Esc 关闭收口于 shared 浮层引擎 useFloatingLayer（anchored 策略）：
 *      按触发元素 rect 计算 fixed 坐标——与触发元素的间距在 calc 内引用 --ui-space-2
 *      token，居中/贴边用结构性 translate 百分比，无需测量卡片自身尺寸；打开与打开
 *      期间方向切换时重排，滚动（capture）/resize 跟随重排（followViewport）。
 *      Esc（触发元素与卡片两处 keydown 入口，打开时 preventDefault）映射
 *      requestClose(true)，焦点回归触发元素由 SFC 落实。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除（均在引擎侧），回调内逻辑仅由用户事件触达。
 */
import { onBeforeUnmount } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import { HOVER_CARD_GAP } from './HoverCard.constants'
import type { HoverCardPlacement } from './HoverCard.types'

/** useHoverCard 选项（均为 getter/回调，保持对 props / ref 的响应式依赖）。 */
export interface UseHoverCardOptions {
  /** 触发元素 getter（定位基准 / 焦点还原目标）。 */
  trigger: () => HTMLElement | null
  /** 卡片元素 getter（focusout 焦点去向判定）。 */
  card: () => HTMLElement | null
  /** 浮层方向。 */
  placement: () => HoverCardPlacement
  /** 当前是否打开。 */
  isOpen: () => boolean
  /** 是否提供了卡片内容（无内容不开启）。 */
  hasContent: () => boolean
  /** 打开延迟（ms）。 */
  openDelay: () => number
  /** 关闭宽限（ms）。 */
  closeDelay: () => number
  /** 请求开启（SFC 落实受控/非受控与 update:modelValue）。 */
  requestOpen: () => void
  /** 请求关闭；restoreFocus=true 时 SFC 将焦点还原到触发元素。 */
  requestClose: (restoreFocus: boolean) => void
}

/** useHoverCard 返回值。 */
export interface UseHoverCardReturn {
  /** 卡片内联定位样式（打开后由 rect 计算；关闭时为空）。 */
  floatingStyle: ComputedRef<CSSProperties>
  /** 按触发元素当前 rect 重算卡片位置（SFC 在受控初始打开时也会调用）。 */
  updatePosition: () => void
  /** 进入（mouseenter/focusin 共用）。 */
  onTriggerEnter: () => void
  /** 离开（mouseleave）。 */
  onTriggerLeave: () => void
  /** 触发元素 focusout：焦点移入卡片（Tab 进入内容）则保持打开，否则按离开处理。 */
  onTriggerFocusout: (event: FocusEvent) => void
  /** 卡片进入（取消待关闭计时）。 */
  onCardEnter: () => void
  /** 卡片离开（宽限关闭）。 */
  onCardLeave: () => void
  /** 卡片 focusout：焦点移回卡片或触发元素则保持打开，否则宽限关闭。 */
  onCardFocusout: (event: FocusEvent) => void
  /** 触发元素 keydown：打开时 Esc 关闭（焦点回归）。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 卡片 keydown：打开时 Esc 关闭（焦点回归）。 */
  onCardKeydown: (event: KeyboardEvent) => void
}

/** HoverCard 浮层交互 composable（仅在 setup 中调用）。 */
export function useHoverCard(options: UseHoverCardOptions): UseHoverCardReturn {
  /** 待开启计时（进入路径）。 */
  let showTimer: ReturnType<typeof setTimeout> | null = null
  /** 待关闭计时（离开宽限）。 */
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function clearShowTimer(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer)
      showTimer = null
    }
  }

  function clearHideTimer(): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  /** 进入：取消待关闭；未开且无待开启时延迟开启（无内容不开启）。 */
  function enter(): void {
    clearHideTimer()
    if (options.isOpen() || showTimer !== null || !options.hasContent()) return
    showTimer = setTimeout(() => {
      showTimer = null
      options.requestOpen()
    }, options.openDelay())
  }

  /** 离开：取消待开启；已开且无待关闭时宽限后关闭（不抢焦点）。 */
  function leave(): void {
    clearShowTimer()
    if (!options.isOpen() || hideTimer !== null) return
    hideTimer = setTimeout(() => {
      hideTimer = null
      options.requestClose(false)
    }, options.closeDelay())
  }

  function onTriggerEnter(): void {
    enter()
  }

  function onTriggerLeave(): void {
    leave()
  }

  /** 触发元素 focusout：焦点移入卡片（Tab 进入内容）则保持打开。 */
  function onTriggerFocusout(event: FocusEvent): void {
    const to = event.relatedTarget
    if (to instanceof Node && options.card()?.contains(to)) return
    leave()
  }

  const onCardEnter = onTriggerEnter

  const onCardLeave = onTriggerLeave

  /** 卡片 focusout：焦点移回卡片或触发元素则保持打开，否则宽限关闭。 */
  function onCardFocusout(event: FocusEvent): void {
    const to = event.relatedTarget
    if (!(to instanceof Node)) {
      leave()
      return
    }
    if (options.card()?.contains(to)) return
    if (options.trigger()?.contains(to)) return
    leave()
  }

  // 定位与 Esc 关闭收口于 shared 浮层引擎：anchored 策略（GAP 走 --ui-space-2 token，
  // calc 内引用）、滚动（capture）/resize 跟随重排；Esc → requestClose(true)（焦点
  // 回归触发元素）。无外点/scrim 关闭路径，不启用引擎的 closeOnOutsideClick。
  const layer = useFloatingLayer({
    isOpen: options.isOpen,
    anchor: options.trigger,
    strategy: 'anchored',
    placement: options.placement,
    gap: HOVER_CARD_GAP,
    followViewport: true,
    onRequestClose: () => options.requestClose(true),
  })

  onBeforeUnmount(() => {
    clearShowTimer()
    clearHideTimer()
  })

  return {
    floatingStyle: layer.floatingStyle,
    updatePosition: layer.updatePosition,
    onTriggerEnter,
    onTriggerLeave,
    onTriggerFocusout,
    onCardEnter,
    onCardLeave,
    onCardFocusout,
    onTriggerKeydown: layer.onKeydown,
    onCardKeydown: layer.onKeydown,
  }
}
