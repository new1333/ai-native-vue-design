// api spec：props 默认值 / emits 声明 / slots 渲染（FormField 的用例见 FormField.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import Form from './Form.vue'
import type { FormSlotScope } from './Form.types'

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
