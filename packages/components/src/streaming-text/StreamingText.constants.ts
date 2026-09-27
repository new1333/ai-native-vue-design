/**
 * streaming-text/ —— StreamingText 的逻辑常量收口（显示态名与上屏节拍）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 显示态：流式进行中（增量上屏、渲染光标）。 */
export const STREAMING_TEXT_STATE_STREAMING = 'streaming' as const

/** 显示态：完成定格（全文定格、无光标）。 */
export const STREAMING_TEXT_STATE_DONE = 'done' as const

/**
 * 上屏节拍（ms）：reveal 循环的逻辑节拍。
 * 属于行为节奏逻辑常量（类似分页的每页条数），不是 CSS 动效时长——
 * 组件不引入任何 CSS 动画，样式层的动效时长仍只消费 --ui-motion-*。
 */
export const STREAMING_TEXT_REVEAL_TICK_MS = 24

/** 单次节拍最少上屏字符数（小增量也保持可感知的逐字节奏）。 */
export const STREAMING_TEXT_REVEAL_CHARS_MIN = 2

/**
 * 缓冲追平节奏：把当前未上屏增量均摊到这么多拍内追平（约 1.5s），
 * 避免一次性到达的大段 token 造成长时间静默等待。
 * 速率在内容变化时按当时增量定档，循环期间保持恒定（逐拍重算会衰减到追不平）。
 */
export const STREAMING_TEXT_REVEAL_CATCHUP_TICKS = 60
