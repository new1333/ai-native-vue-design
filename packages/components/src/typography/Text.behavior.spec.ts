// behavior spec：props 响应式切换（as / size / weight / color / numeric）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Text from './Text.vue'

describe('Text behavior', () => {
  it('as 动态切换渲染元素标签', async () => {
    const wrapper = mount(Text, { slots: { default: () => '段落' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    await wrapper.setProps({ as: 'p' })
    expect(wrapper.element.tagName).toBe('P')
    await wrapper.setProps({ as: 'div' })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('size 切换：字阶修饰类随之更新', async () => {
    const wrapper = mount(Text)
    expect(wrapper.classes()).toContain('ui-text--md')
    await wrapper.setProps({ size: '3xl' })
    expect(wrapper.classes()).toContain('ui-text--3xl')
    expect(wrapper.classes()).not.toContain('ui-text--md')
  })

  it('weight 切换：字重修饰类随之更新', async () => {
    const wrapper = mount(Text, { props: { weight: 400 } })
    expect(wrapper.classes()).toContain('ui-text--weight-regular')
    await wrapper.setProps({ weight: 600 })
    expect(wrapper.classes()).toContain('ui-text--weight-semibold')
    expect(wrapper.classes()).not.toContain('ui-text--weight-regular')
  })

  it('color 切换：语义档修饰类随之更新', async () => {
    const wrapper = mount(Text)
    expect(wrapper.classes()).toContain('ui-text--text-1')
    await wrapper.setProps({ color: 'muted' })
    expect(wrapper.classes()).toContain('ui-text--muted')
    expect(wrapper.classes()).not.toContain('ui-text--text-1')
  })

  it('numeric 切换：工具档类显隐随之更新', async () => {
    const wrapper = mount(Text)
    expect(wrapper.classes()).not.toContain('ui-text--numeric')
    await wrapper.setProps({ numeric: true })
    expect(wrapper.classes()).toContain('ui-text--numeric')
    await wrapper.setProps({ numeric: false })
    expect(wrapper.classes()).not.toContain('ui-text--numeric')
  })
})
