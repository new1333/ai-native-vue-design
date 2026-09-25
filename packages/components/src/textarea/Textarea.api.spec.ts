// api spec：props 默认值 / emits 声明 / attrs 透传（Textarea 无插槽，api 契约见 meta.slots=[]）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Textarea from './Textarea.vue'

describe('Textarea api', () => {
  it('渲染 ui-textarea 根容器与原生 textarea 控件', () => {
    const wrapper = mount(Textarea)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-textarea')
    expect(wrapper.find('textarea.ui-textarea__control').exists()).toBe(true)
  })

  it('默认：rows=3、resize=vertical、status=default，无 disabled/readonly/maxlength/aria-invalid、无字数统计', () => {
    const wrapper = mount(Textarea)
    const control = wrapper.find('textarea')
    expect(control.attributes('rows')).toBe('3')
    expect(control.attributes('disabled')).toBeUndefined()
    expect(control.attributes('readonly')).toBeUndefined()
    expect(control.attributes('maxlength')).toBeUndefined()
    expect(control.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-textarea--resize-vertical')
    expect(wrapper.classes()).toContain('ui-textarea--default')
    expect(wrapper.classes()).not.toContain('ui-textarea--error')
    expect(wrapper.find('.ui-textarea__count').exists()).toBe(false)
  })

  it('rows / maxlength / placeholder 透传到原生 textarea', () => {
    const control = mount(Textarea, { props: { rows: 6, maxlength: 120, placeholder: '请输入描述' } }).find('textarea')
    expect(control.attributes('rows')).toBe('6')
    expect(control.attributes('maxlength')).toBe('120')
    expect(control.attributes('placeholder')).toBe('请输入描述')
  })

  it('resize=none：切换锁定档位类', () => {
    expect(mount(Textarea, { props: { resize: 'none' } }).classes()).toContain('ui-textarea--resize-none')
  })

  it('disabled / readonly：原生属性与修饰类落位', () => {
    const disabled = mount(Textarea, { props: { disabled: true } })
    expect(disabled.find('textarea').attributes('disabled')).toBeDefined()
    expect(disabled.classes()).toContain('ui-textarea--disabled')

    const readonly = mount(Textarea, { props: { readonly: true } })
    expect(readonly.find('textarea').attributes('readonly')).toBeDefined()
    expect(readonly.classes()).toContain('ui-textarea--readonly')
  })

  it('status=error：ui-textarea--error 修饰类 + 原生 textarea aria-invalid="true"', () => {
    const wrapper = mount(Textarea, { props: { status: 'error' } })
    expect(wrapper.classes()).toContain('ui-textarea--error')
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('modelValue 初始值渲染为 textarea 内容', () => {
    const control = mount(Textarea, { props: { modelValue: '纸面' } }).find('textarea')
    expect((control.element as HTMLTextAreaElement).value).toBe('纸面')
  })

  it('showCount：配 maxlength 显示 x/y，无 maxlength 显示 x，默认不渲染', () => {
    const xy = mount(Textarea, { props: { showCount: true, maxlength: 10, modelValue: 'abc' } })
    expect(xy.find('.ui-textarea__count').text()).toBe('3/10')

    const x = mount(Textarea, { props: { showCount: true, modelValue: 'abc' } })
    expect(x.find('.ui-textarea__count').text()).toBe('3')

    expect(mount(Textarea).find('.ui-textarea__count').exists()).toBe(false)
  })

  it('update:modelValue 已声明：输入路径以字符串载荷发出', async () => {
    const wrapper = mount(Textarea)
    await wrapper.find('textarea').setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 textarea，不落根容器', () => {
    const wrapper = mount(Textarea, {
      attrs: { id: 'desc-area', name: 'desc', 'aria-describedby': 'desc-error' },
    })
    const control = wrapper.find('textarea')
    expect(control.attributes('id')).toBe('desc-area')
    expect(control.attributes('name')).toBe('desc')
    expect(control.attributes('aria-describedby')).toBe('desc-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
