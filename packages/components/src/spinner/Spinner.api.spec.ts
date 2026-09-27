// api spec：props 默认值 / role / 变体与档位渲染 / label 与插槽。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from './Spinner.vue'

describe('Spinner api', () => {
  it('渲染 ui-spinner 根 + role="status" + sr-only 可访问名容器', () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.classes()).toContain('ui-spinner')
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.find('.ui-spinner__label').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__label').text()).toBe('加载中')
  })

  it('默认：variant=spin（SVG 旋转环）、size=md，无 dots', () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.classes()).toContain('ui-spinner--spin')
    expect(wrapper.classes()).toContain('ui-spinner--md')
    expect(wrapper.find('.ui-spinner__svg').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__ring').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__arc').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__dot').exists()).toBe(false)
  })

  it('variant=dots：渲染恰好 3 个圆点、无 svg 结构', () => {
    const wrapper = mount(Spinner, { props: { label: '加载中', variant: 'dots' } })
    expect(wrapper.classes()).toContain('ui-spinner--dots')
    expect(wrapper.findAll('.ui-spinner__dot')).toHaveLength(3)
    expect(wrapper.find('.ui-spinner__svg').exists()).toBe(false)
  })

  it('size=sm/lg：档位修饰类', () => {
    const sm = mount(Spinner, { props: { label: 'x', size: 'sm' } })
    expect(sm.classes()).toContain('ui-spinner--sm')
    expect(sm.classes()).not.toContain('ui-spinner--md')

    const lg = mount(Spinner, { props: { label: 'x', size: 'lg' } })
    expect(lg.classes()).toContain('ui-spinner--lg')
    expect(lg.classes()).not.toContain('ui-spinner--md')
  })

  it('label 渲染进 sr-only 容器（视觉隐藏契约由样式层钉住，见 behavior spec）', () => {
    const wrapper = mount(Spinner, { props: { label: '正在导出文件' } })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('正在导出文件')
  })

  it('#label 插槽覆盖默认文本', () => {
    const wrapper = mount(Spinner, {
      props: { label: '加载中' },
      slots: { label: '正在同步，剩余 3 项' },
    })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('正在同步，剩余 3 项')
  })

  it('图形本体 aria-hidden（svg 与 dots），可访问名不隐藏', () => {
    const spin = mount(Spinner, { props: { label: '加载中' } })
    expect(spin.find('.ui-spinner__svg').attributes('aria-hidden')).toBe('true')

    const dots = mount(Spinner, { props: { label: '加载中', variant: 'dots' } })
    for (const dot of dots.findAll('.ui-spinner__dot')) {
      expect(dot.attributes('aria-hidden')).toBe('true')
    }
    expect(dots.find('.ui-spinner__label').attributes('aria-hidden')).toBeUndefined()
  })

  it('无 emits 契约：不触发任何事件', () => {
    expect(mount(Spinner, { props: { label: 'x' } }).emitted()).toEqual({})
  })
})
