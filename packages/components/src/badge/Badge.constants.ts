/**
 * badge/ —— 逻辑常量收口（variant 全集、默认值）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { BadgeVariant } from './Badge.types'

/** 状态语义档位全集（与 Badge.types.ts 的 BadgeVariant 一一对应）。 */
export const BADGE_VARIANTS = ['neutral', 'success', 'warning', 'danger', 'info'] as const satisfies readonly BadgeVariant[]

/** 默认状态语义档位。 */
export const BADGE_VARIANT_DEFAULT = 'neutral' as const
