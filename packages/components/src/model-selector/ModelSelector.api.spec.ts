// api spec：props 默认值 / emits 声明 / 弹层渲染面 / provider 徽标 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModelSelector from './ModelSelector.vue'
import type { ModelSelectorModel } from './ModelSelector.types'

const MODELS: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude', value: 'claude', provider: 'Anthropic' },
  { label: '本地推理', value: 'local', disabled: true },
]

describe('ModelSelector api', () => {
  it('渲染 ui-model-selector 根容器与 combobox 触发器按钮', () => {
    const wrapper = mount(ModelSelector)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-model-selector')
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
  })

  it('默认：显示默认 placeholder、aria-expanded=false、无已选/无弹层', () => {
    const wrapper = mount(ModelSelector)
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    expect(trigger.text()).toContain('选择模型')
    expect(wrapper.find('.ui-model-selector__label--placeholder').exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
  })

  it('placeholder prop 覆盖默认占位文案', () => {
    const trigger = mount(ModelSelector, { props: { placeholder: '选择对话模型' } }).find(
      'button.ui-model-selector__trigger',
    )
    expect(trigger.text()).toContain('选择对话模型')
  })

  it('modelValue 命中模型：触发器显示其 label 与 provider 徽标（badge 形态），不再走占位样式', () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, modelValue: 'claude' } })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    expect(trigger.text()).toContain('Claude')
    expect(wrapper.find('.ui-model-selector__label--placeholder').exists()).toBe(false)
    const badge = trigger.find('.ui-model-selector__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Anthropic')
    expect(badge.classes()).toContain('ui-badge')
  })

  it('modelValue 未命中（null/未知值）：回落 placeholder，不渲染 provider 徽标', () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, modelValue: null } })
    expect(wrapper.find('button.ui-model-selector__trigger').text()).toContain('选择模型')
    expect(wrapper.find('.ui-model-selector__badge').exists()).toBe(false)
  })

  it('disabled：触发器原生 disabled + 根修饰类', () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, modelValue: 'gpt-4o', disabled: true },
    })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-model-selector--disabled')
  })

  it('loading：根修饰类 + aria-busy="true"', () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, loading: true } })
    expect(wrapper.classes()).toContain('ui-model-selector--loading')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('打开后：弹层渲染模型全集（含 provider 徽标与禁用项 label），默认空态文案不出现', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const listbox = document.querySelector('.ui-model-selector__listbox')
    expect(listbox).not.toBeNull()
    const labels = [...(listbox?.querySelectorAll('.ui-model-selector__option-label') ?? [])].map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['GPT-4o', 'Claude', '本地推理'])
    const badges = [...(listbox?.querySelectorAll('.ui-model-selector__badge') ?? [])].map((el) =>
      el.textContent,
    )
    expect(badges).toEqual(['OpenAI', 'Anthropic'])
    expect(document.querySelector('.ui-model-selector__empty')).toBeNull()
    wrapper.unmount()
  })

  it('emptyText：models 为空数组且非加载中时弹层显示空态文案（默认「暂无可用模型」）', async () => {
    const wrapper = mount(ModelSelector, { props: { models: [] }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__empty')?.textContent).toBe('暂无可用模型')
    wrapper.unmount()

    const custom = mount(ModelSelector, {
      props: { models: [], emptyText: '无可用模型，请检查配置' },
      attachTo: document.body,
    })
    await custom.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__empty')?.textContent).toBe(
      '无可用模型，请检查配置',
    )
    custom.unmount()
  })

  it('loadingText：loading 期间打开弹层显示加载文案（默认「模型列表加载中…」），不渲染选项/空态', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, loading: true }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const popup = document.querySelector('.ui-model-selector__popup')
    expect(popup?.querySelector('.ui-model-selector__loading')?.textContent).toBe('模型列表加载中…')
    expect(document.querySelector('.ui-model-selector__option')).toBeNull()
    expect(document.querySelector('.ui-model-selector__empty')).toBeNull()
    wrapper.unmount()

    const custom = mount(ModelSelector, {
      props: { models: MODELS, loading: true, loadingText: '正在拉取模型…' },
      attachTo: document.body,
    })
    await custom.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__loading')?.textContent).toBe('正在拉取模型…')
    custom.unmount()
  })

  it('update:modelValue / change 已声明：选中路径以 value 与完整模型对象为载荷发出', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const option = document.querySelectorAll('.ui-model-selector__option')[1]
    ;(option as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['claude']])
    expect(wrapper.emitted('change')).toEqual([
      [{ label: 'Claude', value: 'claude', provider: 'Anthropic' }],
    ])
    wrapper.unmount()
  })

  it('update:open 受控：初始 open=true 挂载即打开弹层（aria-expanded=true）', async () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, open: true },
      attachTo: document.body,
    })
    await nextTick()
    const popup = document.querySelector('.ui-model-selector__popup')
    expect(popup).not.toBeNull()
    expect(popup?.parentElement).toBe(document.body)
    expect(wrapper.find('button.ui-model-selector__trigger').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('update:open 受控：open=false 时点击只派发 update:open(true) 不自行开启；父反射后跟随开合', async () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, open: false },
      attachTo: document.body,
    })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(document.querySelector('.ui-model-selector__popup')).toBeNull() // 完全受控：未反射即不开
    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.querySelector('.ui-model-selector__popup')).not.toBeNull()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.querySelector('.ui-model-selector__popup')).toBeNull()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('update:open 非受控（未传 open）：点击开合行为不变，且完整周期上抛 [true]/[false]', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    await trigger.trigger('click')
    expect(document.querySelector('.ui-model-selector__popup')).not.toBeNull()
    await trigger.trigger('click')
    expect(document.querySelector('.ui-model-selector__popup')).toBeNull()
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('trigger 插槽：替换触发器默认内容，scope 携带 model 与 open', async () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, modelValue: 'gpt-4o' },
      slots: {
        trigger: `<template #trigger="{ model, open }">
          <span class="custom-trigger">自定义{{ model?.label }}{{ open ? '开' : '关' }}</span>
        </template>`,
      },
      attachTo: document.body,
    })
    expect(wrapper.find('.custom-trigger').text()).toBe('自定义GPT-4o关')
    expect(wrapper.find('.ui-model-selector__label').exists()).toBe(false)
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    expect(wrapper.find('.custom-trigger').text()).toBe('自定义GPT-4o开')
    wrapper.unmount()
  })

  it('option 插槽：按条目作用域渲染（model/index/selected/active）', async () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, modelValue: 'gpt-4o' },
      slots: {
        option: `<template #option="{ model, index, selected, active }">
          <span class="custom-option">{{ index }}-{{ model.label }}-{{ selected }}-{{ active }}</span>
        </template>`,
      },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const options = [...document.querySelectorAll('.ui-model-selector__option')]
    expect(options[0].textContent).toBe('0-GPT-4o-true-true')
    expect(options[1].textContent).toBe('1-Claude-false-false')
    expect(options[2].textContent).toBe('2-本地推理-false-false')
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到触发器 button，不落根容器', () => {
    const wrapper = mount(ModelSelector, {
      attrs: { id: 'model-picker', 'aria-describedby': 'model-tip' },
    })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    expect(trigger.attributes('id')).toBe('model-picker')
    expect(trigger.attributes('aria-describedby')).toBe('model-tip')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
