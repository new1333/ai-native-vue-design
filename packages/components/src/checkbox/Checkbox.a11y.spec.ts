// a11y spec：原生 checkbox 语义 / 键盘路径（Space 切换）/ indeterminate 可达性 / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from './Checkbox.vue'
import type { CheckboxExpose } from './Checkbox.types'

describe('Checkbox a11y', () => {
  it('原生 <input type="checkbox">：不书写 role / aria-checked / tabindex（checked 语义原生表达）', () => {
    const control = mount(Checkbox).find('input')
    expect(control.attributes('role')).toBeUndefined()
    expect(control.attributes('aria-checked')).toBeUndefined()
    expect(control.attributes('tabindex')).toBeUndefined()
  })

  it('indeterminate：经 DOM property 暴露给读屏（客户端同步），SSR 无法表达该 property', async () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true }, attachTo: document.body })
    expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(true)
    wrapper.unmount()
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const control = mount(Checkbox, { props: { disabled: true } }).find('input')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('根为 label 元素关联原生控件：点击文本即切换（无 id/for 依赖）', () => {
    const wrapper = mount(Checkbox, { props: { label: '同意' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.find('input').element.closest('label')).toBe(wrapper.element)
  })

  it('键盘 Space 路径：keydown 不被组件拦截（defaultPrevented=false，原生切换保留）', () => {
    const wrapper = mount(Checkbox, { attachTo: document.body })
    const control = wrapper.find('input').element as HTMLInputElement
    control.focus()
    expect(document.activeElement).toBe(control)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    control.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('键盘切换路径：聚焦后 change 以布尔载荷发出 update:modelValue', async () => {
    const wrapper = mount(Checkbox, { attachTo: document.body })
    const control = wrapper.find('input')
    ;(control.element as HTMLInputElement).focus()
    await control.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    wrapper.unmount()
  })

  it('expose.focus()/blur() 落在原生控件上', () => {
    const wrapper = mount(Checkbox, { attachTo: document.body })
    const exposed = wrapper.vm as unknown as CheckboxExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  it('对勾 / 短横线标记 svg 均 aria-hidden，不进入可读内容', () => {
    const wrapper = mount(Checkbox, { props: { label: '选项' } })
    expect(wrapper.find('.ui-checkbox__mark--check').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-checkbox__mark--dash').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('选项')
  })

  it('无可见 label：attrs 提供的 aria-label 直达原生控件', () => {
    const control = mount(Checkbox, { attrs: { 'aria-label': '选择第一行' } }).find('input')
    expect(control.attributes('aria-label')).toBe('选择第一行')
  })
})
