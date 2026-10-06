// a11y spec：原生语义 / 键盘提交路径不阻拦 / requestSubmit 等价提交（FormField 的用例见 FormField.*.spec.ts）。
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormRules } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

/** 校验通过的规则（标题必须为"纸面"）。 */
const rules: FormRules = {
  title: [(v: unknown) => (v === '纸面' ? true : '标题必须是纸面')],
}

describe('Form a11y', () => {
  it('原生 <form> 元素：无 role/tabindex 改写，novalidate 关闭原生校验双轨', () => {
    const wrapper = mount(Form, { props: { model: {} } })
    expect(wrapper.element.tagName).toBe('FORM')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('novalidate')).toBeDefined()
  })

  it('键盘提交路径未被组件阻拦：Enter keydown 不被 preventDefault，控件保留原生 Tab 序', () => {
    const wrapper = mount(Form, {
      props: { model: { title: '' } },
      slots: {
        default: () =>
          h(FormField, { name: 'title', label: '标题' }, {
            default: (s: FormFieldSlotScope) =>
              h(Input, { ...s.controlAttrs, modelValue: '' }),
          }),
      },
    })
    // Enter 隐式提交为浏览器原生行为：组件不改写 tabindex、不拦截/改写 keydown
    expect(wrapper.find('form').attributes('tabindex')).toBeUndefined()
    const control = wrapper.find('input')
    expect(control.attributes('tabindex')).toBeUndefined()
    const keydown = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true })
    control.element.dispatchEvent(keydown)
    expect(keydown.defaultPrevented).toBe(false)
  })

  it('键盘等价提交路径（requestSubmit）：与点击提交同经校验网关', async () => {
    const submitted = vi.fn()
    const model = ref<Record<string, unknown>>({ title: '错误值' })
    const host = defineComponent({
      setup: () => () =>
        h(
          Form,
          {
            model: model.value,
            rules,
            onSubmit: (event: SubmitEvent) => submitted(event),
          },
          {
            default: () => [
              h(FormField, { name: 'title', label: '标题' }, {
                default: (s: FormFieldSlotScope) =>
                  h(Input, {
                    ...s.controlAttrs,
                    modelValue: String(model.value.title ?? ''),
                    'onUpdate:modelValue': (v: string) => {
                      model.value.title = v
                    },
                  }),
              }),
            ],
          },
        ),
    })
    const wrapper = mount(host)
    // 浏览器 Enter 隐式提交最终派发 submit 事件（等价于 requestSubmit）
    ;(wrapper.find('form').element as HTMLFormElement).requestSubmit()
    await flushPromises()
    expect(submitted).not.toHaveBeenCalled()
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')

    await wrapper.find('input').setValue('纸面')
    ;(wrapper.find('form').element as HTMLFormElement).requestSubmit()
    await flushPromises()
    expect(submitted).toHaveBeenCalledTimes(1)
  })
})
