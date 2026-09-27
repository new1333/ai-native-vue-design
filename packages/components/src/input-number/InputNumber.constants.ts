/**
 * input-number/ —— 逻辑常量收口（默认值、键盘键名、步进按钮可读名称）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { InputNumberStepDirection } from './InputNumber.types'

/** 默认步长。 */
export const INPUT_NUMBER_STEP_DEFAULT = 1 as const

/** PageUp / PageDown 的步进倍率：一次跨 step × 10。 */
export const INPUT_NUMBER_PAGE_STEP_MULTIPLIER = 10 as const

/** 定向步进方向全集（与 InputNumberStepDirection 一一对应）。 */
export const INPUT_NUMBER_STEP_DIRECTIONS = ['up', 'down'] as const satisfies readonly InputNumberStepDirection[]

/**
 * spinbutton 键盘受理键全集（WAI-ARIA Authoring Practices: Spinbutton）：
 * ↑/↓ 逐 step、PageUp/PageDown 跨 step × 10、Home/End 跳 min/max（有界时）。
 */
export const INPUT_NUMBER_KEYS: readonly string[] = [
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
]

/** 减少按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const INPUT_NUMBER_DECREASE_ARIA_LABEL = '减少' as const

/** 增加按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const INPUT_NUMBER_INCREASE_ARIA_LABEL = '增加' as const
