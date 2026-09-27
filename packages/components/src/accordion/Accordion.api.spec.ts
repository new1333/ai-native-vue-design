// api spec：props 默认值（不传时 DOM 表现）/ emits 声明 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Accordion from './Accordion.vue'
import type { AccordionItem, AccordionItemScope } from './Accordion.types'

const ITEMS: AccordionItem[] = [
  { key: 'a', title: '条款 A', content: '条款 A 的正文。' },
  { key: 'b', title: '条款 B', content: '条款 B 的正文。' },
  { key: 'c', title: '条款 C', content: '条款 C 的正文。' },
]

describe('Accordion api', () => {
  it('渲染 ui-accordion 根容器（div），条目以 ui-accordion__item 分段', () => {
    const wrapper = mount(Accordion, { props: { items: ITEMS } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-accordion')
    expect(wrapper.findAll('.ui-accordion__item')).toHaveLength(3)
  })

  it('默认（无 modelValue）：全部收起——aria-expanded=false、面板 hidden、无 --open 修饰类', () => {
    const wrapper = mount(Accordion, { props: { items: ITEMS } })
    const triggers = wrapper.findAll('.ui-accordion__trigger')
    const panels = wrapper.findAll('.ui-accordion__panel')
    expect(triggers).toHaveLength(3)
    for (const trigger of triggers) {
      expect(trigger.attributes('aria-expanded')).toBe('false')
    }
    for (const panel of panels) {
      expect(panel.attributes('hidden')).toBeDefined()
    }
    expect(wrapper.findAll('.ui-accordion__item--open')).toHaveLength(0)
  })

  it('items 驱动渲染：头部标题与面板缺省正文（item.title / item.content）', () => {
    const wrapper = mount(Accordion, { props: { items: ITEMS } })
    const triggers = wrapper.findAll('.ui-accordion__trigger')
    expect(triggers[0]?.text()).toBe('条款 A')
    expect(triggers[2]?.text()).toBe('条款 C')
    // 收起面板内容仍在 DOM（hidden 隐藏）：缺省正文渲染 item.content
    expect(wrapper.find('.ui-accordion__panel').text()).toBe('条款 A 的正文。')
  })

  it('受控单开：modelValue="b" 仅 b 展开（aria-expanded / hidden / --open 同步）', () => {
    const wrapper = mount(Accordion, { props: { items: ITEMS, modelValue: 'b' } })
    const triggers = wrapper.findAll('.ui-accordion__trigger')
    expect(triggers[0]?.attributes('aria-expanded')).toBe('false')
    expect(triggers[1]?.attributes('aria-expanded')).toBe('true')
    expect(triggers[2]?.attributes('aria-expanded')).toBe('false')
    expect(wrapper.findAll('.ui-accordion__panel')[1]?.attributes('hidden')).toBeUndefined()
    expect(wrapper.findAll('.ui-accordion__item--open')).toHaveLength(1)
  })

  it('受控多开：multiple + modelValue 为 keys 数组，多面板同时展开', () => {
    const wrapper = mount(Accordion, {
      props: { items: ITEMS, modelValue: ['a', 'c'], multiple: true },
    })
    const triggers = wrapper.findAll('.ui-accordion__trigger')
    expect(triggers[0]?.attributes('aria-expanded')).toBe('true')
    expect(triggers[1]?.attributes('aria-expanded')).toBe('false')
    expect(triggers[2]?.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.ui-accordion__item--open')).toHaveLength(2)
  })

  it('emits 已声明：点击头部发出 update:modelValue 与 change', async () => {
    const wrapper = mount(Accordion, { props: { items: ITEMS } })
    await wrapper.findAll('.ui-accordion__trigger')[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({
      key: 'a',
      expanded: true,
      value: 'a',
    })
  })

  it('title 插槽：作用域 { item, index, expanded } 渲染并覆盖 item.title', () => {
    const wrapper = mount(Accordion, {
      props: { items: ITEMS, modelValue: 'a' },
      slots: {
        title: (scope: AccordionItemScope) =>
          h('span', { class: 'slot-title' }, `第${scope.index + 1}节 · ${scope.item.title}（${scope.expanded ? '开' : '合'}）`),
      },
    })
    const title = wrapper.find('.slot-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('第1节 · 条款 A（开）')
  })

  it('icon 插槽：渲染进头部图标容器并覆盖缺省 chevron', () => {
    const wrapper = mount(Accordion, {
      props: { items: ITEMS },
      slots: {
        icon: () => h('svg', { class: 'slot-icon', viewBox: '0 0 24 24' }),
      },
    })
    const icon = wrapper.find('.ui-accordion__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.find('svg.slot-icon').exists()).toBe(true)
    // 缺省 chevron 不再渲染（每个条目只剩插槽 svg）
    expect(wrapper.findAll('.ui-accordion__icon svg')).toHaveLength(ITEMS.length)
  })

  it('default 插槽：作用域渲染面板正文并覆盖 item.content', () => {
    const wrapper = mount(Accordion, {
      props: { items: ITEMS, modelValue: 'a' },
      slots: {
        default: (scope: AccordionItemScope) =>
          h('p', { class: 'slot-body' }, `定制正文：${scope.item.key} / 展开=${scope.expanded}`),
      },
    })
    expect(wrapper.find('.slot-body').text()).toBe('定制正文：a / 展开=true')
    expect(wrapper.text()).not.toContain('条款 A 的正文。')
  })
})
