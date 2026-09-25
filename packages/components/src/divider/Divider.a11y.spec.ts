// a11y spec：separator 语义（hr 隐式 / div 显式 + aria-orientation）/ 不可聚焦 / 装饰线 aria-hidden。
// 组件为纯展示、无交互，不存在键盘激活路径；断言其不产生可聚焦/伪交互语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Divider from './Divider.vue'

describe('Divider a11y', () => {
  it('水平默认：语义 <hr>（隐式 role=separator），不额外书写 role', () => {
    const wrapper = mount(Divider)
    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('水平带标签：div 显式 role="separator"，标签文本可读', () => {
    const wrapper = mount(Divider, { slots: { label: () => '或' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.find('.ui-divider__label').text()).toBe('或')
  })

  it('垂直：role="separator" 且 aria-orientation="vertical"（ARIA 默认水平，须显式）', () => {
    const wrapper = mount(Divider, { props: { direction: 'vertical' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('装饰细线 aria-hidden="true"，不进入读屏内容', () => {
    const wrapper = mount(Divider, { slots: { label: () => '分组' } })
    const lines = wrapper.findAll('.ui-divider__line')
    expect(lines).toHaveLength(2)
    for (const line of lines) {
      expect(line.attributes('aria-hidden')).toBe('true')
    }
  })

  it('不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(Divider, { props: { direction: 'vertical' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })
})
