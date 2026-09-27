/**
 * input-number/ —— InputNumber 的公共类型（Props / Emits / Slots / Expose）。
 * 与 InputNumber.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 数值取值：number = 有值；null = 空（输入框清空后提交的语义值）。 */
export type InputNumberValue = number | null

/** 定向步进方向：up = 增、down = 减（按钮与 ↑/↓/PageUp/PageDown 共用）。 */
export type InputNumberStepDirection = 'up' | 'down'

/** InputNumber 的 Props。 */
export interface InputNumberProps {
  /** v-model 绑定值（number | null，受控），默认 null（空）。 */
  modelValue?: InputNumberValue
  /** 允许的最小值；undefined = 无下界（不渲染 aria-valuemin）。 */
  min?: number
  /** 允许的最大值；undefined = 无上界（不渲染 aria-valuemax）。 */
  max?: number
  /** 步长，默认 1；PageUp/PageDown 为 step × 10。 */
  step?: number
  /** 小数位数（>= 0）：提交/步进后按此精度取整并格式化展示；undefined = 不干预小数位。 */
  precision?: number
  /** 是否渲染增/减步进按钮，默认 true。 */
  controls?: boolean
  /** 禁用：原生 disabled 属性 + 拦截全部步进与提交路径。 */
  disabled?: boolean
}

/** InputNumber 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface InputNumberEmits {
  /** v-model 更新：值实际发生变化（提交/步进/跳边界钳制后）时发出。 */
  'update:modelValue': [value: InputNumberValue]
  /** 一次提交或步进导致值变化后触发（载荷为钳制/取整后的最终值）。 */
  change: [value: InputNumberValue]
  /** 一次定向步进实际生效后触发：方向 + 步进后的值（到达边界被钳制为无变化时不发出）。 */
  step: [direction: InputNumberStepDirection, value: number]
}

/** InputNumber 的 Slots。 */
export interface InputNumberSlots {
  /** 前缀内容（通常是内联 SVG 图标或货币符号；viewBox 0 0 24 24、stroke-width 1.5、currentColor）。 */
  prefix?: () => VNode[]
  /** 后缀内容（渲染于步进按钮之后，通常是单位或图标）。 */
  suffix?: () => VNode[]
}

/** InputNumber 对外暴露的实例方法。 */
export interface InputNumberExpose {
  /** 聚焦原生 input（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
