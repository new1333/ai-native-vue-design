/**
 * icon-button/ —— IconButton 的公共类型（Props / Emits / Slots / Expose）。
 * 与 IconButton.meta.ts 的 api 字段保持一致。
 *
 * 可访问名契约：aria-label / aria-labelledby 不声明为 props，
 * 经原生 attrs 透传直达根 button（同 Button 系的 attrs 约定）。
 */
import type { VNode } from 'vue'

/** 视觉档位。 */
export type IconButtonVariant = 'ghost' | 'outline' | 'primary'

/** 尺寸档位：sm→图标 16、md→图标 20、lg→图标 24。 */
export type IconButtonSize = 'sm' | 'md' | 'lg'

/** IconButton 的 Props。 */
export interface IconButtonProps {
  /** 视觉档位，默认 'ghost'（工具栏/卡片内安静动作）。 */
  variant?: IconButtonVariant
  /** 尺寸；同时决定图标渲染尺寸（sm=16 / md=20 / lg=24），默认 'md'。 */
  size?: IconButtonSize
  /** 加载中：图标让位于旋转指示、置 aria-busy="true"，激活路径全部拦截（同 Button）。 */
  loading?: boolean
  /** 禁用：原生 disabled + 拦截点击/键盘激活。 */
  disabled?: boolean
}

/** IconButton 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface IconButtonEmits {
  /** 点击（仅在非 disabled/loading 时触发；键盘 Enter/Space 激活同路径）。 */
  click: [event: MouseEvent]
}

/** IconButton 的 Slots。 */
export interface IconButtonSlots {
  /** 图标内容：仅内联 SVG（viewBox="0 0 24 24"、stroke-width 1.5、currentColor）；渲染尺寸由组件按 size 统一约束。 */
  default?: () => VNode[]
}

/** IconButton 对外暴露的实例方法。 */
export interface IconButtonExpose {
  /** 聚焦根按钮元素（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
