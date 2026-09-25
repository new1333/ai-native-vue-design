// behavior spec：props 响应式切换（as / size / weight / color / numeric）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Heading from './Heading.vue'

describe('Heading behavior', () => {
  it('as 动态切换标题层级标签', async () => {
    const wrapper = mount(Heading)
    expect(wrapper.element.tagName).toBe('H2')
    await wrapper.setProps({ as: 'h1' })
    expect(wrapper.element.tagName).toBe('H1')
    await wrapper.setProps({ as: 'h3' })
    expect(wrapper.element.tagName).toBe('H3')
  })

  it('size 切换：字阶修饰类随之更新', async () => {
    const wrapper = mount(Heading)
    expect(wrapper.classes()).toContain('ui-heading--xl')
    await wrapper.setProps({ size: '2xl' })
    expect(wrapper.classes()).toContain('ui-heading--2xl')
    expect(wrapper.classes()).not.toContain('ui-heading--xl')
  })

  it('weight 切换：字重修饰类随之更新', async () => {
    const wrapper = mount(Heading, { props: { weight: 600 } })
    expect(wrapper.classes()).toContain('ui-heading--weight-semibold')
    await wrapper.setProps({ weight: 400 })
    expect(wrapper.classes()).toContain('ui-heading--weight-regular')
    expect(wrapper.classes()).not.toContain('ui-heading--weight-semibold')
  })

  it('color 切换：语义档修饰类随之更新', async () => {
    const wrapper = mount(Heading)
    expect(wrapper.classes()).toContain('ui-heading--text-1')
    await wrapper.setProps({ color: 'text-3' })
    expect(wrapper.classes()).toContain('ui-heading--text-3')
    expect(wrapper.classes()).not.toContain('ui-heading--text-1')
  })

  it('numeric 切换：工具档类显隐随之更新', async () => {
    const wrapper = mount(Heading)
    expect(wrapper.classes()).not.toContain('ui-heading--numeric')
    await wrapper.setProps({ numeric: true })
    expect(wrapper.classes()).toContain('ui-heading--numeric')
    await wrapper.setProps({ numeric: false })
    expect(wrapper.classes()).not.toContain('ui-heading--numeric')
  })
})
