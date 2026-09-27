/**
 * toggle-group/ —— 逻辑常量收口（注入键；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey } from 'vue'
import type { ToggleGroupContext } from './ToggleGroup.types'

/**
 * 注入键：ToggleGroup → 组内 ToggleItem 的共享上下文
 * （模式 / 形态 / 禁用 / 选中集合 / select / roving tabindex 注册表）。
 * ToggleItem 脱离组独立使用时注入不到，退化为无角色、不联动选中态的普通按钮（不推荐，不抛错）。
 */
export const TOGGLE_GROUP_CONTEXT_KEY: InjectionKey<ToggleGroupContext> = Symbol(
  'ui-toggle-group-context',
)
