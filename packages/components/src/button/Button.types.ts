/**
 * button/ —— Button 与 ButtonRoot 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Button.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 视觉档位。 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/** 尺寸档位。 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** 原生 button type。 */
export type ButtonNativeType = 'button' | 'submit' | 'reset'

/** Button 的 Props。 */
export interface ButtonProps {
  /** 视觉档位，默认 'secondary'。 */
  variant?: ButtonVariant
  /** 尺寸；缺省时 ButtonGroup 内跟随组 size，独立使用为 'md'。 */
  size?: ButtonSize
  /** 原生 button type，默认 'button'。 */
  type?: ButtonNativeType
  /** 加载中：拦截点击/键盘激活并置 aria-busy="true"。 */
  loading?: boolean
  /** 禁用：原生 disabled + 拦截点击/键盘激活。 */
  disabled?: boolean
  /** 块级撑满容器宽度。 */
  block?: boolean
}

/** Button 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ButtonEmits {
  /** 点击（仅在非 disabled/loading 时触发；键盘 Enter/Space 激活同路径）。 */
  click: [event: MouseEvent]
}

/** Button 的 Slots。 */
export interface ButtonSlots {
  /** 按钮文本/内容（应始终有可读 label）。 */
  default?: () => VNode[]
  /** 左侧图标（内联 SVG，尺寸 16/20/24 由组件按 size 统一约束）。 */
  icon?: () => VNode[]
  /** 右侧图标。 */
  iconRight?: () => VNode[]
}

/** Button 对外暴露的实例方法。 */
export interface ButtonExpose {
  /** 聚焦根按钮元素（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}

/**
 * ButtonRoot（无样式交互根）的 Props。
 * 承载交互与 aria 契约，不含任何视觉样式。
 */
export interface ButtonRootProps {
  /** 原生 button type，默认 'button'。 */
  type?: ButtonNativeType
  /** 加载中语义：aria-busy + 激活拦截。 */
  loading?: boolean
  /** 禁用语义：原生 disabled + 激活拦截。 */
  disabled?: boolean
}

/** ButtonRoot 的 Emits（元组语法）。 */
export interface ButtonRootEmits {
  /** 点击（已被 loading/disabled 语义网关过滤）。 */
  click: [event: MouseEvent]
}

/** ButtonRoot 的 Slots。 */
export interface ButtonRootSlots {
  /** 根元素内容。 */
  default?: () => VNode[]
}

/** ButtonRoot 对外暴露的实例方法。 */
export interface ButtonRootExpose {
  /** 聚焦根按钮元素。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
