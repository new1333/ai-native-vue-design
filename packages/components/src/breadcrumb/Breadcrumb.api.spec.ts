// api spec：props 默认值 / emits 声明 / slots 渲染 / 折叠语义 / aria-label 覆写。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { BreadcrumbItem } from './Breadcrumb.types'
import Breadcrumb from './Breadcrumb.vue'

/** 四项路径：甲(href) / 乙(button) / 丙(href, disabled) / 丁(末项，button)。 */
function fourItems(): BreadcrumbItem[] {
  return [
    { key: 'a', label: '甲', href: '/a' },
    { key: 'b', label: '乙' },
    { key: 'c', label: '丙', href: '/c', disabled: true },
    { key: 'd', label: '丁' },
  ]
}

function mountBreadcrumb(props: { items: BreadcrumbItem[]; maxCount?: number; separator?: string } = { items: fourItems() }) {
  return mount(Breadcrumb, { props })
}

describe('Breadcrumb api', () => {
  it('渲染 nav.ui-breadcrumb 根类，默认 aria-label=面包屑', () => {
    const wrapper = mountBreadcrumb()
    const nav = wrapper.find('nav.ui-breadcrumb')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('面包屑')
  })

  it('使用方以同名 aria-label attr 覆写默认值（fallthrough 优先）', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: fourItems() },
      attrs: { 'aria-label': '位置路径' },
    })
    expect(wrapper.find('nav.ui-breadcrumb').attributes('aria-label')).toBe('位置路径')
  })

  it('ol>li 结构：li 数量与 items 一致（缺省不折叠）', () => {
    const wrapper = mountBreadcrumb()
    const ol = wrapper.find('ol.ui-breadcrumb__list')
    expect(ol.exists()).toBe(true)
    expect(wrapper.findAll('ol > li')).toHaveLength(4)
  })

  it('有 href 渲染原生 a[href]，无 href 渲染 button[type=button]，label 为内容', () => {
    const wrapper = mountBreadcrumb()
    const values = wrapper.findAll('.ui-breadcrumb__value')
    expect(values[0].element.tagName).toBe('A')
    expect(values[0].attributes('href')).toBe('/a')
    expect(values[0].text()).toBe('甲')
    expect(values[1].element.tagName).toBe('BUTTON')
    expect(values[1].attributes('type')).toBe('button')
    expect(values[1].text()).toBe('乙')
  })

  it('disabled 项渲染为 aria-disabled 的 span（不是 a/button）', () => {
    const wrapper = mountBreadcrumb()
    const disabled = wrapper.findAll('.ui-breadcrumb__value--disabled')
    expect(disabled).toHaveLength(1)
    expect(disabled[0].element.tagName).toBe('SPAN')
    expect(disabled[0].attributes('aria-disabled')).toBe('true')
    expect(disabled[0].text()).toBe('丙')
  })

  it('末项标记 aria-current=page，其余项不标记', () => {
    const wrapper = mountBreadcrumb()
    const values = wrapper.findAll('.ui-breadcrumb__value')
    expect(values[0].attributes('aria-current')).toBeUndefined()
    expect(values[1].attributes('aria-current')).toBeUndefined()
    expect(values[2].attributes('aria-current')).toBeUndefined()
    expect(values[3].attributes('aria-current')).toBe('page')
  })

  it('缺省分隔符渲染内联 chevron 图标（svg，aria-hidden）', () => {
    const wrapper = mountBreadcrumb()
    const icons = wrapper.findAll('.ui-breadcrumb__separator svg')
    expect(icons).toHaveLength(3) // n 项 → n-1 个分隔符
    for (const icon of icons) {
      expect(icon.attributes('aria-hidden')).toBe('true')
      expect(icon.attributes('viewBox')).toBe('0 0 24 24')
    }
  })

  it('separator prop：文本分隔符落位', () => {
    const wrapper = mountBreadcrumb({ items: fourItems(), separator: '/' })
    const separators = wrapper.findAll('.ui-breadcrumb__separator')
    expect(separators).toHaveLength(3)
    for (const separator of separators) {
      expect(separator.text()).toBe('/')
      expect(separator.find('svg').exists()).toBe(false)
    }
  })

  it('separator 插槽：覆盖缺省图标与 prop 文本', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: fourItems(), separator: '/' },
      slots: { separator: '<b class="custom-sep">»</b>' },
    })
    expect(wrapper.findAll('.ui-breadcrumb__separator .custom-sep')).toHaveLength(3)
    expect(wrapper.find('.ui-breadcrumb__separator svg').exists()).toBe(false)
    expect(wrapper.find('.ui-breadcrumb__separator').text()).not.toBe('/')
  })

  it('item 插槽：作用域提供 item / index / isCurrent，替代默认渲染', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: fourItems() },
      slots: {
        item: `<template #item="{ item, index, isCurrent }">
          <em class="custom-item">{{ item.label }}-{{ index }}-{{ isCurrent ? 'cur' : 'no' }}</em>
        </template>`,
      },
    })
    const items = wrapper.findAll('.custom-item')
    expect(items).toHaveLength(4)
    expect(items[0].text()).toBe('甲-0-no')
    expect(items[3].text()).toBe('丁-3-cur')
    // 默认渲染被替代：不再出现 a/button 值元素
    expect(wrapper.find('.ui-breadcrumb__value').exists()).toBe(false)
  })

  it('maxCount 折叠：6 项 maxCount=4 → 首项 + 省略号 + 末尾 2 项（共 4 槽位）', () => {
    const items = ['一', '二', '三', '四', '五', '六'].map((label, index) => ({ key: `k${index}`, label }))
    const wrapper = mountBreadcrumb({ items, maxCount: 4 })
    const lis = wrapper.findAll('ol > li')
    expect(lis).toHaveLength(4)
    expect(wrapper.findAll('.ui-breadcrumb__value')).toHaveLength(3)
    expect(wrapper.find('.ui-breadcrumb__ellipsis').text()).toBe('…')
    expect(wrapper.text()).toContain('一')
    expect(wrapper.text()).not.toContain('二')
    expect(wrapper.text()).not.toContain('四')
    expect(wrapper.text()).toContain('五')
    expect(wrapper.text()).toContain('六')
    // 当前页（末项）永远保留
    expect(lis[3].find('.ui-breadcrumb__value').attributes('aria-current')).toBe('page')
  })

  it('maxCount 小于 3 收敛为 3：5 项 maxCount=1 → 首 + 省略号 + 末项', () => {
    const items = ['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label }))
    const wrapper = mountBreadcrumb({ items, maxCount: 1 })
    const lis = wrapper.findAll('ol > li')
    expect(lis).toHaveLength(3)
    expect(lis[0].text()).toContain('一')
    expect(lis[1].find('.ui-breadcrumb__ellipsis').exists()).toBe(true)
    expect(lis[2].text()).toContain('五')
  })

  it('maxCount ≥ items.length 或缺省：不折叠', () => {
    const items = fourItems()
    const unfolded = mountBreadcrumb({ items, maxCount: 4 })
    expect(unfolded.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(0)
    const absent = mountBreadcrumb({ items, maxCount: 100 })
    expect(absent.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(0)
    const def = mountBreadcrumb({ items })
    expect(def.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(0)
  })

  it('itemClick 已声明：点击项以 { item, index, event } 载荷发出', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('button.ui-breadcrumb__link')[0].trigger('click')
    const payloads = wrapper.emitted('itemClick')
    expect(payloads).toHaveLength(1)
    const payload = payloads![0][0] as { item: BreadcrumbItem; index: number; event: MouseEvent }
    expect(payload.item.label).toBe('乙')
    expect(payload.index).toBe(1)
    expect(payload.event).toBeInstanceOf(MouseEvent)
  })

  it('空 items：渲染空 ol，不抛异常', () => {
    const wrapper = mountBreadcrumb({ items: [] })
    expect(wrapper.findAll('ol > li')).toHaveLength(0)
  })
})
