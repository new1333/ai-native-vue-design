// api spec：props 默认值 / items 渲染 / pending 幽灵节点 / slots 作用域。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Timeline from './Timeline.vue'
import { TIMELINE_PENDING_TEXT } from './Timeline.constants'
import type { TimelineItem } from './Timeline.types'

const items: TimelineItem[] = [
  { key: 'a', title: '订单创建', description: '用户下单成功', time: '09:12' },
  { key: 'b', title: '订单支付', time: '09:30' },
  { title: '订单发货', description: '顺丰 SF123' },
]

describe('Timeline api', () => {
  it('渲染 ui-timeline 根 + role=list 的 ol 与 listitem 的 li', () => {
    const wrapper = mount(Timeline, { props: { items } })
    expect(wrapper.classes()).toContain('ui-timeline')
    const list = wrapper.find('ol')
    expect(list.exists()).toBe(true)
    expect(list.attributes('role')).toBe('list')
    const nodes = wrapper.findAll('li')
    expect(nodes).toHaveLength(3)
    expect(nodes.every((li) => li.attributes('role') === 'listitem')).toBe(true)
  })

  it('默认：mode=left（无 alternate 修饰类）、无 pending 节点、无 footer', () => {
    const wrapper = mount(Timeline, { props: { items } })
    expect(wrapper.classes()).not.toContain('ui-timeline--alternate')
    expect(wrapper.find('.ui-timeline__item--pending').exists()).toBe(false)
    expect(wrapper.find('.ui-timeline__footer').exists()).toBe(false)
    // 默认圆点（未覆盖 dot 插槽）存在
    expect(wrapper.findAll('.ui-timeline__dot-core')).toHaveLength(3)
  })

  it('items 渲染 title/description/time；可选字段缺省时不渲染对应行', () => {
    const wrapper = mount(Timeline, { props: { items } })
    const texts = wrapper.findAll('.ui-timeline__item').map((li) => li.text())
    expect(texts[0]).toContain('订单创建')
    expect(texts[0]).toContain('用户下单成功')
    expect(texts[0]).toContain('09:12')
    expect(texts[1]).toContain('订单支付')
    expect(texts[1]).not.toContain('09:12')
    expect(wrapper.find('.ui-timeline__description').text()).toBe('用户下单成功')
    expect(wrapper.findAll('.ui-timeline__time')).toHaveLength(2)
    expect(wrapper.findAll('.ui-timeline__title')).toHaveLength(3)
  })

  it('mode=alternate：根加 ui-timeline--alternate 修饰类', () => {
    const wrapper = mount(Timeline, { props: { items, mode: 'alternate' } })
    expect(wrapper.classes()).toContain('ui-timeline--alternate')
  })

  it('pending 默认 false；true 时末尾追加幽灵节点（--pending 类 + 默认文案）', () => {
    const off = mount(Timeline, { props: { items } })
    expect(off.findAll('li')).toHaveLength(3)

    const on = mount(Timeline, { props: { items, pending: true } })
    const nodes = on.findAll('li')
    expect(nodes).toHaveLength(4)
    const pendingNode = on.find('.ui-timeline__item--pending')
    expect(pendingNode.exists()).toBe(true)
    // 幽灵节点是末项
    expect(pendingNode.element).toBe(nodes[3]!.element)
    expect(pendingNode.text()).toContain(TIMELINE_PENDING_TEXT)
    // pending 圆点修饰类；普通圆点不受影响
    expect(on.find('.ui-timeline__dot-core--pending').exists()).toBe(true)
    expect(on.findAll('.ui-timeline__dot-core:not(.ui-timeline__dot-core--pending)')).toHaveLength(3)
  })

  it('item 插槽覆盖默认渲染，作用域 { item, index }', () => {
    const wrapper = mount(Timeline, {
      props: { items },
      slots: {
        item: `<template #item="{ item, index }">
          <em class="custom-item">{{ index }}-{{ item.title }}</em>
        </template>`,
      },
    })
    const customs = wrapper.findAll('.custom-item')
    expect(customs).toHaveLength(3)
    expect(customs[0]!.text()).toBe('0-订单创建')
    expect(customs[2]!.text()).toBe('2-订单发货')
    // 默认渲染被覆盖
    expect(wrapper.find('.ui-timeline__title').exists()).toBe(false)
  })

  it('dot 插槽覆盖默认圆点；普通项与 pending 节点都经过插槽', () => {
    const wrapper = mount(Timeline, {
      props: { items, pending: true },
      slots: {
        dot: `<template #dot="{ item, index, pending }">
          <i class="custom-dot" :data-pending="pending" :data-title="item?.title ?? ''">{{ index }}</i>
        </template>`,
      },
    })
    const dots = wrapper.findAll('.custom-dot')
    expect(dots).toHaveLength(4)
    expect(dots[0]!.text()).toBe('0')
    expect(dots[0]!.attributes('data-title')).toBe('订单创建')
    expect(dots[0]!.attributes('data-pending')).toBe('false')
    // pending 节点：item 为 undefined、pending 为 true、index 取 items.length
    expect(dots[3]!.attributes('data-pending')).toBe('true')
    expect(dots[3]!.attributes('data-title')).toBe('')
    expect(dots[3]!.text()).toBe('3')
    expect(wrapper.find('.ui-timeline__dot-core').exists()).toBe(false)
  })

  it('footer 插槽渲染于列表之下的附加区', () => {
    const wrapper = mount(Timeline, {
      props: { items },
      slots: { footer: '<button class="custom-footer">加载更多</button>' },
    })
    const footer = wrapper.find('.ui-timeline__footer')
    expect(footer.exists()).toBe(true)
    expect(footer.find('.custom-footer').exists()).toBe(true)
    expect(footer.text()).toBe('加载更多')
  })

  it('无 emits 契约：不触发任何事件', () => {
    expect(mount(Timeline, { props: { items, pending: true } }).emitted()).toEqual({})
  })
})
