/**
 * tag/ —— 逻辑常量收口（variant 全集、默认值、aria 文案、关闭图标 path 数据）。
 * 不是视觉值；视觉一律走 --ui-* token（paper.css，见 CONVENTIONS §2）。
 */
import type { TagVariant } from './Tag.types'

/** 语义档位全集（与 Tag.types.ts 的 TagVariant 一一对应）。 */
export const TAG_VARIANTS = ['neutral', 'success', 'warning', 'danger', 'info'] as const satisfies readonly TagVariant[]

/** 默认语义档位。 */
export const TAG_VARIANT_DEFAULT = 'neutral' as const

/** 关闭按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const TAG_CLOSE_ARIA_LABEL = '关闭'

/** 关闭按钮 X 图标 path 数据（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸 16）。 */
export const TAG_CLOSE_ICON_PATHS: readonly string[] = ['m6.5 6.5 11 11', 'm17.5 6.5-11 11']
