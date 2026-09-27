// a11y spec：aria-expanded / aria-controls 关联 / role="dialog" + aria-labelledby / 键盘路径（focus 开启、焦点入卡不关、Esc 关闭+焦点回归）。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import HoverCard from './HoverCard.vue'
import {
  HOVER_CARD_CLOSE_DELAY_DEFAULT,
  HOVER_CARD_OPEN_DELAY_DEFAULT,
} from './HoverCard.constants'

const wrappers: Array<{ unmount: () => void }> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

function mountHoverCard() {
  const wrapper = mount(
    HoverCard,
    {
      slots: {
        trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '查看'),
        default: () => [h('p', '预览卡内容'), h('input', { type: 'text', 'aria-label': '备注' })],
      } as never,
      // attachTo document.body：触发元素在文档内，focus()/activeElement 断言才与真实使用一致。
      attachTo: document.body,
    },
  )
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: ReturnType<typeof mountHoverCard>): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.custom-trigger') as DOMWrapper<HTMLButtonElement>
}

/** 键盘聚焦（focusin）并等 openDelay 到期。 */
async function openByFocus(wrapper: ReturnType<typeof mountHoverCard>): Promise<void> {
  await triggerEl(wrapper).trigger('focusin')
  await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
}

function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-hover-card__card')
}

function cardWrapper(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(card() as HTMLElement)
}

describe('HoverCard a11y', () => {
  it('触发元素恒挂 aria-expanded：关闭 false / 打开 true', async () => {
    const wrapper = mountHoverCard()
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('false')
    await openByFocus(wrapper)
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('打开时触发元素 aria-controls 指向卡片 id（双向关联成立）；关闭时不挂 aria-controls', async () => {
    const wrapper = mountHoverCard()
    expect(triggerEl(wrapper).attributes('aria-controls')).toBeUndefined()
    await openByFocus(wrapper)
    const controls = triggerEl(wrapper).attributes('aria-controls')
    expect(controls).toBeDefined()
    expect(card()?.id).toBe(controls)
    await triggerEl(wrapper).trigger('focusout')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(triggerEl(wrapper).attributes('aria-controls')).toBeUndefined()
  })

  it('卡片 role="dialog" 且 aria-labelledby 指向触发元素 id', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    const el = card()
    expect(el?.getAttribute('role')).toBe('dialog')
    const labelledBy = el?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeDefined()
    expect(triggerEl(wrapper).attributes('id')).toBe(labelledBy)
  })

  it('卡片非模态：不携带 aria-modal（区别于 Dialog）', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    expect(card()?.hasAttribute('aria-modal')).toBe(false)
  })

  it('触发元素保持原生语义：不加 role、不改 tabindex（自然进入 Tab 序）', () => {
    const wrapper = mountHoverCard()
    const button = triggerEl(wrapper)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('role')).toBeUndefined()
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('键盘路径：focusin（Tab 聚焦）延迟后开启', async () => {
    const wrapper = mountHoverCard()
    await triggerEl(wrapper).trigger('focusin')
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
  })

  it('键盘路径：focusout（Tab 离开）宽限后关闭', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    await triggerEl(wrapper).trigger('focusout')
    expect(card()).not.toBeNull() // 宽限期内仍在
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).toBeNull()
  })

  it('键盘路径：焦点移入卡片（focusout relatedTarget 落在卡片内，Tab 进入内容）保持打开', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    const inner = card()?.querySelector('input')
    expect(inner).not.toBeNull()
    // 焦点从触发元素移入卡片：dispatch 原生 FocusEvent 携带 relatedTarget
    triggerEl(wrapper).element.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inner }))
    await nextTick()
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
  })

  it('键盘路径：触发元素上 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('键盘路径：卡片内 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountHoverCard()
    await openByFocus(wrapper)
    const input = card()?.querySelector<HTMLInputElement>('input')
    input?.focus()
    await cardWrapper().trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('监听器链式合并：触发元素已有的 keydown 处理器与组件的 Esc 关闭共存', async () => {
    const seen: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(
          HoverCard,
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
                '查看',
              ),
            default: () => '预览卡内容',
          },
        ),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper)
    const button = wrapper.find('button.custom-trigger')
    await button.trigger('focusin')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
    await button.trigger('keydown', { key: 'Escape' })
    expect(seen).toEqual(['Escape'])
    expect(card()).toBeNull()
  })
})
