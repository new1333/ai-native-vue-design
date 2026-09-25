/**
 * switch/ —— Switch 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Switch.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 尺寸档位。 */
export type SwitchSize = 'sm' | 'md'

/** Switch 的 Props。 */
export interface SwitchProps {
  /** v-model 绑定值（boolean，受控），默认 false。 */
  modelValue?: boolean
  /**
   * 加载中：置 aria-busy="true" 并拦截一切切换路径（点击与键盘激活），
   * 但保持可聚焦（读屏可达）——不落原生 disabled（同 Button 的 loading 语义）。
   */
  loading?: boolean
  /** 禁用：原生 disabled 属性（移出 Tab 序），一切切换路径无效。 */
  disabled?: boolean
  /** 可读名称；与默认插槽等价，插槽优先。 */
  label?: string
  /** 尺寸档位，默认 'md'。 */
  size?: SwitchSize
}

/** Switch 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface SwitchEmits {
  /** v-model 更新（点击/键盘激活路径，载荷为切换后的布尔值）。 */
  'update:modelValue': [value: boolean]
}

/** Switch 的 Slots。 */
export interface SwitchSlots {
  /** 可读名称内容（优先于 label prop；根为 label 元素，点击文本即切换）。 */
  default?: () => VNode[]
}

/** Switch 对外暴露的实例方法。 */
export interface SwitchExpose {
  /** 聚焦开关按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
