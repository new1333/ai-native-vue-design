// behavior spec：value / indeterminate / showLabel / size 的响应式行为。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress behavior', () => {
  it('value 响应式：aria-valuenow 与填充宽度同步更新', async () => {
    const wrapper = mount(Progress, { props: { value: 20 } })
    const fill = wrapper.find('.ui-progress__fill')
    expect(wrapper.attributes('aria-valuenow')).toBe('20')
    expect((fill.element as HTMLElement).style.width).toBe('20%')

    await wrapper.setProps({ value: 80 })
    expect(wrapper.attributes('aria-valuenow')).toBe('80')
    expect((fill.element as HTMLElement).style.width).toBe('80%')
  })

  it('切 indeterminate：省略 aria-valuenow、加扫描修饰类、去内联宽度；切回恢复确定态', async () => {
    const wrapper = mount(Progress, { props: { value: 60 } })
    const fill = wrapper.find('.ui-progress__fill')
    expect(wrapper.attributes('aria-valuenow')).toBe('60')

    await wrapper.setProps({ indeterminate: true })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-progress--indeterminate')
    expect(fill.classes()).toContain('ui-progress__fill--indeterminate')
    expect((fill.element as HTMLElement).style.width).toBe('')

    await wrapper.setProps({ indeterminate: false, value: 30 })
    expect(wrapper.attributes('aria-valuenow')).toBe('30')
    expect((fill.element as HTMLElement).style.width).toBe('30%')
    expect(fill.classes()).not.toContain('ui-progress__fill--indeterminate')
  })

  it('showLabel 响应式：标签随 props 出现/消失，indeterminate 下隐藏', async () => {
    const wrapper = mount(Progress, { props: { value: 42, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').text()).toBe('42%')

    await wrapper.setProps({ indeterminate: true })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)

    await wrapper.setProps({ indeterminate: false })
    expect(wrapper.find('.ui-progress__label').text()).toBe('42%')

    await wrapper.setProps({ showLabel: false })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)
  })

  it('value 响应式钳制：越界值回落后 aria-valuenow 与宽度一致', async () => {
    const wrapper = mount(Progress, { props: { value: 90 } })
    await wrapper.setProps({ value: 200 })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect((wrapper.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('100%')
    await wrapper.setProps({ value: -5 })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect((wrapper.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('0%')
  })

  it('size 响应式：sm/md 修饰类切换', async () => {
    const wrapper = mount(Progress)
    expect(wrapper.classes()).toContain('ui-progress--md')
    await wrapper.setProps({ size: 'sm' })
    expect(wrapper.classes()).toContain('ui-progress--sm')
    expect(wrapper.classes()).not.toContain('ui-progress--md')
  })
})
