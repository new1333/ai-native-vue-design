/**
 * useButton —— Button 的交互语义 composable（headless）。
 *
 * 收口三类语义，供 ButtonRoot 与极端定制场景直接使用：
 *   1. 交互：click 网关与 Enter/Space 键盘激活（统一 preventDefault 后
 *      由目标元素 .click() 触发，避免真实浏览器与测试环境行为分叉/双触发）；
 *   2. loading：拦截一切激活路径并给出 aria-busy；
 *   3. disabled：拦截一切激活路径。
 *
 * SSR 安全：不访问任何浏览器 API；.click() 只会在客户端事件回调中执行。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { BUTTON_ACTIVATION_KEYS } from './Button.constants'

/** useButton 选项。 */
export interface UseButtonOptions {
  /** loading 语义来源（响应式）。 */
  loading?: MaybeRefOrGetter<boolean>
  /** disabled 语义来源（响应式）。 */
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * 键盘激活目标元素 getter：keydown Enter/Space 时统一对其 .click()。
   * 缺省时不做键盘拦截（完全交由原生 button 默认行为）。
   */
  element?: () => HTMLElement | null
}

/** 绑定到根元素的 aria 契约。 */
export interface UseButtonAriaAttrs {
  /** loading 时为 'true'，否则不出现在 DOM。 */
  'aria-busy'?: 'true'
}

/** useButton 返回值。 */
export interface UseButtonReturn {
  /** 是否处于 loading。 */
  loading: ComputedRef<boolean>
  /** 是否被显式禁用。 */
  disabled: ComputedRef<boolean>
  /** 交互总闸：disabled || loading，一切激活路径据此拦截。 */
  interactionDisabled: ComputedRef<boolean>
  /** 根元素 aria 契约（v-bind 到根元素）。 */
  ariaAttrs: ComputedRef<UseButtonAriaAttrs>
  /**
   * click 网关：放行返回 true；拦截时 preventDefault + stopPropagation 并返回 false。
   * 原生 disabled 属性已挡住用户路径，这里同时兜底直接派发的合成事件。
   */
  guardClick: (event: MouseEvent) => boolean
  /**
   * keydown 处理器：Enter/Space 一律 preventDefault（阻止原生二次激活与 Space 滚动），
   * 未被禁用时对目标元素 .click() 完成唯一一次激活。
   */
  onKeydown: (event: KeyboardEvent) => void
}

/** 判定键盘事件是否为激活键。 */
function isActivationKey(key: string): boolean {
  return BUTTON_ACTIVATION_KEYS.includes(key)
}

/** Button 交互语义 composable。 */
export function useButton(options: UseButtonOptions = {}): UseButtonReturn {
  const loading = computed(() => toValue(options.loading) === true)
  const disabled = computed(() => toValue(options.disabled) === true)
  const interactionDisabled = computed(() => disabled.value || loading.value)

  const ariaAttrs = computed<UseButtonAriaAttrs>(() =>
    loading.value ? { 'aria-busy': 'true' } : {},
  )

  function guardClick(event: MouseEvent): boolean {
    if (interactionDisabled.value) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    return true
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!isActivationKey(event.key)) return
    // 统一在 keydown 拦截默认激活（含 Space 滚动），再以 .click() 唯一触发。
    event.preventDefault()
    if (interactionDisabled.value) return
    options.element?.()?.click()
  }

  return { loading, disabled, interactionDisabled, ariaAttrs, guardClick, onKeydown }
}
