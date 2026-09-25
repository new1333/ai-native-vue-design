/**
 * alert/ —— Alert 的公共类型（Props / Emits / Slots）。
 * 与 Alert.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 语义档位：对应 --ui-{severity} 与 --ui-{severity}-soft 色彩 token。 */
export type AlertSeverity = 'info' | 'success' | 'warning' | 'danger'

/** Alert 的 Props。 */
export interface AlertProps {
  /** 语义档位，默认 'info'；决定柔底/图标色与 live region 角色（danger 为 alert，其余 status）。 */
  severity?: AlertSeverity
  /** 标题（一句话结论）；详细说明放默认插槽正文。 */
  title?: string
  /** 可关闭：渲染关闭按钮（原生 button、aria-label="关闭"）；点击仅 emit close，显隐由使用方控制。 */
  closable?: boolean
}

/** Alert 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface AlertEmits {
  /** 点击关闭按钮后触发；组件不自行隐藏，由使用方据此处理（如 v-if 移除）。 */
  close: []
}

/** Alert 的 Slots。 */
export interface AlertSlots {
  /** 正文（详细说明、补充信息或富内容），渲染于标题之下。 */
  default?: () => VNode[]
  /** 左侧图标；缺省时按 severity 渲染内建语义图标（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor、20px）。 */
  icon?: () => VNode[]
}
