// api spec：props 默认值 / slots 渲染 / attrs 透传 / 无自定义 emits。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Tooltip from './Tooltip.vue'
import { TOOLTIP_PLACEMENT_DEFAULT, TOOLTIP_SHOW_DELAY_MS } from './Tooltip.constants'

const wrappers: Array<{ unmount: () => void }> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

function mountTooltip(options: { props?: Record<string, unknown>; attrs?: Record<string, unknown>; slots?: Record<string, unknown> } = {}) {
  const wrapper = mount(Tooltip, {
    props: options.props,
    attrs: options.attrs,
    slots: {
      default: () => h('button', { type: 'button' }, '保存'),
      content: () => '提示内容',
      ...options.slots,
    } as never,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 模拟键盘聚焦路径打开浮层（focusin + 延迟到期）。 */
async function openByFocus(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('button').trigger('focusin')
  await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
}

/** 当前渲染中的浮层元素（占位 span 无 role，不会命中）。 */
function floating(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-tooltip[role="tooltip"]')
}

describe('Tooltip api', () => {
  it('默认插槽触发元素原样渲染（无包装 DOM、不挂 ui-tooltip 类）', () => {
    const wrapper = mountTooltip()
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('保存')
    expect(button.classes()).not.toContain('ui-tooltip')
    expect(button.element.parentElement?.classList.contains('ui-tooltip')).toBe(false)
  })

  it('挂载后 SSR 占位移除：组件内无 hidden 占位', async () => {
    const wrapper = mountTooltip()
    await nextTick() // 等 isMounted 触发的重渲染落地
    expect(wrapper.find('.ui-tooltip[hidden]').exists()).toBe(false)
  })

  it(`默认 placement=${TOOLTIP_PLACEMENT_DEFAULT}：浮层携带方向修饰类`, async () => {
    const wrapper = mountTooltip()
    await openByFocus(wrapper)
    const el = floating()
    expect(el).not.toBeNull()
    expect(el?.classList.contains('ui-tooltip--top')).toBe(true)
  })

  it('placement 可选方向落位（bottom）', async () => {
    const wrapper = mountTooltip({ props: { placement: 'bottom' } })
    await openByFocus(wrapper)
    expect(floating()?.classList.contains('ui-tooltip--bottom')).toBe(true)
  })

  it('content 插槽渲染进浮层', async () => {
    const wrapper = mountTooltip()
    await openByFocus(wrapper)
    expect(floating()?.textContent).toBe('提示内容')
  })

  it('写在 <Tooltip> 上的 attrs 透传到触发元素', () => {
    const wrapper = mountTooltip({ attrs: { 'data-track': 'save', class: 'extra-cls' } })
    const button = wrapper.find('button')
    expect(button.attributes('data-track')).toBe('save')
    expect(button.classes()).toContain('extra-cls')
  })

  it('未提供 content 插槽：不弹层', async () => {
    const wrapper = mount(Tooltip, {
      slots: { default: () => h('button', { type: 'button' }, '保存') } as never,
    })
    wrappers.push(wrapper)
    await openByFocus(wrapper)
    expect(floating()).toBeNull()
  })

  it('无自定义 emits：完整显隐周期不发出任何事件', async () => {
    const wrapper = mountTooltip()
    await openByFocus(wrapper)
    await wrapper.find('button').trigger('focusout')
    await wrapper.find('button').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    await wrapper.find('button').trigger('mouseleave')
    expect(wrapper.emitted()).toEqual({})
  })
})
