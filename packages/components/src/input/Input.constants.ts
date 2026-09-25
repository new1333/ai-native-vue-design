/**
 * input/ —— 逻辑常量收口（类型/状态全集、默认值、清空按钮可读名称）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { InputStatus, InputType } from './Input.types'

/** 支持的原生输入类型全集（与 Input.types.ts 的 InputType 一一对应）。 */
export const INPUT_TYPES = ['text', 'password'] as const satisfies readonly InputType[]

/** 校验状态全集（与 Input.types.ts 的 InputStatus 一一对应）。 */
export const INPUT_STATUSES = ['default', 'error'] as const satisfies readonly InputStatus[]

/** 默认输入类型。 */
export const INPUT_TYPE_DEFAULT = 'text' as const

/** 默认校验状态。 */
export const INPUT_STATUS_DEFAULT = 'default' as const

/** 清空按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const INPUT_CLEAR_ARIA_LABEL = '清空'
