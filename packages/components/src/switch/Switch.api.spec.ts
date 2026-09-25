// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Switch from './Switch.vue'

describe('Switch api', () => {
  it('渲染 ui-switch 根（label 元素）与原生 button 控件', () => {
    const wrapper = mount(Switch)
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.classes()).toContain('ui-switch')
    const control = wrapper.find('button')
    expect(control.element.tagName).toBe('BUTTON')
    expect(control.attributes('type')).toBe('button')
  })

  it('默认：md 尺寸、未选中（aria-checked=false）、无 loading/disabled', () => {
    const wrapper = mount(Switch)
    expect(wrapper.classes()).toContain('ui-switch--md')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('button').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.ui-switch__label').exists()).toBe(false)
  })

  it('modelValue=true：aria-checked="true" 与 checked 修饰类落位', () => {
    const wrapper = mount(Switch, { props: { modelValue: true } })
    expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
    expect(wrapper.classes()).toContain('ui-switch--checked')
  })

  it('size=sm：切换 sm 档类', () => {
    expect(mount(Switch, { props: { size: 'sm' } }).classes()).toContain('ui-switch--sm')
  })

  it('loading：aria-busy="true" 但不落原生 disabled（保持可聚焦）', () => {
    const wrapper = mount(Switch, { props: { loading: true } })
    expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.ui-switch__spinner').exists()).toBe(true)
  })

  it('disabled：原生 disabled 属性与修饰类落位', () => {
    const wrapper = mount(Switch, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-switch--disabled')
  })

  it('label prop 渲染文本；默认插槽优先于 label prop', () => {
    expect(mount(Switch, { props: { label: '通知' } }).find('.ui-switch__label').text()).toBe('通知')

    const bySlot = mount(Switch, { props: { label: 'prop' }, slots: { default: () => h('b', '插槽') } })
    expect(bySlot.find('.ui-switch__label').text()).toBe('插槽')
  })

  it('update:modelValue 已声明（载荷断言见 behavior spec）', async () => {
    const wrapper = mount(Switch)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('attrs 透传（inheritAttrs:false）：合并到内部 button，不落根 label', () => {
    const wrapper = mount(Switch, {
      attrs: { id: 'notify', 'aria-label': '通知开关', 'aria-describedby': 'notify-tip' },
    })
    const control = wrapper.find('button')
    expect(control.attributes('id')).toBe('notify')
    expect(control.attributes('aria-label')).toBe('通知开关')
    expect(control.attributes('aria-describedby')).toBe('notify-tip')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })
})
