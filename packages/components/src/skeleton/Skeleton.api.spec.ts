// api spec：props 默认值 / 形状与尺寸渲染 / aria-hidden。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from './Skeleton.vue'

describe('Skeleton api', () => {
  it('渲染 ui-skeleton 根元素，默认 variant=line', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.classes()).toContain('ui-skeleton')
    expect(wrapper.classes()).toContain('ui-skeleton--line')
  })

  it('默认 lines=3：渲染 3 个 ui-skeleton__line', () => {
    expect(mount(Skeleton).findAll('.ui-skeleton__line')).toHaveLength(3)
  })

  it('lines 控制行数；0/负数钳制为 1、小数向下取整', () => {
    expect(mount(Skeleton, { props: { lines: 5 } }).findAll('.ui-skeleton__line')).toHaveLength(5)
    expect(mount(Skeleton, { props: { lines: 0 } }).findAll('.ui-skeleton__line')).toHaveLength(1)
    expect(mount(Skeleton, { props: { lines: -2 } }).findAll('.ui-skeleton__line')).toHaveLength(1)
    expect(mount(Skeleton, { props: { lines: 2.9 } }).findAll('.ui-skeleton__line')).toHaveLength(2)
  })

  it('variant=circle / rect：根元素即形状本体，无 __line 子元素', () => {
    const circle = mount(Skeleton, { props: { variant: 'circle' } })
    expect(circle.classes()).toContain('ui-skeleton--circle')
    expect(circle.find('.ui-skeleton__line').exists()).toBe(false)

    const rect = mount(Skeleton, { props: { variant: 'rect' } })
    expect(rect.classes()).toContain('ui-skeleton--rect')
    expect(rect.find('.ui-skeleton__line').exists()).toBe(false)
  })

  it('width/height：数字按 px、字符串原样落内联样式（rect）', () => {
    const rect = mount(Skeleton, { props: { variant: 'rect', width: 120, height: '3em' } })
    const el = rect.element as HTMLElement
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('3em')
  })

  it('circle：width 优先决定正圆直径（宽高同值内联）；仅 height 时作为直径', () => {
    const byWidth = mount(Skeleton, { props: { variant: 'circle', width: 32, height: 64 } })
    const byWidthEl = byWidth.element as HTMLElement
    expect(byWidthEl.style.width).toBe('32px')
    expect(byWidthEl.style.height).toBe('32px')

    const byHeight = mount(Skeleton, { props: { variant: 'circle', height: 48 } })
    const byHeightEl = byHeight.element as HTMLElement
    expect(byHeightEl.style.width).toBe('48px')
    expect(byHeightEl.style.height).toBe('48px')
  })

  it('line：width 落根容器、height 落每一行行高', () => {
    const wrapper = mount(Skeleton, { props: { width: 200, height: 16, lines: 2 } })
    expect((wrapper.element as HTMLElement).style.width).toBe('200px')
    for (const line of wrapper.findAll('.ui-skeleton__line')) {
      expect((line.element as HTMLElement).style.height).toBe('16px')
    }
  })

  it('根元素恒 aria-hidden="true"', () => {
    expect(mount(Skeleton, { props: { variant: 'rect' } }).attributes('aria-hidden')).toBe('true')
  })

  it('无 emits/slots 契约：不触发任何事件', () => {
    const wrapper = mount(Skeleton, { props: { lines: 2 } })
    expect(wrapper.emitted()).toEqual({})
  })
})
