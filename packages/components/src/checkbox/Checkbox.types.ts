/**
 * checkbox/ —— Checkbox 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Checkbox.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** Checkbox 的 Props。 */
export interface CheckboxProps {
  /** v-model 绑定值（boolean，受控），默认 false。 */
  modelValue?: boolean
  /**
   * 半选（indeterminate）：纯视觉 + DOM 状态。它是 DOM property 而非 attribute，
   * SSR 无法表达，组件仅在客户端 onMounted 与 watch 中同步到原生控件；
   * 用户点击后浏览器会自动清除该状态，父层应在 onChange 时把它复位为 false。
   */
  indeterminate?: boolean
  /** 可读名称；与默认插槽等价，插槽优先（用于富文本 label）。 */
  label?: string
  /** 禁用：原生 disabled 属性（移出 Tab 序），点击/键盘切换均无效。 */
  disabled?: boolean
}

/** Checkbox 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface CheckboxEmits {
  /** v-model 更新（原生 change 事件路径，载荷为勾选后的布尔值）。 */
  'update:modelValue': [value: boolean]
}

/** Checkbox 的 Slots。 */
export interface CheckboxSlots {
  /** label 内容（优先于 label prop；点击文本即切换——根为 label 元素的原生关联）。 */
  default?: () => VNode[]
}

/** Checkbox 对外暴露的实例方法。 */
export interface CheckboxExpose {
  /** 聚焦原生 checkbox（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
