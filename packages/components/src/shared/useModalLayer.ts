/**
 * useModalLayer —— 模态层机制共享 composable：焦点圈定（Tab 循环）、焦点移入/还原、
 * body 滚动锁定（跨实例计数，支持嵌套模态）、Esc 请求关闭。
 *
 * Dialog / Drawer / CommandPalette / Artifact 等模态浮层的公共机制收口于此；
 * 各组件只保留自身差异（尺寸、动画、aria 语义、模态/非模态开关）。
 *
 *   1. 滚动锁：模块级计数——嵌套模态只有最后一个解锁时才真正恢复；按实例记账
 *      （本实例加锁才允许解锁），非模态实例不会误减他实例的计数；
 *   2. 焦点：激活时记录先前焦点并在 DOM 就绪后移入面板首个可聚焦元素；
 *      关闭时还原（元素仍连接在文档中才还原）；Tab 在面板内首尾环绕圈定；
 *   3. 非模态（modal() === false）：不锁滚动、不抢焦点、Tab 不圈定，仅保留
 *      Esc 关闭路径（页面保持可交互）。
 *
 * SSR 安全：模块顶层不访问任何浏览器 API；document 只出现在
 * 由客户端生命周期与用户事件调用的函数内部。
 */
import { nextTick } from 'vue'

/** Esc 键名（逻辑常量，非视觉值）。 */
const MODAL_LAYER_ESCAPE_KEY = 'Escape'

/** Tab 键名（逻辑常量，非视觉值）。 */
const MODAL_LAYER_TAB_KEY = 'Tab'

/** 面板内可聚焦元素选择器（DOM 序，Dialog/Drawer 家族共用）。 */
const MODAL_LAYER_FOCUSABLE_SELECTOR: string = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** 默认滚动锁 body class（公开行为钩子；Dialog/Drawer 传入各自家族 class）。 */
const MODAL_LAYER_SCROLL_LOCK_CLASS_DEFAULT = 'ui-modal-scroll-lock'

/* ── body 滚动锁定（模块级计数：嵌套模态只有最后一个解锁时才真正恢复） ── */

/** 当前持有滚动锁的实例数。 */
let scrollLockCount = 0

/** 锁定前 <body> 的行内 overflow（解锁时原样还原）。 */
let bodyOverflowCache = ''

/** 锁定 body 滚动：挂 class（公开钩子）+ 行内 overflow 兜底（组件包禁止全局 CSS）。 */
function lockBodyScroll(scrollLockClass: string): void {
  scrollLockCount += 1
  if (scrollLockCount > 1) return
  bodyOverflowCache = document.body.style.overflow
  document.body.classList.add(scrollLockClass)
  // overflow:hidden 为行为性滚动锁定而非视觉取值（token 体系无 overflow 语义）
  document.body.style.overflow = 'hidden'
}

/** 解锁 body 滚动（计数归零时还原行内 overflow 并移除 class）。 */
function unlockBodyScroll(scrollLockClass: string): void {
  if (scrollLockCount === 0) return
  scrollLockCount -= 1
  if (scrollLockCount > 0) return
  document.body.classList.remove(scrollLockClass)
  document.body.style.overflow = bodyOverflowCache
  bodyOverflowCache = ''
}

/** 当前文档焦点元素（非 HTMLElement 时为 null）。 */
function getActiveElement(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null
}

/** 面板内可聚焦元素（DOM 序）。 */
function getFocusableElements(panel: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(selector))
}

/** useModalLayer 选项。 */
export interface UseModalLayerOptions {
  /** 焦点圈定范围（面板元素 getter）。 */
  panel: () => HTMLElement | null
  /** Esc 请求关闭回调。 */
  onEscape: () => void
  /** 是否模态（getter）：非模态跳过滚动锁/焦点移入/Tab 圈定（默认恒模态）。 */
  modal?: () => boolean
  /** 滚动锁挂到 <body> 的 class（公开行为钩子，Dialog/Drawer 家族各自传入）。 */
  scrollLockClass?: string
  /** 面板内可聚焦元素选择器（默认 Dialog/Drawer 家族共用选择器）。 */
  focusableSelector?: string
}

/** useModalLayer 返回值。 */
export interface UseModalLayerReturn {
  /** 打开：模态时锁定滚动、记录先前焦点，并在 DOM 就绪后将焦点移入面板。 */
  activate: () => void
  /** 关闭：模态时解锁滚动并将焦点还原到打开前元素（幂等）。 */
  deactivate: () => void
  /** keydown 处理器（绑定浮层根）：Esc 请求关闭；模态下 Tab 在面板内循环圈定。 */
  onKeydown: (event: KeyboardEvent) => void
  /** 将焦点移入面板（首个可聚焦元素，否则面板自身）。 */
  focusPanel: () => void
}

/** 模态层机制 composable（Dialog/Drawer 等模态浮层共用，在 setup 或 composable 内调用）。 */
export function useModalLayer(options: UseModalLayerOptions): UseModalLayerReturn {
  const scrollLockClass = options.scrollLockClass ?? MODAL_LAYER_SCROLL_LOCK_CLASS_DEFAULT
  const focusableSelector = options.focusableSelector ?? MODAL_LAYER_FOCUSABLE_SELECTOR
  const isModal = options.modal ?? (() => true)

  let active = false
  /** 本实例是否持有滚动锁（按实例记账：非模态不解锁他实例的计数）。 */
  let locked = false
  let previouslyFocused: HTMLElement | null = null

  function focusPanel(): void {
    const panel = options.panel()
    if (!panel) return
    const focusable = getFocusableElements(panel, focusableSelector)
    if (focusable.length > 0) focusable[0].focus()
    else panel.focus()
  }

  function activate(): void {
    if (active) return
    active = true
    // 非模态：页面保持可交互，不锁滚动、不移入焦点（仅 Esc 关闭路径可用）。
    if (!isModal()) return
    lockBodyScroll(scrollLockClass)
    locked = true
    previouslyFocused = getActiveElement()
    // Teleport 内容在打开后的下一次渲染落地；焦点移入等 DOM 就绪再执行。
    void nextTick().then(() => {
      if (active) focusPanel()
    })
  }

  function deactivate(): void {
    if (!active) return
    active = false
    if (locked) {
      unlockBodyScroll(scrollLockClass)
      locked = false
    }
    const toRestore = previouslyFocused
    previouslyFocused = null
    if (toRestore !== null && toRestore.isConnected) toRestore.focus()
  }

  /** Tab 循环圈定：焦点始终在面板内首尾环绕，逃逸到面板外时拉回（仅模态调用）。 */
  function handleTab(event: KeyboardEvent): void {
    const panel = options.panel()
    if (!panel) return
    const focusable = getFocusableElements(panel, focusableSelector)
    if (focusable.length === 0) {
      event.preventDefault()
      panel.focus()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const current = getActiveElement()
    const insidePanel = current !== null && panel.contains(current)
    if (event.shiftKey) {
      if (!insidePanel || current === first) {
        event.preventDefault()
        last.focus()
      }
    } else if (!insidePanel || current === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === MODAL_LAYER_ESCAPE_KEY) {
      options.onEscape()
      return
    }
    if (event.key === MODAL_LAYER_TAB_KEY && isModal()) handleTab(event)
  }

  return { activate, deactivate, onKeydown, focusPanel }
}
