// behavior spec：提交校验网关 / 异步规则 / pending 拦截 / 错误分发与清除（Form + FormField）。
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormErrors, FormRules, FormSlotScope } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

/** 组合宿主：Form + FormField(name) + Input(v-bind controlAttrs) + 作用域回显。 */
function mountForm(options: {
  model: Record<string, unknown>
  rules?: FormRules
  pending?: boolean
  fieldError?: string
}) {
  const name = 'title'
  const model = ref<Record<string, unknown>>({ ...options.model })
  const submitted = vi.fn()
  const host = defineComponent({
    setup() {
      return () =>
        h(
          Form,
          {
            model: model.value,
            rules: options.rules,
            pending: options.pending,
            onSubmit: (event: SubmitEvent) => submitted(event),
          },
          {
            default: (scope: FormSlotScope) => [
              h(
                FormField,
                { name, error: options.fieldError },
                {
                  default: (fieldScope: FormFieldSlotScope) =>
                    h(Input, {
                      ...fieldScope.controlAttrs,
                      modelValue: String(model.value[name] ?? ''),
                      'onUpdate:modelValue': (v: string) => {
                        model.value[name] = v
                      },
                    }),
                },
              ),
              h(
                'output',
                { class: 'form-scope' },
                `${scope.valid}|${scope.pending}|${Object.keys(scope.errors).length}`,
              ),
              h('output', { class: 'form-error' }, scope.errors[name] ?? ''),
            ],
          },
        )
    },
  })
  const wrapper = mount(host)
  return { wrapper, model, submitted }
}

/** 供值断言：提交 / 修正 / 主动校验共用。 */
const notBlank: FormRules = {
  title: [(v: unknown) => (v === '纸面' ? true : '标题必须是纸面')],
}

