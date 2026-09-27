/**
 * hover-card/ —— HoverCard 的公共类型（Props / Emits / Slots）。
 * 与 HoverCard.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 浮层相对触发元素的方向。 */
export type HoverCardPlacement = 'top' | 'bottom' | 'left' | 'right'

/** HoverCard 的 Props。 */
export interface HoverCardProps {
  /**
   * 受控显隐（v-model）：绑定了 v-model 或显式直传 :model-value 即为受控，显隐完全
   * 跟随该值，组件只发出 update:modelValue；未绑定时为非受控，组件内部维护开合状态。
   * 两种模式下一切开合路径（hover/focus 进入离开、Esc）都会先发出 update:modelValue。
   */
  modelValue?: boolean
  /**
   * 打开延迟（ms）：指针进入或键盘聚焦触发元素后延迟开启（防止掠过即弹），
   * 默认 150。
   */
  openDelay?: number
  /**
   * 关闭宽限（ms）：移出触发元素/卡片后延迟关闭，期间移回触发元素或移入卡片即取消，
   * 保证卡片内容可被指针停留与交互，默认 150。
   */
  closeDelay?: number
  /** 浮层方向，默认 'top'；打开期间切换会按新方向重排。 */
  placement?: HoverCardPlacement
}

/** HoverCard 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface HoverCardEmits {
  /** 显隐变更（v-model）：一切开合路径先发出，由使用方决定实际状态。 */
  'update:modelValue': [value: boolean]
}

/** HoverCard 的 Slots。 */
export interface HoverCardSlots {
  /**
   * 触发元素：插槽为「单个元素/组件 vnode」时该元素直接作为触发元素——组件向其
   * 克隆合并 id、aria-expanded、aria-controls 与 hover/focus/Esc 监听，不产生包装
   * DOM（元素应可聚焦，如 button / a / 本库 Button，保证键盘可达）；文本/多根/空插槽
   * 回退为内建原生 button 触发器。应始终有可读 label。
   */
  trigger?: () => VNode[]
  /** 预览卡内容：用户/条目信息摘要（可含链接、按钮等轻交互）；未提供该插槽时不弹层。 */
  default?: () => VNode[]
}
