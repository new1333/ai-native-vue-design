// api spec：props 渲染 / slots（icon 缺省与覆盖、action）/ 条件渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import EmptyState from './EmptyState.vue'

describe('EmptyState api', () => {
  it('渲染 div 容器并携带 ui-empty-state 根类', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-empty-state')
  })

  it('无 props：仅渲染图标位（内建 svg），无标题/说明/操作区', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.ui-empty-state__icon-svg').exists()).toBe(true)
    expect(wrapper.find('.ui-empty-state__title').exists()).toBe(false)
    expect(wrapper.find('.ui-empty-state__description').exists()).toBe(false)
    expect(wrapper.find('.ui-empty-state__action').exists()).toBe(false)
  })

  it('title / description 渲染进专属容器', () => {
    const wrapper = mount(EmptyState, {
      props: { title: '暂无数据', description: '创建第一条记录试试。' },
    })
    expect(wrapper.find('.ui-empty-state__title').text()).toBe('暂无数据')
    expect(wrapper.find('.ui-empty-state__description').text()).toBe('创建第一条记录试试。')
  })

  it('icon 插槽覆盖内建图标：自定义 svg 渲染，内建 svg 不出现', () => {
    const wrapper = mount(EmptyState, {
      slots: { icon: () => h('svg', { viewBox: '0 0 24 24', class: 'custom-icon' }) },
    })
    const iconArea = wrapper.find('.ui-empty-state__icon')
    expect(iconArea.find('svg.custom-icon').exists()).toBe(true)
    expect(iconArea.find('.ui-empty-state__icon-svg').exists()).toBe(false)
  })

  it('action 插槽渲染到操作区容器', () => {
    const wrapper = mount(EmptyState, {
      slots: { action: () => h('button', { type: 'button', class: 'action-btn' }, '新建记录') },
    })
    const action = wrapper.find('.ui-empty-state__action')
    expect(action.exists()).toBe(true)
    expect(action.find('button.action-btn').exists()).toBe(true)
    expect(action.text()).toBe('新建记录')
  })

  it('四区块完整组合渲染：图标 + 标题 + 说明 + 操作', () => {
    const wrapper = mount(EmptyState, {
      props: { title: '没有找到匹配结果', description: '调整筛选条件后重试。' },
      slots: { action: () => h('button', { type: 'button' }, '清除筛选') },
    })
    expect(wrapper.find('.ui-empty-state__icon-svg').exists()).toBe(true)
    expect(wrapper.find('.ui-empty-state__title').exists()).toBe(true)
    expect(wrapper.find('.ui-empty-state__description').exists()).toBe(true)
    expect(wrapper.find('.ui-empty-state__action').exists()).toBe(true)
  })

  it('title / description 为空字符串时按缺省处理（不渲染空行）', () => {
    const wrapper = mount(EmptyState, { props: { title: '', description: '' } })
    expect(wrapper.find('.ui-empty-state__title').exists()).toBe(false)
    expect(wrapper.find('.ui-empty-state__description').exists()).toBe(false)
  })
})
