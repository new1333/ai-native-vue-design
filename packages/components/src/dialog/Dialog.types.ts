/**
 * dialog/ —— Dialog 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Dialog.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 尺寸档位。 */
export type DialogSize = 'sm' | 'md' | 'lg'

/** 关闭来源：遮罩点击 / Esc 键 / 默认关闭按钮。 */
export type DialogCloseReason = 'scrim' | 'esc' | 'footer'

/** Dialog 的 Props。 */
export interface DialogProps {
  /** 受控可见性（v-model）：true 渲染浮层。 */
  modelValue?: boolean
  /** 标题文本；无 title 插槽时作为回退内容渲染。 */
  title?: string
  /** 无标题时的面板可访问名兜底（渲染为 aria-label）；有标题时以标题关联优先。attrs 写 aria-label 亦被本 prop 同名受理。 */
  ariaLabel?: string
  /** 尺寸档位，默认 'md'。 */
  size?: DialogSize
  /** 点击遮罩是否请求关闭，默认 true。 */
  closeOnScrim?: boolean
}

/** Dialog 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface DialogEmits {
  /** v-model 更新：一切关闭路径先发出 false，由使用方决定实际状态。 */
  'update:modelValue': [value: boolean]
  /** 请求关闭（update:modelValue false 的同时附带来源）。 */
  close: [reason: DialogCloseReason]
}

/** Dialog 的 Slots。 */
export interface DialogSlots {
  /** 对话框正文。 */
  default?: () => VNode[]
  /** 标题；覆盖 title prop 的文本。 */
  title?: () => VNode[]
  /** 底部动作区；缺省渲染默认「关闭」按钮（复用本库 Button）。 */
  footer?: () => VNode[]
}

/** Dialog 对外暴露的实例方法。 */
export interface DialogExpose {
  /** 将焦点移入对话框（首个可聚焦元素，否则面板自身）。 */
  focus: () => void
}
