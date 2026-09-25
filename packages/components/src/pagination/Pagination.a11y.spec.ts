// a11y spec：nav/列表语义 / aria-label / aria-current / 省略号不可聚焦 / 键盘可达与原生激活路径。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import {
  PAGINATION_NEXT_ARIA_LABEL,
  PAGINATION_PREV_ARIA_LABEL,
} from './Pagination.constants'
import Pagination from './Pagination.vue'

function navButtons(wrapper: VueWrapper) {
  return wrapper.findAll('button.ui-pagination__nav')
}

describe('Pagination a11y', () => {
  it('根为 <nav>（隐式 role=navigation），aria-label="分页"，不额外书写 role', () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('分页')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('列表语义完整：ul/li 承载页码项', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    expect(wrapper.find('ul.ui-pagination__list').exists()).toBe(true)
    expect(wrapper.findAll('li.ui-pagination__item').length).toBeGreaterThanOrEqual(5)
  })

  it('上一页/下一页：原生 button + aria-label="上一页"/"下一页"，chevron svg aria-hidden 且不聚焦', () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })
    const [prev, next] = navButtons(wrapper)
    expect(prev?.attributes('aria-label')).toBe(PAGINATION_PREV_ARIA_LABEL)
    expect(next?.attributes('aria-label')).toBe(PAGINATION_NEXT_ARIA_LABEL)
    for (const button of navButtons(wrapper)) {
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('type')).toBe('button')
      const icon = button.find('svg')
      expect(icon.attributes('aria-hidden')).toBe('true')
      expect(icon.attributes('focusable')).toBe('false')
    }
  })

  it('当前页 aria-current="page"，其余页码按钮无 aria-current', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 4 } })
    const pages = wrapper.findAll('button.ui-pagination__page')
    const currents = pages.filter((page) => page.attributes('aria-current') === 'page')
    expect(currents).toHaveLength(1)
    expect(currents[0]?.text()).toBe('4')
  })

  it('省略号：span 占位、aria-hidden="true"、非按钮、无 tabindex（不可聚焦）', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    const ellipses = wrapper.findAll('.ui-pagination__ellipsis')
    expect(ellipses).toHaveLength(2)
    for (const ellipse of ellipses) {
      expect(ellipse.element.tagName).toBe('SPAN')
      expect(ellipse.attributes('aria-hidden')).toBe('true')
      expect(ellipse.attributes('tabindex')).toBeUndefined()
    }
  })

  it('页码按钮为原生 button type=button：可读名即数字本身，不写 role/tabindex', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 2 } })
    for (const page of wrapper.findAll('button.ui-pagination__page')) {
      expect(page.element.tagName).toBe('BUTTON')
      expect(page.attributes('type')).toBe('button')
      expect(page.attributes('role')).toBeUndefined()
      expect(page.attributes('tabindex')).toBeUndefined()
      expect(page.attributes('aria-label')).toBeUndefined()
    }
  })

  it('边界禁用用原生 disabled（移出可交互态），不用 aria-disabled', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 1 } })
    const prev = navButtons(wrapper)[0]
    expect(prev?.attributes('disabled')).toBeDefined()
    expect(prev?.attributes('aria-disabled')).toBeUndefined()
  })

  it('键盘可达：页码按钮可聚焦（document.activeElement）', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 2 }, attachTo: document.body })
    const page2 = wrapper.findAll<HTMLButtonElement>('button.ui-pagination__page')[1]
    page2?.element.focus()
    expect(document.activeElement).toBe(page2?.element)
    wrapper.unmount()
  })

  it('键盘激活不被组件劫持：Enter/Space 的 keydown 不被 preventDefault（原生 click 激活路径完整）', async () => {
    const wrapper = mount(Pagination, {
      props: { total: 100, page: 1 },
      attachTo: document.body,
    })
    const page2 = wrapper.findAll<HTMLButtonElement>('button.ui-pagination__page')[1]
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    page2?.element.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    page2?.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
    // 原生 button 的键盘激活即触发 click（happy-dom 不合成，按原生路径直接派发验证回路的终点）
    page2?.element.click()
    expect(wrapper.emitted('update:page')).toEqual([[2]])
    wrapper.unmount()
  })
})
