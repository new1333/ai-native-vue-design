// api spec：props 默认值 / aria 值映射 / 钳制 / 标签与档位渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress api', () => {
  it('渲染 ui-progress 根 + role=progressbar + 轨道/填充结构', () => {
    const wrapper = mount(Progress)
    expect(wrapper.classes()).toContain('ui-progress')
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.find('.ui-progress__track').exists()).toBe(true)
    expect(wrapper.find('.ui-progress__fill').exists()).toBe(true)
  })

  it('默认：value=0、size=md、非 indeterminate、无标签', () => {
    const wrapper = mount(Progress)
    expect(wrapper.classes()).toContain('ui-progress--md')
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.classes()).not.toContain('ui-progress--indeterminate')
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)
  })

  it('value 透传为 aria-valuenow 与填充内联宽度', () => {
    const wrapper = mount(Progress, { props: { value: 42 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('42')
    expect((wrapper.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('42%')
  })

  it('value 越界钳制到 [0,100]', () => {
    const over = mount(Progress, { props: { value: 150 } })
    expect(over.attributes('aria-valuenow')).toBe('100')
    expect((over.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('100%')

    const under = mount(Progress, { props: { value: -20 } })
    expect(under.attributes('aria-valuenow')).toBe('0')
    expect((under.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('0%')
  })

  it('value 非有限数回退 0', () => {
    const wrapper = mount(Progress, { props: { value: Number.NaN } })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('indeterminate：忽略 value、省略 aria-valuenow、填充转扫描态（无内联宽度）', () => {
    const wrapper = mount(Progress, { props: { indeterminate: true, value: 42 } })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.classes()).toContain('ui-progress--indeterminate')
    const fill = wrapper.find('.ui-progress__fill')
    expect(fill.classes()).toContain('ui-progress__fill--indeterminate')
    expect((fill.element as HTMLElement).style.width).toBe('')
  })

  it('showLabel：渲染百分号数值标签', () => {
    const wrapper = mount(Progress, { props: { value: 42, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(true)
    expect(wrapper.find('.ui-progress__label').text()).toBe('42%')
  })

  it('showLabel + indeterminate：无确定值，不渲染标签', () => {
    const wrapper = mount(Progress, { props: { indeterminate: true, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)
  })

  it('size=sm：ui-progress--sm 修饰类', () => {
    const wrapper = mount(Progress, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('ui-progress--sm')
    expect(wrapper.classes()).not.toContain('ui-progress--md')
  })

  it('无 emits 契约：不触发任何事件', () => {
    expect(mount(Progress, { props: { value: 1 } }).emitted()).toEqual({})
  })
})
