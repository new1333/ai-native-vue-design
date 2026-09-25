/**
 * useDialog —— Dialog 的浮层交互 composable：焦点圈定（Tab 循环）、焦点移入/还原、
 * body 滚动锁定（跨实例计数，支持嵌套 Dialog）、Esc 请求关闭。
 *
 * SSR 安全：模块顶层不访问任何浏览器 API；document 只出现在
 * 由客户端生命周期（onMounted/watch）与用户事件调用的函数内部。
 */
import { nextTick } from 'vue'
import {
  DIALOG_BODY_SCROLL_LOCK_CLASS,
  DIALOG_ESCAPE_KEY,
  DIALOG_FOCUSABLE_SELECTOR,
  DIALOG_TAB_KEY,
} from './Dialog.constants'

/* ── body 滚动锁定（模块级计数：嵌套 Dialog 只有最后一个解锁时才真正恢复） ── */

/** 当前持有滚动锁的 Dialog 实例数。 */
let scrollLockCount = 0

/** 锁定前 <body> 的行内 overflow（解锁时原样还原）。 */
let bodyOverflowCache = ''

/** 锁定 body 滚动：挂 class（公开钩子）+ 行内 overflow 兜底（组件包禁止全局 CSS）。 */
function lockBodyScroll(): void {
  scrollLockCount += 1
  if (scrollLockCount > 1) return
  bodyOverflowCache = document.body.style.overflow
  document.body.classList.add(DIALOG_BODY_SCROLL_LOCK_CLASS)
  // overflow:hidden 为行为性滚动锁定而非视觉取值（token 体系无 overflow 语义）
  document.body.style.overflow = 'hidden'
}

/** 解锁 body 滚动（计数归零时还原行内 overflow 并移除 class）。 */
function unlockBodyScroll(): void {
  if (scrollLockCount === 0) return
  scrollLockCount -= 1
  if (scrollLockCount > 0) return
  document.body.classList.remove(DIALOG_BODY_SCROLL_LOCK_CLASS)
  document.body.style.overflow = bodyOverflowCache
  bodyOverflowCache = ''
}

/** 当前文档焦点元素（非 HTMLElement 时为 null）。 */
function getActiveElement(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null
}

/** 面板内可聚焦元素（DOM 序）。 */
function getFocusableElements(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR))
}

/** useDialog 选项。 */
export interface UseDialogOptions {
  /** 焦点圈定范围（面板元素 getter）。 */
  panel: () => HTMLElement | null
  /** Esc 请求关闭回调。 */
  onEscape: () => void
}

/** useDialog 返回值。 */
export interface UseDialogReturn {
  /** 打开：锁定滚动、记录先前焦点，并在 DOM 就绪后将焦点移入面板。 */
  activate: () => void
  /** 关闭：解锁滚动并将焦点还原到打开前元素（幂等）。 */
  deactivate: () => void
  /** keydown 处理器（绑定浮层根）：Esc 请求关闭；Tab 在面板内循环圈定。 */
  onKeydown: (event: KeyboardEvent) => void
  /** 将焦点移入对话框（首个可聚焦元素，否则面板自身）。 */
  focusDialog: () => void
}

/** Dialog 浮层交互 composable。 */
export function useDialog(options: UseDialogOptions): UseDialogReturn {
  let active = false
  let previouslyFocused: HTMLElement | null = null

  function focusDialog(): void {
    const panel = options.panel()
    if (!panel) return
    const focusable = getFocusableElements(panel)
    if (focusable.length > 0) focusable[0].focus()
    else panel.focus()
  }

  function activate(): void {
    if (active) return
    active = true
    lockBodyScroll()
    previouslyFocused = getActiveElement()
    // Teleport 内容在打开后的下一次渲染落地；焦点移入等 DOM 就绪再执行。
    void nextTick().then(() => {
      if (active) focusDialog()
    })
  }

  function deactivate(): void {
    if (!active) return
    active = false
    unlockBodyScroll()
    const toRestore = previouslyFocused
    previouslyFocused = null
    if (toRestore !== null && toRestore.isConnected) toRestore.focus()
  }

  /** Tab 循环圈定：焦点始终在面板内首尾环绕，逃逸到面板外时拉回。 */
  function handleTab(event: KeyboardEvent): void {
    const panel = options.panel()
    if (!panel) return
    const focusable = getFocusableElements(panel)
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
    if (event.key === DIALOG_ESCAPE_KEY) {
      options.onEscape()
      return
    }
    if (event.key === DIALOG_TAB_KEY) handleTab(event)
  }

  return { activate, deactivate, onKeydown, focusDialog }
}