describe('Form behavior', () => {
  it('校验失败：不 emit submit，错误进入作用域 errors，FormField 展示错误文案', async () => {
    const { wrapper, submitted } = mountForm({ model: { title: '' }, rules: notBlank })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitted).not.toHaveBeenCalled()
    expect(wrapper.find('.form-scope').text()).toBe('false|false|1')
    expect(wrapper.find('.form-error').text()).toBe('标题必须是纸面')
    expect(wrapper.find('.ui-form-field__error').text()).toBe('标题必须是纸面')
  })

  it('校验失败后修正再提交：错误清除并 emit submit', async () => {
    const { wrapper, model, submitted } = mountForm({ model: { title: '' }, rules: notBlank })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitted).not.toHaveBeenCalled()

    model.value.title = '纸面'
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitted).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.form-scope').text()).toBe('true|false|0')
    expect(wrapper.find('.ui-form-field__error').exists()).toBe(false)
  })

  it('字段内按序执行：首个失败文案生效，后续规则不再执行', async () => {
    const notRun = vi.fn((): true => true)
    const rules: FormRules = { title: [() => '第一个失败', notRun] }
    const { wrapper } = mountForm({ model: { title: 'x' }, rules })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(notRun).not.toHaveBeenCalled()
    expect(wrapper.find('.ui-form-field__error').text()).toBe('第一个失败')
  })

  it('pending prop：拦截提交（不校验、不 emit submit），作用域 pending=true', async () => {
    const rule = vi.fn((): true => true)
    const rules: FormRules = { title: [rule] }
    const { wrapper, submitted } = mountForm({ model: { title: '纸面' }, rules, pending: true })
    expect(wrapper.find('.form-scope').text()).toBe('true|true|0')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(rule).not.toHaveBeenCalled()
    expect(submitted).not.toHaveBeenCalled()
  })

  it('异步规则通过：校验期间作用域 pending=true，resolve 后放行 emit submit', async () => {
    let resolveRule: ((v: true | string) => void) | undefined
    const rules: FormRules = {
      title: [() => new Promise<true | string>((resolve) => { resolveRule = resolve })],
    }
    const { wrapper, submitted } = mountForm({ model: { title: '纸面' }, rules })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitted).not.toHaveBeenCalled()
    expect(wrapper.find('.form-scope').text()).toBe('true|true|0')

    resolveRule?.(true)
    await flushPromises()
    expect(submitted).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.form-scope').text()).toBe('true|false|0')
  })

  it('异步规则失败：resolve 错误文案后不 emit submit，错误流入 FormField', async () => {
    let resolveRule: ((v: true | string) => void) | undefined
    const rules: FormRules = {
      title: [() => new Promise<true | string>((resolve) => { resolveRule = resolve })],
    }
    const { wrapper, submitted } = mountForm({ model: { title: '重复' }, rules })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    resolveRule?.('标题已存在')
    await flushPromises()
    expect(submitted).not.toHaveBeenCalled()
    expect(wrapper.find('.form-scope').text()).toBe('false|false|1')
    expect(wrapper.find('.ui-form-field__error').text()).toBe('标题已存在')
  })

  it('异步校验进行中再次提交：被 pending 拦截，校验函数只执行一轮', async () => {
    let resolveRule: ((v: true | string) => void) | undefined
    const rule = vi.fn(
      () => new Promise<true | string>((resolve) => { resolveRule = resolve }),
    )
    const rules: FormRules = { title: [rule] }
    const { wrapper, submitted } = mountForm({ model: { title: '纸面' }, rules })
    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    expect(rule).toHaveBeenCalledTimes(1)

    resolveRule?.(true)
    await flushPromises()
    expect(rule).toHaveBeenCalledTimes(1)
    expect(submitted).toHaveBeenCalledTimes(1)
  })

  it('expose.validate()：返回错误集合并同步作用域/FormField；全通过返回空对象', async () => {
    const fail: FormRules = { title: [() => '长度不足'] }
    const pass: FormRules = { title: [() => true] }
    const failing = mountForm({ model: { title: 'x' }, rules: fail })
    const errors: FormErrors = await failing.wrapper
      .findComponent(Form)
      .vm.validate()
    expect(errors).toEqual({ title: '长度不足' })
    expect(failing.wrapper.find('.ui-form-field__error').text()).toBe('长度不足')
    expect(failing.wrapper.find('.form-scope').text()).toBe('false|false|1')

    const passing = mountForm({ model: { title: '纸面' }, rules: pass })
    await expect(passing.wrapper.findComponent(Form).vm.validate()).resolves.toEqual({})
  })

  it('expose.resetValidation()：清空全部错误（作用域与 FormField 同步）', async () => {
    const rules: FormRules = { title: [() => '长度不足'] }
    const { wrapper } = mountForm({ model: { title: 'x' }, rules })
    await wrapper.findComponent(Form).vm.validate()
    expect(wrapper.find('.ui-form-field__error').exists()).toBe(true)

    wrapper.findComponent(Form).vm.resetValidation()
    await flushPromises()
    expect(wrapper.find('.form-scope').text()).toBe('true|false|0')
    expect(wrapper.find('.ui-form-field__error').exists()).toBe(false)
  })

  it('FormField error prop 优先于 Form 注入的校验错误', async () => {
    const rules: FormRules = { title: [() => '注入的错误'] }
    const { wrapper } = mountForm({ model: { title: 'x' }, rules, fieldError: '自定义错误' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.ui-form-field__error').text()).toBe('自定义错误')
  })

  it('出现错误时 help 让位：帮助文案消失、错误文案出现', async () => {
    const rules: FormRules = { title: [() => '不能为空'] }
    const host = defineComponent({
      setup: () => () =>
        h(
          Form,
          { model: { title: '' }, rules },
          {
            default: () => [
              h(
                FormField,
                { name: 'title', help: '填写文档标题' },
                {
                  default: (s: FormFieldSlotScope) =>
                    h(Input, { ...s.controlAttrs, modelValue: '' }),
                },
              ),
            ],
          },
        ),
    })
    const wrapper: VueWrapper = mount(host)
    expect(wrapper.find('.ui-form-field__help').text()).toBe('填写文档标题')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.ui-form-field__help').exists()).toBe(false)
    expect(wrapper.find('.ui-form-field__error').text()).toBe('不能为空')
  })
})
