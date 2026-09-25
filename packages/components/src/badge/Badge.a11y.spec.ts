// a11y spec：纯文本语义 / 不可聚焦 / dot 纯装饰 aria-hidden。
// 组件为纯展示、无交互，不存在键盘激活路径；断言其不产生可聚焦/伪交互语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge a11y', () => {
  it('纯文本语义：不加 role，状态由文本本身承载', () => {
    const wrapper = mount(Badge, { props: { variant: 'danger' }, slots: { default: () => '已失败' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.text()).toBe('已失败')
  })

  it('不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(Badge, { slots: { default: () => '进行中' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('dot 为纯装饰：aria-hidden="true"，状态不只靠圆点传达', () => {
    const wrapper = mount(Badge, { props: { dot: true }, slots: { default: () => '服务异常' } })
    const dot = wrapper.find('.ui-badge__dot')
    expect(dot.exists()).toBe(true)
    expect(dot.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('服务异常')
  })
})
