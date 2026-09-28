/**
 * usePopconfirm —— Popconfirm 的气泡交互 composable：
 *
 *   1. 开合状态机（非受控，显隐内部管理）：点击触发元素开合；确认/取消由 SFC 在
 *      emit 对应事件后调用 close；Esc（触发元素或气泡内）关闭并焦点回归触发元素；
 *      打开期间 document 上的 mousedown 落在触发元素/气泡之外时关闭（焦点在气泡内
 *      则焦点回归触发元素，否则不抢焦点）。
 *   2. 定位与 Esc 关闭收口于 shared 浮层引擎 useFloatingLayer（anchored 策略）：
 *      按触发元素 rect 计算 fixed 坐标——与触发元素的间距在 calc 内引用 --ui-space-2
 *      token，居中/贴边用结构性 translate 百分比，无需测量气泡自身尺寸；打开与打开
 *      期间方向切换、滚动（capture）/resize 跟随重排（followViewport）。Esc（打开时
 *      preventDefault）映射 close(true)（焦点回归触发元素）。外部点击关闭走本
 *      composable 的 mousedown 判定（含焦点去向语义），不启用引擎的 closeOnOutsideClick。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除，回调内逻辑仅由用户事件触达。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import { POPCONFIRM_GAP } from './Popconfirm.constants'
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

  // 定位与 Esc 关闭收口于 shared 浮层引擎：anchored 策略（GAP 走 --ui-space-2 token，
  // calc 内引用）、滚动（capture）/resize 跟随重排；Esc → close(true)（焦点回归触发元素）。
  const layer = useFloatingLayer({
    isOpen: () => isOpen.value,
    anchor: options.trigger,
    strategy: 'anchored',
    placement: options.placement,
    gap: POPCONFIRM_GAP,
    followViewport: true,
    onRequestClose: () => close(true),
  })

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

  onMounted(() => {
    document.addEventListener('mousedown', onDocumentMousedown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentMousedown)
  })

  return {
    isOpen,
    floatingStyle: layer.floatingStyle,
    updatePosition: layer.updatePosition,
    open,
    close,
    toggle,
    onTriggerKeydown: layer.onKeydown,
    onCardKeydown: layer.onKeydown,
  }
}
