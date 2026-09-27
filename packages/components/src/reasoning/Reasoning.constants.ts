/**
 * reasoning/ —— Reasoning 的逻辑常量收口（props 默认值与头部默认文案）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** streaming 默认值：默认非流式（历史消息直接呈现完成态）。 */
export const REASONING_STREAMING_DEFAULT = false as const

/** autoCollapse 默认值：流式结束（streaming true→false）自动收起。 */
export const REASONING_AUTO_COLLAPSE_DEFAULT = true as const

/** 流式中的头部默认文案。 */
export const REASONING_LABEL_STREAMING = '思考中…'

/** 完成态（未传 duration）的头部默认文案。 */
export const REASONING_LABEL_IDLE = '思考过程'
