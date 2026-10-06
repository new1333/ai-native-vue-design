// a11y spec：label 关联 / aria-invalid / aria-describedby / aria-required（自 Form.a11y.spec.ts 移入的 FormField 断言）。
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormRules } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

/** 校验通过的规则（标题必须为"纸面"）。 */
const rules: FormRules = {
  title: [(v: unknown) => (v === '纸面' ? true : '标题必须是纸面')],
}

describe('FormField a11y', () => {
  /** 独立（无 Form）挂载一个完整字段。 */
  function mountField(props: { name?: string; label?: string; required?: boolean; error?: string; help?: string }) {
    return mount(FormField, {
      props: { name: props.name ?? 'title', ...props },
      slots: {
        default: (s: FormFieldSlotScope) =>
          h(Input, { ...s.controlAttrs, modelValue: '' }),
      },
    })
  }

  it('label[for] 与控件 id 严格关联（id 基于 useId，SSR 稳定前缀）', () => {
    const wrapper = mountField({ label: '标题' })
    const control = wrapper.find('input')
    expect(wrapper.find('label.ui-form-field__label').attributes('for')).toBe(
      control.attributes('id'),
    )
    expect(control.attributes('id')).toMatch(/^ui-form-field-/)
  })

  it('错误时：控件 aria-invalid="true"，aria-describedby 指向错误文案元素 id', () => {
    const wrapper = mountField({ error: '标题不能为空' })
    const control = wrapper.find('input')
    expect(control.attributes('aria-invalid')).toBe('true')
    const describedBy = control.attributes('aria-describedby')
    expect(describedBy).toBe(wrapper.find('.ui-form-field__error').attributes('id'))
  })

  it('无错误有 help：无 aria-invalid，aria-describedby 指向 help 元素 id', () => {
    const wrapper = mountField({ help: '填写文档标题' })
    const control = wrapper.find('input')
    expect(control.attributes('aria-invalid')).toBeUndefined()
    expect(control.attributes('aria-describedby')).toBe(
      wrapper.find('.ui-form-field__help').attributes('id'),
    )
  })

  it('无错误无 help：控件不出现 aria-invalid / aria-describedby', () => {
    const control = mountField({}).find('input')
    expect(control.attributes('aria-invalid')).toBeUndefined()
    expect(control.attributes('aria-describedby')).toBeUndefined()
  })

  it('required：控件 aria-required="true"，视觉 * 标记 aria-hidden', () => {
    const wrapper = mountField({ label: '标题', required: true })
    expect(wrapper.find('input').attributes('aria-required')).toBe('true')
    const mark = wrapper.find('.ui-form-field__required')
    expect(mark.text()).toBe('*')
    expect(mark.attributes('aria-hidden')).toBe('true')
  })

  it('非必填：控件不出现 aria-required', () => {
    expect(mountField({}).find('input').attributes('aria-required')).toBeUndefined()
  })

  it('错误文案元素为文本节点（<p>，id 存在，不用 role=alert 避免多字段重复打断）', () => {
    const wrapper = mountField({ error: '错误' })
    const error = wrapper.find('.ui-form-field__error')
    expect(error.element.tagName).toBe('P')
    expect(error.attributes('id')).toMatch(/-error$/)
    expect(error.attributes('role')).toBeUndefined()
  })

  it('Form 内校验失败：注入错误同样驱动控件 aria-invalid 与 aria-describedby（provide/inject）', async () => {
    const wrapper = mount(Form, {
      props: { model: { title: '' }, rules },
      slots: {
        default: () =>
          h(FormField, { name: 'title', label: '标题', required: true, help: '帮助' }, {
            default: (s: FormFieldSlotScope) =>
              h(Input, { ...s.controlAttrs, modelValue: '' }),
          }),
      },
    })
    const control = wrapper.find('input')
    // 校验前：help 为描述，无 aria-invalid
    expect(control.attributes('aria-describedby')).toBe(
      wrapper.find('.ui-form-field__help').attributes('id'),
    )
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    // 校验后：aria-invalid + describedby 切到错误文案
    expect(control.attributes('aria-invalid')).toBe('true')
    expect(control.attributes('aria-describedby')).toBe(
      wrapper.find('.ui-form-field__error').attributes('id'),
    )
  })
})
