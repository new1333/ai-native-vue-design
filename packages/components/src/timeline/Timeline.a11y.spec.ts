// a11y spec：list/listitem 角色语义 / 纯展示不可聚焦（键盘路径）/ pending 节点可读内容。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Timeline from './Timeline.vue'
import { TIMELINE_PENDING_TEXT } from './Timeline.constants'
import type { TimelineItem } from './Timeline.types'

const items: TimelineItem[] = [
  { title: '事件一', description: '说明一', time: '09:12' },
  { title: '事件二' },
]

describe('Timeline a11y', () => {
  it('ol 显式 role="list"：抵消 list-style:none 丢失的列表语义', () => {
    const wrapper = mount(Timeline, { props: { items } })
    expect(wrapper.find('ol').attributes('role')).toBe('list')
  })

  it('每个 li 显式 role="listitem"（含 pending 幽灵节点）', () => {
    const wrapper = mount(Timeline, { props: { items, pending: true } })
    const nodes = wrapper.findAll('li')
    expect(nodes).toHaveLength(3)
    expect(nodes.every((li) => li.attributes('role') === 'listitem')).toBe(true)
    expect(nodes[2]!.classes()).toContain('ui-timeline__item--pending')
  })

  it('节点文本按可读顺序输出：标题在前，说明/时间随后（读屏顺序与视觉一致）', () => {
    const wrapper = mount(Timeline, { props: { items } })
    const first = wrapper.findAll('.ui-timeline__item')[0]!
    const children = first.findAll('.ui-timeline__title, .ui-timeline__description, .ui-timeline__time')
    expect(children.map((c) => c.classes()[0])).toEqual([
      'ui-timeline__title',
      'ui-timeline__description',
      'ui-timeline__time',
    ])
    expect(children[0]!.text()).toBe('事件一')
  })

  it('pending 幽灵节点携带可见默认文案，保证节点有可读内容', () => {
    const wrapper = mount(Timeline, { props: { items, pending: true } })
    const pendingNode = wrapper.find('.ui-timeline__item--pending')
    expect(pendingNode.text()).toContain(TIMELINE_PENDING_TEXT)
  })

  it('纯展示不可聚焦：根与后代均无 tabindex，不进入 Tab 序', () => {
    const wrapper = mount(Timeline, { props: { items, pending: true } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
  })

  it('组件自身不渲染交互元素（键盘路径只经由 #footer/#item 内使用方控件）', () => {
    const wrapper = mount(Timeline, { props: { items, pending: true } })
    expect(wrapper.find('button, a, input, select, textarea, [role="button"]').exists()).toBe(false)
  })

  it('使用方在 #footer 放置原生 button 时键盘可达（原生激活行为，组件不干预）', async () => {
    const wrapper = mount(Timeline, {
      props: { items },
      slots: { footer: '<button type="button" class="footer-btn">加载更多</button>' },
    })
    const button = wrapper.find('.footer-btn')
    expect(button.exists()).toBe(true)
    // 原生 button：可聚焦、Enter/Space 原生激活——组件不加 tabindex/按键拦截
    await button.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
  })
})
