/**
 * form/ —— FormField 的公共类型（Props / Slots / 控件属性契约）。
 * 与 FormField.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/**
 * 可直接 v-bind 到表单控件上的属性集合（FormField 默认插槽作用域提供）。
 * 控件（Input / Textarea / Select / 自定义控件）接收后即完成
 * label 关联与 aria-invalid / aria-describedby / aria-required 落位。
 */
export interface FormControlAttrs {
  /** 控件 id：label[for] 的关联目标（SSR 稳定，基于 Vue useId + 固定前缀）。 */
  id: string
  /** 错误态时为 'true'，无错误时不出现。 */
  'aria-invalid'?: 'true'
  /** 描述元素 id（错误文案或 help 文案；无描述时不出现）。 */
  'aria-describedby'?: string
  /** required 时为 'true'，否则不出现。 */
  'aria-required'?: 'true'
}

/** FormField 默认插槽作用域。 */
export interface FormFieldSlotScope {
  /** 控件 id（label[for] 关联目标；SSR 稳定）。 */
  id: string
  /** 是否处于错误态（error prop 或 Form 注入的校验错误非空）。 */
  invalid: boolean
  /** 可直接 v-bind 到控件上的属性集合（id / aria-invalid / aria-describedby / aria-required）。 */
  controlAttrs: FormControlAttrs
}

/** FormField 的 Props。 */
export interface FormFieldProps {
  /** 字段名：对应 Form 的 model 键与 rules 键，用于读取注入的校验错误。 */
  name: string
  /** 标签文本：渲染为 label[for=控件 id]。 */
  label?: string
  /** 必填标记：label 后红色 *（aria-hidden，纯视觉），controlAttrs 附带 aria-required="true"。 */
  required?: boolean
  /**
   * 错误文案：优先于 Form 注入的校验错误；空串视为无错误。
   * 无 Form 时（独立使用）仅展示该 prop。
   */
  error?: string
  /** 帮助文案：无错误时展示于控件下方（aria-describedby 指向）；出现错误时让位于错误文案。 */
  help?: string
}

/** FormField 的 Slots。 */
export interface FormFieldSlots {
  /** 表单控件（Input / Textarea / Select / 自定义控件）；作用域见 FormFieldSlotScope。 */
  default?: (scope: FormFieldSlotScope) => VNode[]
  /** 错误文案内容；覆盖 error prop 的文本渲染，作用域 { error: 错误文案 }。 */
  error?: (scope: { error: string }) => VNode[]
}
