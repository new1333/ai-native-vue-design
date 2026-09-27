/**
 * tag/ —— Tag 的公共类型（Props / Emits / Slots）。
 * 与 Tag.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 语义档位：对应 --ui-{variant}-soft 柔底 + 同系 --ui-{variant} 文字色 token。 */
export type TagVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

/** Tag 的 Props。 */
export interface TagProps {
  /** 语义档位，默认 'neutral'；决定柔底与文字/图标同系色。 */
  variant?: TagVariant
  /** 可移除：渲染关闭按钮（原生 button、aria-label="关闭"）；点击仅 emit close，移除与否由使用方控制。 */
  closable?: boolean
  /** 禁用：根元素 aria-disabled="true"，关闭按钮置 disabled 且不触发 close；整体视觉降为 muted。 */
  disabled?: boolean
}

/** Tag 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface TagEmits {
  /** 点击关闭按钮后触发；组件不自行移除，由使用方据此处理（如从列表删除该标签）。 */
  close: []
}

/** Tag 的 Slots。 */
export interface TagSlots {
  /** 标签文本（建议 2–8 字的分类/属性词）。 */
  default?: () => VNode[]
  /** 前置图标位；组件无内建图标，由使用方传入内联 SVG（建议 viewBox 0 0 24 24、stroke-width 1.5、currentColor，装饰性图标自行 aria-hidden）。 */
  icon?: () => VNode[]
}
