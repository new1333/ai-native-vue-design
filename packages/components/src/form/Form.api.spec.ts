// api spec：props 默认值 / emits 声明 / slots 渲染（Form + FormField）。
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormSlotScope } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

/** 把默认插槽作用域渲染为可断言文本：valid|pending|errors 键数。 */
function scopeSlot(scope: FormSlotScope) {
  return h(
    'output',
    { class: 'form-scope' },
    `${scope.valid}|${scope.pending}|${Object.keys(scope.errors).length}`,
  )
}

describe('Form api', () => {
  it('渲染原生 <form> 元素并携带 ui-form 根类与 novalidate', () => {
    const wrapper = mount(Form, { props: { model: {} } })
    expect(wrapper.element.tagName).toBe('FORM')
    expect(wrapper.classes()).toContain('ui-form')
    expect(wrapper.attributes('novalidate')).toBeDefined()
  })

  it('默认：作用域 { valid: true, pending: false, errors: {} }；rules 缺省为空', () => {
    const wrapper = mount(Form, {
      props: { model: {} },
      slots: { default: scopeSlot },
    })
    expect(wrapper.find('output.form-scope').text()).toBe('true|false|0')
  })

  it('pending prop 落入作用域 pending=true', () => {
    const wrapper = mount(Form, {
      props: { model: {}, pending: true },
      slots: { default: scopeSlot },
    })
    expect(wrapper.find('output.form-scope').text()).toBe('true|true|0')
  })

  it('submit 已声明：无 rules 时提交通过，载荷为原生 submit 事件', async () => {
    const wrapper = mount(Form, {
      props: { model: {} },
      slots: { default: () => h('button', { type: 'submit' }, '提交') },
    })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('默认插槽内容渲染于表单内', () => {
    const wrapper = mount(Form, {
      props: { model: {} },
      slots: { default: () => h('p', { class: 'form-body' }, '正文') },
    })
    expect(wrapper.find('form .form-body').text()).toBe('正文')
  })
})

describe('FormField api', () => {
  it('渲染 ui-form-field 根类；label 渲染且 for 指向作用域控件 id', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', label: '标题' },
      slots: { default: (scope: FormFieldSlotScope) => h(Input, { id: scope.id }) },
    })
    expect(wrapper.classes()).toContain('ui-form-field')
    const label = wrapper.find('label.ui-form-field__label')
    expect(label.text()).toContain('标题')
    const control = wrapper.find('input')
    expect(label.attributes('for')).toBe(control.attributes('id'))
    expect(control.attributes('id')).toMatch(/^ui-form-field-/)
  })

  it('默认：无 label / required 标记 / help / 错误文案', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title' },
      slots: { default: () => h(Input) },
    })
    expect(wrapper.find('label').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__required').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__help').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__error').exists()).toBe(false)
  })

  it('required：label 后渲染 aria-hidden 的 * 标记', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', label: '标题', required: true },
      slots: { default: () => h(Input) },
    })
    const mark = wrapper.find('.ui-form-field__required')
    expect(mark.text()).toBe('*')
    expect(mark.attributes('aria-hidden')).toBe('true')
  })

  it('help：渲染帮助文案于控件下方并带 id', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', help: '用于生成目录' },
      slots: { default: () => h(Input) },
    })
    const help = wrapper.find('p.ui-form-field__help')
    expect(help.text()).toBe('用于生成目录')
    expect(help.attributes('id')).toMatch(/-help$/)
  })

  it('error prop（无 Form 独立使用）：渲染错误文案并替代 help', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', help: '帮助', error: '标题不能为空' },
      slots: { default: () => h(Input) },
    })
    const error = wrapper.find('p.ui-form-field__error')
    expect(error.text()).toBe('标题不能为空')
    expect(error.attributes('id')).toMatch(/-error$/)
    expect(wrapper.classes()).toContain('ui-form-field--error')
    expect(wrapper.find('.ui-form-field__help').exists()).toBe(false)
  })

  it('error 空串视为无错误：help 正常展示', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', help: '帮助', error: '' },
      slots: { default: () => h(Input) },
    })
    expect(wrapper.find('.ui-form-field__error').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__help').text()).toBe('帮助')
  })

  it('error 插槽覆盖默认文案并接收 { error } 作用域', () => {
    const wrapper = mount(FormField, {
      props: { name: 'title', error: '原始文案' },
      slots: {
        default: () => h(Input),
        error: (scope: { error: string }) => `自定义：${scope.error}`,
      },
    })
    expect(wrapper.find('.ui-form-field__error').text()).toBe('自定义：原始文案')
  })

  it('默认插槽作用域：{ id, invalid: false, controlAttrs }', () => {
    let captured: FormFieldSlotScope | undefined
    mount(FormField, {
      props: { name: 'title' },
      slots: {
        default: (scope: FormFieldSlotScope) => {
          captured = scope
          return h(Input, scope.controlAttrs)
        },
      },
    })
    expect(captured).toBeDefined()
    expect(captured?.id).toMatch(/^ui-form-field-/)
    expect(captured?.invalid).toBe(false)
    expect(captured?.controlAttrs.id).toBe(captured?.id)
    expect(captured?.controlAttrs['aria-invalid']).toBeUndefined()
    expect(captured?.controlAttrs['aria-describedby']).toBeUndefined()
    expect(captured?.controlAttrs['aria-required']).toBeUndefined()
  })
})
