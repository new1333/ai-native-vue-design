/**
 * statistic/ —— 逻辑常量收口（不是视觉值，视觉只走 --ui-* token）。
 */
import type { StatisticTrend } from './Statistic.types'

/** 倒计时步进间隔（毫秒）。 */
export const STATISTIC_COUNTDOWN_TICK_MS = 1000

/** value 默认值。 */
export const STATISTIC_VALUE_DEFAULT = 0

/** precision 默认值。 */
export const STATISTIC_PRECISION_DEFAULT = 0

/**
 * 趋势箭头的可访问名（role="img" 的 aria-label，方向语义双通道）。
 * 文案常量非视觉值（先例：Timeline pending 文案 TIMELINE_PENDING_TEXT）。
 */
export const STATISTIC_TREND_LABELS: Record<StatisticTrend, string> = {
  up: '上升',
  down: '下降',
}
