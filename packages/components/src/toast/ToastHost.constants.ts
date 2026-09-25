/**
 * toast/ —— 逻辑常量收口（变体名、默认时长、aria 文案、图标 path 数据）。
 * 不是视觉值：视觉一律走 --ui-* token（见 CONVENTIONS §2）。
 */
import type { ToastVariant } from './ToastHost.types'

/** 变体全集（与 ToastHost.types.ts 的 ToastVariant 一一对应）。 */
export const TOAST_VARIANTS = ['success', 'error', 'info', 'warning'] as const

/**
 * 默认自动关闭时长（毫秒）。
 * 展示时长是行为语义而非视觉动效，故为常量；视觉转场时长只走 --ui-motion-* token。
 */
export const TOAST_DURATION_DEFAULT = 4000

/** duration ≤ 0 的语义：不自动关闭（hover 暂停/恢复对其无效果）。 */
export const TOAST_DURATION_MANUAL = 0

/** 堆栈容器的 aria-label（契约：容器 role=region aria-label=通知）。 */
export const TOAST_REGION_LABEL = '通知'

/** 每条提示关闭按钮的 aria-label。 */
export const TOAST_CLOSE_ARIA_LABEL = '关闭通知'

/**
 * 变体图标 path 数据（内联 SVG：viewBox 0 0 24 24 / stroke-width 1.5 / currentColor，
 * 尺寸 16，遵循设计文档 Icon Token）。
 */
export const TOAST_ICON_PATHS: Record<ToastVariant, readonly string[]> = {
  success: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8.5 12.3 2.4 2.4 4.6-5.4'],
  error: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm9.4 9.4 5.2 5.2', 'm14.6 9.4-5.2 5.2'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11.2v4.6', 'M12 7.9h.01'],
  warning: ['M12 4.2 3.7 18.9h16.6L12 4.2Z', 'M12 10.1v4', 'M12 16.9h.01'],
}

/** 关闭按钮 X 图标 path 数据（内联 SVG，约束同上）。 */
export const TOAST_CLOSE_ICON_PATHS: readonly string[] = ['m6.5 6.5 11 11', 'm17.5 6.5-11 11']
