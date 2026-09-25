/**
 * form/ —— Form 的公共类型（Props / Emits / Slots / Expose / 注入契约）。
 * 与 Form.meta.ts 的 api 字段保持一致。
 */
import type { Ref, VNode } from 'vue'

/**
 * 单字段校验函数：入参为 model 中该字段当前值。
 * 返回 true 表示通过；返回错误文案表示失败；可返回 Promise（异步校验）。
 */
export type FormValidator = (value: unknown) => true | string | Promise<true | string>

/**
 * rules：字段名 → 校验函数数组。
 * 各字段内按序执行，取首个失败规则的文案；字段之间并行执行。
 */
export type FormRules = Readonly<Record<string, readonly FormValidator[]>>

/** errors：字段名 → 首个失败规则的错误文案。 */
export type FormErrors = Record<string, string>

/** Form 的 Props。 */
export interface FormProps {
  /** 表单数据对象：校验取值来源（rules 按字段名从此取值）。 */
  model: Record<string, unknown>
  /** 校验规则：字段名 → 校验函数数组；缺省为空对象（提交不经校验直接通过）。 */
  rules?: FormRules
  /**
   * 异步提交进行中（受控）：true 时拦截提交（不触发校验、不 emit submit），
   * 并并入默认插槽作用域的 pending。
   */
  pending?: boolean
}

/** Form 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface FormEmits {
  /** 提交：仅当全量校验通过且非 pending 时触发；载荷为原生 submit 事件（已 preventDefault）。 */
  submit: [event: SubmitEvent]
}

/** Form 默认插槽作用域。 */
export interface FormSlotScope {
  /** 当前是否无校验错误（errors 为空即 true；首次提交前为 true）。 */
  valid: boolean
  /** 表单忙：异步校验进行中或 pending prop 为 true；此间提交一律被拦截。 */
  pending: boolean
  /** 当前校验错误集合（字段名 → 文案）的浅拷贝；不应被使用方修改。 */
  errors: Readonly<FormErrors>
}

/** Form 的 Slots。 */
export interface FormSlots {
  /** 表单内容（通常为若干 FormField + 提交 Button）；作用域见 FormSlotScope。 */
  default?: (scope: FormSlotScope) => VNode[]
}

/** Form 对外暴露的实例方法。 */
export interface FormExpose {
  /**
   * 主动触发全量校验：更新内部 errors 并返回错误集合
   * （空对象即全部通过；返回值与 expose 的 Promise resolve 同步）。
   */
  validate: () => Promise<FormErrors>
  /** 清空全部校验错误（不改 model 值）。 */
  resetValidation: () => void
}

/**
 * Form → FormField 的 provide/inject 契约。
 * FormField 注入后按自身 name 读取字段级校验错误；未注入（独立使用）时仅展示 error prop。
 */
export interface FormContext {
  /** 各字段当前校验错误（响应式只读；字段名 → 错误文案）。 */
  errors: Readonly<Ref<Readonly<FormErrors>>>
}
