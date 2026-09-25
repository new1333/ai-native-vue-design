/**
 * textarea/ —— 逻辑常量收口（状态/拉伸方向全集、默认值）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { TextareaResize, TextareaStatus } from './Textarea.types'

/** 校验状态全集（与 Textarea.types.ts 的 TextareaStatus 一一对应）。 */
export const TEXTAREA_STATUSES = ['default', 'error'] as const satisfies readonly TextareaStatus[]

/** 拉伸方向全集（与 Textarea.types.ts 的 TextareaResize 一一对应）。 */
export const TEXTAREA_RESIZES = ['none', 'vertical'] as const satisfies readonly TextareaResize[]

/** 默认校验状态。 */
export const TEXTAREA_STATUS_DEFAULT = 'default' as const

/** 默认拉伸方向：多行文本只允许垂直拉伸（横向拉破容器栅格）。 */
export const TEXTAREA_RESIZE_DEFAULT = 'vertical' as const

/** 默认可见行数（原生 rows）。 */
export const TEXTAREA_ROWS_DEFAULT = 3
