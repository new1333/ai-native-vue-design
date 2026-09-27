// a11y spec：原生语义 / role / aria / 键盘 Enter·Space 路径。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Suggestion from './Suggestion.vue'
import type { SuggestionItem } from './Suggestion.types'

const ITEMS: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的示例' },
]

describe('Suggestion a11y', () => {
  it('chips 为原生 button（隐式 role=button），不额外书写 role', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const chip = wrapper.find('button.ui-suggestion__item')
    expect(chip.element.tagName).toBe('BUTTON')
    expect(chip.attributes('role')).toBeUndefined()
  })

  it('根容器 role="group"，可经 attrs 提供 aria-label 命名分组', () => {
    const wrapper = mount(Suggestion, {
      props: { items: ITEMS },
      attrs: { 'aria-label': '推荐追问' },
    })
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('推荐追问')
  })

  it('不改写 tabindex：chips 自然进入 Tab 序', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    expect(wrapper.find('button.ui-suggestion__item').attributes('tabindex')).toBeUndefined()
  })

  it('disabled：原生 disabled 属性（原生即移出 Tab 序），不用 aria-disabled', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, disabled: true } })
    expect(wrapper.find('button.ui-suggestion__item').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.ui-suggestion__item').attributes('aria-disabled')).toBeUndefined()
  })

  it('item.disabled：该 chip 原生 disabled 且无 aria-disabled', () => {
    const wrapper = mount(Suggestion, {
      props: { items: [{ label: '禁用', value: 'a', disabled: true }] },
    })
    expect(wrapper.find('button.ui-suggestion__item').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.ui-suggestion__item').attributes('aria-disabled')).toBeUndefined()
  })

  it('loading：根级 aria-busy="true" 且 chips 无原生 disabled（保持可聚焦、读屏可达）', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button.ui-suggestion__item').attributes('disabled')).toBeUndefined()
  })

  it('非 loading：不出现 aria-busy 属性', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('键盘 Enter：上抛 select 且仅一次', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('键盘 Space（" "）：上抛 select 且仅一次', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('键盘激活时 preventDefault：拦截原生二次激活与 Space 滚动，且只上抛一次', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const chip = wrapper.find('button.ui-suggestion__item').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    chip.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')).toHaveLength(1)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    chip.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')).toHaveLength(2)
  })

  it('非激活键（Tab、A）不上抛 select', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: 'Tab' })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('loading 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, loading: true } })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('disabled 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, disabled: true } })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-suggestion__item').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
