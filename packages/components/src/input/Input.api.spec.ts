// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Input from './Input.vue'

describe('Input api', () => {
  it('渲染 ui-input 根容器与原生 input 控制元素', () => {
    const wrapper = mount(Input)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-input')
    expect(wrapper.find('input.ui-input__control').exists()).toBe(true)
  })

  it('默认：type=text、无 disabled/readonly/maxlength、无 aria-invalid、无清空按钮', () => {
    const wrapper = mount(Input)
    const control = wrapper.find('input')
    expect(control.attributes('type')).toBe('text')
    expect(control.attributes('disabled')).toBeUndefined()
    expect(control.attributes('readonly')).toBeUndefined()
    expect(control.attributes('maxlength')).toBeUndefined()
    expect(control.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-input--default')
    expect(wrapper.classes()).not.toContain('ui-input--error')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('placeholder 透传到原生 input', () => {
    const control = mount(Input, { props: { placeholder: '请输入标题' } }).find('input')
    expect(control.attributes('placeholder')).toBe('请输入标题')
  })

  it('type=password：原生 type 切换', () => {
    expect(mount(Input, { props: { type: 'password' } }).find('input').attributes('type')).toBe('password')
  })

  it('maxlength 透传为原生 maxlength 属性', () => {
    expect(mount(Input, { props: { maxlength: 20 } }).find('input').attributes('maxlength')).toBe('20')
  })

  it('disabled / readonly：原生属性与修饰类落位', () => {
    const disabled = mount(Input, { props: { disabled: true } })
    expect(disabled.find('input').attributes('disabled')).toBeDefined()
    expect(disabled.classes()).toContain('ui-input--disabled')

    const readonly = mount(Input, { props: { readonly: true } })
    expect(readonly.find('input').attributes('readonly')).toBeDefined()
    expect(readonly.classes()).toContain('ui-input--readonly')
  })

  it('status=error：ui-input--error 修饰类 + 原生 input aria-invalid="true"', () => {
    const wrapper = mount(Input, { props: { status: 'error' } })
    expect(wrapper.classes()).toContain('ui-input--error')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('modelValue 初始值渲染到原生 input 的 value', () => {
    const control = mount(Input, { props: { modelValue: '纸面' } }).find('input')
    expect((control.element as HTMLInputElement).value).toBe('纸面')
  })

  it('prefix / suffix 插槽渲染到专属容器', () => {
    const wrapper = mount(Input, {
      slots: {
        prefix: () => h('svg', { viewBox: '0 0 24 24' }),
        suffix: () => '字',
      },
    })
    expect(wrapper.find('.ui-input__prefix svg').exists()).toBe(true)
    expect(wrapper.find('.ui-input__suffix').text()).toBe('字')
  })

  it('clearable：有值时渲染清空按钮，空值时不渲染', () => {
    const withValue = mount(Input, { props: { clearable: true, modelValue: 'abc' } })
    expect(withValue.find('button.ui-input__clear').exists()).toBe(true)
    const empty = mount(Input, { props: { clearable: true } })
    expect(empty.find('button.ui-input__clear').exists()).toBe(false)
  })

  it('update:modelValue 已声明：输入路径以字符串载荷发出', async () => {
    const wrapper = mount(Input)
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 input，不落根容器', () => {
    const wrapper = mount(Input, {
      attrs: { id: 'title-input', autocomplete: 'off', 'aria-describedby': 'title-error' },
    })
    const control = wrapper.find('input')
    expect(control.attributes('id')).toBe('title-input')
    expect(control.attributes('autocomplete')).toBe('off')
    expect(control.attributes('aria-describedby')).toBe('title-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
