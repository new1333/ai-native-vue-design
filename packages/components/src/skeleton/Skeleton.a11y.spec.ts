// a11y spec：纯装饰语义——aria-hidden、不进入 Tab 序、无可交互角色、无可读文本。
// 加载状态由使用方容器声明（组件契约，见 meta.accessibility）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Skeleton from './Skeleton.vue'

describe('Skeleton a11y', () => {
  it('根元素恒 aria-hidden="true"（三种形状一致，加载状态由使用方声明）', () => {
    expect(mount(Skeleton).attributes('aria-hidden')).toBe('true')
    expect(mount(Skeleton, { props: { variant: 'circle' } }).attributes('aria-hidden')).toBe('true')
    expect(mount(Skeleton, { props: { variant: 'rect' } }).attributes('aria-hidden')).toBe('true')
  })

  it('不书写 role / tabindex：非交互、不可聚焦', () => {
    const wrapper = mount(Skeleton, { props: { variant: 'circle' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('无任何可聚焦后代（行占位同样不携带 tabindex）', () => {
    expect(mount(Skeleton, { props: { lines: 3 } }).find('[tabindex]').exists()).toBe(false)
  })

  it('占位不产生可读文本（读屏感知完全依赖使用方容器）', () => {
    expect(mount(Skeleton, { props: { lines: 2 } }).text()).toBe('')
  })

  it('推荐用法：使用方容器持 role="status" 声明加载，Skeleton 本体保持 aria-hidden', () => {
    const Host = defineComponent({
      setup: () => () =>
        h('div', { role: 'status', 'aria-label': '加载中' }, [h(Skeleton, { lines: 2 })]),
    })
    const wrapper = mount(Host)
    const skeleton = wrapper.find('.ui-skeleton')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(skeleton.attributes('aria-hidden')).toBe('true')
  })
})
