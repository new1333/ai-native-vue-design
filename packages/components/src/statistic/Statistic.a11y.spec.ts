// a11y spec：timer 角色语义 / 趋势方向双通道 / 非交互不可聚焦 / 可读文本。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Statistic from './Statistic.vue'

describe('Statistic a11y', () => {
  it('非 countdown：无 role（纯展示文本流），结构与文本可读', () => {
    const wrapper = mount(Statistic, {
      props: { title: '总营收', value: 128430.5, precision: 2, prefix: '¥' },
    })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-statistic__title').text()).toBe('总营收')
    expect(wrapper.find('.ui-statistic__value').text()).toBe('128430.50')
    expect(wrapper.find('.ui-statistic__affix').text()).toBe('¥')
  })

  it('countdown：根元素 role="timer"（ARIA 数值计数器语义），剩余时间文本可读', () => {
    const wrapper = mount(Statistic, { props: { value: 90, countdown: true } })
    expect(wrapper.attributes('role')).toBe('timer')
    expect(wrapper.find('.ui-statistic__value').text()).toBe('01:30')
  })

  it('countdown 关闭后 role="timer" 随之移除', async () => {
    const wrapper = mount(Statistic, { props: { value: 90, countdown: true } })
    expect(wrapper.attributes('role')).toBe('timer')
    await wrapper.setProps({ countdown: false })
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('trend=up：role=img + aria-label「上升」方向语义双通道，svg 对读屏隐藏', () => {
    const wrapper = mount(Statistic, { props: { value: 42, trend: 'up' } })
    const trend = wrapper.find('.ui-statistic__trend')
    expect(trend.attributes('role')).toBe('img')
    expect(trend.attributes('aria-label')).toBe('上升')
    expect(trend.find('svg').attributes('aria-hidden')).toBe('true')
    expect(trend.find('svg').attributes('focusable')).toBe('false')
  })

  it('trend=down：aria-label「下降」', () => {
    const wrapper = mount(Statistic, { props: { value: 42, trend: 'down' } })
    expect(wrapper.find('.ui-statistic__trend').attributes('aria-label')).toBe('下降')
  })

  it('无 trend：不渲染趋势元素（方向不臆造）', () => {
    const wrapper = mount(Statistic, { props: { value: 42 } })
    expect(wrapper.find('.ui-statistic__trend').exists()).toBe(false)
  })

  it('非交互：无 tabindex、不进入 Tab 序、无可聚焦后代', () => {
    const wrapper = mount(Statistic, {
      props: { value: 42, title: '指标', countdown: true, trend: 'up' },
    })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
    expect(wrapper.find('button, a, input, select, textarea').exists()).toBe(false)
  })

  it('countdown 不设 aria-live：避免逐秒打断读屏', () => {
    const wrapper = mount(Statistic, { props: { value: 90, countdown: true } })
    expect(wrapper.attributes('aria-live')).toBeUndefined()
  })
})
