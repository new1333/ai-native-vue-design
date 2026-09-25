/**
 * pagination/ —— 逻辑常量收口（默认值、aria 可读名称、省略号字符）。
 * 不是视觉值；视觉一律走 --ui-* token（paper.css）。
 */

/** 默认当前页。 */
export const PAGINATION_PAGE_DEFAULT = 1 as const

/** 默认数据总条数（无数据时为单页，上一页/下一页均禁用）。 */
export const PAGINATION_TOTAL_DEFAULT = 0 as const

/** 默认每页条数。 */
export const PAGINATION_PAGE_SIZE_DEFAULT = 10 as const

/** 默认当前页两侧保留的页码数（总页数 ≤ 2*1+5=7 时全量展示）。 */
export const PAGINATION_SIBLING_COUNT_DEFAULT = 1 as const

/** nav 容器的可读名称。 */
export const PAGINATION_ARIA_LABEL = '分页' as const

/** 上一页按钮的可读名称（图标按钮无文本，必须 aria-label）。 */
export const PAGINATION_PREV_ARIA_LABEL = '上一页' as const

/** 下一页按钮的可读名称。 */
export const PAGINATION_NEXT_ARIA_LABEL = '下一页' as const

/** 省略号占位字符（渲染在 aria-hidden 的非聚焦元素内，仅表达被折叠的连续页码）。 */
export const PAGINATION_ELLIPSIS_CHAR = '…' as const
