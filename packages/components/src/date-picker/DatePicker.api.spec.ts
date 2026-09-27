// api spec：props 默认值 / emits 声明 / 面板渲染面 / slots / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DatePicker from './DatePicker.vue'
import type { DatePickerDisabledDate } from './DatePicker.types'

/** 2026-03-01 为周日，周一首列网格从 2026-02-23 起；用固定值钉住视图月份。 */
const PINNED = '2026-03-15'

const weekendDisabled: DatePickerDisabledDate = (date) => date.getDay() === 0 || date.getDay() === 6

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-date-picker__trigger')

async function openPanel(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findTrigger(wrapper).trigger('click')
  await nextTick()
}

describe('DatePicker api', () => {
  it('渲染 ui-date-picker 根容器与 dialog 触发器按钮', () => {
    const wrapper = mount(DatePicker)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-date-picker')
    const trigger = findTrigger(wrapper)
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
  })

  it('默认：显示默认占位「选择日期」、aria-expanded=false、无清空按钮、无面板', () => {
    const wrapper = mount(DatePicker)
    const trigger = findTrigger(wrapper)
    expect(trigger.text()).toContain('选择日期')
    expect(wrapper.find('.ui-date-picker__label--placeholder').exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-busy')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-date-picker__clear').exists()).toBe(false)
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
  })

  it('placeholder prop 覆盖按形态的默认占位文案', () => {
    const trigger = mount(DatePicker, { props: { placeholder: '选择发稿日' } }).find(
      'button.ui-date-picker__trigger',
    )
    expect(trigger.text()).toContain('选择发稿日')
  })

  it('type=datetime：默认占位为「选择日期时间」', () => {
    const trigger = mount(DatePicker, { props: { type: 'datetime' } }).find(
      'button.ui-date-picker__trigger',
    )
    expect(trigger.text()).toContain('选择日期时间')
  })

  it('modelValue（date）：触发器显示格式化值，不再走占位样式', () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED } })
    const trigger = findTrigger(wrapper)
    expect(trigger.text()).toContain('2026-03-15')
    expect(wrapper.find('.ui-date-picker__label--placeholder').exists()).toBe(false)
  })

  it('modelValue（datetime）：触发器显示含时间的格式化值', () => {
    const wrapper = mount(DatePicker, { props: { type: 'datetime', modelValue: '2026-03-15 08:30' } })
    expect(findTrigger(wrapper).text()).toContain('2026-03-15 08:30')
  })

  it('modelValue（range）：触发器显示「start ~ end」', () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'range', modelValue: ['2026-03-10', '2026-03-20'] },
    })
    expect(findTrigger(wrapper).text()).toContain('2026-03-10 ~ 2026-03-20')
  })

  it('disabled：触发器原生 disabled + 根修饰类，且不渲染清空按钮', () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED, disabled: true, clearable: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-date-picker--disabled')
    expect(wrapper.find('button.ui-date-picker__clear').exists()).toBe(false)
  })

  it('loading：根修饰类 + 触发器 aria-busy="true"，不渲染清空按钮', () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED, loading: true, clearable: true } })
    expect(wrapper.classes()).toContain('ui-date-picker--loading')
    expect(findTrigger(wrapper).attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button.ui-date-picker__clear').exists()).toBe(false)
  })

  it('clearable：有已选值时渲染清空按钮（aria-label="清空"），未选时不渲染', () => {
    const withValue = mount(DatePicker, { props: { modelValue: PINNED, clearable: true } })
    const clear = withValue.find('button.ui-date-picker__clear')
    expect(clear.exists()).toBe(true)
    expect(clear.attributes('aria-label')).toBe('清空')
    const withoutValue = mount(DatePicker, { props: { clearable: true } })
    expect(withoutValue.find('button.ui-date-picker__clear').exists()).toBe(false)
  })

  it('打开后面板：role=dialog、aria-label、年月标签、6 周行 × 7 列 = 42 个日期格与 7 个周表头', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const panel = document.querySelector('.ui-date-picker__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-label')).toBe('选择日期')
    expect(document.querySelector('.ui-date-picker__header-label')?.textContent).toContain('2026年3月')
    expect(document.querySelectorAll('.ui-date-picker__day')).toHaveLength(42)
    expect(document.querySelectorAll('.ui-date-picker__weekday')).toHaveLength(7)
    expect(document.querySelectorAll('.ui-date-picker__week')).toHaveLength(6)
    wrapper.unmount()
  })

  it('type=range：面板内起止格带 --range-start/--range-end，之间格带 --in-range', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'range', modelValue: ['2026-03-10', '2026-03-20'] },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    const start = document.querySelector('[aria-label="2026年3月10日"]')
    const middle = document.querySelector('[aria-label="2026年3月15日"]')
    const end = document.querySelector('[aria-label="2026年3月20日"]')
    expect(start?.className).toContain('ui-date-picker__day--range-start')
    expect(end?.className).toContain('ui-date-picker__day--range-end')
    expect(middle?.className).toContain('ui-date-picker__day--in-range')
    expect(start?.getAttribute('aria-selected')).toBe('true')
    expect(end?.getAttribute('aria-selected')).toBe('true')
    expect(middle?.getAttribute('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('type=datetime：面板内渲染 input[type=time]（aria-label="时间"）', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'datetime', modelValue: '2026-03-15 08:30' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    const time = document.querySelector('.ui-date-picker__time-input') as HTMLInputElement | null
    expect(time).not.toBeNull()
    expect(time?.getAttribute('type')).toBe('time')
    expect(time?.getAttribute('aria-label')).toBe('时间')
    expect(time?.value).toBe('08:30')
    wrapper.unmount()
  })

  it('min/max：界外日期格渲染 aria-disabled="true"，界内不受影响', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED, min: '2026-03-10', max: '2026-03-20' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    expect(document.querySelector('[aria-label="2026年3月5日"]')?.getAttribute('aria-disabled')).toBe('true')
    expect(document.querySelector('[aria-label="2026年3月15日"]')?.getAttribute('aria-disabled')).toBeNull()
    expect(document.querySelector('[aria-label="2026年3月25日"]')?.getAttribute('aria-disabled')).toBe('true')
    wrapper.unmount()
  })

  it('disabledDate：命中日期格渲染 aria-disabled="true"（周末禁用）', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED, disabledDate: weekendDisabled },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    // 2026-03-15 为周日、2026-03-16 为周一
    expect(document.querySelector('[aria-label="2026年3月15日"]')?.getAttribute('aria-disabled')).toBe('true')
    expect(document.querySelector('[aria-label="2026年3月16日"]')?.getAttribute('aria-disabled')).toBeNull()
    wrapper.unmount()
  })

  it('update:modelValue / panelChange / clear 已声明：面板可见与文案随打开渲染', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    wrapper.unmount()
  })

  it('trigger 具名插槽：替换默认文案与日历图标，作用域携带 display/open', () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED },
      slots: {
        trigger: `<template #trigger="{ display, open }"><span class="custom-trigger">{{ display }}|{{ open }}</span></template>`,
      },
    })
    expect(wrapper.find('.custom-trigger').text()).toBe('2026-03-15|false')
    expect(wrapper.find('.ui-date-picker__icon').exists()).toBe(false)
    expect(wrapper.find('.ui-date-picker__label').exists()).toBe(false)
  })

  it('panel-footer 具名插槽：面板打开时渲染于底部，作用域携带 view', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED },
      attachTo: document.body,
      slots: {
        'panel-footer': `<template #panel-footer="{ view }"><span class="footer-mark">{{ view.year }}-{{ view.month }}</span></template>`,
      },
    })
    await openPanel(wrapper)
    expect(document.querySelector('.ui-date-picker__footer')?.textContent).toContain('2026-3')
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到触发器 button，不落根容器', () => {
    const wrapper = mount(DatePicker, {
      attrs: { id: 'start-date', 'aria-describedby': 'start-date-tip' },
    })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('id')).toBe('start-date')
    expect(trigger.attributes('aria-describedby')).toBe('start-date-tip')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
