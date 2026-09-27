// a11y spec：aria-expanded / aria-controls 关联 / role="dialog" + aria-labelledby / 键盘路径（focus 开启、Esc 关闭+焦点回归）。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import Popover from './Popover.vue'
import { POPOVER_HIDE_DELAY_MS, POPOVER_SHOW_DELAY_MS } from './Popover.constants'

const wrappers: Array<{ unmount: () => void }> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

function mountPopover(props: Record<string, unknown> = {}) {
  const wrapper = mount(
    Popover,
    {
      props,
      slots: {
        trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '筛选'),
        default: () => [h('p', '气泡内容'), h('input', { type: 'text', 'aria-label': '备注' })],
      } as never,
      attachTo: document.body,
    },
  )
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: ReturnType<typeof mountPopover>): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.custom-trigger') as DOMWrapper<HTMLButtonElement>
}

/** 点击打开并等 Teleport 渲染落地。 */
async function open(wrapper: ReturnType<typeof mountPopover>): Promise<void> {
  await triggerEl(wrapper).trigger('click')
  await nextTick()
  await nextTick()
}

function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-popover__card')
}

describe('Popover a11y', () => {
  it('触发元素恒挂 aria-expanded：关闭 false / 打开 true', async () => {
    const wrapper = mountPopover()
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('false')
    await open(wrapper)
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('打开时触发元素 aria-controls 指向卡片 id（双向关联成立）；关闭时不挂 aria-controls', async () => {
    const wrapper = mountPopover()
    expect(triggerEl(wrapper).attributes('aria-controls')).toBeUndefined()
    await open(wrapper)
    const controls = triggerEl(wrapper).attributes('aria-controls')
    expect(controls).toBeDefined()
    expect(card()?.id).toBe(controls)
  })

  it('卡片 role="dialog" 且 aria-labelledby 指向触发元素 id', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    const el = card()
    expect(el?.getAttribute('role')).toBe('dialog')
    const labelledBy = el?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeDefined()
    expect(triggerEl(wrapper).attributes('id')).toBe(labelledBy)
  })

  it('卡片非模态：不携带 aria-modal（区别于 Dialog）', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    expect(card()?.hasAttribute('aria-modal')).toBe(false)
  })

  it('触发元素保持原生语义：不加 role、不改 tabindex（自然进入 Tab 序）', () => {
    const wrapper = mountPopover()
    const button = triggerEl(wrapper)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('role')).toBeUndefined()
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('键盘路径（hover 模式）：focusin（Tab 聚焦）延迟后开启', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('focusin')
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    expect(card()).not.toBeNull()
  })

  it('键盘路径（hover 模式）：focusout 宽限后关闭', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    await triggerEl(wrapper).trigger('focusout')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS)
    expect(card()).toBeNull()
  })

  it('键盘路径：触发元素上 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('键盘路径：卡片内 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    const input = card()?.querySelector<HTMLInputElement>('input')
    input?.focus()
    await new DOMWrapper(card() as HTMLElement).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('箭头装饰对读屏隐藏（aria-hidden="true"）', async () => {
    const wrapper = mountPopover({ arrow: true })
    await open(wrapper)
    const arrow = document.body.querySelector('.ui-popover__arrow')
    expect(arrow?.getAttribute('aria-hidden')).toBe('true')
  })

  it('监听器链式合并：触发元素已有的 keydown 处理器与组件的 Esc 关闭共存', async () => {
    const seen: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(
          Popover,
          {},
          {
            trigger: () =>
              h(
                'button',
                {
                  type: 'button',
                  class: 'custom-trigger',
                  onKeydown: (event: KeyboardEvent) => seen.push(event.key),
                },
                '筛选',
              ),
            default: () => '气泡内容',
          },
        ),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper)
    const button = wrapper.find('button.custom-trigger')
    await button.trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
    await button.trigger('keydown', { key: 'Escape' })
    expect(seen).toEqual(['Escape'])
    expect(card()).toBeNull()
  })
})
