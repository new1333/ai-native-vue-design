// api spec：props 默认值 / 档位修饰类 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Heading from './Heading.vue'

describe('Heading api', () => {
  it('默认渲染 <h2> 并携带 ui-heading 根类', () => {
    const wrapper = mount(Heading, { slots: { default: () => '区块标题' } })
    expect(wrapper.element.tagName).toBe('H2')
    expect(wrapper.classes()).toContain('ui-heading')
    expect(wrapper.text()).toBe('区块标题')
  })

  it('as 指定标题层级：h1..h6', () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      expect(mount(Heading, { props: { as: `h${level}` } }).element.tagName).toBe(`H${level}`)
    }
  })

  it('默认档：size=xl、weight=600（semibold）、color=text-1、无 numeric', () => {
    const wrapper = mount(Heading)
    expect(wrapper.classes()).toContain('ui-heading--xl')
    expect(wrapper.classes()).toContain('ui-heading--weight-semibold')
    expect(wrapper.classes()).toContain('ui-heading--text-1')
    expect(wrapper.classes()).not.toContain('ui-heading--numeric')
  })

  it('size 全档位映射修饰类（xs..3xl）', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
    for (const size of sizes) {
      expect(mount(Heading, { props: { size } }).classes()).toContain(`ui-heading--${size}`)
    }
  })

  it('weight 400/500/600 映射 regular/medium/semibold 修饰类', () => {
    expect(mount(Heading, { props: { weight: 400 } }).classes()).toContain('ui-heading--weight-regular')
    expect(mount(Heading, { props: { weight: 500 } }).classes()).toContain('ui-heading--weight-medium')
    expect(mount(Heading, { props: { weight: 600 } }).classes()).toContain('ui-heading--weight-semibold')
  })

  it('color 语义档：text-1/text-2/text-3；muted 为独立简写档', () => {
    expect(mount(Heading, { props: { color: 'text-2' } }).classes()).toContain('ui-heading--text-2')
    expect(mount(Heading, { props: { color: 'text-3' } }).classes()).toContain('ui-heading--text-3')
    const muted = mount(Heading, { props: { color: 'muted' } })
    expect(muted.classes()).toContain('ui-heading--muted')
    expect(muted.classes()).not.toContain('ui-heading--text-2')
  })

  it('numeric=true：附加 ui-heading--numeric 工具档', () => {
    expect(mount(Heading, { props: { numeric: true } }).classes()).toContain('ui-heading--numeric')
  })

  it('attrs 透传到根元素（id）', () => {
    expect(mount(Heading, { attrs: { id: 'page-title' } }).attributes('id')).toBe('page-title')
  })
})
