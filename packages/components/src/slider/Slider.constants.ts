/**
 * slider/ —— 逻辑常量收口（默认值、步进倍率、可读名称）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 默认最小值。 */
export const SLIDER_MIN_DEFAULT = 0

/** 默认最大值。 */
export const SLIDER_MAX_DEFAULT = 100

/** 默认步长。 */
export const SLIDER_STEP_DEFAULT = 1

/** PageUp / PageDown 的大步长倍率：大步长 = step × 该值。 */
export const SLIDER_PAGE_STEP_FACTOR = 10

/** range 模式低值柄的默认可读名称（aria-label）。 */
export const SLIDER_HANDLE_MIN_ARIA_LABEL = '最小值'

/** range 模式高值柄的默认可读名称（aria-label）。 */
export const SLIDER_HANDLE_MAX_ARIA_LABEL = '最大值'
