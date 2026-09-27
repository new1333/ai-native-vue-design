/**
 * useSuggestion —— Suggestion 的交互语义 composable（headless）。
 *
 * 收口三类语义，供 Suggestion.vue 与极端定制场景直接使用：
 *   1. 交互：chip 的 click 与 Enter/Space 键盘激活统一经 guardSelect 上抛
 *      select（keydown 一律 preventDefault，避免原生二次激活与 Space 滚动，
 *      环境间行为一致）；
 *   2. loading：拦截一切选中路径并给出根级 aria-busy；
 *   3. disabled：整组禁用与单项禁用统一拦截。
 *
 * SSR 安全：不访问任何浏览器 API；select 只会在客户端事件回调中执行。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { SUGGESTION_ACTIVATION_KEYS } from './Suggestion.constants'
import type { SuggestionItem } from './Suggestion.types'

/** useSuggestion 选项。 */
export interface UseSuggestionOptions {
  /** loading 语义来源（响应式）。 */
  loading?: MaybeRefOrGetter<boolean>
  /** 整组禁用语义来源（响应式）。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** chip 通过闸门后的选中出口（组件内即 emit('select', item)）。 */
  onSelect: (item: SuggestionItem) => void
}

/** 绑定到根元素的 aria 契约。 */
export interface UseSuggestionAriaAttrs {
  /** loading 时为 'true'，否则不出现在 DOM。 */
  'aria-busy'?: 'true'
}

/** useSuggestion 返回值。 */
export interface UseSuggestionReturn {
  /** 是否处于 loading。 */
  loading: ComputedRef<boolean>
  /** 是否整组禁用。 */
  disabled: ComputedRef<boolean>
  /** 根元素 aria 契约（v-bind 到根元素）。 */
  ariaAttrs: ComputedRef<UseSuggestionAriaAttrs>
  /**
   * 单个 chip 的选中闸门：放行返回 true；被 loading/整组禁用/单项禁用拦截时
   * preventDefault + stopPropagation 并返回 false。
   * 原生 disabled 属性已挡住用户路径，这里同时兜底直接派发的合成事件。
   */
  guardSelect: (item: SuggestionItem, event?: Event) => boolean
  /** 统一选中入口：先过闸门再上抛 onSelect。 */
  select: (item: SuggestionItem, event?: Event) => void
  /**
   * chip keydown 处理器：Enter/Space 一律 preventDefault（拦截原生二次激活与
   * Space 滚动），未被禁用时经 select 上抛唯一一次选中。
   */
  onItemKeydown: (item: SuggestionItem, event: KeyboardEvent) => void
}

/** 判定键盘事件是否为激活键。 */
function isActivationKey(key: string): boolean {
  return SUGGESTION_ACTIVATION_KEYS.includes(key)
}

/** Suggestion 交互语义 composable。 */
export function useSuggestion(options: UseSuggestionOptions): UseSuggestionReturn {
  const loading = computed(() => toValue(options.loading) === true)
  const disabled = computed(() => toValue(options.disabled) === true)

  const ariaAttrs = computed<UseSuggestionAriaAttrs>(() =>
    loading.value ? { 'aria-busy': 'true' } : {},
  )

  function guardSelect(item: SuggestionItem, event?: Event): boolean {
    if (disabled.value || loading.value || item.disabled === true) {
      event?.preventDefault()
      event?.stopPropagation()
      return false
    }
    return true
  }

  function select(item: SuggestionItem, event?: Event): void {
    if (!guardSelect(item, event)) return
    options.onSelect(item)
  }

  function onItemKeydown(item: SuggestionItem, event: KeyboardEvent): void {
    if (!isActivationKey(event.key)) return
    // 统一在 keydown 拦截默认激活（含 Space 滚动），再经 select 唯一上抛。
    event.preventDefault()
    select(item, event)
  }

  return { loading, disabled, ariaAttrs, guardSelect, select, onItemKeydown }
}
