/**
 * tooltip/ —— Tooltip 的公共类型（Props / Slots）。
 * 与 Tooltip.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 浮层相对触发元素的方向。 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Tooltip 的 Props。 */
export interface TooltipProps {
  /** 浮层方向，默认 'top'；打开期间切换会按新方向重排。 */
  placement?: TooltipPlacement
}

/** Tooltip 的 Slots。 */
export interface TooltipSlots {
  /** 唯一触发元素（应为恰一个可聚焦/可交互元素；组件会向其克隆合并事件与 aria-describedby）。 */
  default?: () => VNode[]
  /** 浮层提示内容；未提供时不弹层。 */
  content?: () => VNode[]
}
