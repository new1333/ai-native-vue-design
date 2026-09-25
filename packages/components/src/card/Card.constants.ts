/**
 * card/ —— 逻辑常量收口（档位全集、默认值；不是视觉值，视觉只走 --ui-* token）。
 */
import type { CardShadow } from './Card.types'

/** 阴影档位全集（与 Card.types.ts 的 CardShadow 一一对应）。 */
export const CARD_SHADOWS = ['none', 'rest'] as const satisfies readonly CardShadow[]

/** 默认阴影档：静止面默认无阴影（设计文档 §Shape / Elevation）。 */
export const CARD_SHADOW_DEFAULT = 'none' as const
