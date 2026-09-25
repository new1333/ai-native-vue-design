// api spec：props 默认值 / 档位修饰类 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Text from './Text.vue'

describe('Text api', () => {
  it('默认渲染 <span> 并携带 ui-text 根类', () => {
    const wrapper = mount(Text, { slots: { default: () => '正文' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-text')
    expect(wrapper.text()).toBe('正文')
  })

  it('as 指定渲染标签：p / div', () => {
    expect(mount(Text, { props: { as: 'p' } }).element.tagName).toBe('P')
    expect(mount(Text, { props: { as: 'div' } }).element.tagName).toBe('DIV')
  })

  it('默认档：size=md、weight=400（regular）、color=text-1、无 numeric', () => {
    const wrapper = mount(Text)
    expect(wrapper.classes()).toContain('ui-text--md')
    expect(wrapper.classes()).toContain('ui-text--weight-regular')
    expect(wrapper.classes()).toContain('ui-text--text-1')
    expect(wrapper.classes()).not.toContain('ui-text--numeric')
  })

  it('size 全档位映射修饰类（xs..3xl）', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
    for (const size of sizes) {
      expect(mount(Text, { props: { size } }).classes()).toContain(`ui-text--${size}`)
    }
  })

  it('weight 400/500/600 映射 regular/medium/semibold 修饰类', () => {
    expect(mount(Text, { props: { weight: 400 } }).classes()).toContain('ui-text--weight-regular')
    expect(mount(Text, { props: { weight: 500 } }).classes()).toContain('ui-text--weight-medium')
    expect(mount(Text, { props: { weight: 600 } }).classes()).toContain('ui-text--weight-semibold')
  })

  it('color 语义档：text-1/text-2/text-3；muted 为独立简写档', () => {
    expect(mount(Text, { props: { color: 'text-2' } }).classes()).toContain('ui-text--text-2')
    expect(mount(Text, { props: { color: 'text-3' } }).classes()).toContain('ui-text--text-3')
    const muted = mount(Text, { props: { color: 'muted' } })
    expect(muted.classes()).toContain('ui-text--muted')
    expect(muted.classes()).not.toContain('ui-text--text-2')
  })

  it('numeric=true：附加 ui-text--numeric 工具档', () => {
    expect(mount(Text, { props: { numeric: true } }).classes()).toContain('ui-text--numeric')
  })

  it('attrs 透传到根元素（id / aria-label）', () => {
    const wrapper = mount(Text, { attrs: { id: 'intro', 'aria-label': '简介' } })
    expect(wrapper.attributes('id')).toBe('intro')
    expect(wrapper.attributes('aria-label')).toBe('简介')
  })
})
