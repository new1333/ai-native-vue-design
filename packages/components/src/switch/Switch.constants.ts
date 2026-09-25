/**
 * switch/ —— 逻辑常量收口（尺寸档位全集与默认值；不是视觉值，视觉只走 --ui-* token）。
 */
import type { SwitchSize } from './Switch.types'

/** 尺寸档位全集（与 Switch.types.ts 的 SwitchSize 一一对应）。 */
export const SWITCH_SIZES = ['sm', 'md'] as const satisfies readonly SwitchSize[]

/** 默认尺寸档位。 */
export const SWITCH_SIZE_DEFAULT = 'md' as const
