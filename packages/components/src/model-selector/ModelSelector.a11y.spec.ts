// a11y spec：combobox/listbox 语义 / aria 属性 / 键盘序列 / 焦点模型 / 加载态。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModelSelector from './ModelSelector.vue'
import type { ModelSelectorExpose, ModelSelectorModel } from './ModelSelector.types'

const MODELS: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude', value: 'claude', provider: 'Anthropic' },
  { label: '旗舰模型', value: 'flagship', disabled: true },
  { label: '本地推理', value: 'local', disabled: true },
]

const findTrigger = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('button.ui-model-selector__trigger')

describe('ModelSelector a11y', () => {
  it('触发器：原生 button + role=combobox + aria-haspopup=listbox + aria-controls', () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-controls')).toMatch(/^ui-model-selector-listbox-/)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('打开后：aria-controls 指向真实弹层 id，aria-expanded=true', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const controls = trigger.attributes('aria-controls') ?? ''
    expect(document.getElementById(controls)?.getAttribute('role')).toBe('listbox')
    wrapper.unmount()
  })

  it('弹层与选项：role=listbox / role=option / aria-selected / aria-disabled', async () => {
    const wrapper = mount(ModelSelector, {
      props: { models: MODELS, modelValue: 'claude' },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    const listbox = document.querySelector('.ui-model-selector__listbox')
    expect(listbox).not.toBeNull()
    expect(listbox?.getAttribute('role')).toBe('listbox')
    const options = [...(listbox?.querySelectorAll('.ui-model-selector__option') ?? [])]
    expect(options.map((el) => el.getAttribute('role'))).toEqual(
      Array.from({ length: 4 }, () => 'option'),
    )
    expect(options[1].getAttribute('aria-selected')).toBe('true')
    expect(options[0].getAttribute('aria-selected')).toBe('false')
    expect(options[2].getAttribute('aria-disabled')).toBe('true')
    expect(options[0].getAttribute('aria-disabled')).toBeNull()
    wrapper.unmount()
  })

  it('provider 徽标为可读文本（不 aria-hidden），折叠箭标 svg 带 aria-hidden', () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, modelValue: 'gpt-4o' } })
    const badge = wrapper.find('.ui-model-selector__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes('aria-hidden')).toBeUndefined()
    const chevron = wrapper.find('.ui-model-selector__chevron')
    expect(chevron.attributes('aria-hidden')).toBe('true')
    expect(chevron.attributes('focusable')).toBe('false')
  })

  it('loading：根级 aria-busy="true"，弹层显示加载文案且不渲染选项', async () => {
    const wrapper = mount(ModelSelector,
      { props: { models: MODELS, loading: true }, attachTo: document.body },
    )
    expect(wrapper.attributes('aria-busy')).toBe('true')
    await findTrigger(wrapper).trigger('click')
    const loadingRow = document.querySelector('.ui-model-selector__loading')
    const listbox = document.querySelector('.ui-model-selector__listbox')
    expect(loadingRow).not.toBeNull()
    // 提示行在 listbox 之外（WAI-ARIA：listbox 直接子元素仅允许 option/group），loading 行 role=status
    expect(loadingRow?.getAttribute('role')).toBe('status')
    expect(listbox?.contains(loadingRow)).toBe(false)
    expect(document.querySelector('.ui-model-selector__option')).toBeNull()
    wrapper.unmount()
  })

  it('listbox 子元素约束：直接子元素全为 role=option，empty 提示行置于 listbox 之外', async () => {
    // 有数据：listbox 直接子元素全部是 role=option
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    const listbox = document.querySelector('.ui-model-selector__listbox')
    const childRoles = [...(listbox?.children ?? [])].map((el) => el.getAttribute('role'))
    expect(childRoles).toEqual(Array.from({ length: MODELS.length }, () => 'option'))
    wrapper.unmount()

    // 空态：empty 行是弹层面板的直接子元素（listbox 兄弟节点），listbox 无元素子节点
    const empty = mount(ModelSelector, { props: { models: [] }, attachTo: document.body })
    await findTrigger(empty).trigger('click')
    const emptyListbox = document.querySelector('.ui-model-selector__listbox')
    const emptyRow = document.querySelector('.ui-model-selector__empty')
    expect(emptyListbox?.children.length).toBe(0)
    expect(emptyRow?.parentElement?.classList.contains('ui-model-selector__popup')).toBe(true)
    empty.unmount()
  })

  it('键盘 ↓：关闭态打开并把 aria-activedescendant 落在首个可选模型', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const firstOptionId = document.querySelector('.ui-model-selector__option')?.id
    expect(trigger.attributes('aria-activedescendant')).toBe(firstOptionId)
    wrapper.unmount()
  })

  it('键盘 ↓/↑：高亮沿可选模型移动（跳过禁用项），aria-activedescendant 同步', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    const options = () => [...document.querySelectorAll('.ui-model-selector__option')]
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[1].id)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[1].id) // 禁用项被跳过后夹住
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options()[0].id)
    wrapper.unmount()
  })

  it('键盘 ↑ 在关闭态：打开并把高亮落在末个可选模型', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    const lastEnabled = [...document.querySelectorAll('.ui-model-selector__option')][1]
    expect(trigger.attributes('aria-activedescendant')).toBe(lastEnabled.id)
    wrapper.unmount()
  })

  it('键盘 Home/End：高亮跳到首/尾可选模型', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'End' })
    const options = [...document.querySelectorAll('.ui-model-selector__option')]
    expect(trigger.attributes('aria-activedescendant')).toBe(options[1].id)
    await trigger.trigger('keydown', { key: 'Home' })
    expect(trigger.attributes('aria-activedescendant')).toBe(options[0].id)
    wrapper.unmount()
  })

  it('键盘 Enter：打开（关闭态）/ 选中高亮项并关闭（打开态）', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['claude']])
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Space（" "）：打开弹层；Enter/Space 均被 preventDefault（不双触发）', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Esc：关闭弹层且不上抛事件', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），触发器 blur 关闭弹层', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
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
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    const options = [...document.querySelectorAll('.ui-model-selector__option')]
    expect(options.every((el) => !el.hasAttribute('tabindex'))).toBe(true)
    expect(document.activeElement).not.toBe(options[0])
    const exposed = wrapper.vm as ModelSelectorExpose
    exposed.focus()
    expect(document.activeElement).toBe(trigger.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(trigger.element)
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序）且键盘路径不打开', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, disabled: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
  })
})
