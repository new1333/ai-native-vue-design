/**
 * empty-state/ —— EmptyState 的公共类型（Props / Slots）。
 * 与 EmptyState.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** EmptyState 的 Props。 */
export interface EmptyStateProps {
  /** 空态标题（一句话，text-2）；缺省时仅渲染图标与可选描述。 */
  title?: string
  /** 补充说明（text-3），解释空态成因或引导下一步。 */
  description?: string
}

/** EmptyState 的 Slots。 */
export interface EmptyStateSlots {
  /** 图标；缺省时渲染内建克制线稿图标（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor、24px）。 */
  icon?: () => VNode[]
  /** 下一步操作区（通常放一个 Button），渲染于描述之下。 */
  action?: () => VNode[]
}
