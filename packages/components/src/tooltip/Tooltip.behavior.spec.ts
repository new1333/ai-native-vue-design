// behavior spec：hover/focus 显示延迟与立即隐藏、Esc、rect 定位、计时器清理。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { h } from 'vue'
import Tooltip from './Tooltip.vue'
import { TOOLTIP_SHOW_DELAY_MS } from './Tooltip.constants'

const wrappers: Array<{ unmount: () => void }> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

function mountTooltip(props: Record<string, unknown> = {}) {
  const wrapper = mount(Tooltip, {
    props,
    slots: {
      default: () => h('button', { type: 'button' }, '保存'),
      content: () => '提示内容',
    } as never,
  })
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: ReturnType<typeof mountTooltip>) {
  return wrapper.find('button')
}

function floating(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-tooltip[role="tooltip"]')
}

/** 模拟 rect（left 40 / top 100 / width 80 / height 20 → right 120 / bottom 120，中心 (80,110)）。 */
function mockRect(el: HTMLElement): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 40,
    y: 100,
    left: 40,
    top: 100,
    right: 120,
    bottom: 120,
    width: 80,
    height: 20,
    toJSON: () => ({}),
  } as DOMRect)
}

describe('Tooltip behavior', () => {
  it('hover 进入：150ms 内不显示，到点后显示', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('mouseenter')
    expect(floating()).toBeNull()
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS - 1)
    expect(floating()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(floating()).not.toBeNull()
  })

  it('延迟期内移开：取消显示（不再弹出）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS - 1)
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).toBeNull()
  })

  it('已显示后移开：立即隐藏（无需等待）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).not.toBeNull()
    await triggerEl(wrapper).trigger('mouseleave')
    expect(floating()).toBeNull()
  })

  it('focusin 聚焦：延迟显示；focusout 失焦：立即隐藏', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).not.toBeNull()
    await triggerEl(wrapper).trigger('focusout')
    expect(floating()).toBeNull()
  })

  it('Esc 键：已显示时立即隐藏', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).not.toBeNull()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    expect(floating()).toBeNull()
  })

  it('非 Esc 键不隐藏（如 Tab 方向浏览）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    await triggerEl(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(floating()).not.toBeNull()
  })

  it('定位：打开后按触发元素 rect 计算（placement=top：水平居中、上缘留 token 间距）', async () => {
    const wrapper = mountTooltip()
    mockRect(triggerEl(wrapper).element)
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    const el = floating()
    expect(el).not.toBeNull()
    expect(el?.style.left).toBe('80px')
    expect(el?.style.top).toBe('calc(100px - var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, -100%)')
  })

  it('定位：placement=right 贴触发元素右缘并垂直居中', async () => {
    const wrapper = mountTooltip({ placement: 'right' })
    mockRect(triggerEl(wrapper).element)
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    const el = floating()
    expect(el?.style.left).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.top).toBe('110px')
    expect(el?.style.transform).toBe('translate(0, -50%)')
  })

  it('打开期间切换 placement：按新方向重排', async () => {
    const wrapper = mountTooltip()
    mockRect(triggerEl(wrapper).element)
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    await wrapper.setProps({ placement: 'bottom' })
    await nextTick()
    await nextTick()
    const el = floating()
    expect(el?.classList.contains('ui-tooltip--bottom')).toBe(true)
    expect(el?.style.top).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, 0)')
  })

  it('浮层 Teleport 至 body（脱离触发元素父级）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(wrapper.find('.ui-tooltip[role="tooltip"]').exists()).toBe(false)
    expect(document.body.contains(floating())).toBe(true)
  })

  it('待显示计时期间卸载：计时器被清理，到期后无异常、不弹层', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('mouseenter')
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => vi.advanceTimersByTime(TOOLTIP_SHOW_DELAY_MS * 2)).not.toThrow()
    expect(floating()).toBeNull()
  })
})
