// behavior spec：value/precision 响应式、countdown 递减/finish/重置/卸载清理（fake timers）。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Statistic from './Statistic.vue'

describe('Statistic behavior', () => {
  it('value 响应式：数值文本随 props 更新', async () => {
    const wrapper = mount(Statistic, { props: { value: 10 } })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('10')

    await wrapper.setProps({ value: 42.678 })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('43')
  })

  it('precision 响应式：小数位随 props 更新', async () => {
    const wrapper = mount(Statistic, { props: { value: 42.678 } })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('43')

    await wrapper.setProps({ precision: 2 })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('42.68')
  })

  it('countdown 递减：每秒 -1，触达 0 停表并发出一次 finish', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 3, countdown: true } })
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:03')

      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:02')
      expect(wrapper.emitted('finish')).toBeUndefined()

      await vi.advanceTimersByTimeAsync(2000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:00')
      expect(wrapper.emitted('finish')).toHaveLength(1)

      // 已停表：继续推进不再递减、不再发出 finish。
      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:00')
      expect(wrapper.emitted('finish')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('countdown 初始即 0：不起表、不发出 finish', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 0, countdown: true } })
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:00')

      await vi.advanceTimersByTimeAsync(3000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:00')
      expect(wrapper.emitted('finish')).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('countdown value 变更即受控重置：重置剩余并重新起表', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 3, countdown: true } })
      await vi.advanceTimersByTimeAsync(2000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:01')

      await wrapper.setProps({ value: 10 })
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:10')

      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:09')
    } finally {
      vi.useRealTimers()
    }
  })

  it('countdown 开关切换：开启起表、关闭停表并回落数值展示', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 5, countdown: true } })
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:04')

      await wrapper.setProps({ countdown: false })
      expect(wrapper.find('.ui-statistic__value').text()).toBe('5')
      await vi.advanceTimersByTimeAsync(3000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('5')

      await wrapper.setProps({ countdown: true })
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:05')
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:04')
    } finally {
      vi.useRealTimers()
    }
  })

  it('卸载清理：倒计时中途卸载后不再递减、不再发出 finish', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 2, countdown: true } })
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('00:01')

      wrapper.unmount()
      await vi.advanceTimersByTimeAsync(3000)
      expect(wrapper.emitted('finish')).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('非 countdown 不起表：推进时间数值不变、无 finish', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(Statistic, { props: { value: 42 } })
      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.find('.ui-statistic__value').text()).toBe('42')
      expect(wrapper.emitted('finish')).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })
})
