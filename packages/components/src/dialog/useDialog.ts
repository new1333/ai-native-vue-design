/**
 * useDialog —— Dialog 的浮层交互 composable：共享模态层（shared/useModalLayer）的薄适配层。
 *
 * 机制已收口于 shared/useModalLayer：body 滚动锁（跨实例计数）、焦点记录/移入/还原、
 * Tab 循环圈定、Esc 请求关闭。本文件只保留 Dialog 家族差异——滚动锁 body class 与
 * 面板可聚焦元素选择器（常量来自 Dialog.constants）。
 *
 * 有意的行为改进：滚动锁此前 dialog/drawer 各自为政（嵌套 dialog+drawer 无法互认计数），
 * 现由共享层统一计数；且共享层按实例记账，修复了「非模态 drawer deactivate 误减计数」的潜在缺陷。
 *
 * 注：DIALOG_ESCAPE_KEY / DIALOG_TAB_KEY 仍为公共契约常量（由 Dialog.constants 导出、
 * 目录 index.ts 公共导出不变），供使用方与文档引用；模态引擎内部键名（'Escape'/'Tab'）
 * 由共享层自持，本文件不再消费这两个键名常量。
 *
 * SSR 安全：模块顶层不访问任何浏览器 API；document 只出现在由共享层管理的、
 * 仅被客户端生命周期（onMounted/watch）与用户事件调用的函数内部。
 */
import { useModalLayer } from '../shared/useModalLayer'
import { DIALOG_BODY_SCROLL_LOCK_CLASS, DIALOG_FOCUSABLE_SELECTOR } from './Dialog.constants'

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

/** Dialog 浮层交互 composable（共享模态层的薄适配：恒模态语义）。 */
export function useDialog(options: UseDialogOptions): UseDialogReturn {
  const layer = useModalLayer({
    panel: options.panel,
    onEscape: options.onEscape,
    scrollLockClass: DIALOG_BODY_SCROLL_LOCK_CLASS,
    focusableSelector: DIALOG_FOCUSABLE_SELECTOR,
  })
  return {
    activate: layer.activate,
    deactivate: layer.deactivate,
    onKeydown: layer.onKeydown,
    focusDialog: layer.focusPanel,
  }
}
