// api spec：props 默认值 / slots 渲染 / attrs 透传 / emits 声明 / 受控与非受控。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Popover from './Popover.vue'
import { POPOVER_CLOSE_ON_SCRIM_DEFAULT, POPOVER_PLACEMENT_DEFAULT, POPOVER_TRIGGER_DEFAULT } from './Popover.constants'

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

function mountPopover(options: MountOptions = {}) {
  const slots: Record<string, unknown> = {
    trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '筛选'),
    default: () => '气泡内容',
  }
  if (options.slots) Object.assign(slots, options.slots)
  // 值为 null 的键表示「不提供该插槽」（显式传 undefined 会被 VTU 归一化，不可靠）
  for (const key of Object.keys(slots)) {
    if (slots[key] === null) delete slots[key]
  }
  const wrapper = mount(Popover, {
    props: options.props,
    attrs: options.attrs,
    slots: slots as never,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 打开（点击触发元素）并等 Teleport 渲染落地。 */
async function open(wrapper: ReturnType<typeof mountPopover>): Promise<void> {
  await wrapper.find('button.custom-trigger').trigger('click')
  await nextTick()
  await nextTick()
}

/** 当前渲染中的卡片元素（Teleport 至 body）。 */
function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-popover__card')
}

describe('Popover api', () => {
  it('根元素带 ui-popover 根类', () => {
    const wrapper = mountPopover()
    expect(wrapper.classes()).toContain('ui-popover')
  })

  it(`默认 trigger=${POPOVER_TRIGGER_DEFAULT}：mouseenter 不开启（点击触发，无 hover 路径）`, async () => {
    const wrapper = mountPopover()
    await wrapper.find('button.custom-trigger').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(300)
    expect(card()).toBeNull()
    await wrapper.find('button.custom-trigger').trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it(`默认 placement=${POPOVER_PLACEMENT_DEFAULT}：卡片携带方向修饰类`, async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    expect(card()?.classList.contains('ui-popover__card--top')).toBe(true)
  })

  it(`默认 closeOnScrim=${String(POPOVER_CLOSE_ON_SCRIM_DEFAULT)}：打开期间渲染 scrim`, async () => {
    const wrapper = mountPopover()
    expect(document.body.querySelector('.ui-popover__scrim')).toBeNull()
    await open(wrapper)
    expect(document.body.querySelector('.ui-popover__scrim')).not.toBeNull()
  })

  it('默认 arrow=false：无箭头元素；arrow=true 渲染 aria-hidden 箭头', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    expect(document.body.querySelector('.ui-popover__arrow')).toBeNull()
    await wrapper.setProps({ arrow: true })
    const arrow = document.body.querySelector('.ui-popover__arrow')
    expect(arrow).not.toBeNull()
    expect(arrow?.getAttribute('aria-hidden')).toBe('true')
  })

  it('trigger 插槽为文本：回退内建原生 button 触发器并可点击开合', async () => {
    const wrapper = mountPopover({ slots: { trigger: () => '文本触发' } })
    const fallback = wrapper.find('button.ui-popover__trigger')
    expect(fallback.exists()).toBe(true)
    expect(fallback.text()).toBe('文本触发')
    expect(fallback.attributes('type')).toBe('button')
    await fallback.trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('trigger 插槽为单个元素：直接作为触发元素（无内建包装 button、无 ui-popover__trigger 类）', () => {
    const wrapper = mountPopover()
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('button.ui-popover__trigger').exists()).toBe(false)
    expect(wrapper.find('button.custom-trigger').exists()).toBe(true)
  })

  it('写在 <Popover> 上的 attrs 透传到触发元素', () => {
    const wrapper = mountPopover({ attrs: { 'data-track': 'filter', class: 'extra-cls' } })
    const trigger = wrapper.find('button.custom-trigger')
    expect(trigger.attributes('data-track')).toBe('filter')
    expect(trigger.classes()).toContain('extra-cls')
  })

  it('default 插槽内容渲染进卡片', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    expect(card()?.textContent).toContain('气泡内容')
  })

  it('未提供 default 插槽：点击不弹层', async () => {
    const wrapper = mountPopover({ slots: { default: null } })
    await wrapper.find('button.custom-trigger').trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).toBeNull()
  })

  it('非受控完整开合周期：发出 update:modelValue [true] 与 [false]', async () => {
    const wrapper = mountPopover()
    await open(wrapper)
    await wrapper.find('button.custom-trigger').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('受控：modelValue=false 时点击只 emit 不开启；父响应后跟随渲染', async () => {
    const wrapper = mountPopover({ props: { modelValue: false } })
    await wrapper.find('button.custom-trigger').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(card()).toBeNull()
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('受控初始 modelValue=true：挂载即打开', async () => {
    mountPopover({ props: { modelValue: true } })
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('closeOnScrim=false：打开期间不渲染 scrim', async () => {
    const wrapper = mountPopover({ props: { closeOnScrim: false } })
    await open(wrapper)
    expect(card()).not.toBeNull()
    expect(document.body.querySelector('.ui-popover__scrim')).toBeNull()
  })
})
