/**
 * radio/ —— RadioGroup 与 Radio 的公共类型（Props / Emits / Slots / 注入上下文）。
 * 与 Radio.meta.ts / RadioGroup.meta.ts 的 api 字段保持一致。
 */
import type { ComputedRef, VNode } from 'vue'

/** 选项值类型：原生 radio 的 value 语义（字符串或数字）。 */
export type RadioValue = string | number

/** RadioGroup 的 Props。 */
export interface RadioGroupProps {
  /** v-model 当前选中值；未选中为 undefined。 */
  modelValue?: RadioValue
  /**
   * 原生 name（必填）：同组 radio 的分组依据——原生互斥与方向键导航都由
   * 浏览器按 name 实现；必填保证组语义完整。
   */
  name: string
  /** 整组禁用：组内全部 Radio 原生 disabled（移出 Tab 序）。 */
  disabled?: boolean
}

/** RadioGroup 的 Emits（Vue 3.3+ 元组语法）。 */
export interface RadioGroupEmits {
  /** v-model 更新：组内任一 Radio change 时以该 Radio 的 value 发出。 */
  'update:modelValue': [value: RadioValue]
}

/** RadioGroup 的 Slots。 */
export interface RadioGroupSlots {
  /** 组内放置若干 Radio（渲染序即原生 Tab/方向键导航序）。 */
  default?: () => VNode[]
}

/** Radio 的 Props。 */
export interface RadioProps {
  /** 该项对应的值（必填；change 时经 RadioGroup 以 update:modelValue 发出）。 */
  value: RadioValue
  /** 可读名称；与默认插槽等价，插槽优先。 */
  label?: string
  /** 单项禁用（与组 disabled 取或，原生 disabled）。 */
  disabled?: boolean
}

/** Radio 的 Slots。 */
export interface RadioSlots {
  /** label 内容（优先于 label prop；点击文本即选中）。 */
  default?: () => VNode[]
}

/** RadioGroup → 组内 Radio 的注入上下文（provide/inject 契约）。 */
export interface RadioGroupContext {
  /** 原生 name（响应式，随组 props 更新）。 */
  name: ComputedRef<string>
  /** 当前选中值（响应式）。 */
  modelValue: ComputedRef<RadioValue | undefined>
  /** 整组禁用（响应式）。 */
  disabled: ComputedRef<boolean>
  /** 选中某值：由 Radio 在原生 change 路径调用，RadioGroup 发出 update:modelValue。 */
  select: (value: RadioValue) => void
}

/** Radio 对外暴露的实例方法。 */
export interface RadioExpose {
  /** 聚焦原生 radio（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
