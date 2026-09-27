// a11y spec：combobox/listbox 语义 / aria 属性 / 键盘序列 / 焦点模型 / 加载行播报。
import { describe, expect, it } from 'vitest'
import { afterEach } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AutoComplete from './AutoComplete.vue'
import type { AutoCompleteExpose, AutoCompleteOption } from './AutoComplete.types'

// 任一用例失败时也保证卸载，避免 Teleport 弹层跨用例泄漏污染后续断言。
enableAutoUnmount(afterEach)

const OPTIONS: AutoCompleteOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '南京', value: 'nanjing' },
  { label: '北海（暂不可选）', value: 'beihai', disabled: true },
  { label: '北疆（暂不可选）', value: 'beijiang', disabled: true },
]

const findInput = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('input.ui-autocomplete__control')

/** 以可取消的真实 KeyboardEvent 派发，断言 defaultPrevented。 */
function pressKey(element: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}

describe('AutoComplete a11y', () => {
  it('输入框：原生 input + role=combobox + aria-autocomplete=list + aria-haspopup=listbox + aria-controls', () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS } })
    const input = findInput(wrapper)
    expect(input.element.tagName).toBe('INPUT')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-haspopup')).toBe('listbox')
    expect(input.attributes('aria-controls')).toMatch(/^ui-autocomplete-listbox-/)
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    expect(input.attributes('tabindex')).toBeUndefined()
  })

  it('键入打开后：aria-expanded=true 且 aria-controls 指向真实弹层 id', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.setValue('北')
    expect(input.attributes('aria-expanded')).toBe('true')
    const controls = input.attributes('aria-controls') ?? ''
    const listbox = document.getElementById(controls)
    expect(listbox?.getAttribute('role')).toBe('listbox')
    expect(listbox?.classList.contains('ui-autocomplete__listbox')).toBe(true)
    wrapper.unmount()
  })

  it('建议：role=option / aria-selected（文本命中）/ aria-disabled', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, modelValue: '北京', filter: false },
      attachTo: document.body,
    })
    await findInput(wrapper).trigger('click')
    const options = [...document.querySelectorAll('.ui-autocomplete__option')]
    expect(options.map((el) => el.getAttribute('role'))).toEqual(
      Array.from({ length: 4 }, () => 'option'),
    )
    expect(options[0].getAttribute('aria-selected')).toBe('true') // label === modelValue
    expect(options[1].getAttribute('aria-selected')).toBe('false')
    expect(options[2].getAttribute('aria-disabled')).toBe('true')
    expect(options[0].getAttribute('aria-disabled')).toBeNull()
    wrapper.unmount()
  })

  it('键盘 ↓：关闭态打开并把 aria-activedescendant 落在首个可选建议', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('true')
    const firstOptionId = document.querySelector('.ui-autocomplete__option')?.id
    expect(input.attributes('aria-activedescendant')).toBe(firstOptionId)
    wrapper.unmount()
  })

  it('键盘 ↓/↑：高亮沿可选建议移动（跳过禁用项），aria-activedescendant 同步', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowDown' })
    const options = () => [...document.querySelectorAll('.ui-autocomplete__option')]
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(options()[1].id)
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(options()[1].id) // 禁用项被跳过后夹住
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.attributes('aria-activedescendant')).toBe(options()[0].id)
    wrapper.unmount()
  })

  it('键盘 ↑ 在关闭态：打开并把高亮落在末个可选建议', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowUp' })
    const lastEnabled = [...document.querySelectorAll('.ui-autocomplete__option')][1]
    expect(input.attributes('aria-activedescendant')).toBe(lastEnabled.id)
    wrapper.unmount()
  })

  it('键盘 Enter：选中高亮建议并关闭，aria-activedescendant 随之移除', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([[{ label: '南京', value: 'nanjing' }]])
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Enter（打开但无可选高亮）：关闭面板且不发出 select', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: [{ label: '锁定项', value: 'x', disabled: true }] },
      attachTo: document.body,
    })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    await input.trigger('keydown', { key: 'Enter' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Esc：关闭面板、preventDefault 且不发出 select', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('click')
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    const escape = pressKey(input.element, 'Escape')
    expect(escape.defaultPrevented).toBe(true)
    await nextTick()
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），blur 关闭面板', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('click')
    const tab = pressKey(input.element, 'Tab')
    expect(tab.defaultPrevented).toBe(false)
    await input.trigger('blur')
    expect(input.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('键盘 Home/End/Space：不劫持（保留文本编辑原义，不高亮、不打开）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    expect(pressKey(input.element, 'Home').defaultPrevented).toBe(false)
    expect(pressKey(input.element, 'End').defaultPrevented).toBe(false)
    expect(pressKey(input.element, ' ').defaultPrevented).toBe(false)
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('键盘 ↓/↑ 受理时 preventDefault（防光标跳动到行首/行尾）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    expect(pressKey(input.element, 'ArrowDown').defaultPrevented).toBe(true)
    expect(pressKey(input.element, 'ArrowUp').defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('焦点模型：建议不进 Tab 序（无 tabindex），焦点始终停留在输入框', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('keydown', { key: 'ArrowDown' })
    const options = [...document.querySelectorAll('.ui-autocomplete__option')]
    expect(options.every((el) => !el.hasAttribute('tabindex'))).toBe(true)
    expect(document.activeElement).not.toBe(options[0])
    const exposed = wrapper.vm as AutoCompleteExpose
    exposed.focus()
    expect(document.activeElement).toBe(input.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(input.element)
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序、无 aria-disabled）且键盘路径不打开', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS, disabled: true } })
    const input = findInput(wrapper)
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-disabled')).toBeUndefined()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
  })

  it('清空按钮：原生 button + aria-label="清空"，不嵌套在 input 内（DOM 合法）', () => {
    const wrapper = mount(AutoComplete, {
      props: { modelValue: '北京', clearable: true },
    })
    const clear = wrapper.find('button.ui-autocomplete__clear')
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('清空')
    expect(clear.find('svg').attributes('aria-hidden')).toBe('true')
    expect(findInput(wrapper).element.contains(clear.element)).toBe(false)
  })

  it('加载行：role=status 供读屏播报，listbox aria-busy=true', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: [], loading: true },
      attachTo: document.body,
    })
    await findInput(wrapper).trigger('click')
    const loading = document.querySelector('.ui-autocomplete__loading')
    expect(loading?.getAttribute('role')).toBe('status')
    expect(document.querySelector('.ui-autocomplete__listbox')?.getAttribute('aria-busy')).toBe(
      'true',
    )
    wrapper.unmount()
  })
})
