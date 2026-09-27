// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传 / spinbutton aria 落位。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import InputNumber from './InputNumber.vue'

describe('InputNumber api', () => {
  it('渲染 ui-input-number 根容器与 role=spinbutton 的原生 input 控制元素', () => {
    const wrapper = mount(InputNumber)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-input-number')
    const control = wrapper.find('input.ui-input-number__control')
    expect(control.exists()).toBe(true)
    expect(control.attributes('role')).toBe('spinbutton')
    expect(control.attributes('type')).toBe('text')
    expect(control.attributes('inputmode')).toBe('decimal')
  })

  it('默认：controls=true 渲染增/减按钮、无 disabled、无 aria-valuemin/max/now、无修饰类', () => {
    const wrapper = mount(InputNumber)
    expect(wrapper.find('button.ui-input-number__decrease').exists()).toBe(true)
    expect(wrapper.find('button.ui-input-number__increase').exists()).toBe(true)
    const control = wrapper.find('input')
    expect(control.attributes('disabled')).toBeUndefined()
    expect(control.attributes('aria-valuemin')).toBeUndefined()
    expect(control.attributes('aria-valuemax')).toBeUndefined()
    expect(control.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-input-number--disabled')
  })

  it('controls=false：不渲染步进按钮', () => {
    const wrapper = mount(InputNumber, { props: { controls: false } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('min / max 落位 aria-valuemin / aria-valuemax', () => {
    const control = mount(InputNumber, { props: { min: 0, max: 100 } }).find('input')
    expect(control.attributes('aria-valuemin')).toBe('0')
    expect(control.attributes('aria-valuemax')).toBe('100')
  })

  it('modelValue 有值：渲染到原生 input 的 value 与 aria-valuenow；null 则二者皆空', () => {
    const withValue = mount(InputNumber, { props: { modelValue: 5 } })
    expect((withValue.find('input').element as HTMLInputElement).value).toBe('5')
    expect(withValue.find('input').attributes('aria-valuenow')).toBe('5')

    const empty = mount(InputNumber, { props: { modelValue: null } })
    expect((empty.find('input').element as HTMLInputElement).value).toBe('')
    expect(empty.find('input').attributes('aria-valuenow')).toBeUndefined()
  })

  it('受控值越界：展示与 aria-valuenow 按钳制值呈现', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 99, min: 0, max: 10 } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('10')
    expect(wrapper.find('input').attributes('aria-valuenow')).toBe('10')
  })

  it('precision：展示按小数位补齐（1 → "1.00"），aria-valuenow 保持数值', () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1, precision: 2 } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('1.00')
    expect(wrapper.find('input').attributes('aria-valuenow')).toBe('1')
  })

  it('disabled：原生 disabled 落在 input 与两个步进按钮上，并带修饰类', () => {
    const wrapper = mount(InputNumber, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.ui-input-number__decrease').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.ui-input-number__increase').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-input-number--disabled')
  })

  it('prefix / suffix 插槽渲染到专属容器', () => {
    const wrapper = mount(InputNumber, {
      slots: {
        prefix: () => h('svg', { viewBox: '0 0 24 24' }),
        suffix: () => '个',
      },
    })
    expect(wrapper.find('.ui-input-number__prefix svg').exists()).toBe(true)
    expect(wrapper.find('.ui-input-number__suffix').text()).toBe('个')
  })

  it('三个 emits 均已声明：步进路径以载荷发出', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1 } })
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    expect(wrapper.emitted('change')).toEqual([[2]])
    expect(wrapper.emitted('step')).toEqual([['up', 2]])
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 input，不落根容器', () => {
    const wrapper = mount(InputNumber, {
      attrs: { id: 'count-input', 'aria-label': '数量', 'aria-describedby': 'count-tip' },
    })
    const control = wrapper.find('input')
    expect(control.attributes('id')).toBe('count-input')
    expect(control.attributes('aria-label')).toBe('数量')
    expect(control.attributes('aria-describedby')).toBe('count-tip')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })
})
