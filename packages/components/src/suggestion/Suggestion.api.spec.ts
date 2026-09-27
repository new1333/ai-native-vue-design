// api spec：props 默认值 / emits 声明 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Suggestion from './Suggestion.vue'
import type { SuggestionItem, SuggestionItemScope } from './Suggestion.types'

const ITEMS: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的示例' },
  { label: '深入原理', value: '请解释底层实现原理' },
]

describe('Suggestion api', () => {
  it('渲染根容器 ui-suggestion 与 role=group，chips 为原生 button 列表', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    expect(wrapper.classes()).toContain('ui-suggestion')
    expect(wrapper.attributes('role')).toBe('group')
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips).toHaveLength(3)
    for (const chip of chips) expect(chip.element.tagName).toBe('BUTTON')
  })

  it('items 数据源：chip 数量与 label 文案按 items 顺序渲染', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips.map((chip) => chip.text())).toEqual(ITEMS.map((item) => item.label))
  })

  it('items 为空数组时不渲染任何 chip（空态安全）', () => {
    const wrapper = mount(Suggestion, { props: { items: [] } })
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.find('.ui-suggestion__list').exists()).toBe(true)
  })

  it('默认：type=button、无原生 disabled、无 aria-busy', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    for (const chip of wrapper.findAll('button.ui-suggestion__item')) {
      expect(chip.attributes('type')).toBe('button')
      expect(chip.attributes('disabled')).toBeUndefined()
    }
  })

  it('disabled=true：全部 chips 原生 disabled', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, disabled: true } })
    for (const chip of wrapper.findAll('button.ui-suggestion__item')) {
      expect(chip.attributes('disabled')).toBeDefined()
    }
  })

  it('item.disabled：仅该 chip 原生 disabled，其余正常', () => {
    const wrapper = mount(Suggestion, {
      props: { items: [{ label: '可用', value: 'a' }, { label: '禁用', value: 'b', disabled: true }] },
    })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips[0].attributes('disabled')).toBeUndefined()
    expect(chips[1].attributes('disabled')).toBeDefined()
  })

  it('loading=true：根级 aria-busy=true 且 chips 不置原生 disabled（保持可聚焦）', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    for (const chip of wrapper.findAll('button.ui-suggestion__item')) {
      expect(chip.attributes('disabled')).toBeUndefined()
    }
  })

  it('select 已声明：点击 chip 上抛完整建议项载荷', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    await wrapper.findAll('button.ui-suggestion__item')[1].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(ITEMS[1])
  })

  it('item 作用域插槽：scope 携带 item 与 index，替代默认 label', () => {
    const wrapper = mount(Suggestion, {
      props: { items: ITEMS },
      slots: {
        item: ({ item, index }: SuggestionItemScope) => h('span', `${index + 1}. ${item.label}`),
      },
    })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips[0].text()).toBe('1. 总结要点')
    expect(chips[2].text()).toBe('3. 深入原理')
  })

  it('default 插槽渲染到前置内容区（chips 之前）', () => {
    const wrapper = mount(Suggestion, {
      props: { items: ITEMS },
      slots: { default: () => h('span', { class: 'hint' }, '推荐追问') },
    })
    expect(wrapper.find('.ui-suggestion__prefix').exists()).toBe(true)
    expect(wrapper.find('.ui-suggestion__prefix .hint').text()).toBe('推荐追问')
    expect(wrapper.element.firstElementChild?.className).toContain('ui-suggestion__prefix')
  })

  it('未提供 default 插槽时不渲染前置内容区', () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    expect(wrapper.find('.ui-suggestion__prefix').exists()).toBe(false)
  })

  it('attrs 透传：aria-label 落到根元素（供分组命名）', () => {
    const wrapper = mount(Suggestion, {
      props: { items: ITEMS },
      attrs: { 'aria-label': '推荐追问' },
    })
    expect(wrapper.attributes('aria-label')).toBe('推荐追问')
  })
})
