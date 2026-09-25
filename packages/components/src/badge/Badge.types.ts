/**
 * badge/ —— Badge 的公共类型（Props / Slots）。
 * 与 Badge.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 状态语义档位（soft 底 + 同系文字色 token）。 */
export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

/** Badge 的 Props。 */
export interface BadgeProps {
  /** 状态语义档位，默认 'neutral'。 */
  variant?: BadgeVariant
  /** 前置小圆点（颜色随同系文字色），默认关闭。 */
  dot?: boolean
}

/** Badge 的 Slots。 */
export interface BadgeSlots {
  /** 徽标文本。 */
  default?: () => VNode[]
}
