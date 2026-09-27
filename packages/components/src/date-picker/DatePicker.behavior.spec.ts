// behavior spec：开合 / 选中 / v-model 双向 / range 两段式 / datetime 时间输入 / 清空 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import DatePicker from './DatePicker.vue'
import { parseDate, parseTimeInput, useDatePicker } from './useDatePicker'
import type { DatePickerDisabledDate, DatePickerModelValue } from './DatePicker.types'
import type { UseDatePickerReturn } from './useDatePicker'

/**
 * 2026-03-01 为周日，周一首列网格从 2026-02-23（周一）起：
 * 3 月 d 日落在扁平下标 5 + d；3/2（下标 7）为行 1 首格。
 * 用固定 modelValue 钉住视图月份，保证断言与运行日期无关。
 */
const PINNED = '2026-03-15'

const weekendDisabled: DatePickerDisabledDate = (date) => date.getDay() === 0 || date.getDay() === 6

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-date-picker__trigger')

async function openPanel(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findTrigger(wrapper).trigger('click')
  await nextTick()
}

function clickDay(label: string): void {
  ;(document.querySelector(`[aria-label="${label}"]`) as HTMLElement).click()
}

describe('DatePicker behavior', () => {
  it('点击触发器打开面板（Teleport 到 body），再点一次切换关闭', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    let panel = document.querySelector('.ui-date-picker__panel')
    expect(panel).not.toBeNull()
    expect(panel?.parentElement).toBe(document.body)
    await findTrigger(wrapper).trigger('click')
    await nextTick()
    panel = document.querySelector('.ui-date-picker__panel')
    expect(panel).toBeNull()
    wrapper.unmount()
  })

  it('点击日期格：发出格式化 update:modelValue 并关闭面板', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    clickDay('2026年3月20日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-03-20']])
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    wrapper.unmount()
  })

  it('v-model 双向绑定：选中更新父状态，父状态变化回落触发器文案', async () => {
    const value = ref<string | null>(PINNED)
    const Host = defineComponent({
      setup: () => () =>
        h(DatePicker, {
          modelValue: value.value,
          'onUpdate:modelValue': (v: DatePickerModelValue) => {
            value.value = v as string
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    expect(findTrigger(wrapper).text()).toContain('2026-03-15')
    await openPanel(wrapper)
    clickDay('2026年3月20日')
    await nextTick()
    expect(value.value).toBe('2026-03-20')
    expect(findTrigger(wrapper).text()).toContain('2026-03-20')
    value.value = '2026-03-01'
    await nextTick()
    expect(findTrigger(wrapper).text()).toContain('2026-03-01')
    wrapper.unmount()
  })

  it('点击禁用日期格（disabledDate）：不发出 update:modelValue，面板保持打开', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED, disabledDate: weekendDisabled },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    clickDay('2026年3月15日') // 2026-03-15 为周日
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    wrapper.unmount()
  })

  it('点击 min/max 界外日期格：不发出 update:modelValue', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED, min: '2026-03-10', max: '2026-03-20' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    clickDay('2026年3月5日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('清空按钮：发出 update:modelValue(null) 与 clear，回落占位并交还焦点', async () => {
    const value = ref<string | null>(PINNED)
    const Host = defineComponent({
      setup: () => () =>
        h(DatePicker, {
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: DatePickerModelValue) => {
            value.value = v as string
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button.ui-date-picker__clear').trigger('click')
    expect(value.value).toBeNull()
    expect(wrapper.getComponent(DatePicker).emitted('clear')).toHaveLength(1)
    expect(findTrigger(wrapper).text()).toContain('选择日期')
    expect(document.activeElement).toBe(findTrigger(wrapper).element)
    wrapper.unmount()
  })

  it('点击外部关闭：面板内/触发器外目标触发关闭且不发 update:modelValue', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()
    wrapper.unmount()
  })

  it('触发器上按 Tab：先关闭面板并放行默认行为', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    findTrigger(wrapper).element.dispatchEvent(tab)
    await nextTick()
    expect(tab.defaultPrevented).toBe(false)
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    wrapper.unmount()
  })

  it('disabled / loading：点击触发器不打开面板', async () => {
    const disabled = mount(DatePicker, { props: { modelValue: PINNED, disabled: true } })
    await findTrigger(disabled).trigger('click')
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    disabled.unmount()

    const loading = mount(DatePicker, { props: { modelValue: PINNED, loading: true } })
    await findTrigger(loading).trigger('click')
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    loading.unmount()
  })

  it('range 两段式：首击落起点（不关面板不发值），再击落终点并发 [start, end]', async () => {
    // 以既有范围值钉住视图月份（range 形态的 modelValue 为元组）。
    const wrapper = mount(DatePicker, {
      props: { type: 'range', modelValue: ['2026-03-10', '2026-03-20'] },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    clickDay('2026年3月10日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    const start = document.querySelector('[aria-label="2026年3月10日"]')
    expect(start?.className).toContain('ui-date-picker__day--range-start')
    expect(start?.className).toContain('ui-date-picker__day--range-end')
    clickDay('2026年3月20日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[['2026-03-10', '2026-03-20']]])
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    wrapper.unmount()
  })

  it('range 再击早于起点：重置起点而非发值，第三次点击完成选择', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'range', modelValue: ['2026-03-10', '2026-03-20'] },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    clickDay('2026年3月20日')
    await nextTick()
    clickDay('2026年3月10日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    clickDay('2026年3月15日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[['2026-03-10', '2026-03-15']]])
    wrapper.unmount()
  })

  it('range v-model：完成后触发器显示「start ~ end」', async () => {
    const value = ref<[string, string] | null>(null)
    const Host = defineComponent({
      setup: () => () =>
        h(DatePicker, {
          type: 'range',
          modelValue: value.value,
          'onUpdate:modelValue': (v: DatePickerModelValue) => {
            value.value = v as [string, string]
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    // 无已选值时视图为运行日所在月（不可假设运行日期）：
    // 点选网格内首末两个可选格（时间上先首后末），期望值由 aria-label 反推。
    await openPanel(wrapper)
    const enabled = [...document.querySelectorAll('.ui-date-picker__day')].filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    )
    const first = enabled[0] as HTMLElement
    const last = enabled[enabled.length - 1] as HTMLElement
    const isoOf = (el: HTMLElement): string => {
      const matched = /(\d{4})年(\d{1,2})月(\d{1,2})日/.exec(el.getAttribute('aria-label') ?? '')
      if (matched === null) throw new Error(`unexpected aria-label: ${el.getAttribute('aria-label')}`)
      return `${matched[1]}-${matched[2].padStart(2, '0')}-${matched[3].padStart(2, '0')}`
    }
    first.click()
    await nextTick()
    last.click()
    await nextTick()
    const start = isoOf(first)
    const end = isoOf(last)
    expect(value.value).toEqual([start, end])
    expect(findTrigger(wrapper).text()).toContain(`${start} ~ ${end}`)
    wrapper.unmount()
  })

  it('datetime：时间输入变化即同步发值；选日合并当前时间', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'datetime', modelValue: '2026-03-15 08:30' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    const time = document.querySelector('.ui-date-picker__time-input') as HTMLInputElement
    new DOMWrapper(time).setValue('09:45')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-03-15 09:45']])
    clickDay('2026年3月20日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([
      ['2026-03-15 09:45'],
      ['2026-03-20 09:45'],
    ])
    wrapper.unmount()
  })

  it('datetime 值无时间部分（00:00）时选日：按 00:00 合并', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'datetime', modelValue: '2026-03-15 00:00' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    clickDay('2026年3月20日')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-03-20 00:00']])
    wrapper.unmount()
  })

  it('翻月按钮 / PageUp / PageDown：发出 panelChange 且年月标签随之更新', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const next = document.querySelector('.ui-date-picker__nav--next') as HTMLButtonElement
    next.click()
    await nextTick()
    expect(wrapper.emitted('panelChange')).toEqual([[{ year: 2026, month: 4 }]])
    expect(document.querySelector('.ui-date-picker__header-label')?.textContent).toContain('2026年4月')
    const grid = document.querySelector('.ui-date-picker__grid') as HTMLElement
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true }))
    await nextTick()
    expect(wrapper.emitted('panelChange')).toEqual([
      [{ year: 2026, month: 4 }],
      [{ year: 2026, month: 3 }],
    ])
    wrapper.unmount()
  })

  it('打开时按触发器 rect 计算面板定位（top/left/minWidth 内联落位）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const style = document.querySelector('.ui-date-picker__panel')?.getAttribute('style') ?? ''
    expect(style).toContain('top:')
    expect(style).toContain('left:')
    expect(style).toContain('min-width:')
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('useDatePicker 纯状态机：parseDate 严格解析（拒绝越界/未补零），formatDate 回填一致', () => {
    expect(toIso(parseDate('2026-03-15', 'YYYY-MM-DD'))).toBe('2026-03-15')
    expect(parseDate('2026-03-15 08:30', 'YYYY-MM-DD HH:mm')?.getHours()).toBe(8)
    expect(parseDate('2026-13-01', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('2026-02-30', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('2026-3-5', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('非法', 'YYYY-MM-DD')).toBeNull()
    expect(parseTimeInput('9:05')).toEqual({ hours: 9, minutes: 5 })
    expect(parseTimeInput('25:00')).toBeNull()
    expect(parseTimeInput('abc')).toBeNull()
  })

  it('useDatePicker 纯状态机：roving 跳过禁用格并在网格两端夹住，Home/End 行首尾', () => {
    const state = buildState({ type: 'date', modelValue: null, disabledDate: (d) => d.getDate() === 2 })
    state.openPanel()
    pinToMarch(state)
    const dayIndex = (day: number) =>
      state.cells.value.findIndex((cell) => cell.inMonth && cell.date.getDate() === day)
    state.activeIndex.value = dayIndex(1) // 2026-03-01 → 下标 6（行 0 末格）
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(dayIndex(3)) // 3/2（下标 7）禁用被跳过
    state.activeIndex.value = 0
    state.moveActive(-1)
    expect(state.activeIndex.value).toBe(0) // 网格左端夹住
    state.activeIndex.value = 41
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(41) // 网格右端夹住
    state.activeIndex.value = dayIndex(1)
    state.toRowEdge('first')
    expect(state.activeIndex.value).toBe(0) // 行 0 首格（2026-02-23）
    state.toRowEdge('last')
    expect(state.activeIndex.value).toBe(6) // 行 0 末格（2026-03-01）
  })

  it('useDatePicker 纯状态机：selectCell 出口发出格式化值，禁用格与越界下标被忽略', () => {
    const onSelect = vi.fn()
    const state = buildState({ type: 'date', modelValue: null, disabledDate: weekendDisabled, onSelect })
    state.openPanel()
    pinToMarch(state)
    const dayIndex = (day: number) =>
      state.cells.value.findIndex((cell) => cell.inMonth && cell.date.getDate() === day)
    state.selectCell(dayIndex(20))
    expect(onSelect).toHaveBeenCalledWith('2026-03-20')
    expect(state.open.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
    state.openPanel()
    pinToMarch(state)
    onSelect.mockClear()
    state.selectCell(dayIndex(15)) // 周日（disabledDate 命中）
    state.selectCell(99)
    state.selectCell(-1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('useDatePicker 纯状态机：disabled/loading 总闸拦截开合，changeMonth 发 panelChange', () => {
    const onPanelChange = vi.fn()
    const blocked = buildState({ type: 'date', modelValue: null, disabled: true, onPanelChange })
    blocked.togglePanel()
    expect(blocked.open.value).toBe(false)
    expect(onPanelChange).not.toHaveBeenCalled()
    const loadingBlocked = buildState({ type: 'date', modelValue: null, loading: true })
    loadingBlocked.openPanel()
    expect(loadingBlocked.open.value).toBe(false)
    const state = buildState({ type: 'date', modelValue: PINNED, onPanelChange })
    state.openPanel() // 有已选值 → 视图自动钉到 2026-03
    state.changeMonth(1)
    expect(onPanelChange).toHaveBeenCalledWith({ year: 2026, month: 4 })
    expect(state.viewMonth.value).toBe(4)
    state.changeMonth(-1)
    expect(onPanelChange).toHaveBeenCalledWith({ year: 2026, month: 3 })
  })

  it('useDatePicker 纯状态机：range 草稿两段式与起点重置', () => {
    const onSelect = vi.fn()
    const state = buildState({ type: 'range', modelValue: null, onSelect })
    state.openPanel()
    pinToMarch(state)
    const dayIndex = (day: number) =>
      state.cells.value.findIndex((cell) => cell.inMonth && cell.date.getDate() === day)
    state.selectCell(dayIndex(10))
    expect(onSelect).not.toHaveBeenCalled()
    expect(state.open.value).toBe(true)
    expect(state.activeRange.value?.[0].getDate()).toBe(10)
    state.selectCell(dayIndex(20))
    expect(onSelect).toHaveBeenCalledWith(['2026-03-10', '2026-03-20'])
    expect(state.open.value).toBe(false)
    state.openPanel()
    pinToMarch(state)
    state.selectCell(dayIndex(20))
    state.selectCell(dayIndex(10)) // 早于起点 → 重置
    expect(onSelect).toHaveBeenCalledTimes(1)
    state.selectCell(dayIndex(15))
    expect(onSelect).toHaveBeenCalledWith(['2026-03-10', '2026-03-15'])
  })

  it('useDatePicker 纯状态机：setTime 在 datetime 有已选值时同步发值', () => {
    const onSelect = vi.fn()
    const state = buildState({ type: 'datetime', modelValue: '2026-03-15 08:00', onSelect })
    state.openPanel() // 有已选值 → 视图自动钉到 2026-03
    expect(state.timeValue.value).toBe('08:00')
    state.setTime('09:45')
    expect(onSelect).toHaveBeenCalledWith('2026-03-15 09:45')
    expect(state.timeValue.value).toBe('09:45')
    onSelect.mockClear()
    state.setTime('bad')
    expect(state.timeValue.value).toBe('')
    expect(onSelect).not.toHaveBeenCalled()
  })
})

/** 组装 useDatePicker 的测试便捷函数（disabledDate 须以 getter 传入，同组件路径）。 */
function buildState(overrides: {
  type: 'date' | 'datetime' | 'range'
  modelValue: DatePickerModelValue
  disabledDate?: DatePickerDisabledDate
  disabled?: boolean
  loading?: boolean
  onSelect?: (value: DatePickerModelValue) => void
  onPanelChange?: (view: { year: number; month: number }) => void
}): UseDatePickerReturn {
  return useDatePicker({
    type: overrides.type,
    modelValue: overrides.modelValue,
    format: undefined,
    min: undefined,
    max: undefined,
    disabledDate:
      overrides.disabledDate === undefined
        ? undefined
        : () => {
            return overrides.disabledDate
          },
    disabled: overrides.disabled ?? false,
    loading: overrides.loading ?? false,
    onSelect: overrides.onSelect ?? (() => {}),
    onPanelChange: overrides.onPanelChange ?? (() => {}),
  })
}

/** 无已选值时视图为运行日所在月：打开后手动钉到 2026-03 保证断言确定性。 */
function pinToMarch(state: UseDatePickerReturn): void {
  state.viewYear.value = 2026
  state.viewMonth.value = 3
}

function toIso(date: Date | null): string | null {
  return date === null
    ? null
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
