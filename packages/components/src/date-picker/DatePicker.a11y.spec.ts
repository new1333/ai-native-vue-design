// a11y spec：dialog/grid 语义 / aria 属性 / roving 键盘序列 / 焦点模型。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DatePicker from './DatePicker.vue'
import type { DatePickerDisabledDate } from './DatePicker.types'

/**
 * 2026-03-01 为周日，周一首列网格从 2026-02-23（周一）起：3 月 d 日落在扁平下标 5 + d。
 * 2026-03-15（下标 20）为周日、2026-03-21（下标 26）周六、2026-03-22（下标 27）周日。
 */
const PINNED = '2026-03-15'

const weekendDisabled: DatePickerDisabledDate = (date) => date.getDay() === 0 || date.getDay() === 6

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-date-picker__trigger')

async function openPanel(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findTrigger(wrapper).trigger('click')
  await nextTick()
  await nextTick()
}

const allDays = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.ui-date-picker__day')]
const dayByLabel = (label: string): HTMLElement | null => document.querySelector(`[aria-label="${label}"]`)
const activeDay = (): HTMLElement | null =>
  document.querySelector('.ui-date-picker__day[tabindex="0"]')

function pressGrid(key: string): void {
  activeDay()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

describe('DatePicker a11y', () => {
  it('触发器：原生 button + aria-haspopup="dialog" + aria-expanded=false + aria-controls', () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('role')).toBeUndefined() // 原生 button 语义即可，不加 role
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toMatch(/^ui-date-picker-panel-/)
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('打开后：aria-expanded=true，aria-controls 指向 role=dialog + aria-label 面板', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('true')
    const panel = document.getElementById(findTrigger(wrapper).attributes('aria-controls') ?? '')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-label')).toBe('选择日期')
    wrapper.unmount()
  })

  it('月网格：role=grid + aria-label，周表头 columnheader（aria-label 全称），日期格为原生 button + role=gridcell', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const grid = document.querySelector('.ui-date-picker__grid')
    expect(grid?.getAttribute('role')).toBe('grid')
    expect(grid?.getAttribute('aria-label')).toBe('日历')
    const headers = [...document.querySelectorAll('.ui-date-picker__weekday')]
    expect(headers.map((el) => el.getAttribute('role'))).toEqual(Array.from({ length: 7 }, () => 'columnheader'))
    expect(headers[0].getAttribute('aria-label')).toBe('星期一')
    expect(headers[6].getAttribute('aria-label')).toBe('星期日')
    expect(allDays().map((el) => el.getAttribute('role'))).toEqual(
      Array.from({ length: 42 }, () => 'gridcell'),
    )
    expect(allDays().every((el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'button')).toBe(true)
    wrapper.unmount()
  })

  it('选中/今天/禁用格：aria-selected / aria-current="date" / aria-disabled + 不进 Tab 序', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED, min: '2026-03-10' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    expect(dayByLabel('2026年3月15日')?.getAttribute('aria-selected')).toBe('true')
    expect(dayByLabel('2026年3月16日')?.getAttribute('aria-selected')).toBe('false')
    expect(dayByLabel('2026年3月5日')?.getAttribute('aria-disabled')).toBe('true')
    expect(dayByLabel('2026年3月5日')?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()

    // 今天标记：无值打开时视图为运行日所在月，网格必含今天。
    const host = mount(DatePicker, { attachTo: document.body })
    await openPanel(host)
    const today = document.querySelector('[aria-current="date"]')
    expect(today?.getAttribute('aria-current')).toBe('date')
    host.unmount()
  })

  it('roving tabindex：打开后唯一 tabindex=0 落在已选格，焦点随之移入面板', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const active = activeDay()
    expect(active?.getAttribute('aria-label')).toBe('2026年3月15日')
    expect(allDays().filter((el) => el.getAttribute('tabindex') === '0')).toHaveLength(1)
    expect(document.activeElement).toBe(active)
    wrapper.unmount()
  })

  it('键盘 ↓ 在触发器：打开面板并把焦点移入月网格', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(activeDay())
    wrapper.unmount()
  })

  it('键盘 →/←：焦点在相邻格间移动（aria-label 随 activeElement 变化）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    pressGrid('ArrowRight')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月16日')
    pressGrid('ArrowLeft')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月15日')
    wrapper.unmount()
  })

  it('键盘 →：跳过禁用格（周末禁用，周五 → 跳到周一）', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: '2026-03-20', disabledDate: weekendDisabled },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    expect(activeDay()?.getAttribute('aria-label')).toBe('2026年3月20日')
    pressGrid('ArrowRight')
    await nextTick()
    // 2026-03-21（六）/03-22（日）禁用被跳过
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月23日')
    wrapper.unmount()
  })

  it('键盘 ↓/↑：焦点按周上下移动', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    pressGrid('ArrowDown')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月22日')
    pressGrid('ArrowUp')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月15日')
    wrapper.unmount()
  })

  it('键盘 Home/End：焦点跳到所在行首/行尾', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    pressGrid('ArrowRight') // 行 3（下标 21–27）
    await nextTick()
    pressGrid('Home')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月16日')
    pressGrid('End')
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('2026年3月22日')
    wrapper.unmount()
  })

  it('键盘 PageUp/PageDown：翻月且焦点移入新月网格（焦点不丢）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    pressGrid('PageDown')
    await nextTick()
    await nextTick()
    expect(document.querySelector('.ui-date-picker__header-label')?.textContent).toContain('2026年4月')
    expect(document.activeElement?.classList.contains('ui-date-picker__day')).toBe(true)
    pressGrid('PageUp')
    await nextTick()
    await nextTick()
    expect(document.querySelector('.ui-date-picker__header-label')?.textContent).toContain('2026年3月')
    wrapper.unmount()
  })

  it('键盘 Enter：选中当前格并关闭面板（载荷为格式化值）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    pressGrid('ArrowRight')
    await nextTick()
    pressGrid('Enter')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-03-16']])
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('键盘 Space（" "）：选中当前格且被 preventDefault（不触发原生 button 二次激活）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    activeDay()?.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-03-15']])
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    wrapper.unmount()
  })

  it('键盘 Esc：关闭面板并把焦点交还触发器，不发 update:modelValue', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    expect(document.activeElement).toBe(activeDay())
    activeDay()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(findTrigger(wrapper).element)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），触发器上按 Tab 关闭面板', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    findTrigger(wrapper).element.dispatchEvent(tab)
    await nextTick()
    expect(tab.defaultPrevented).toBe(false)
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
    wrapper.unmount()
  })

  it('面板 aria-modal="true" + tabindex="-1"：模态语义，面板本体为程序化聚焦锚点且不进 Tab 序', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const panel = document.querySelector('.ui-date-picker__panel')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('键盘 Tab 在面板末位可聚焦元素（roving 高亮格）上：圈定循环回首个（上月按钮），面板保持打开', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    // date 形态无时间输入/footer：面板 Tab 序为 上月 → 下月 → 高亮格（末位）
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    activeDay()?.dispatchEvent(tab)
    await nextTick()
    expect(tab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(document.querySelector('.ui-date-picker__nav--prev'))
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('datetime：Tab 在时间输入（末位）上圈定循环回上月按钮；Shift+Tab 在上月按钮（首位）上回绕到时间输入', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'datetime', modelValue: '2026-03-15 08:30' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    const time = document.querySelector<HTMLInputElement>('.ui-date-picker__time-input')
    expect(time).not.toBeNull()
    time!.focus()
    time!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    await nextTick()
    expect(document.activeElement).toBe(document.querySelector('.ui-date-picker__nav--prev'))
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()

    document
      .querySelector<HTMLElement>('.ui-date-picker__nav--prev')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey: true }),
      )
    await nextTick()
    expect(document.activeElement).toBe(time)
    wrapper.unmount()
  })

  it('键盘 Tab 在面板中部可聚焦元素（下月按钮）上：放行默认行为（不拦截），面板保持打开', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    await openPanel(wrapper)
    const next = document.querySelector<HTMLElement>('.ui-date-picker__nav--next')
    next!.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    next!.dispatchEvent(tab)
    await nextTick()
    expect(tab.defaultPrevented).toBe(false)
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    wrapper.unmount()
  })

  it('panel-footer 插槽内可聚焦元素纳入圈定：Tab 在其（末位）上循环回首个，不逃逸', async () => {
    const wrapper = mount(DatePicker, {
      props: { modelValue: PINNED },
      attachTo: document.body,
      slots: { 'panel-footer': '<button type="button" class="footer-today">今天</button>' },
    })
    await openPanel(wrapper)
    const footerBtn = document.querySelector<HTMLButtonElement>('.footer-today')
    expect(footerBtn).not.toBeNull()
    footerBtn!.focus() // footer 内容渲染在网格之后，为面板末位可聚焦元素
    footerBtn!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    )
    await nextTick()
    expect(document.activeElement).toBe(document.querySelector('.ui-date-picker__nav--prev'))
    expect(document.querySelector('.ui-date-picker__panel')).not.toBeNull()
    wrapper.unmount()
  })

  it('焦点逃逸到面板外时按 Tab：拉回面板内首个可聚焦元素（上月按钮）', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    await openPanel(wrapper)
    outside.focus() // 模拟焦点已逃逸到面板外
    expect(document.activeElement).toBe(outside)
    document
      .querySelector<HTMLElement>('.ui-date-picker__panel')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    await nextTick()
    expect(document.activeElement).toBe(document.querySelector('.ui-date-picker__nav--prev'))
    outside.remove()
    wrapper.unmount()
  })

  it('datetime：时间输入为原生 input[type=time] 且带 aria-label="时间"', async () => {
    const wrapper = mount(DatePicker, {
      props: { type: 'datetime', modelValue: '2026-03-15 08:30' },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    const time = document.querySelector('.ui-date-picker__time-input')
    expect(time?.tagName).toBe('INPUT')
    expect(time?.getAttribute('type')).toBe('time')
    expect(time?.getAttribute('aria-label')).toBe('时间')
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序）且键盘路径不打开', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED, disabled: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-date-picker__panel')).toBeNull()
  })

  it('清空按钮：原生 button + aria-label="清空"，不嵌套在触发器 button 内（DOM 合法）', () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED, clearable: true } })
    const clear = wrapper.find('button.ui-date-picker__clear')
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('清空')
    expect(clear.find('svg').attributes('aria-hidden')).toBe('true')
    expect(findTrigger(wrapper).element.contains(clear.element)).toBe(false)
  })

  it('触发器日历图标 / 翻月图标 svg 带 aria-hidden，不进入可读内容', async () => {
    const wrapper = mount(DatePicker, { props: { modelValue: PINNED }, attachTo: document.body })
    const icon = wrapper.find('.ui-date-picker__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.attributes('focusable')).toBe('false')
    await openPanel(wrapper)
    for (const nav of [...document.querySelectorAll('.ui-date-picker__nav')]) {
      expect(nav.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
      expect(nav.getAttribute('aria-label')).not.toBeNull()
    }
    wrapper.unmount()
  })
})
