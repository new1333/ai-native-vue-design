/**
 * rating/ —— 逻辑常量收口（键名 / 步进粒度 / aria 文案；不是视觉值，视觉只走 --ui-* token）。
 */

/** 键盘增档键名（WAI-ARIA radio 模式的方向键语义：右/上 = 增一档）。 */
export const RATING_INCREASE_KEYS: readonly string[] = ['ArrowRight', 'ArrowUp']

/** 键盘减档键名（左/下 = 减一档）。 */
export const RATING_DECREASE_KEYS: readonly string[] = ['ArrowLeft', 'ArrowDown']

/** 键盘清除键名（clearable 时清空当前评分；Backspace 必须 preventDefault 阻断浏览器后退）。 */
export const RATING_CLEAR_KEYS: readonly string[] = ['Delete', 'Backspace']

/** 半星步进粒度（allowHalf 时每档 0.5 星；0.5 在二进制浮点下精确，等值比较安全）。 */
export const RATING_HALF_STEP = 0.5

/** 整星步进粒度。 */
export const RATING_FULL_STEP = 1

/** 单档 radio 的 aria-label 单位（档位无可见文本，可读名称 = 档位值 + 单位，如 "3 星"）。 */
export const RATING_ARIA_UNIT = '星'
