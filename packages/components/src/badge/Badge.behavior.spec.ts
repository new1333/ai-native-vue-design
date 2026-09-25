// behavior spec：variant / dot 的响应式切换。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge behavior', () => {
  it('variant 切换：语义档修饰类随之更新', async () => {
    const wrapper = mount(Badge, { props: { variant: 'neutral' } })
    expect(wrapper.classes()).toContain('ui-badge--neutral')
    await wrapper.setProps({ variant: 'danger' })
    expect(wrapper.classes()).toContain('ui-badge--danger')
    expect(wrapper.classes()).not.toContain('ui-badge--neutral')
    await wrapper.setProps({ variant: 'success' })
    expect(wrapper.classes()).toContain('ui-badge--success')
    expect(wrapper.classes()).not.toContain('ui-badge--danger')
  })

  it('dot 切换：圆点元素显隐随之更新', async () => {
    const wrapper = mount(Badge, { slots: { default: () => '同步中' } })
    expect(wrapper.find('.ui-badge__dot').exists()).toBe(false)
    await wrapper.setProps({ dot: true })
    expect(wrapper.find('.ui-badge__dot').exists()).toBe(true)
    await wrapper.setProps({ dot: false })
    expect(wrapper.find('.ui-badge__dot').exists()).toBe(false)
  })

  it('dot 切换不影响文本内容渲染', async () => {
    const wrapper = mount(Badge, { props: { dot: true }, slots: { default: () => '在线' } })
    expect(wrapper.text()).toContain('在线')
    await wrapper.setProps({ dot: false })
    expect(wrapper.text()).toContain('在线')
  })
})
