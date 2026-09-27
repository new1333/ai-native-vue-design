/**
 * popconfirm/ —— Popconfirm 的公共类型（Props / Emits / Slots）。
 * 与 Popconfirm.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 气泡相对触发元素的方向。 */
export type PopconfirmPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Popconfirm 的 Props。 */
export interface PopconfirmProps {
  /** 确认气泡的标题（一句话）；与 description 至少提供一个，否则点击不弹层。 */
  title?: string
  /** 可选的补充说明文字（展示在标题下方）。 */
  description?: string
  /** 确认按钮文案，默认「确认」。 */
  confirmText?: string
  /** 取消按钮文案，默认「取消」。 */
  cancelText?: string
  /** 危险动作：确认按钮走 destructive token（danger-soft 柔底 → hover 实底），默认图标转 --ui-danger。 */
  danger?: boolean
  /** 气泡方向，默认 'top'；打开期间切换会按新方向重排（不做视口碰撞翻转）。 */
  placement?: PopconfirmPlacement
}

/** Popconfirm 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface PopconfirmEmits {
  /** 点击确认按钮：先发出事件，组件随后关闭气泡并把焦点还原到触发元素。 */
  confirm: []
  /** 点击取消按钮：先发出事件，组件随后关闭气泡并把焦点还原到触发元素。 */
  cancel: []
}

/** Popconfirm 的 Slots。 */
export interface PopconfirmSlots {
  /**
   * 触发元素：插槽为「单个元素/组件 vnode」时该元素直接作为触发元素——组件向其
   * 克隆合并 id、aria-expanded、aria-controls 与 click/keydown（Esc）监听，不产生
   * 包装 DOM（元素应可聚焦，如 Button / 原生 button / a）；文本/多根/空插槽回退为
   * 内建原生 button 触发器。应始终有可读 label。
   */
  trigger?: () => VNode[]
  /** 标题左侧的图标；未提供时渲染内建警示图标（装饰性、aria-hidden）。 */
  icon?: () => VNode[]
}
