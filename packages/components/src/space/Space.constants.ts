/**
 * space/ —— 逻辑常量收口（方向/档位/对齐全集与默认值）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { SpaceAlign, SpaceDirection, SpaceSize } from './Space.types'

/** 支持的排列方向全集（与 Space.types.ts 的 SpaceDirection 一一对应）。 */
export const SPACE_DIRECTIONS = ['row', 'column'] as const satisfies readonly SpaceDirection[]

/** 默认排列方向。 */
export const SPACE_DIRECTION_DEFAULT = 'row' as const

/** 支持的间距档位全集（与 Space.types.ts 的 SpaceSize 一一对应）。 */
export const SPACE_SIZES = ['sm', 'md', 'lg'] as const satisfies readonly SpaceSize[]

/** 默认间距档位。 */
export const SPACE_SIZE_DEFAULT = 'md' as const

/** 支持的交叉轴对齐全集（与 Space.types.ts 的 SpaceAlign 一一对应）。 */
export const SPACE_ALIGNS = ['start', 'center', 'end', 'baseline', 'stretch'] as const satisfies readonly SpaceAlign[]

/** 默认交叉轴对齐。 */
export const SPACE_ALIGN_DEFAULT = 'center' as const
