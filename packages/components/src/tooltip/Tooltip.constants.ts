/**
 * tooltip/ —— 逻辑常量收口（方向全集、键名、显示延迟；不是视觉值，视觉只走 --ui-* token）。
 */

/** 方向全集（与 Tooltip.types.ts 的 TooltipPlacement 一一对应）。 */
export const TOOLTIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

/** 默认方向。 */
export const TOOLTIP_PLACEMENT_DEFAULT = 'top' as const

/**
 * 显示延迟：hover/focus 进入后延迟显示（隐藏始终立即）。
 * 交互节奏常量（任务契约规定 150ms），非 CSS 动效时长——入场动画时长走 --ui-motion-fast token。
 */
export const TOOLTIP_SHOW_DELAY_MS = 150

/** 关闭浮层的键盘键。 */
export const TOOLTIP_ESCAPE_KEY = 'Escape'

/** 浮层与触发元素的间距（token 引用，供内联定位的 calc 使用，禁止裸 px）。 */
export const TOOLTIP_GAP = 'var(--ui-space-2)' as const
