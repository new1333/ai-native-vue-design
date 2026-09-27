/**
 * scroll-area/ —— ScrollArea 的逻辑常量收口（非视觉值；视觉值只走 --ui-* token）。
 */
import type { ScrollAreaDirection, ScrollAreaType } from './ScrollArea.types'

/** type 默认档：悬停或滚动中可见。 */
export const SCROLL_AREA_TYPE_DEFAULT: ScrollAreaType = 'auto'

/** direction 默认档：仅纵向。 */
export const SCROLL_AREA_DIRECTION_DEFAULT: ScrollAreaDirection = 'vertical'

/**
 * type='scroll' / 'auto' 停止滚动后隐藏装饰条的静默时长（毫秒）。
 * 逻辑常量：淡出的过渡时长走 --ui-motion-default，此处只决定"何时开始隐藏"。
 */
export const SCROLL_AREA_HIDE_DELAY_MS = 1000
