// a11y spec：progressbar 角色与 ARIA 值语义 / 非交互不可聚焦 / 数值双通道。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress a11y', () => {
  it('role=progressbar，aria-valuemin/max 恒为 0/100', () => {
    const wrapper = mount(Progress, { props: { value: 30 } })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
  })

  it('可访问名：attrs 的 aria-label 落到 role=progressbar 元素，值语义完整', () => {
    const wrapper = mount(Progress, {
      props: { value: 42 },
      attrs: { 'aria-label': '上传进度' },
    })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-label')).toBe('上传进度')
    expect(wrapper.attributes('aria-valuenow')).toBe('42')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
  })

  it('可访问名：aria-labelledby 透传落 progressbar 元素（indeterminate 同样可命名）', () => {
    const wrapper = mount(Progress, {
      props: { indeterminate: true },
      attrs: { 'aria-labelledby': 'task-title' },
    })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-labelledby')).toBe('task-title')
    // indeterminate 省略 aria-valuenow，但 min/max 命名语义仍在
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
  })

  it('确定态：aria-valuenow 等于钳制后的 value（含小数与越界）', () => {
    expect(mount(Progress, { props: { value: 66.5 } }).attributes('aria-valuenow')).toBe('66.5')
    expect(mount(Progress, { props: { value: 999 } }).attributes('aria-valuenow')).toBe('100')
    expect(mount(Progress, { props: { value: -1 } }).attributes('aria-valuenow')).toBe('0')
  })

  it('indeterminate：省略 aria-valuenow（进度未知），仍保留 min/max', () => {
    const wrapper = mount(Progress, { props: { indeterminate: true } })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
  })

  it('数值标签以 "N%" 文本提供视觉双通道（与 aria-valuenow 同源）', () => {
    const wrapper = mount(Progress, { props: { value: 8, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').text()).toBe('8%')
    expect(wrapper.attributes('aria-valuenow')).toBe('8')
  })

  it('非交互：无 tabindex、不进入 Tab 序、无可聚焦后代', () => {
    const wrapper = mount(Progress, { props: { showLabel: true } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
    expect(wrapper.find('button, a, input, select, textarea').exists()).toBe(false)
  })
})
