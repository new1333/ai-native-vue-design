// a11y spec：原生 radio 语义 / label 关联 / 焦点管理（RadioGroup 的用例见 RadioGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Radio from './Radio.vue'
import type { RadioExpose } from './Radio.types'

describe('Radio a11y', () => {
  it('原生 <input type="radio">：无 role / aria-checked / tabindex（checked 语义原生表达）', () => {
    const control = mount(Radio, { props: { value: 'a' } }).find('input')
    expect(control.attributes('role')).toBeUndefined()
    expect(control.attributes('aria-checked')).toBeUndefined()
    expect(control.attributes('tabindex')).toBeUndefined()
  })

  it('根为 label 元素关联原生控件：点击文本即选中（无 id/for 依赖）', () => {
    const wrapper = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.find('input').element.closest('label')).toBe(wrapper.element)
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const control = mount(Radio, { props: { value: 'a', disabled: true } }).find('input')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('选中圆点为纯装饰（aria-hidden），不进入可读内容', () => {
    const wrapper = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(wrapper.find('.ui-radio__dot').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('甲')
  })

  it('expose.focus()/blur() 落在原生 radio 上（键盘用户入口）', () => {
    const wrapper = mount(Radio, { props: { value: 'a' }, attachTo: document.body })
    const exposed = wrapper.vm as unknown as RadioExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('input').element)
    wrapper.unmount()
  })
})
