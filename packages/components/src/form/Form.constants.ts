/**
 * form/ —— Form 的逻辑常量收口（注入键等；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey } from 'vue'
import type { FormContext } from './Form.types'

/**
 * 注入键：Form → FormField 的上下文契约。
 * FormField 注入后按自身 name 读取字段级校验错误；
 * 注入不到（独立使用）时 FormField 仅展示自身 error prop。
 */
export const FORM_CONTEXT_KEY: InjectionKey<FormContext> = Symbol('ui-form-context')
