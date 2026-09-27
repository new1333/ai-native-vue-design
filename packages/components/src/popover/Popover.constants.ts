/**
 * popover/ —— 逻辑常量收口（方向/触发方式全集、键名、hover 节奏、定位间距；
 * 不是视觉值，视觉只走 --ui-* token）。
 */
import type { PopoverPlacement, PopoverTrigger } from './Popover.types'

/** trigger 全集（与 Popover.types.ts 的 PopoverTrigger 一一对应）。 */
export const POPOVER_TRIGGERS = ['click', 'hover'] as const

/** 默认触发方式。 */
export const POPOVER_TRIGGER_DEFAULT: PopoverTrigger = 'click'

/** 方向全集（与 Popover.types.ts 的 PopoverPlacement 一一对应）。 */
export const POPOVER_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

/** 默认方向。 */
export const POPOVER_PLACEMENT_DEFAULT: PopoverPlacement = 'top'

/** closeOnScrim 默认值：打开期间点击触发元素/卡片之外区域关闭。 */
export const POPOVER_CLOSE_ON_SCRIM_DEFAULT = true

/**
 * hover 模式开启延迟：进入触发元素后延迟开启（节奏同 tooltip 的显示延迟）。
 * 交互节奏常量，非 CSS 动效时长——入场动画时长走 --ui-motion-fast token。
 */
export const POPOVER_SHOW_DELAY_MS = 150

/**
 * hover 模式关闭宽限：移出触发元素/卡片后延迟关闭，期间移入卡片即取消
 * （保证卡片内容可被指针停留与交互）。
 */
export const POPOVER_HIDE_DELAY_MS = 150

/** 关闭浮层的键盘键。 */
export const POPOVER_KEY_ESCAPE = 'Escape'

/** 浮层与触发元素的间距（token 引用，供内联定位的 calc 使用，禁止裸 px）。 */
export const POPOVER_GAP = 'var(--ui-space-2)' as const
