/**
 * drawer/ —— 逻辑常量收口（键名、状态名、选择器；不是视觉值，视觉只走 --ui-* token）。
 */
import type { DrawerSide, DrawerSize } from './Drawer.types'

/** side 全集（与 Drawer.types.ts 的 DrawerSide 一一对应）。 */
export const DRAWER_SIDES = ['left', 'right', 'top', 'bottom'] as const

/** 默认 side。 */
export const DRAWER_SIDE_DEFAULT: DrawerSide = 'right'

/** size 全集（与 Drawer.types.ts 的 DrawerSize 一一对应）。 */
export const DRAWER_SIZES = ['sm', 'md', 'lg'] as const

/** 默认 size。 */
export const DRAWER_SIZE_DEFAULT: DrawerSize = 'md'

/** 默认模态（遮罩 + 焦点圈定 + 滚动锁定）。 */
export const DRAWER_MODAL_DEFAULT = true as const

/** 默认遮罩点击关闭。 */
export const DRAWER_CLOSE_ON_SCRIM_DEFAULT = true as const

/** Esc 键名（KeyboardEvent.key）。 */
export const DRAWER_ESCAPE_KEY = 'Escape'

/** Tab 键名（KeyboardEvent.key）。 */
export const DRAWER_TAB_KEY = 'Tab'

/** body 滚动锁定时挂到 <body> 的 class（公开钩子，使用方可据此定制滚动条行为）。 */
export const DRAWER_BODY_SCROLL_LOCK_CLASS = 'ui-drawer-scroll-lock'

/**
 * 焦点圈定范围内可聚焦元素的选择器（Tab 循环与初始聚焦的候选集）。
 * 排除 disabled 与 tabindex="-1" 的元素。
 */
export const DRAWER_FOCUSABLE_SELECTOR: string = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** 头部内置关闭按钮的可访问名称（aria-label）。 */
export const DRAWER_CLOSE_LABEL = '关闭抽屉'
