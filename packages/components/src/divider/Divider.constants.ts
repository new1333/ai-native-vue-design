/**
 * divider/ —— 逻辑常量收口（方向全集、默认值、间距档位映射）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { DividerDirection } from './Divider.types'

/** 支持的分隔方向全集（与 Divider.types.ts 的 DividerDirection 一一对应）。 */
export const DIVIDER_DIRECTIONS = ['horizontal', 'vertical'] as const satisfies readonly DividerDirection[]

/** 默认分隔方向。 */
export const DIVIDER_DIRECTION_DEFAULT = 'horizontal' as const
