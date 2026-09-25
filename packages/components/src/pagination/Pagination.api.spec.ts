// api spec：props 默认值 / emits 声明 / 渲染契约（本组件无插槽，契约面为空）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import {
  PAGINATION_NEXT_ARIA_LABEL,
  PAGINATION_PAGE_SIZE_DEFAULT,
  PAGINATION_PREV_ARIA_LABEL,
  PAGINATION_SIBLING_COUNT_DEFAULT,
} from './Pagination.constants'
import Pagination from './Pagination.vue'

/** 页码按钮文本序列（不含上一页/下一页与省略号）。 */
function pageLabels(wrapper: VueWrapper): string[] {
  return wrapper.findAll('button.ui-pagination__page').map((button) => button.text())
}

/** 省略号占位元素。 */
function ellipses(wrapper: VueWrapper) {
  return wrapper.findAll('.ui-pagination__ellipsis')
}

/** 上一页 / 下一页按钮。 */
function navButtons(wrapper: VueWrapper) {
  return wrapper.findAll('button.ui-pagination__nav')
}

describe('Pagination api', () => {
  it('根为 <nav class="ui-pagination"> 且 aria-label="分页"', () => {
    const wrapper = mount(Pagination)
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.classes()).toContain('ui-pagination')
    expect(wrapper.attributes('aria-label')).toBe('分页')
  })

  it('默认档：page=1 / total=0 / pageSize=10 / siblingCount=1 → 单页、无省略号、双边界禁用', () => {
    const wrapper = mount(Pagination)
    expect(pageLabels(wrapper)).toEqual(['1'])
    expect(ellipses(wrapper)).toHaveLength(0)
    expect(navButtons(wrapper)[0]?.attributes('disabled')).toBeDefined()
    expect(navButtons(wrapper)[1]?.attributes('disabled')).toBeDefined()
  })

  it('total=45、pageSize=10 → 5 页全显（≤7 不折叠）', () => {
    const wrapper = mount(Pagination, { props: { total: 45 } })
    expect(pageLabels(wrapper)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('siblingCount 默认 1：total=100、page=5 → 窗口宽 3 + 首尾 + 两个省略号', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    expect(pageLabels(wrapper)).toEqual(['1', '4', '5', '6', '10'])
    expect(ellipses(wrapper)).toHaveLength(2)
  })

  it('emits 声明：点击页码发出 update:page，载荷为目标页码', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 1 } })
    await wrapper.findAll('button.ui-pagination__page')[1]?.trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[2]])
  })

  it('上一页/下一页按钮带固定 aria-label 常量', () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })
    const [prev, next] = navButtons(wrapper)
    expect(prev?.attributes('aria-label')).toBe(PAGINATION_PREV_ARIA_LABEL)
    expect(next?.attributes('aria-label')).toBe(PAGINATION_NEXT_ARIA_LABEL)
    expect(PAGINATION_PAGE_SIZE_DEFAULT).toBe(10)
    expect(PAGINATION_SIBLING_COUNT_DEFAULT).toBe(1)
  })

  it('多余 attrs 透传到 nav 根元素（默认 attr 继承）', () => {
    const wrapper = mount(Pagination, { attrs: { 'data-testid': 'pager', id: 'list-pager' } })
    expect(wrapper.attributes('data-testid')).toBe('pager')
    expect(wrapper.attributes('id')).toBe('list-pager')
  })
})
