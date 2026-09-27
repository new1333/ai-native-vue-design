/**
 * image/ —— 逻辑常量收口（不是视觉值，视觉只走 --ui-* token）。
 */
import type { ImageFit, ImageStatus } from './Image.types'

/** fit 默认档：fill（与原生 img 行为一致）。 */
export const IMAGE_FIT_DEFAULT: ImageFit = 'fill'

/** alt 缺省值：空字符串 = 装饰性图片（读屏跳过）。 */
export const IMAGE_ALT_DEFAULT = ''

/** 状态机三态。 */
export const IMAGE_STATUS_LOADING: ImageStatus = 'loading'
export const IMAGE_STATUS_LOADED: ImageStatus = 'loaded'
export const IMAGE_STATUS_ERROR: ImageStatus = 'error'

/**
 * error 态默认文案（error 插槽未覆盖时的内置可见文案；
 * 文案常量非视觉值，先例：Timeline 的 TIMELINE_PENDING_TEXT）。
 */
export const IMAGE_ERROR_TEXT = '加载失败'

/** 预览浮层 aria-label 缺省（无 alt 时）。 */
export const IMAGE_PREVIEW_LABEL_DEFAULT = '图片预览'

/** 预览触发按钮 aria-label 缺省（无 alt 时）。 */
export const IMAGE_PREVIEW_TRIGGER_LABEL_DEFAULT = '预览大图'

/** 预览触发按钮 aria-label 前缀（有 alt 时：前缀 + alt）。 */
export const IMAGE_PREVIEW_TRIGGER_LABEL_PREFIX = '预览图片：'

/** 预览关闭按钮 aria-label。 */
export const IMAGE_PREVIEW_CLOSE_LABEL = '关闭预览'

/** 关闭预览的按键。 */
export const IMAGE_ESCAPE_KEY = 'Escape'

/** 预览焦点圈定的按键。 */
export const IMAGE_TAB_KEY = 'Tab'

/** 预览浮层内可聚焦元素选择器（Tab 圈定用）。 */
export const IMAGE_PREVIEW_FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
