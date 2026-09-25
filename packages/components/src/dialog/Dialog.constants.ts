/**
 * dialog/ —— 逻辑常量收口（键名、状态名、选择器；不是视觉值，视觉只走 --ui-* token）。
 */
import type { DialogSize } from './Dialog.types'

/** size 全集（与 Dialog.types.ts 的 DialogSize 一一对应）。 */
export const DIALOG_SIZES = ['sm', 'md', 'lg'] as const

/** 默认 size。 */
export const DIALOG_SIZE_DEFAULT: DialogSize = 'md'

/** 默认遮罩点击关闭。 */
export const DIALOG_CLOSE_ON_SCRIM_DEFAULT = true as const

/** Esc 键名（KeyboardEvent.key）。 */
export const DIALOG_ESCAPE_KEY = 'Escape'

/** Tab 键名（KeyboardEvent.key）。 */
export const DIALOG_TAB_KEY = 'Tab'

/** body 滚动锁定时挂到 <body> 的 class（公开钩子，使用方可据此定制滚动条行为）。 */
export const DIALOG_BODY_SCROLL_LOCK_CLASS = 'ui-dialog-scroll-lock'

/**
 * 焦点圈定范围内可聚焦元素的选择器（Tab 循环与初始聚焦的候选集）。
 * 排除 disabled 与 tabindex="-1" 的元素。
 */
export const DIALOG_FOCUSABLE_SELECTOR: string = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** footer 插槽缺省时默认关闭按钮的文本。 */
export const DIALOG_CLOSE_BUTTON_TEXT = '关闭'
