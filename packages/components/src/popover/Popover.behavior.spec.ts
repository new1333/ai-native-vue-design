// behavior spec：click/hover 开合、受控联动、Esc+焦点回归、scrim 关闭、rect 定位与滚动/resize 重排、卸载清理。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
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
      // attachTo document.body：触发元素在文档内，focus()/activeElement 断言才与真实使用一致。
      attachTo: document.body,
    },
  )
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: ReturnType<typeof mountPopover>): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.custom-trigger') as DOMWrapper<HTMLButtonElement>
}

/** 点击打开并等 Teleport 渲染与定位落地。 */
async function open(wrapper: ReturnType<typeof mountPopover>): Promise<void> {
  await triggerEl(wrapper).trigger('click')
  await nextTick()
  await nextTick()
}

function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-popover__card')
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

describe('Popover behavior', () => {
  it('点击触发元素：卡片 Teleport 至 body 渲染；再次点击关闭（点击开合）', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    expect(card()).not.toBeNull()
    expect(document.body.contains(card())).toBe(true)
    await triggerEl(wrapper).trigger('click')
    expect(card()).toBeNull()
  })

  it('受控开合：点击只 emit；父响应 setProps 后跟随开/关', async () => {
    const wrapper = mountPopover({ modelValue: false })
    await triggerEl(wrapper).trigger('click')
    expect(card()).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(card()).toBeNull()
  })

  it('hover 进入：150ms 内不开启，到点后开启', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('mouseenter')
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS - 1)
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(card()).not.toBeNull()
  })

  it('hover 待开启期间移开：取消开启（不再弹出）', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS - 1)
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    expect(card()).toBeNull()
  })

  it('hover 已开启后移出：宽限期后关闭；宽限期内移入卡片取消关闭', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS - 1)
    expect(card()).not.toBeNull()
    // 移入卡片：取消待关闭计时
    await cardWrapper().trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS)
    expect(card()).not.toBeNull()
    // 移出卡片：宽限后关闭
    await cardWrapper().trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS)
    expect(card()).toBeNull()
  })

  it('hover 键盘等价路径：focusin 延迟开启、focusout 宽限关闭', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('focusin')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('focusout')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS)
    expect(card()).toBeNull()
  })

  it('click 模式：鼠标移出卡片不关闭（mouse/focus 路径只在 hover 模式生效）', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    await cardWrapper().trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(POPOVER_HIDE_DELAY_MS * 2)
    expect(card()).not.toBeNull()
  })

  it('Esc（触发元素上）：关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('Esc（卡片内）：关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    const input = card()?.querySelector('input')
    input?.focus()
    expect(document.activeElement).toBe(input)
    await cardWrapper().trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('非 Esc 键不关闭', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    await triggerEl(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(card()).not.toBeNull()
  })

  it('scrim 点击：关闭且不抢焦点', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    const scrim = document.body.querySelector<HTMLElement>('.ui-popover__scrim')
    expect(scrim).not.toBeNull()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    scrim?.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(card()).toBeNull()
    // scrim 关闭不还原焦点（焦点保持在用户点击前的位置）
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('closeOnScrim=false：无 scrim，外部点击不关闭', async () => {
    const wrapper = mountPopover({ closeOnScrim: false })
    await open(wrapper)
    expect(document.body.querySelector('.ui-popover__scrim')).toBeNull()
    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('定位：打开后按触发元素 rect 计算（placement=top：水平居中、上缘留 token 间距）', async () => {
    const wrapper = mountPopover()
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    const el = card()
    expect(el?.style.left).toBe('80px')
    expect(el?.style.top).toBe('calc(100px - var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, -100%)')
  })

  it('定位：placement=right 贴触发元素右缘并垂直居中', async () => {
    const wrapper = mountPopover({ placement: 'right' })
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    const el = card()
    expect(el?.style.left).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.top).toBe('110px')
    expect(el?.style.transform).toBe('translate(0, -50%)')
  })

  it('打开期间切换 placement：按新方向重排', async () => {
    const wrapper = mountPopover()
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    await wrapper.setProps({ placement: 'bottom' })
    await nextTick()
    await nextTick()
    const el = card()
    expect(el?.classList.contains('ui-popover__card--bottom')).toBe(true)
    expect(el?.style.top).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, 0)')
  })

  it('打开期间滚动/resize：按最新 rect 重排', async () => {
    const wrapper = mountPopover()
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
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

  it('hover 待关闭期间卸载：计时器被清理，到期后无异常、不弹层', async () => {
    const wrapper = mountPopover({ trigger: 'hover' })
    await triggerEl(wrapper).trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(POPOVER_SHOW_DELAY_MS)
    await triggerEl(wrapper).trigger('mouseleave')
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => vi.advanceTimersByTime(POPOVER_HIDE_DELAY_MS * 2)).not.toThrow()
    expect(card()).toBeNull()
  })

  it('打开状态下卸载：全局 scroll/resize 监听被移除（后续事件不引用已卸载实例，不抛错）', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => {
      document.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    }).not.toThrow()
  })
})
