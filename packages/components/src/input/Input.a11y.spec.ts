// a11y spec：原生语义 / aria 属性 / 键盘输入与清空路径 / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from './Input.vue'
import type { InputExpose } from './Input.types'

describe('Input a11y', () => {
  it('原生 <input type="text">（隐式 role=textbox），不额外书写 role', () => {
    const control = mount(Input).find('input')
    expect(control.element.tagName).toBe('INPUT')
    expect(control.attributes('type')).toBe('text')
    expect(control.attributes('role')).toBeUndefined()
  })

  it('不改写 tabindex：自然进入 Tab 序', () => {
    expect(mount(Input).find('input').attributes('tabindex')).toBeUndefined()
  })

  it('status=error → aria-invalid="true"；default → 不出现', () => {
    expect(mount(Input, { props: { status: 'error' } }).find('input').attributes('aria-invalid')).toBe('true')
    expect(mount(Input).find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('aria-describedby 经 attrs 落在原生 input（FormField 接入点）', () => {
    const control = mount(Input, { attrs: { 'aria-describedby': 'field-error' } }).find('input')
    expect(control.attributes('aria-describedby')).toBe('field-error')
  })

  it('placeholder 不承担 label 职责：组件自身不设置 aria-label', () => {
    const control = mount(Input, { props: { placeholder: '占位' } }).find('input')
    expect(control.attributes('placeholder')).toBe('占位')
    expect(control.attributes('aria-label')).toBeUndefined()
  })

  it('清空按钮：原生 <button type="button">、aria-label="清空"、图标 aria-hidden', () => {
    const wrapper = mount(Input, { props: { clearable: true, modelValue: 'abc' } })
    const clear = wrapper.find('button.ui-input__clear')
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('清空')
    expect(clear.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const control = mount(Input, { props: { disabled: true } }).find('input')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('键盘输入路径：expose.focus() 聚焦原生 input，键入字符发出 update:modelValue', async () => {
    const wrapper = mount(Input, { attachTo: document.body })
    const control = wrapper.find('input.ui-input__control')
    const exposed = wrapper.vm as InputExpose
    exposed.focus()
    expect(document.activeElement).toBe(control.element)
    await control.trigger('keydown', { key: 'a' })
    await control.setValue('a')
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    exposed.blur()
    expect(document.activeElement).not.toBe(control.element)
    wrapper.unmount()
  })

  it('清空按钮键盘可达：原生 button 可聚焦且不改写 tabindex（Enter/Space 为平台原生激活）', async () => {
    const wrapper = mount(Input, {
      props: { clearable: true, modelValue: 'abc' },
      attachTo: document.body,
    })
    const clear = wrapper.find('button.ui-input__clear')
    expect(clear.attributes('tabindex')).toBeUndefined()
    ;(clear.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(clear.element)
    wrapper.unmount()
  })
})
