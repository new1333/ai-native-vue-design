/**
 * prompt-input/ —— 逻辑常量收口（键名、默认值、无障碍文案）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 触发发送的键名（Shift+Enter 除外；IME 组合输入中除外）。 */
export const PROMPT_INPUT_ENTER_KEY = 'Enter'

/** 默认自适应高度上限（行数）。 */
export const PROMPT_INPUT_MAX_ROWS_DEFAULT = 8

/** Enter 发送默认开启。 */
export const PROMPT_INPUT_SUBMIT_ON_ENTER_DEFAULT = true

/** 内建发送按钮的无障碍名称。 */
export const PROMPT_INPUT_SUBMIT_ARIA_LABEL = '发送'

/** 加载中内建停止按钮的无障碍名称。 */
export const PROMPT_INPUT_STOP_ARIA_LABEL = '停止'
