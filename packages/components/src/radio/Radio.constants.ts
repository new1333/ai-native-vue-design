/**
 * radio/ —— 逻辑常量收口（注入键；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey } from 'vue'
import type { RadioGroupContext } from './Radio.types'

/**
 * 注入键：RadioGroup → 组内 Radio 的共享上下文（name / 选中值 / 整组禁用 / select）。
 * Radio 脱离组独立使用时注入不到，退化为无 name 的原生 radio（不推荐，不抛错）。
 */
export const RADIO_GROUP_CONTEXT_KEY: InjectionKey<RadioGroupContext> = Symbol('ui-radio-group-context')
