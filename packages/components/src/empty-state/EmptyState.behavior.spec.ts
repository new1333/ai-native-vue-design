// behavior spec：props 响应式切换 / action 插槽交互透传 / 静态无副作用。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import EmptyState from './EmptyState.vue'

describe('EmptyState behavior', () => {
  it('title / description 响应式更新：无 → 有 → 无', async () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.ui-empty-state__title').exists()).toBe(false)
    await wrapper.setProps({ title: '暂无数据', description: '先新建。' })
    expect(wrapper.find('.ui-empty-state__title').text()).toBe('暂无数据')
    expect(wrapper.find('.ui-empty-state__description').text()).toBe('先新建。')
    await wrapper.setProps({ title: undefined, description: undefined })
    expect(wrapper.find('.ui-empty-state__title').exists()).toBe(false)
    expect(wrapper.find('.ui-empty-state__description').exists()).toBe(false)
  })

  it('action 插槽内的使用方按钮点击正常透传（组合交互不被拦截）', async () => {
    const clicks: string[] = []
    const wrapper = mount(EmptyState, {
      slots: {
        action: () =>
          h(
            'button',
            {
              type: 'button',
              onClick: () => clicks.push('create'),
            },
            '新建记录',
          ),
      },
    })
    await wrapper.find('.ui-empty-state__action button').trigger('click')
    expect(clicks).toEqual(['create'])
  })

  it('组件自身不声明任何事件（静态占位；触发器记录见 test-utils 行为，不作为组件契约）', () => {
    // test-utils 会把根元素上的 DOM trigger 也记入 emitted()，故此处断言组件 emits 选项本身
    const emitsOption = (EmptyState as unknown as { emits?: Record<string, unknown> }).emits
    expect(emitsOption).toBeUndefined()
    const wrapper = mount(EmptyState, { props: { title: '静态' } })
    expect(wrapper.emitted()).toEqual({})
  })

  it('重复挂载/卸载互不串扰（无模块级共享状态）', () => {
    const a = mount(EmptyState, { props: { title: 'A' } })
    const b = mount(EmptyState, { props: { title: 'B' } })
    expect(a.find('.ui-empty-state__title').text()).toBe('A')
    expect(b.find('.ui-empty-state__title').text()).toBe('B')
    a.unmount()
    expect(b.find('.ui-empty-state__title').text()).toBe('B')
    b.unmount()
  })
})
