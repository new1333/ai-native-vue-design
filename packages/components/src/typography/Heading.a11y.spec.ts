// a11y spec：原生 h* 层级语义 / 不引入 role 与 tabindex / 默认左对齐基线。
// 组件为纯展示、无交互，不存在键盘激活路径；断言其不产生可聚焦/伪交互语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Heading from './Heading.vue'

describe('Heading a11y', () => {
  it('层级语义由原生 h* 标签承担：隐式 heading role，不额外书写 role/aria-level', () => {
    const wrapper = mount(Heading, { props: { as: 'h1' }, slots: { default: () => '页面主标题' } })
    expect(wrapper.element.tagName).toBe('H1')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-level')).toBeUndefined()
  })

  it('不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(Heading, { slots: { default: () => '区块标题' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('默认左对齐：根类携带排版基线（text-align: left 由 .ui-heading 基类提供）', () => {
    // 样式在 vitest 下不参与计算，这里断言承载左对齐基线的根类存在。
    const wrapper = mount(Heading, { slots: { default: () => '区块标题' } })
    expect(wrapper.classes()).toContain('ui-heading')
  })

  it('标题文本直接可读：默认插槽内容无额外包裹层', () => {
    const wrapper = mount(Heading, { slots: { default: () => '概览' } })
    expect(wrapper.text()).toBe('概览')
  })
})
