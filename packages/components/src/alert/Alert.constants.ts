/**
 * alert/ —— 逻辑常量收口（severity 全集、默认档、aria 文案、图标 path 数据）。
 * 不是视觉值；视觉一律走 --ui-* token（paper.css，见 CONVENTIONS §2）。
 */
import type { AlertSeverity } from './Alert.types'

/** 语义档位全集（与 Alert.types.ts 的 AlertSeverity 一一对应）。 */
export const ALERT_SEVERITIES = ['info', 'success', 'warning', 'danger'] as const satisfies readonly AlertSeverity[]

/** 默认语义档位。 */
export const ALERT_SEVERITY_DEFAULT = 'info' as const

/** 关闭按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const ALERT_CLOSE_ARIA_LABEL = '关闭'

/**
 * 各 severity 的内建图标 path 数据（内联 SVG：viewBox 0 0 24 24 / stroke-width 1.5 /
 * currentColor，尺寸 20，遵循设计文档 Icon Token；与 toast 家族的语义图标保持同一图形语言）。
 */
export const ALERT_ICON_PATHS: Record<AlertSeverity, readonly string[]> = {
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11.2v4.6', 'M12 7.9h.01'],
  success: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8.5 12.3 2.4 2.4 4.6-5.4'],
  warning: ['M12 4.2 3.7 18.9h16.6L12 4.2Z', 'M12 10.1v4', 'M12 16.9h.01'],
  danger: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm9.4 9.4 5.2 5.2', 'm14.6 9.4-5.2 5.2'],
}

/** 关闭按钮 X 图标 path 数据（内联 SVG，约束同上，尺寸 16）。 */
export const ALERT_CLOSE_ICON_PATHS: readonly string[] = ['m6.5 6.5 11 11', 'm17.5 6.5-11 11']
