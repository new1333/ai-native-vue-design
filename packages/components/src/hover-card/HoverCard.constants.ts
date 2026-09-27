/**
 * hover-card/ —— 逻辑常量收口（方向全集、键名、开合节奏默认值、定位间距；
 * 不是视觉值，视觉只走 --ui-* token）。
 */
import type { HoverCardPlacement } from './HoverCard.types'

/** 方向全集（与 HoverCard.types.ts 的 HoverCardPlacement 一一对应）。 */
export const HOVER_CARD_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

/** 默认方向。 */
export const HOVER_CARD_PLACEMENT_DEFAULT: HoverCardPlacement = 'top'

/**
 * 打开延迟默认值：指针进入/键盘聚焦触发元素后延迟开启（防掠过即弹）。
 * 交互节奏常量（同 tooltip 显示延迟 / popover hover 开启延迟的节奏），
 * 非 CSS 动效时长——入场动画时长走 --ui-motion-fast token。
 */
export const HOVER_CARD_OPEN_DELAY_DEFAULT = 150

/**
 * 关闭宽限默认值：移出触发元素/卡片后延迟关闭，期间移回触发元素或移入卡片即取消。
 */
export const HOVER_CARD_CLOSE_DELAY_DEFAULT = 150

/** 关闭浮层的键盘键。 */
export const HOVER_CARD_KEY_ESCAPE = 'Escape'

/** 浮层与触发元素的间距（token 引用，供内联定位的 calc 使用，禁止裸 px）。 */
export const HOVER_CARD_GAP = 'var(--ui-space-2)' as const
