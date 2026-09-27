// api spec：props 默认值 / 方向、档位、对齐、换行修饰类 / 默认插槽渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Space from './Space.vue'

describe('Space api', () => {
  it('默认：row + md + align-center、不换行，根类 ui-space', () => {
    const wrapper = mount(Space, { slots: { default: () => '<span>甲</span>' } })
    expect(wrapper.classes()).toContain('ui-space')
    expect(wrapper.classes()).toContain('ui-space--row')
    expect(wrapper.classes()).toContain('ui-space--md')
    expect(wrapper.classes()).toContain('ui-space--align-center')
    expect(wrapper.classes()).not.toContain('ui-space--wrap')
  })

  it('direction="column"：携带纵向修饰类，不再携带 row', () => {
    const wrapper = mount(Space, { props: { direction: 'column' } })
    expect(wrapper.classes()).toContain('ui-space--column')
    expect(wrapper.classes()).not.toContain('ui-space--row')
  })

  it('size 档位：sm / lg 各自携带档位修饰类', () => {
    expect(mount(Space, { props: { size: 'sm' } }).classes()).toContain('ui-space--sm')
    expect(mount(Space, { props: { size: 'lg' } }).classes()).toContain('ui-space--lg')
  })

  it('wrap：默认不携带换行类，显式开启后携带', () => {
    expect(mount(Space).classes()).not.toContain('ui-space--wrap')
    expect(mount(Space, { props: { wrap: true } }).classes()).toContain('ui-space--wrap')
  })

  it('align 各取值携带对应修饰类（start / end / baseline / stretch）', () => {
    expect(mount(Space, { props: { align: 'start' } }).classes()).toContain('ui-space--align-start')
    expect(mount(Space, { props: { align: 'end' } }).classes()).toContain('ui-space--align-end')
    expect(mount(Space, { props: { align: 'baseline' } }).classes()).toContain('ui-space--align-baseline')
    expect(mount(Space, { props: { align: 'stretch' } }).classes()).toContain('ui-space--align-stretch')
  })

  it('默认插槽：子元素按原文档顺序直出，容器不加包裹层', () => {
    const wrapper = mount(Space, {
      slots: { default: '<span class="child">甲</span><span class="child">乙</span><span class="child">丙</span>' },
    })
    const children = wrapper.findAll('.child')
    expect(children).toHaveLength(3)
    expect(children.map((c) => c.text())).toEqual(['甲', '乙', '丙'])
    // flex gap 实现：子元素与根元素之间没有逐子元素包裹层
    expect(wrapper.element.children).toHaveLength(3)
    for (const child of wrapper.element.children) {
      expect(child.classList.contains('child')).toBe(true)
    }
  })

  it('attrs 透传到根元素（id / data-testid）', () => {
    const wrapper = mount(Space, { attrs: { id: 'row-1', 'data-testid': 'actions' } })
    expect(wrapper.attributes('id')).toBe('row-1')
    expect(wrapper.attributes('data-testid')).toBe('actions')
  })
})
