// api spec：props 默认值 / slots 渲染 / attrs 透传 / emits 声明 / 受控与非受控。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import HoverCard from './HoverCard.vue'
import {
  HOVER_CARD_CLOSE_DELAY_DEFAULT,
  HOVER_CARD_OPEN_DELAY_DEFAULT,
  HOVER_CARD_PLACEMENT_DEFAULT,
} from './HoverCard.constants'

const wrappers: Array<{ unmount: () => void }> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

interface MountOptions {
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  slots?: Record<string, unknown>
}

function mountHoverCard(options: MountOptions = {}) {
  const slots: Record<string, unknown> = {
    trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '查看'),
    default: () => '预览卡内容',
  }
  if (options.slots) Object.assign(slots, options.slots)
  // 值为 null 的键表示「不提供该插槽」（显式传 undefined 会被 VTU 归一化，不可靠）
  for (const key of Object.keys(slots)) {
    if (slots[key] === null) delete slots[key]
  }
  const wrapper = mount(HoverCard, {
    props: options.props,
    attrs: options.attrs,
    slots: slots as never,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** hover 进入并等 openDelay 到期。 */
async function openByHover(wrapper: ReturnType<typeof mountHoverCard>): Promise<void> {
  await wrapper.find('button.custom-trigger').trigger('mouseenter')
  await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
}

/** 当前渲染中的卡片元素（Teleport 至 body）。 */
function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-hover-card__card')
}

describe('HoverCard api', () => {
  it('根元素带 ui-hover-card 根类', () => {
    const wrapper = mountHoverCard()
    expect(wrapper.classes()).toContain('ui-hover-card')
  })

  it(`默认 placement=${HOVER_CARD_PLACEMENT_DEFAULT}：卡片携带方向修饰类`, async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    expect(card()?.classList.contains('ui-hover-card__card--top')).toBe(true)
  })

  it(`默认 openDelay=${HOVER_CARD_OPEN_DELAY_DEFAULT}：hover 后延迟到期才开启`, async () => {
    const wrapper = mountHoverCard()
    await wrapper.find('button.custom-trigger').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT - 1)
    expect(card()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(card()).not.toBeNull()
  })

  it(`默认 closeDelay=${HOVER_CARD_CLOSE_DELAY_DEFAULT}：移出后宽限到期才关闭`, async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    await wrapper.find('button.custom-trigger').trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT - 1)
    expect(card()).not.toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(card()).toBeNull()
  })

  it('trigger 插槽为文本：回退内建原生 button 触发器并可 hover 开启', async () => {
    const wrapper = mountHoverCard({ slots: { trigger: () => '文本触发' } })
    const fallback = wrapper.find('button.ui-hover-card__trigger')
    expect(fallback.exists()).toBe(true)
    expect(fallback.text()).toBe('文本触发')
    expect(fallback.attributes('type')).toBe('button')
    await fallback.trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).not.toBeNull()
  })

  it('trigger 插槽为单个元素：直接作为触发元素（无内建包装 button、无 ui-hover-card__trigger 类）', () => {
    const wrapper = mountHoverCard()
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('button.ui-hover-card__trigger').exists()).toBe(false)
    expect(wrapper.find('button.custom-trigger').exists()).toBe(true)
  })

  it('写在 <HoverCard> 上的 attrs 透传到触发元素', () => {
    const wrapper = mountHoverCard({ attrs: { 'data-track': 'preview', class: 'extra-cls' } })
    const trigger = wrapper.find('button.custom-trigger')
    expect(trigger.attributes('data-track')).toBe('preview')
    expect(trigger.classes()).toContain('extra-cls')
  })

  it('default 插槽内容渲染进卡片', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    expect(card()?.textContent).toContain('预览卡内容')
  })

  it('未提供 default 插槽：hover 不开启', async () => {
    const wrapper = mountHoverCard({ slots: { default: null } })
    await wrapper.find('button.custom-trigger').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(card()).toBeNull()
  })

  it('非受控完整开合周期：发出 update:modelValue [true] 与 [false]', async () => {
    const wrapper = mountHoverCard()
    await openByHover(wrapper)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    await wrapper.find('button.custom-trigger').trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_CLOSE_DELAY_DEFAULT)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('受控：modelValue=false 时 hover 只 emit 不开启；父响应后跟随渲染', async () => {
    const wrapper = mountHoverCard({ props: { modelValue: false } })
    await wrapper.find('button.custom-trigger').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(HOVER_CARD_OPEN_DELAY_DEFAULT)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(card()).toBeNull()
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('受控初始 modelValue=true：挂载即打开', async () => {
    mountHoverCard({ props: { modelValue: true } })
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })
})
