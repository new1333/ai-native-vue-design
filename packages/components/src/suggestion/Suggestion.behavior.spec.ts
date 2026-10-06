// behavior spec：select 上抛 / disabled / loading / items 响应式 / 多 chip 独立 / 空态。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Suggestion from './Suggestion.vue'
import type { SuggestionItem } from './Suggestion.types'

const ITEMS: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的示例' },
  { label: '深入原理', value: '请解释底层实现原理' },
]

describe('Suggestion behavior', () => {
  it('点击 chip 触发 select，载荷为对应建议项', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(ITEMS[0])
  })

  it('连续点击不同 chips：各自上抛，互不串扰', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    await chips[0].trigger('click')
    await chips[2].trigger('click')
    await chips[2].trigger('click')
    const values = wrapper.emitted('select')?.map((args) => (args[0] as SuggestionItem).value)
    expect(values).toEqual([ITEMS[0].value, ITEMS[2].value, ITEMS[2].value])
  })

  it('disabled=true：点击不上抛 select', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, disabled: true } })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('disabled 恢复 false 后 select 恢复（响应式语义）', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, disabled: true } })
    await wrapper.setProps({ disabled: false })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('item.disabled：禁用项不上抛，可用项正常', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        items: [
          { label: '可用', value: 'a' },
          { label: '禁用', value: 'b', disabled: true },
        ],
      },
    })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    await chips[1].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    await chips[0].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual({ label: '可用', value: 'a' })
  })

  it('loading=true：点击不上抛（含直接派发的合成事件）', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, loading: true } })
    const chip = wrapper.findAll('button.ui-suggestion__item')[0]
    await chip.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    // chips 未置原生 disabled，合成事件兜底同样被闸门拦截
    void (chip.element as HTMLButtonElement).click()
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('loading 恢复 false 后 select 恢复', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS, loading: true } })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.setProps({ loading: false })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('items 响应式更新：chips 随之重渲染', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const next: SuggestionItem[] = [{ label: '换个话题', value: '我们换个话题聊聊' }]
    await wrapper.setProps({ items: next })
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips).toHaveLength(1)
    expect(chips[0].text()).toBe('换个话题')
  })

  it('新 items 的选中载荷为新数据（渲染与载荷同步）', async () => {
    const wrapper = mount(Suggestion, { props: { items: ITEMS } })
    const next: SuggestionItem[] = [{ label: '换个话题', value: '我们换个话题聊聊' }]
    await wrapper.setProps({ items: next })
    await wrapper.findAll('button.ui-suggestion__item')[0].trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(next[0])
  })

  it('空态（默认文案）：items 为空时渲染「暂无建议」弱提示，无 chips、无空列表占位', () => {
    const wrapper = mount(Suggestion, { props: { items: [] } })
    const empty = wrapper.find('.ui-suggestion__empty')
    expect(empty.exists()).toBe(true)
    expect(empty.text()).toBe('暂无建议')
    expect(wrapper.findAll('button.ui-suggestion__item')).toHaveLength(0)
    expect(wrapper.find('.ui-suggestion__list').exists()).toBe(false)
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('空态（#empty 插槽优先）：提供插槽时渲染插槽内容，默认文案不再出现', () => {
    const wrapper = mount(Suggestion, {
      props: { items: [] },
      slots: { empty: () => h('span', '正在生成建议…') },
    })
    const empty = wrapper.find('.ui-suggestion__empty')
    expect(empty.exists()).toBe(true)
    expect(empty.text()).toBe('正在生成建议…')
    expect(empty.text()).not.toContain('暂无建议')
  })

  it('空态响应式：items 由空到有再到空，空态与 chips 列表随数据切换', async () => {
    const wrapper = mount(Suggestion, { props: { items: [] } })
    expect(wrapper.find('.ui-suggestion__empty').exists()).toBe(true)
    await wrapper.setProps({ items: ITEMS })
    expect(wrapper.find('.ui-suggestion__empty').exists()).toBe(false)
    const chips = wrapper.findAll('button.ui-suggestion__item')
    expect(chips).toHaveLength(ITEMS.length)
    await wrapper.setProps({ items: [] })
    expect(wrapper.find('.ui-suggestion__empty').exists()).toBe(true)
    expect(wrapper.findAll('button.ui-suggestion__item')).toHaveLength(0)
  })
})
