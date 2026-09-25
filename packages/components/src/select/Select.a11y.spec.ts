// a11y spec：combobox/listbox 语义 / aria 属性 / 键盘序列 / 焦点模型。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from './Select.vue'
import type { SelectExpose, SelectOption } from './Select.types'

const OPTIONS: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '归档', value: 'archived', disabled: true },
  { label: '删除', value: 'deleted', disabled: true },
]

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-select__trigger')

describe('Select a11y', () => {
  it('触发器：原生 button + role=combobox + aria-haspopup=listbox + aria-controls', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-controls')).toMatch(/^ui-select-listbox-/)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('打开后：aria-controls 指向真实弹层 id，aria-expanded=true', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const controls = trigger.attributes('aria-controls') ?? ''
    expect(document.getElementById(controls)?.getAttribute('role')).toBe('listbox')
    wrapper.unmount()
  })

  it('弹层与选项：role=listbox / role=option / aria-selected / aria-disabled', async () => {
    const wrapper = mount(Select, {
      props: { options: OPTIONS, modelValue: 'published' },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    const listbox = document.querySelector('.ui-select__listbox')
    expect(listbox).not.toBeNull()
    expect(listbox?.getAttribute('role')).toBe('listbox')
    const options = [...(listbox?.querySelectorAll('.ui-select__option') ?? [])]
    expect(options.map((el) => el.getAttribute('role'))).toEqual(
      Array.from({ length: 4 }, () => 'option'),
    )
    expect(options[1].getAttribute('aria-selected')).toBe('true')
    expect(options[0].getAttribute('aria-selected')).toBe('false')
    expect(options[2].getAttribute('aria-disabled')).toBe('true')
    expect(options[0].getAttribute('aria-disabled')).toBeNull()
    wrapper.unmount()
  })

  it('键盘 ↓：关闭态打开并把 aria-activedescendant 落在首个可选选项', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const firstOptionId = document.querySelector('.ui-select__option')?.id
    expect(trigger.attributes('aria-activedescendant')).toBe(firstOptionId)
    wrapper.unmount()
  })

  it('键盘 ↓/↑：高亮沿可选项移动（跳过禁用项），aria-activedescendant 同步', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    const options = () => [...document.querySelectorAll('.ui-select__option')]
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[1].id)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[1].id) // 禁用项被跳过后夹住
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[0].id)
    wrapper.unmount()
  })

  it('键盘 ↑ 在关闭态：打开并把高亮落在末个可选选项', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    const lastEnabled = [...document.querySelectorAll('.ui-select__option')][1]
    expect(trigger.attributes('aria-activedescendant')).toBe(lastEnabled.id)
    wrapper.unmount()
  })

  it('键盘 Home/End：高亮跳到首/尾可选选项', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'End' })
    const options = [...document.querySelectorAll('.ui-select__option')]
    expect(trigger.attributes('aria-activedescendant')).toBe(options[1].id)
    await trigger.trigger('keydown', { key: 'Home' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options[0].id)
    wrapper.unmount()
  })

  it('键盘 Enter：打开（关闭态）/ 选中高亮项并关闭（打开态）', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['published']])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Space（" "）：打开弹层；Enter/Space 均被 preventDefault（不双触发）', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Esc：关闭弹层且不发出 update:modelValue', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），触发器 blur 关闭弹层', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    await trigger.trigger('blur')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('焦点模型：选项不进 Tab 序（无 tabindex），焦点始终停留在触发器', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    const options = [...document.querySelectorAll('.ui-select__option')]
    expect(options.every((el) => !el.hasAttribute('tabindex'))).toBe(true)
    expect(document.activeElement).not.toBe(options[0])
    const exposed = wrapper.vm as SelectExpose
    exposed.focus()
    expect(document.activeElement).toBe(trigger.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(trigger.element)
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序）且键盘路径不打开', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, disabled: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
  })

  it('清空按钮：原生 button + aria-label="清空"，不嵌套在触发器 button 内（DOM 合法）', () => {
    const wrapper = mount(Select, {
      props: { options: OPTIONS, modelValue: 'draft', clearable: true },
    })
    const clear = wrapper.find('button.ui-select__clear')
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('清空')
    expect(clear.find('svg').attributes('aria-hidden')).toBe('true')
    expect(findTrigger(wrapper).element.contains(clear.element)).toBe(false)
  })

  it('折叠箭标 svg 带 aria-hidden，不进入可读内容', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    const chevron = wrapper.find('.ui-select__chevron')
    expect(chevron.exists()).toBe(true)
    expect(chevron.attributes('aria-hidden')).toBe('true')
    expect(chevron.attributes('focusable')).toBe('false')
  })
})
