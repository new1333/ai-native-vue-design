// a11y spec：原生语义 / aria 属性 / 键盘输入路径 / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Textarea from './Textarea.vue'
import type { TextareaExpose } from './Textarea.types'

describe('Textarea a11y', () => {
  it('原生 <textarea>（隐式 role=textbox），不额外书写 role', () => {
    const control = mount(Textarea).find('textarea')
    expect(control.element.tagName).toBe('TEXTAREA')
    expect(control.attributes('role')).toBeUndefined()
  })

  it('不改写 tabindex：自然进入 Tab 序', () => {
    expect(mount(Textarea).find('textarea').attributes('tabindex')).toBeUndefined()
  })

  it('status=error → aria-invalid="true"；default → 不出现', () => {
    expect(mount(Textarea, { props: { status: 'error' } }).find('textarea').attributes('aria-invalid')).toBe('true')
    expect(mount(Textarea).find('textarea').attributes('aria-invalid')).toBeUndefined()
  })

  it('aria-describedby 经 attrs 落在原生 textarea（FormField 接入点）', () => {
    const control = mount(Textarea, { attrs: { 'aria-describedby': 'field-error' } }).find('textarea')
    expect(control.attributes('aria-describedby')).toBe('field-error')
  })

  it('placeholder 不承担 label 职责：组件自身不设置 aria-label', () => {
    const control = mount(Textarea, { props: { placeholder: '占位' } }).find('textarea')
    expect(control.attributes('placeholder')).toBe('占位')
    expect(control.attributes('aria-label')).toBeUndefined()
  })

  it('键盘换行路径原生保留：Enter/方向键 keydown 不被组件拦截（defaultPrevented=false）', async () => {
    const wrapper = mount(Textarea, { attachTo: document.body })
    const control = wrapper.find('textarea').element
    control.focus()
    expect(document.activeElement).toBe(control)

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    control.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)

    const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    control.dispatchEvent(arrow)
    expect(arrow.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('键盘输入路径：expose.focus() 聚焦原生 textarea，键入发出 update:modelValue', async () => {
    const wrapper = mount(Textarea, { attachTo: document.body })
    const control = wrapper.find('textarea.ui-textarea__control')
    const exposed = wrapper.vm as TextareaExpose
    exposed.focus()
    expect(document.activeElement).toBe(control.element)
    await control.setValue('多行')
    expect(wrapper.emitted('update:modelValue')).toEqual([['多行']])
    exposed.blur()
    expect(document.activeElement).not.toBe(control.element)
    wrapper.unmount()
  })

  it('字数统计为可见真实文本（读屏可感知），非 aria-hidden 装饰', () => {
    const count = mount(Textarea, { props: { showCount: true, maxlength: 10, modelValue: 'abc' } }).find('.ui-textarea__count')
    expect(count.text()).toBe('3/10')
    expect(count.attributes('aria-hidden')).toBeUndefined()
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const control = mount(Textarea, { props: { disabled: true } }).find('textarea')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('readonly：原生 readonly（可聚焦可选中、不可编辑）', () => {
    expect(mount(Textarea, { props: { readonly: true } }).find('textarea').attributes('readonly')).toBeDefined()
  })
})
