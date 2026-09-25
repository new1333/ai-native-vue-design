// a11y spec：role / aria-describedby 关联 / 键盘序列（focus 显示、失焦与 Esc 关闭）。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
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

function mountTooltip() {
  const wrapper = mount(Tooltip, {
    slots: {
      default: () => h('button', { type: 'button' }, '保存'),
      content: () => '保存当前草稿',
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

describe('Tooltip a11y', () => {
  it('浮层 role="tooltip"', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()?.getAttribute('role')).toBe('tooltip')
  })

  it('打开时触发元素 aria-describedby 指向浮层 id（双向关联成立）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    const describedBy = triggerEl(wrapper).attributes('aria-describedby')
    expect(describedBy).toBeDefined()
    expect(floating()?.id).toBe(describedBy)
  })

  it('关闭态触发元素不带 aria-describedby（隐藏后即解除关联）', async () => {
    const wrapper = mountTooltip()
    expect(triggerEl(wrapper).attributes('aria-describedby')).toBeUndefined()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(triggerEl(wrapper).attributes('aria-describedby')).toBeDefined()
    await triggerEl(wrapper).trigger('focusout')
    expect(triggerEl(wrapper).attributes('aria-describedby')).toBeUndefined()
  })

  it('浮层不可聚焦：不携带 tabindex（不进入 Tab 序、无焦点停留）', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()?.hasAttribute('tabindex')).toBe(false)
  })

  it('触发元素保持原生语义：不加 role、不改 tabindex（自然进入 Tab 序）', async () => {
    const wrapper = mountTooltip()
    const button = triggerEl(wrapper)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('role')).toBeUndefined()
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('键盘路径：focusin（Tab 聚焦）延迟后显示', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    expect(floating()).toBeNull()
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).not.toBeNull()
  })

  it('键盘路径：focusout（Tab 离开）立即隐藏', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    await triggerEl(wrapper).trigger('focusout')
    expect(floating()).toBeNull()
  })

  it('键盘路径：Esc 立即关闭', async () => {
    const wrapper = mountTooltip()
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    expect(floating()).toBeNull()
  })

  it('监听器链式合并：触发元素已有的 keydown 处理器与组件的 Esc 关闭共存', async () => {
    const seen: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(
          Tooltip,
          {},
          {
            default: () =>
              h(
                'button',
                {
                  type: 'button',
                  onKeydown: (event: KeyboardEvent) => seen.push(event.key),
                },
                '保存',
              ),
            content: () => '提示内容',
          },
        ),
    })
    const wrapper = mount(Host)
    wrappers.push(wrapper)
    const button = wrapper.find('button')
    await button.trigger('focusin')
    await vi.advanceTimersByTimeAsync(TOOLTIP_SHOW_DELAY_MS)
    expect(floating()).not.toBeNull()
    await button.trigger('keydown', { key: 'Escape' })
    expect(seen).toEqual(['Escape'])
    expect(floating()).toBeNull()
  })
})
