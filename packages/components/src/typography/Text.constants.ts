/**
 * typography/ —— Text 的逻辑常量收口（默认档位）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** Text 默认渲染标签。 */
export const TEXT_AS_DEFAULT = 'span' as const

/** Text 默认字号档位（15px 正文）。 */
export const TEXT_SIZE_DEFAULT = 'md' as const

/** Text 默认字重（regular）。 */
export const TEXT_WEIGHT_DEFAULT = 400 as const

/** Text 默认颜色语义档位。 */
export const TEXT_COLOR_DEFAULT = 'text-1' as const
