/**
 * textarea/ —— Textarea 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Textarea.meta.ts 的 api 字段保持一致。
 */

/** 拉伸方向子集：默认仅垂直拉伸，或锁定不可拉伸。 */
export type TextareaResize = 'none' | 'vertical'

/** 校验状态（同 Input 的 InputStatus）。 */
export type TextareaStatus = 'default' | 'error'

/** Textarea 的 Props。 */
export interface TextareaProps {
  /** v-model 绑定值（string，受控），默认空字符串。 */
  modelValue?: string
  /** 可见行数（原生 rows 属性），默认 3。 */
  rows?: number
  /** 用户可拉伸方向，默认 'vertical'；'none' 锁定为固定尺寸。 */
  resize?: TextareaResize
  /** 占位文本（不替代 label，label 由使用方或 FormField 提供）。 */
  placeholder?: string
  /** 禁用：原生 disabled 属性（移出 Tab 序）。 */
  disabled?: boolean
  /** 只读：原生 readonly 属性（可聚焦可选中、不可编辑）。 */
  readonly?: boolean
  /** 最大输入长度（原生 maxlength，浏览器原生截断）。 */
  maxlength?: number
  /** 显示字数统计（容器右下角弱文字）：配 maxlength 时为 x/y，否则为 x。 */
  showCount?: boolean
  /** 校验状态，默认 'default'；'error' 时容器转 danger 描边并推导 aria-invalid="true"。 */
  status?: TextareaStatus
}

/** Textarea 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface TextareaEmits {
  /** v-model 更新（原生 input 事件路径，载荷为输入区最新值）。 */
  'update:modelValue': [value: string]
}

/** Textarea 的 Slots（当前无插槽；显式导出以稳定公共契约）。 */
export interface TextareaSlots {}

/** Textarea 对外暴露的实例方法。 */
export interface TextareaExpose {
  /** 聚焦原生 textarea（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
