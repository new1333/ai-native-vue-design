// api spec：props 默认值 / emits 声明 / 弹层渲染面 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from './Select.vue'
import type { SelectOption } from './Select.types'

const OPTIONS: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '归档', value: 'archived', disabled: true },
]

describe('Select api', () => {
  it('渲染 ui-select 根容器与 combobox 触发器按钮', () => {
    const wrapper = mount(Select)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-select')
    const trigger = wrapper.find('button.ui-select__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
  })

  it('默认：显示默认 placeholder、aria-expanded=false、无已选/无弹层/无清空按钮', () => {
    const wrapper = mount(Select)
    const trigger = wrapper.find('button.ui-select__trigger')
    expect(trigger.text()).toContain('请选择')
    expect(wrapper.find('.ui-select__label--placeholder').exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-select__clear').exists()).toBe(false)
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
  })

  it('placeholder prop 覆盖默认占位文案', () => {
    const trigger = mount(Select, { props: { placeholder: '选择负责人' } }).find(
      'button.ui-select__trigger',
    )
    expect(trigger.text()).toContain('选择负责人')
  })

  it('modelValue 命中选项：触发器显示其 label，不再走占位样式', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, modelValue: 'published' } })
    const trigger = wrapper.find('button.ui-select__trigger')
    expect(trigger.text()).toContain('已发布')
    expect(wrapper.find('.ui-select__label--placeholder').exists()).toBe(false)
  })

  it('modelValue 未命中（null/未知值）：回落 placeholder', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, modelValue: null } })
    expect(wrapper.find('button.ui-select__trigger').text()).toContain('请选择')
  })

  it('disabled：触发器原生 disabled + 根修饰类，且不渲染清空按钮', () => {
    const wrapper = mount(Select, {
      props: { options: OPTIONS, modelValue: 'draft', disabled: true, clearable: true },
    })
    const trigger = wrapper.find('button.ui-select__trigger')
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-select--disabled')
    expect(wrapper.find('button.ui-select__clear').exists()).toBe(false)
  })

  it('clearable：有已选值时渲染清空按钮（aria-label="清空"），未选时不渲染', () => {
    const withValue = mount(Select, { props: { options: OPTIONS, modelValue: 'draft', clearable: true } })
    const clear = withValue.find('button.ui-select__clear')
    expect(clear.exists()).toBe(true)
    expect(clear.attributes('aria-label')).toBe('清空')
    const withoutValue = mount(Select, { props: { options: OPTIONS, clearable: true } })
    expect(withoutValue.find('button.ui-select__clear').exists()).toBe(false)
  })

  it('打开后：弹层渲染选项全集（含禁用项 label），默认空态文案不出现', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    const listbox = document.querySelector('.ui-select__listbox')
    expect(listbox).not.toBeNull()
    const labels = [...(listbox?.querySelectorAll('.ui-select__option') ?? [])].map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['草稿', '已发布', '归档'])
    expect(listbox?.querySelector('.ui-select__empty')).toBeNull()
    wrapper.unmount()
  })

  it('emptyText：options 为空数组时弹层显示空态文案（默认"暂无选项"）', async () => {
    const wrapper = mount(Select, { props: { options: [] }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    expect(document.querySelector('.ui-select__empty')?.textContent).toBe('暂无选项')
    wrapper.unmount()

    const custom = mount(Select, {
      props: { options: [], emptyText: '加载中…' },
      attachTo: document.body,
    })
    await custom.find('button.ui-select__trigger').trigger('click')
    expect(document.querySelector('.ui-select__empty')?.textContent).toBe('加载中…')
    custom.unmount()
  })

  it('update:modelValue 已声明：选中路径以选项 value 为载荷发出', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    const option = document.querySelectorAll('.ui-select__option')[1]
    ;(option as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['published']])
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到触发器 button，不落根容器', () => {
    const wrapper = mount(Select, {
      attrs: { id: 'status-select', 'aria-describedby': 'status-error' },
    })
    const trigger = wrapper.find('button.ui-select__trigger')
    expect(trigger.attributes('id')).toBe('status-select')
    expect(trigger.attributes('aria-describedby')).toBe('status-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
