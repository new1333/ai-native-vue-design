// behavior spec：error prop 优先级 / help 让位（自 Form.behavior.spec.ts 移入的 FormField 断言；Form 仅作注入上下文）。
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormRules } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

/** 注入上下文宿主：Form(rules) + 单个 FormField(name[, error/help]) + Input(v-bind controlAttrs)。 */
function mountFieldInForm(options: {
  model: Record<string, unknown>
  rules?: FormRules
  fieldError?: string
  help?: string
}) {
  const name = 'title'
  const model = ref<Record<string, unknown>>({ ...options.model })
  const host = defineComponent({
    setup() {
      return () =>
        h(
          Form,
          { model: model.value, rules: options.rules },
          {
            default: () => [
              h(
                FormField,
                { name, error: options.fieldError, help: options.help },
                {
                  default: (fieldScope: FormFieldSlotScope) =>
                    h(Input, {
                      ...fieldScope.controlAttrs,
                      modelValue: String(model.value[name] ?? ''),
                    }),
                },
              ),
            ],
          },
        )
    },
  })
  return mount(host)
}

describe('FormField behavior', () => {
  it('FormField error prop 优先于 Form 注入的校验错误', async () => {
    const rules: FormRules = { title: [() => '注入的错误'] }
    const wrapper = mountFieldInForm({ model: { title: 'x' }, rules, fieldError: '自定义错误' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.ui-form-field__error').text()).toBe('自定义错误')
  })

  it('出现错误时 help 让位：帮助文案消失、错误文案出现', async () => {
    const rules: FormRules = { title: [() => '不能为空'] }
    const wrapper = mountFieldInForm({ model: { title: '' }, rules, help: '填写文档标题' })
    expect(wrapper.find('.ui-form-field__help').text()).toBe('填写文档标题')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.ui-form-field__help').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__error').text()).toBe('不能为空')
  })
})
