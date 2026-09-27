/**
 * popover/ —— Popover 的公共类型（Props / Emits / Slots）。
 * 与 Popover.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 触发方式：点击开合 / 悬停开合。 */
export type PopoverTrigger = 'click' | 'hover'

/** 浮层相对触发元素的方向。 */
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Popover 的 Props。 */
export interface PopoverProps {
  /**
   * 受控显隐（v-model）：绑定了 v-model 或显式直传 :model-value 即为受控，显隐完全
   * 跟随该值，组件只发出 update:modelValue；未绑定时为非受控，组件内部维护开合状态。
   * 两种模式下一切开合路径（点击、Esc、scrim、hover 离开）都会先发出 update:modelValue。
   */
  modelValue?: boolean
  /** 触发方式，默认 'click'。 */
  trigger?: PopoverTrigger
  /** 浮层方向，默认 'top'；打开期间切换会按新方向重排。 */
  placement?: PopoverPlacement
  /** 是否显示指向触发元素的小箭头，默认 false。 */
  arrow?: boolean
  /** 打开期间点击触发元素与卡片之外区域（透明命中层 scrim）是否关闭，默认 true。 */
  closeOnScrim?: boolean
}

/** Popover 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface PopoverEmits {
  /** 显隐变更（v-model）：一切开合路径先发出，由使用方决定实际状态。 */
  'update:modelValue': [value: boolean]
}

/** Popover 的 Slots。 */
export interface PopoverSlots {
  /**
   * 触发元素：插槽为「单个元素/组件 vnode」时该元素直接作为触发元素——组件向其
   * 克隆合并 id、aria-expanded、aria-controls 与 click/keydown（hover 模式另含
   * mouse/focus）监听，不产生包装 DOM（元素应可聚焦，如 Button / 原生 button / a）；
   * 文本/多根/空插槽回退为内建原生 button 触发器。应始终有可读 label。
   */
  trigger?: () => VNode[]
  /** 气泡卡片内容：任意内容或表单（卡片可交互，指针/焦点停留不关闭）；未提供时不弹层。 */
  default?: () => VNode[]
}
