// a11y spec：纯布局容器语义 —— 无 role / 无 aria-* / 不可聚焦 / 不改写子元素语义与 Tab 序。
// Space 自身没有键盘激活路径（非交互容器）；断言其不引入任何伪交互语义，
// 且子元素的原生标签、可聚焦性与事件不被容器改写或拦截。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Space from './Space.vue'

describe('Space a11y', () => {
  it('根元素无 role：纯布局容器不向读屏通告任何语义角色', () => {
    const wrapper = mount(Space, { props: { direction: 'column' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('根元素无 aria-* 属性（aria-label / aria-hidden 等均不声明）', () => {
    const wrapper = mount(Space)
    for (const name of Object.keys(wrapper.attributes())) {
      expect(name.startsWith('aria-')).toBe(false)
    }
  })

  it('不可聚焦：根元素无 tabindex，不进入 Tab 序', () => {
    const wrapper = mount(Space, { props: { wrap: true } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('子元素语义保留：原生标签直出、无 aria-hidden/tabindex 注入', () => {
    const wrapper = mount(Space, {
      slots: {
        default: '<button type="button">甲</button><a href="#x">乙</a><p>丙</p>',
      },
    })
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.findAll('p')).toHaveLength(1)
    const root = wrapper.find('.ui-space').element
    for (const child of root.children) {
      expect(child.hasAttribute('aria-hidden')).toBe(false)
      expect(child.hasAttribute('tabindex')).toBe(false)
      expect(child.getAttribute('role')).toBeNull()
    }
  })

  it('子元素仍可由键盘到达：button 的原生 Tab 序与类型不被改写', () => {
    const wrapper = mount(Space, {
      slots: { default: '<button type="button" class="child">甲</button><button type="button" class="child">乙</button>' },
    })
    const buttons = wrapper.findAll('button.child')
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('tabindex')).toBeUndefined()
      expect(button.attributes('disabled')).toBeUndefined()
    }
  })
})
