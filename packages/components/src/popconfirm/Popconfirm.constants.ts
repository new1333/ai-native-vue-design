/**
 * popconfirm/ —— 逻辑常量收口（方向全集、键名、默认按钮文案、定位间距；
 * 不是视觉值，视觉只走 --ui-* token）。
 */
import type { PopconfirmPlacement } from './Popconfirm.types'

/** 方向全集（与 Popconfirm.types.ts 的 PopconfirmPlacement 一一对应）。 */
export const POPCONFIRM_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

/** 默认方向。 */
export const POPCONFIRM_PLACEMENT_DEFAULT: PopconfirmPlacement = 'top'

/** 确认按钮默认文案。 */
export const POPCONFIRM_CONFIRM_TEXT_DEFAULT = '确认'

/** 取消按钮默认文案。 */
export const POPCONFIRM_CANCEL_TEXT_DEFAULT = '取消'

/** 关闭气泡的键盘键。 */
export const POPCONFIRM_KEY_ESCAPE = 'Escape'

/** 气泡与触发元素的间距（token 引用，供内联定位的 calc 使用，禁止裸 px）。 */
export const POPCONFIRM_GAP = 'var(--ui-space-2)' as const
