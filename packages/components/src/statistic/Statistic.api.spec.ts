// api spec：props 默认值 / 格式化与钳制 / 趋势箭头 / 插槽渲染 / emits 契约。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Statistic from './Statistic.vue'

describe('Statistic api', () => {
  it('渲染 ui-statistic 根 + 数值行结构', () => {
    const wrapper = mount(Statistic)
    expect(wrapper.classes()).toContain('ui-statistic')
    expect(wrapper.find('.ui-statistic__row').exists()).toBe(true)
    expect(wrapper.find('.ui-statistic__value').exists()).toBe(true)
  })

  it('默认：value=0、precision=0、无标题/前后缀/趋势、非 countdown', () => {
    const wrapper = mount(Statistic)
    expect(wrapper.find('.ui-statistic__value').text()).toBe('0')
    expect(wrapper.find('.ui-statistic__title').exists()).toBe(false)
    expect(wrapper.find('.ui-statistic__affix').exists()).toBe(false)
    expect(wrapper.find('.ui-statistic__trend').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('ui-statistic--countdown')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('value + precision：toFixed 小数位格式化', () => {
    const wrapper = mount(Statistic, { props: { value: 42.678, precision: 2 } })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('42.68')
  })

  it('value 非有限数回退 0', () => {
    const nan = mount(Statistic, { props: { value: Number.NaN } })
    expect(nan.find('.ui-statistic__value').text()).toBe('0')
    const inf = mount(Statistic, { props: { value: Number.POSITIVE_INFINITY } })
    expect(inf.find('.ui-statistic__value').text()).toBe('0')
  })

  it('precision 收敛：负数按 0、非有限数按 0', () => {
    const negative = mount(Statistic, { props: { value: 3.7, precision: -2 } })
    expect(negative.find('.ui-statistic__value').text()).toBe('4')
    const nonFinite = mount(Statistic, { props: { value: 2.4, precision: Number.NaN } })
    expect(nonFinite.find('.ui-statistic__value').text()).toBe('2')
  })

  it('countdown 模式：初始剩余秒数格式化为 mm:ss（precision 忽略）', () => {
    const wrapper = mount(Statistic, { props: { value: 90, countdown: true, precision: 2 } })
    expect(wrapper.classes()).toContain('ui-statistic--countdown')
    expect(wrapper.find('.ui-statistic__value').text()).toBe('01:30')
  })

  it('countdown ≥1 小时：HH:mm:ss 格式', () => {
    const wrapper = mount(Statistic, { props: { value: 3661, countdown: true } })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('01:01:01')
  })

  it('title/prefix/suffix 文本渲染为标题与前/后缀元素', () => {
    const wrapper = mount(Statistic, {
      props: { title: '总营收', value: 128430.5, prefix: '¥', suffix: '元' },
    })
    expect(wrapper.find('.ui-statistic__title').text()).toBe('总营收')
    const affixes = wrapper.findAll('.ui-statistic__affix')
    expect(affixes).toHaveLength(2)
    expect(affixes[0].text()).toBe('¥')
    expect(affixes[1].text()).toBe('元')
  })

  it('trend=up：up 修饰类 + role=img + aria-label 上升 + aria-hidden svg', () => {
    const wrapper = mount(Statistic, { props: { value: 42, trend: 'up' } })
    const trend = wrapper.find('.ui-statistic__trend')
    expect(trend.classes()).toContain('ui-statistic__trend--up')
    expect(trend.attributes('role')).toBe('img')
    expect(trend.attributes('aria-label')).toBe('上升')
    expect(trend.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('trend=down：down 修饰类 + aria-label 下降', () => {
    const wrapper = mount(Statistic, { props: { value: 42, trend: 'down' } })
    const trend = wrapper.find('.ui-statistic__trend')
    expect(trend.classes()).toContain('ui-statistic__trend--down')
    expect(trend.attributes('aria-label')).toBe('下降')
  })

  it('#title / #prefix / #suffix 插槽覆盖默认文本渲染', () => {
    const wrapper = mount(Statistic, {
      props: { title: '默认标题', prefix: '¥', suffix: '元' },
      slots: {
        title: '<em class="t">自定义标题</em>',
        prefix: '<b class="p">自定义前缀</b>',
        suffix: '<i class="s">自定义后缀</i>',
      },
    })
    expect(wrapper.find('.ui-statistic__title').text()).toBe('自定义标题')
    expect(wrapper.find('.ui-statistic__title').text()).not.toContain('默认标题')
    const affixes = wrapper.findAll('.ui-statistic__affix')
    expect(affixes[0].text()).toBe('自定义前缀')
    expect(affixes[1].text()).toBe('自定义后缀')
  })

  it('#default 插槽覆盖数值默认渲染（countdown 下同样生效）', () => {
    const wrapper = mount(Statistic, {
      props: { value: 42 },
      slots: { default: '<q class="v">四十二</q>' },
    })
    expect(wrapper.find('.ui-statistic__value').text()).toBe('四十二')
    expect(wrapper.find('.ui-statistic__value').text()).not.toContain('42')
  })

  it('非 countdown：无 emits 契约，不触发任何事件', () => {
    expect(mount(Statistic, { props: { value: 1 } }).emitted()).toEqual({})
  })
})
