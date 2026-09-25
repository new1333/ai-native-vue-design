// behavior spec：提交校验网关 / Enter 隐式提交路径 / 异步规则 / pending 拦截 / 错误分发与清除（Form + FormField）。
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

/**
 * 两字段 + 原生 type=submit 按钮的演示构图（playground Form 卡片同构）。
 * 用于验证浏览器「输入框内按 Enter 隐式提交」与「点击提交按钮」共用的原生 submit 路径。
 * attachTo=true 时挂入 document（happy-dom 提交按钮激活行为要求 isConnected），
 * 此时调用方负责在结束时 unmount 清理。
 */
function mountTwoFieldForm(options: {
  model: Record<string, unknown>
  rules?: FormRules
  attachTo?: boolean
}) {
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
            onSubmit: (event: SubmitEvent) => submitted(event),
          },
          {
            default: (scope: FormSlotScope) => [
              h(FormField, { name: 'name', label: '姓名' }, {
                default: (s: FormFieldSlotScope) =>
                  h(Input, {
                    ...s.controlAttrs,
                    modelValue: String(model.value.name ?? ''),
                    'onUpdate:modelValue': (v: string) => {
                      model.value.name = v
                    },
                  }),
              }),
              h(FormField, { name: 'email', label: '邮箱' }, {
                default: (s: FormFieldSlotScope) =>
                  h(Input, {
                    ...s.controlAttrs,
                    modelValue: String(model.value.email ?? ''),
                    'onUpdate:modelValue': (v: string) => {
                      model.value.email = v
                    },
                  }),
              }),
              h('button', { type: 'submit' }, '提交'),
              h(
                'output',
                { class: 'form-scope' },
                `${scope.valid}|${scope.pending}|${Object.keys(scope.errors).length}`,
              ),
            ],
          },
        )
    },
  })
  const wrapper = mount(host, options.attachTo ? { attachTo: document.body } : {})
  return { wrapper, model, submitted }
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

  it('Enter 隐式提交路径：浏览器隐式提交派发的原生 submit（cancelable）走校验网关，默认提交被拦截', async () => {
    const rules: FormRules = {
      name: [(v: unknown) => (v === '纸面' ? true : '请输入姓名')],
      email: [(v: unknown) => (v === 'a@b.co' ? true : '请输入合法邮箱')],
    }
    const { wrapper, model, submitted } = mountTwoFieldForm({
      model: { name: '', email: '' },
      rules,
    })
    // 浏览器在输入框内按 Enter（存在 type=submit 默认按钮时触发隐式提交）最终派发的
    // 就是 form 元素上的 cancelable submit 事件；happy-dom 不实现隐式提交，
    // 故直接分派该事件作为等价路径（a11y spec 另以 requestSubmit 覆盖同一语义）。
    const formEl = wrapper.find('form').element as HTMLFormElement

    // 空表单按 Enter：校验失败——两处 FormField 错误文案出现，不 emit submit，
    // 且 preventDefault 已拦截原生默认提交（页面不跳转）
    const first = new Event('submit', { bubbles: true, cancelable: true })
    formEl.dispatchEvent(first)
    await flushPromises()
    expect(first.defaultPrevented).toBe(true)
    expect(submitted).not.toHaveBeenCalled()
    const errors = wrapper.findAll('.ui-form-field__error')
    expect(errors).toHaveLength(2)
    expect(errors[0].text()).toBe('请输入姓名')
    expect(errors[1].text()).toBe('请输入合法邮箱')
    expect(wrapper.find('.form-scope').text()).toBe('false|false|2')

    // 修正两字段后再按 Enter：同一事件路径校验通过并 emit submit，错误清除
    model.value.name = '纸面'
    model.value.email = 'a@b.co'
    await flushPromises()
    const second = new Event('submit', { bubbles: true, cancelable: true })
    formEl.dispatchEvent(second)
    await flushPromises()
    expect(second.defaultPrevented).toBe(true)
    expect(submitted).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('.ui-form-field__error')).toHaveLength(0)
    expect(wrapper.find('.form-scope').text()).toBe('true|false|0')
  })

  it('点击 type=submit 按钮与 Enter 同经校验网关：真实按钮 click 触发原生 submit 后校验', async () => {
    const rules: FormRules = {
      name: [(v: unknown) => (v === '纸面' ? true : '请输入姓名')],
      email: [(v: unknown) => (v === 'a@b.co' ? true : '请输入合法邮箱')],
    }
    const { wrapper, model, submitted } = mountTwoFieldForm({
      model: { name: '', email: '' },
      rules,
      attachTo: true,
    })

    try {
      // 空表单点击提交按钮：真实按钮激活行为触发原生 submit → 校验失败，错误展示且不 emit。
      // 注意：VTU 默认不挂入文档（isConnected=false），happy-dom 的提交按钮激活行为
      // 仅对已连接元素生效，故本用例 attachTo: document.body（结束即卸载清理）。
      await wrapper.find('button[type="submit"]').trigger('click')
      await flushPromises()
      expect(submitted).not.toHaveBeenCalled()
      expect(wrapper.findAll('.ui-form-field__error')).toHaveLength(2)

      // 修正后再次点击：校验通过并 emit submit（与 Enter 为同一条原生 submit 路径）
      model.value.name = '纸面'
      model.value.email = 'a@b.co'
      await wrapper.find('button[type="submit"]').trigger('click')
      await flushPromises()
      expect(submitted).toHaveBeenCalledTimes(1)
      expect(wrapper.findAll('.ui-form-field__error')).toHaveLength(0)
    } finally {
      wrapper.unmount()
    }
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
