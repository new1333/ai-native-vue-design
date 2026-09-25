/**
 * input/ —— Input 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Input.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 原生输入类型子集。 */
export type InputType = 'text' | 'password'

/** 校验状态。 */
export type InputStatus = 'default' | 'error'

/** Input 的 Props。 */
export interface InputProps {
  /** v-model 绑定值（string，受控），默认空字符串。 */
  modelValue?: string
  /** 原生输入类型，默认 'text'。 */
  type?: InputType
  /** 占位文本（不替代 label）。 */
  placeholder?: string
  /** 禁用：原生 disabled 属性 + 不渲染清空按钮。 */
  disabled?: boolean
  /** 只读：原生 readonly 属性 + 不渲染清空按钮。 */
  readonly?: boolean
  /** 最大输入长度（原生 maxlength，浏览器原生截断）。 */
  maxlength?: number
  /** 校验状态，默认 'default'；'error' 时容器转 danger 描边并置 aria-invalid="true"。 */
  status?: InputStatus
  /** 可清空：有值且非禁用/只读时渲染清空按钮（aria-label="清空"）。 */
  clearable?: boolean
}

/** Input 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface InputEmits {
  /** v-model 更新（原生 input 事件路径，载荷为输入框最新值）。 */
  'update:modelValue': [value: string]
  /** 点击清空按钮后触发（值已随 update:modelValue 置空，随后焦点交还输入框）。 */
  clear: []
}

/** Input 的 Slots。 */
export interface InputSlots {
  /** 前缀内容（通常是内联 SVG 图标；viewBox 0 0 24 24、stroke-width 1.5、currentColor）。 */
  prefix?: () => VNode[]
  /** 后缀内容（渲染于清空按钮之后，通常是单位或图标）。 */
  suffix?: () => VNode[]
}

/** Input 对外暴露的实例方法。 */
export interface InputExpose {
  /** 聚焦原生 input（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
