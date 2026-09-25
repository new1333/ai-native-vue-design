// api spec：props 默认值 / 方向分支渲染 / label 插槽。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Divider from './Divider.vue'

describe('Divider api', () => {
  it('默认：渲染语义 <hr> 并携带 ui-divider 根类', () => {
    const wrapper = mount(Divider)
    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.classes()).toContain('ui-divider')
    expect(wrapper.classes()).toContain('ui-divider--horizontal')
  })

  it('direction="horizontal" 显式声明同样渲染 hr', () => {
    expect(mount(Divider, { props: { direction: 'horizontal' } }).element.tagName).toBe('HR')
  })

  it('direction="vertical"：渲染 div 并携带垂直修饰类', () => {
    const wrapper = mount(Divider, { props: { direction: 'vertical' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-divider--vertical')
    expect(wrapper.classes()).not.toContain('ui-divider--horizontal')
  })

  it('水平 + label 插槽：改渲染 div（hr 为 void 元素），标签居中、两侧细线', () => {
    const wrapper = mount(Divider, {
      slots: { label: () => '或' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-divider--labeled')
    expect(wrapper.find('.ui-divider__label').text()).toBe('或')
    expect(wrapper.findAll('.ui-divider__line')).toHaveLength(2)
  })

  it('垂直时 label 插槽不生效（契约：标签仅水平）', () => {
    const wrapper = mount(Divider, {
      props: { direction: 'vertical' },
      slots: { label: () => '或' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).not.toContain('ui-divider--labeled')
    expect(wrapper.find('.ui-divider__label').exists()).toBe(false)
  })

  it('attrs 透传到根元素（id / data-testid）', () => {
    const wrapper = mount(Divider, { attrs: { id: 'sep-1', 'data-testid': 'sep' } })
    expect(wrapper.attributes('id')).toBe('sep-1')
    expect(wrapper.attributes('data-testid')).toBe('sep')
  })
})
