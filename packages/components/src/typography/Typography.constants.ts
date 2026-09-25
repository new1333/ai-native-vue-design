/**
 * typography/ —— Text 与 Heading 共享的逻辑常量收口（档位全集、映射表）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { TypographyColor, TypographySize, TypographyWeight } from './Typography.types'

/** 字号档位全集（与 Typography.types.ts 的 TypographySize 一一对应）。 */
export const TYPOGRAPHY_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const satisfies readonly TypographySize[]

/** 字重档位全集（与 Typography.types.ts 的 TypographyWeight 一一对应）。 */
export const TYPOGRAPHY_WEIGHTS = [400, 500, 600] as const satisfies readonly TypographyWeight[]

/** 字重 → token 语义档类名后缀（400/500/600 → regular/medium/semibold，token 见 paper.css）。 */
export const TYPOGRAPHY_WEIGHT_CLASS: Record<TypographyWeight, 'regular' | 'medium' | 'semibold'> = {
  400: 'regular',
  500: 'medium',
  600: 'semibold',
}

/** 颜色语义档位全集（与 Typography.types.ts 的 TypographyColor 一一对应）。 */
export const TYPOGRAPHY_COLORS = ['text-1', 'text-2', 'text-3', 'muted'] as const satisfies readonly TypographyColor[]
