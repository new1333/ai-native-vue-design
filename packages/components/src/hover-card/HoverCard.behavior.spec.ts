// behavior spec：hover/focus 双触发开合、延迟与宽限状态机、Esc+焦点回归、rect 定位与滚动/resize 重排、卸载清理。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
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

function mountHoverCard(props: Record<string, unknown> = {}) {
  const wrapper = mount(
    HoverCard,
    {
      props,
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

/** hover 进入并等默认 openDelay 到期。 */
async function openByHover(wrapper: ReturnType<typeof mountHoverCard>): Promise<void> {
  await triggerEl(wrapper).trigger('mouseenter')
  await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
}

function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-hover-card__card')
}

function cardWrapper(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(card() as HTMLElement)
}

/** 模拟 rect（left 40 / top 100 / width 80 / height 20 → right 120 / bottom 120，中心 (80,110)）。 */
function mockRect(el: HTMLElement, offset = 0): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 40 + offset,
    y: 100 + offset,
    left: 40 + offset,
    top: 100 + offset,
    right: 120 + offset,
    bottom: 120 + offset,
    width: 80,
    height: 20,
    toJSON: () => ({}),
  } as DOMRect)
}

describe('HoverCard behavior', () => {
  it('hover 进入：openDelay 内不开启，到点后开启', async () => {
    const wrapper = mountHoverCard()
    await triggerEl(wrapper).trigger('mouseenter')
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT - 1)
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(card()).not.toBeNull()
  })

  it('待开启期间移开：取消开启（不再弹出）', async () => {
    const wrapper = mountHoverCard()
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT - 1)
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).toBeNull()
  })

  it('已开启后移出：宽限期后关闭；宽限期内移入卡片取消关闭', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT - 1)
    expect(card()).not.toBeNull()
    // 移入卡片：取消待关闭计时
    await cardWrapper().trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
    // 移出卡片：宽限后关闭
    await cardWrapper().trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).toBeNull()
  })

  it('宽限期内移回触发元素：同样取消关闭（触发元素与卡片间往返不断开）', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT - 1)
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
  })

  it('键盘等价路径：focusin 延迟开启、focusout 宽限关闭（与鼠标同构）', async () => {
    const wrapper = mountHoverCard()
    await triggerEl(wrapper).trigger('focusin')
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('focusout')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(card()).toBeNull()
  })

  it('自定义 openDelay/closeDelay（ms）生效', async () => {
    const wrapper = mountHoverCard({ openDelay: 300, closeDelay: 0 })
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(299)
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(card()).not.toBeNull()
    // closeDelay=0：移出后立即关闭（无需等待）
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(0)
    expect(card()).toBeNull()
  })

  it('Esc（触发元素上）：立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('Esc（卡片内）：立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    const input = card()?.querySelector('input')
    input?.focus()
    expect(document.activeElement).toBe(input)
    await cardWrapper().trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('非 Esc 键不关闭', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    await triggerEl(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(card()).not.toBeNull()
  })

  it('定位：打开后按触发元素 rect 计算（placement=top：水平居中、上缘留 token 间距）', async () => {
    const wrapper = mountHoverCard()
    mockRect(triggerEl(wrapper).element)
    await openByHover(wrapper)
    const el = card()
    expect(el?.style.left).toBe('80px')
    expect(el?.style.top).toBe('calc(100px - var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, -100%)')
  })

  it('定位：placement=right 贴触发元素右缘并垂直居中', async () => {
    const wrapper = mountHoverCard({ placement: 'right' })
    mockRect(triggerEl(wrapper).element)
    await openByHover(wrapper)
    const el = card()
    expect(el?.style.left).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.top).toBe('110px')
    expect(el?.style.transform).toBe('translate(0, -50%)')
  })

  it('打开期间切换 placement：按新方向重排', async () => {
    const wrapper = mountHoverCard()
    mockRect(triggerEl(wrapper).element)
    await openByHover(wrapper)
    await wrapper.setProps({ placement: 'bottom' })
    await nextTick()
    await nextTick()
    const el = card()
    expect(el?.classList.contains('ui-hover-card__card--bottom')).toBe(true)
    expect(el?.style.top).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, 0)')
  })

  it('打开期间滚动/resize：按最新 rect 重排', async () => {
    const wrapper = mountHoverCard()
    mockRect(triggerEl(wrapper).element)
    await openByHover(wrapper)
    expect(card()?.style.top).toBe('calc(100px - var(--ui-space-2))')
    // 触发元素随页面滚动移动 24px：scroll（capture）与 resize 都触发重排（重渲染等 microtask 落地）
    mockRect(triggerEl(wrapper).element, 24)
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(card()?.style.top).toBe('calc(124px - var(--ui-space-2))')
    mockRect(triggerEl(wrapper).element, 48)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(card()?.style.top).toBe('calc(148px - var(--ui-space-2))')
  })

  it('待关闭期间卸载：计时器被清理，到期后无异常、不弹层', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    await triggerEl(wrapper).trigger('mouseleave')
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => vi.advanceTimersByTime(HOVER_CARD_CLOSE_DELAY_DEFAULT * 2)).not.toThrow()
    expect(card()).toBeNull()
  })

  it('打开状态下卸载：全局 scroll/resize 监听被移除（后续事件不引用已卸载实例，不抛错）', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => {
      document.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    }).not.toThrow()
  })
})
