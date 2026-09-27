// a11y spec：WAI-ARIA Breadcrumb 模式 / aria-current / aria-hidden 装饰 / 键盘路径。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { BreadcrumbItem } from './Breadcrumb.types'
import Breadcrumb from './Breadcrumb.vue'

/** 四项路径：甲(href) / 乙(button) / 丙(href, disabled) / 丁(末项 button)。 */
function fourItems(): BreadcrumbItem[] {
  return [
    { key: 'a', label: '甲', href: '/a' },
    { key: 'b', label: '乙' },
    { key: 'c', label: '丙', href: '/c', disabled: true },
    { key: 'd', label: '丁' },
  ]
}

function mountBreadcrumb(
  items: BreadcrumbItem[] = fourItems(),
  options: { attach?: boolean; maxCount?: number } = {},
) {
  return mount(Breadcrumb, {
    props: {
      items,
      ...(options.maxCount !== undefined ? { maxCount: options.maxCount } : {}),
    },
    ...(options.attach ? { attachTo: document.body } : {}),
  })
}

describe('Breadcrumb a11y', () => {
  it('结构：nav[aria-label] > ol > li，ol 的直接子元素全部是列表项', () => {
    const wrapper = mountBreadcrumb()
    const nav = wrapper.find('nav.ui-breadcrumb')
    expect(nav.attributes('aria-label')).toBe('面包屑')
    const ol = nav.find('ol')
    expect(ol.exists()).toBe(true)
    for (const child of ol.element.children) {
      expect(child.tagName).toBe('LI')
      expect(child.className).toContain('ui-breadcrumb__item')
    }
  })

  it('仅末项携带 aria-current="page"，其余项不标记', () => {
    const wrapper = mountBreadcrumb()
    const values = wrapper.findAll('.ui-breadcrumb__value')
    const marked = values.filter(value => value.attributes('aria-current') === 'page')
    expect(marked).toHaveLength(1)
    expect(marked[0].text()).toBe('丁')
  })

  it('项为原生交互元素：a[href] / button[type=button]，无 tabindex 覆写（自然 Tab 序）', () => {
    const wrapper = mountBreadcrumb()
    const link = wrapper.find('a.ui-breadcrumb__link')
    expect(link.attributes('href')).toBe('/a')
    const button = wrapper.findAll('button.ui-breadcrumb__link')[0]
    expect(button.attributes('type')).toBe('button')
    for (const value of wrapper.findAll('.ui-breadcrumb__value')) {
      expect(value.attributes('tabindex')).toBeUndefined()
    }
  })

  it('disabled 项：aria-disabled=true 的 span，不是 a/button、不进入交互面', () => {
    const wrapper = mountBreadcrumb()
    const disabled = wrapper.find('.ui-breadcrumb__value--disabled')
    expect(disabled.element.tagName).toBe('SPAN')
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.attributes('href')).toBeUndefined()
    // 没有 aria-current 与 disabled 并存时的假链接语义
    expect(disabled.element.closest('a')).toBeNull()
  })

  it('分隔符与折叠省略号均为 aria-hidden 的非聚焦占位', () => {
    const items = ['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label }))
    const wrapper = mountBreadcrumb(items, { maxCount: 3 })
    const separators = wrapper.findAll('.ui-breadcrumb__separator')
    expect(separators.length).toBeGreaterThan(0)
    for (const separator of separators) {
      expect(separator.attributes('aria-hidden')).toBe('true')
      expect(separator.attributes('tabindex')).toBeUndefined()
    }
    const ellipsis = wrapper.find('.ui-breadcrumb__ellipsis')
    expect(ellipsis.attributes('aria-hidden')).toBe('true')
    expect(ellipsis.attributes('tabindex')).toBeUndefined()
  })

  it('键盘 Enter 在 button 项：激活并单次发出 itemClick（keydown preventDefault 策略）', async () => {
    const wrapper = mountBreadcrumb()
    const button = wrapper.findAll('button.ui-breadcrumb__link')[0]
    await button.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('itemClick')).toHaveLength(1)
    expect(button.attributes('aria-current')).toBeUndefined()
  })

  it('键盘 Space 在 button 项：激活发出 itemClick', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('button.ui-breadcrumb__link')[0].trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('itemClick')).toHaveLength(1)
  })

  it('非激活键不被拦截：button 项上 x 的 keydown 不 preventDefault、不发 itemClick', () => {
    const wrapper = mountBreadcrumb()
    const button = wrapper.findAll('button.ui-breadcrumb__link')[0].element
    const event = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true })
    button.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('itemClick')).toBeUndefined()
  })

  it('<a> 项保留原生键盘激活：Enter keydown 不被 preventDefault（导航不被组件劫持）', () => {
    const wrapper = mountBreadcrumb()
    const link = wrapper.find('a.ui-breadcrumb__link').element
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('itemClick')).toBeUndefined()
  })

  it('焦点可达：逐项聚焦成功（a/button 原生可聚焦）；disabled span 无 tabindex、不进交互面', () => {
    const wrapper = mountBreadcrumb(fourItems(), { attach: true })
    const focusables = [
      wrapper.find('a.ui-breadcrumb__link').element as HTMLElement,
      ...wrapper.findAll('button.ui-breadcrumb__link').map(button => button.element as HTMLElement),
    ]
    expect(focusables).toHaveLength(3)
    for (const element of focusables) {
      element.focus()
      expect(document.activeElement).toBe(element)
    }
    // disabled 项为 span：无 tabindex、非 a/button（真实浏览器中 span.focus() 为 no-op，
    // happy-dom 的 focus() 不校验可聚焦性，故此处做结构断言）
    const disabled = wrapper.find('.ui-breadcrumb__value--disabled')
    expect(disabled.element.tagName).toBe('SPAN')
    expect(disabled.attributes('tabindex')).toBeUndefined()
    expect(disabled.attributes('href')).toBeUndefined()
    wrapper.unmount()
  })
})
