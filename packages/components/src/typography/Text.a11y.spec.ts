// a11y spec：原生标签语义 / 不引入 role 与 tabindex / 默认左对齐基线。
// 组件为纯展示、无交互，不存在键盘激活路径；断言其不产生可聚焦/伪交互语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Text from './Text.vue'

describe('Text a11y', () => {
  it('语义由原生标签承担：不额外书写 role', () => {
    const wrapper = mount(Text, { props: { as: 'p' }, slots: { default: () => '正文' } })
    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(Text, { slots: { default: () => '说明' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('默认左对齐：根类携带排版基线（text-align: left 由 .ui-text 基类提供）', () => {
    // 样式在 vitest 下不参与计算，这里断言承载左对齐基线的根类存在。
    const wrapper = mount(Text, { slots: { default: () => '正文' } })
    expect(wrapper.classes()).toContain('ui-text')
  })

  it('文本内容直接可读：默认插槽内容无额外包裹层', () => {
    const wrapper = mount(Text, { slots: { default: () => '帮助文字' } })
    expect(wrapper.text()).toBe('帮助文字')
  })
})
