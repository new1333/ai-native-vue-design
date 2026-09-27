/**
 * timeline/ —— 逻辑常量收口（不是视觉值，视觉只走 --ui-* token）。
 */
import type { TimelineMode } from './Timeline.types'

/** mode 默认档。 */
export const TIMELINE_MODE_DEFAULT: TimelineMode = 'left'

/**
 * pending（幽灵）节点默认文案（dot/item 插槽均未覆盖时的内置可见文案；
 * 文案常量非视觉值，先例：Table 空态文案 TABLE_EMPTY_TEXT_DEFAULT）。
 */
export const TIMELINE_PENDING_TEXT = '进行中'
