/**
 * usePopover —— Popover 的浮层交互 composable：
 *
 *   1. hover 模式进入/离开状态机：进入（mouseenter/focusin）经 POPOVER_SHOW_DELAY_MS
 *      延迟开启，离开（mouseleave/focusout）经 POPOVER_HIDE_DELAY_MS 宽限关闭；
 *      焦点/指针移入卡片（浮层）取消待关闭计时，移回触发元素同样取消；两条计时互斥
 *      （进入清待关闭、离开清待开启）。click 模式下 mouse/focus 处理器一律空转（模式
 *      收口于此，SFC 两条触发路径可无差别绑定）。
 *   2. 定位（策略同 tooltip/）：按触发元素 rect 计算 fixed 坐标——与触发元素的间距在
 *      calc 内引用 --ui-space-2 token，居中/贴边用结构性 translate 百分比，无需测量
 *      卡片自身尺寸；打开与打开期间方向切换时重排，滚动（capture）/resize 跟随
 *      （策略同 dropdown-menu/）。
 *   3. Esc：触发元素与卡片两处 keydown 入口，打开时关闭并请求焦点回归触发元素
 *      （requestClose(true) 由 SFC 落实）。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除，回调内逻辑仅由用户事件触达。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import {
  POPOVER_GAP,
  POPOVER_HIDE_DELAY_MS,
  POPOVER_KEY_ESCAPE,
  POPOVER_SHOW_DELAY_MS,
} from './Popover.constants'
import type { PopoverPlacement, PopoverTrigger } from './Popover.types'

/** usePopover 选项（均为 getter/回调，保持对 props / ref 的响应式依赖）。 */
export interface UsePopoverOptions {
  /** 触发方式（仅 hover 模式启用 mouse/focus 进入离开路径）。 */
  mode: () => PopoverTrigger
  /** 触发元素 getter（定位基准 / 焦点还原目标）。 */
  trigger: () => HTMLElement | null
  /** 卡片元素 getter（focusout 焦点去向判定）。 */
  card: () => HTMLElement | null
  /** 浮层方向。 */
  placement: () => PopoverPlacement
  /** 当前是否打开。 */
  isOpen: () => boolean
  /** 是否提供了卡片内容（无内容不开启）。 */
  hasContent: () => boolean
  /** 请求开启（SFC 落实受控/非受控与 update:modelValue）。 */
  requestOpen: () => void
  /** 请求关闭；restoreFocus=true 时 SFC 将焦点还原到触发元素。 */
  requestClose: (restoreFocus: boolean) => void
}

/** usePopover 返回值。 */
export interface UsePopoverReturn {
  /** 卡片内联定位样式（打开后由 rect 计算；关闭时为空）。 */
  floatingStyle: ComputedRef<CSSProperties>
  /** 按触发元素当前 rect 重算卡片位置（SFC 在受控初始打开时也会调用）。 */
  updatePosition: () => void
  /** 进入（mouseenter/focusin 共用；click 模式空转）。 */
  onTriggerEnter: () => void
  /** 离开（mouseleave；click 模式空转）。 */
  onTriggerLeave: () => void
  /** 触发元素 focusout：焦点移入卡片则保持打开，否则按离开处理。 */
  onTriggerFocusout: (event: FocusEvent) => void
  /** 卡片进入（取消待关闭计时；click 模式空转）。 */
  onCardEnter: () => void
  /** 卡片离开（宽限关闭；click 模式空转）。 */
  onCardLeave: () => void
  /** 卡片 focusout：焦点移回卡片或触发元素则保持打开，否则宽限关闭。 */
  onCardFocusout: (event: FocusEvent) => void
  /** 触发元素 keydown：打开时 Esc 关闭（焦点回归）。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 卡片 keydown：打开时 Esc 关闭（焦点回归）。 */
  onCardKeydown: (event: KeyboardEvent) => void
}

/** Popover 浮层交互 composable（仅在 setup 中调用）。 */
export function usePopover(options: UsePopoverOptions): UsePopoverReturn {
  const position = ref<CSSProperties>({})

  /** 待开启计时（hover 进入路径）。 */
  let showTimer: ReturnType<typeof setTimeout> | null = null
  /** 待关闭计时（hover 离开宽限）。 */
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
    if (options.mode() !== 'hover') return
    clearHideTimer()
    if (options.isOpen() || showTimer !== null || !options.hasContent()) return
    showTimer = setTimeout(() => {
      showTimer = null
      options.requestOpen()
    }, POPOVER_SHOW_DELAY_MS)
  }

  /** 离开：取消待开启；已开且无待关闭时宽限后关闭（不抢焦点）。 */
  function leave(): void {
    if (options.mode() !== 'hover') return
    clearShowTimer()
    if (!options.isOpen() || hideTimer !== null) return
    hideTimer = setTimeout(() => {
      hideTimer = null
      options.requestClose(false)
    }, POPOVER_HIDE_DELAY_MS)
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

  /** Esc 关闭（触发元素与卡片共用）：打开时关闭并焦点回归触发元素。 */
  function onEscapeKeydown(event: KeyboardEvent): void {
    if (event.key === POPOVER_KEY_ESCAPE && options.isOpen()) {
      event.preventDefault()
      options.requestClose(true)
    }
  }

  /**
   * 按触发元素 rect 计算卡片定位（策略同 tooltip/）：fixed 坐标取自 rect（测量数据），
   * 与触发元素的间距走 --ui-space-2 token（calc 内引用，无裸值）；
   * 居中对齐用结构性 translate 百分比（无需二段测量卡片自身尺寸）。
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
          top: `calc(${rect.top}px - ${POPOVER_GAP})`,
          transform: 'translate(-50%, -100%)',
        }
        break
      case 'bottom':
        position.value = {
          left: centerX,
          top: `calc(${rect.bottom}px + ${POPOVER_GAP})`,
          transform: 'translate(-50%, 0)',
        }
        break
      case 'left':
        position.value = {
          left: `calc(${rect.left}px - ${POPOVER_GAP})`,
          top: centerY,
          transform: 'translate(-100%, -50%)',
        }
        break
      case 'right':
        position.value = {
          left: `calc(${rect.right}px + ${POPOVER_GAP})`,
          top: centerY,
          transform: 'translate(0, -50%)',
        }
        break
    }
  }

  // 打开与打开期间的方向变化：等 Teleport 内容落地后按 rect 重排。
  watch(
    [() => options.isOpen(), () => options.placement()],
    ([open]) => {
      if (open) void nextTick().then(updatePosition)
    },
  )

  /* ── 全局监听（onMounted 常驻绑定、onBeforeUnmount 移除，回调以 isOpen 守卫，同 dropdown-menu/） ── */

  /** 滚动（capture 捕获任意祖先滚动容器）与视口变化时跟随重定位。 */
  function onViewportChange(): void {
    if (!options.isOpen()) return
    updatePosition()
  }

  onMounted(() => {
    document.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
    clearShowTimer()
    clearHideTimer()
  })

  return {
    floatingStyle: computed(() => position.value),
    updatePosition,
    onTriggerEnter,
    onTriggerLeave,
    onTriggerFocusout,
    onCardEnter,
    onCardLeave,
    onCardFocusout,
    onTriggerKeydown: onEscapeKeydown,
    onCardKeydown: onEscapeKeydown,
  }
}
