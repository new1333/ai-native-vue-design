/**
 * button/ —— 逻辑常量收口（键名、状态名；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey, Ref } from 'vue'
import type { ButtonSize } from './Button.types'

/** variant 全集（与 Button.types.ts 的 ButtonVariant 一一对应）。 */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const

/** size 全集（与 Button.types.ts 的 ButtonSize 一一对应）。 */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const

/** 原生 button type 全集。 */
export const BUTTON_NATIVE_TYPES = ['button', 'submit', 'reset'] as const

/** 默认 variant。 */
export const BUTTON_VARIANT_DEFAULT = 'secondary' as const

/** 默认 size（ButtonGroup 内未显式声明时先跟随组，组也未声明时落到该值）。 */
export const BUTTON_SIZE_DEFAULT = 'md' as const

/** 默认原生 type：非表单提交语义下避免意外的隐式提交。 */
export const BUTTON_NATIVE_TYPE_DEFAULT = 'button' as const

/**
 * 键盘激活键：原生 button 的 Enter / Space 激活行为。
 * ButtonRoot 统一在 keydown 阶段 preventDefault 并改由元素 .click() 触发，
 * 保证测试环境（happy-dom）与真实浏览器行为一致且不双触发。
 */
export const BUTTON_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/**
 * 注入键：ButtonGroup → 组内 Button 的共享 size。
 * 组内 Button 自身未声明 size 时取注入值。
 */
export const BUTTON_GROUP_SIZE_KEY: InjectionKey<Readonly<Ref<ButtonSize | undefined>>> = Symbol(
  'ui-button-group-size',
)
