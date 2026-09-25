// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Checkbox from './Checkbox.vue'

describe('Checkbox api', () => {
  it('渲染 ui-checkbox 根（label 元素）与原生 checkbox 控件', () => {
    const wrapper = mount(Checkbox)
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.classes()).toContain('ui-checkbox')
    const control = wrapper.find('input')
    expect(control.element.tagName).toBe('INPUT')
    expect(control.attributes('type')).toBe('checkbox')
  })

  it('默认：未选中、无半选、无禁用（checked/disabled 均为原生语义）', () => {
    const wrapper = mount(Checkbox)
    const control = wrapper.find('input').element as HTMLInputElement
    expect(control.checked).toBe(false)
    expect(wrapper.find('input').attributes('checked')).toBeUndefined()
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-checkbox--checked')
    expect(wrapper.classes()).not.toContain('ui-checkbox--indeterminate')
    expect(wrapper.classes()).not.toContain('ui-checkbox--disabled')
  })

  it('modelValue=true：checked 属性与 ui-checkbox--checked 修饰类落位', () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.classes()).toContain('ui-checkbox--checked')
  })

  it('indeterminate=true：ui-checkbox--indeterminate 修饰类落位（DOM property 见 behavior/a11y spec）', () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true } })
    expect(wrapper.classes()).toContain('ui-checkbox--indeterminate')
  })

  it('disabled：原生 disabled 属性 + 修饰类', () => {
    const wrapper = mount(Checkbox, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-checkbox--disabled')
  })

  it('label prop 渲染到专属文本节点', () => {
    const wrapper = mount(Checkbox, { props: { label: '同意协议' } })
    expect(wrapper.find('.ui-checkbox__label').text()).toBe('同意协议')
  })

  it('默认插槽渲染（优先于 label prop）', () => {
    const wrapper = mount(Checkbox, {
      props: { label: 'prop 文案' },
      slots: { default: () => h('span', { class: 'rich' }, '插槽文案') },
    })
    expect(wrapper.find('.ui-checkbox__label .rich').exists()).toBe(true)
    expect(wrapper.find('.ui-checkbox__label').text()).toBe('插槽文案')
  })

  it('无 label prop 且无插槽：不渲染文本节点（可读名称由使用方经 attrs 提供）', () => {
    const wrapper = mount(Checkbox)
    expect(wrapper.find('.ui-checkbox__label').exists()).toBe(false)
  })

  it('update:modelValue 已声明：change 路径以布尔载荷发出', async () => {
    const wrapper = mount(Checkbox)
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 checkbox，不落根 label', () => {
    const wrapper = mount(Checkbox, {
      attrs: { id: 'agree', name: 'agree', 'aria-describedby': 'agree-error' },
    })
    const control = wrapper.find('input')
    expect(control.attributes('id')).toBe('agree')
    expect(control.attributes('name')).toBe('agree')
    expect(control.attributes('aria-describedby')).toBe('agree-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
