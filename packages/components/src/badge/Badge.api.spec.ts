// api spec：props 默认值 / variant 档位 / dot / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge api', () => {
  it('渲染 <span> 并携带 ui-badge 根类', () => {
    const wrapper = mount(Badge, { slots: { default: () => '进行中' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-badge')
    expect(wrapper.text()).toBe('进行中')
  })

  it('默认：variant=neutral、无 dot', () => {
    const wrapper = mount(Badge)
    expect(wrapper.classes()).toContain('ui-badge--neutral')
    expect(wrapper.find('.ui-badge__dot').exists()).toBe(false)
  })

  it('variant 全档位映射修饰类（neutral/success/warning/danger/info）', () => {
    const variants = ['neutral', 'success', 'warning', 'danger', 'info'] as const
    for (const variant of variants) {
      expect(mount(Badge, { props: { variant } }).classes()).toContain(`ui-badge--${variant}`)
    }
  })

  it('dot=true：渲染前置圆点元素', () => {
    const wrapper = mount(Badge, { props: { dot: true }, slots: { default: () => '在线' } })
    expect(wrapper.find('.ui-badge__dot').exists()).toBe(true)
    expect(wrapper.text()).toContain('在线')
  })

  it('attrs 透传到根元素（data-testid）', () => {
    const wrapper = mount(Badge, { attrs: { 'data-testid': 'status-badge' } })
    expect(wrapper.attributes('data-testid')).toBe('status-badge')
  })
})
