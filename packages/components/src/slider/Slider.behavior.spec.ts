// behavior spec：键盘步进 / 轨道点击跳值 / 指针拖拽（含提交与清理）/ 禁用与加载拦截 / v-model 双向。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Slider from './Slider.vue'
import type { SliderValue } from './Slider.types'

/** 伪造轨道几何（默认 0–100 → 100px 宽，垂直 100px 高）。 */
function mockRailRect(
  rail: Element,
  rect: { left?: number; top?: number; width?: number; height?: number } = {},
): void {
  const left = rect.left ?? 0
  const top = rect.top ?? 0
  const width = rect.width ?? 100
  const height = rect.height ?? 16
  vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect)
}

/** 手工构造携带坐标的指针事件（happy-dom 无 PointerEvent 构造坐标的稳定路径）。 */
function pointerEvent(type: string, x: number, y = 0): Event {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'clientX', { value: x })
  Object.defineProperty(event, 'clientY', { value: y })
  return event
}

/** 受控 Host：v-model 双向绑定到外部 ref。 */
function mountHost(props: Record<string, unknown> = {}, initial: SliderValue = 50) {
  const value = ref<SliderValue>(initial)
  const Host = defineComponent({
    setup: () => () =>
      h(Slider, {
        modelValue: value.value,
        'onUpdate:modelValue': (v: SliderValue) => {
          value.value = v
        },
        ...props,
      }),
  })
  return { wrapper: mount(Host), value }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Slider behavior', () => {
  it('方向键步进：→/↑ 加 step、←/↓ 减 step，update:modelValue 与 change 同发', async () => {
    const cases = [
      { key: 'ArrowRight', expected: 51 },
      { key: 'ArrowUp', expected: 51 },
      { key: 'ArrowLeft', expected: 49 },
      { key: 'ArrowDown', expected: 49 },
    ] as const
    for (const { key, expected } of cases) {
      const wrapper = mount(Slider, { props: { modelValue: 50 } })
      await wrapper.find('.ui-slider__handle--min').trigger('keydown', { key })
      expect(wrapper.emitted('update:modelValue')).toEqual([[expected]])
      expect(wrapper.emitted('change')).toEqual([[expected]])
      wrapper.unmount()
    }
  })

  it('step prop：方向键按步长步进', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, step: 10 } })
    await wrapper.find('.ui-slider__handle--min').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([60])
  })

  it('PageUp / PageDown：按 step×10 大步长', async () => {
    const { wrapper, value } = mountHost()
    const handle = wrapper.find('.ui-slider__handle--min')
    await handle.trigger('keydown', { key: 'PageDown' })
    expect(value.value).toBe(40)
    await handle.trigger('keydown', { key: 'PageUp' })
    expect(value.value).toBe(50)
  })

  it('Home / End：直达柄的值域边界（受控值随之提交）', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 } })
    const handle = wrapper.find('.ui-slider__handle--min')
    await handle.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
    await handle.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([100])
  })

  it('边界钳制：已达界值时步进不变、不发事件（值不变不骚扰）', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 100 } })
    await wrapper.find('.ui-slider__handle--min').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('range 双柄钳制：低柄上界为高柄、高柄下界为低柄（不交叉）', async () => {
    const { wrapper, value } = mountHost({ range: true }, [50, 50])
    const maxHandle = wrapper.find('.ui-slider__handle--max')
    const minHandle = wrapper.find('.ui-slider__handle--min')
    // 两柄重合：各自的越界方向被钳在对方当前值，不发事件
    await maxHandle.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await minHandle.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 拉开区间后可各自推进，但不越过对方
    value.value = [40, 60]
    await nextTick()
    await minHandle.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toEqual([41, 60])
    await maxHandle.trigger('keydown', { key: 'ArrowLeft' })
    expect(value.value).toEqual([41, 59])
  })

  it('v-model 双向绑定：键盘步进更新父状态，父状态变化回落 aria-valuenow', async () => {
    const { wrapper, value } = mountHost()
    const handle = wrapper.find('.ui-slider__handle--min')
    expect(handle.attributes('aria-valuenow')).toBe('50')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe(51)
    await nextTick()
    expect(handle.attributes('aria-valuenow')).toBe('51')
    value.value = 20
    await nextTick()
    expect(handle.attributes('aria-valuenow')).toBe('20')
  })

  it('轨道点击跳值：pointerdown 落值（对齐 step）并从最近柄开始拖拽', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 }, attachTo: document.body })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await rail.trigger('pointerdown', { clientX: 25 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25])
    // 指针交互把焦点移上柄，键盘可无缝接管
    expect(document.activeElement).toBe(wrapper.find('.ui-slider__handle--min').element)
    wrapper.unmount()
  })

  it('拖拽：移动连续发 update:modelValue，抬起值有变化才发一次 change，此后监听已移除', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 }, attachTo: document.body })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await rail.trigger('pointerdown', { clientX: 25 })
    expect(wrapper.emitted('update:modelValue')).toEqual([[25]])
    // 模拟 v-model 回流：受控值落回组件
    await wrapper.setProps({ modelValue: 25 })

    document.dispatchEvent(pointerEvent('pointermove', 60))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[25], [60]])
    await wrapper.setProps({ modelValue: 60 })

    document.dispatchEvent(pointerEvent('pointerup', 60))
    await nextTick()
    expect(wrapper.emitted('change')).toEqual([[60]])

    // 抬起后 document 监听已移除：继续移动不再产生事件
    document.dispatchEvent(pointerEvent('pointermove', 10))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[25], [60]])
    expect(wrapper.emitted('change')).toEqual([[60]])
    wrapper.unmount()
  })

  it('柄上按下不跳值；无值变化的拖拽抬起不发 change', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 }, attachTo: document.body })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await wrapper.find('.ui-slider__handle--min').trigger('pointerdown', { clientX: 50 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    document.dispatchEvent(pointerEvent('pointerup', 50))
    await nextTick()
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('range 轨道点击取最近柄：靠近低值取低柄、靠近高值取高柄（等距取低柄）', async () => {
    const nearLow = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    const railLow = nearLow.find('.ui-slider__rail')
    mockRailRect(railLow.element)
    await railLow.trigger('pointerdown', { clientX: 30 })
    expect(nearLow.emitted('update:modelValue')?.[0]).toEqual([[30, 80]])
    nearLow.unmount()

    const nearHigh = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    const railHigh = nearHigh.find('.ui-slider__rail')
    mockRailRect(railHigh.element)
    await railHigh.trigger('pointerdown', { clientX: 70 })
    expect(nearHigh.emitted('update:modelValue')?.[0]).toEqual([[20, 70]])
    nearHigh.unmount()

    const tie = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    const railTie = tie.find('.ui-slider__rail')
    mockRailRect(railTie.element)
    await railTie.trigger('pointerdown', { clientX: 50 })
    expect(tie.emitted('update:modelValue')?.[0]).toEqual([[50, 80]])
    tie.unmount()
  })

  it('垂直模式：指针取值自下而上（clientY 越小值越大）', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, vertical: true } })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element, { top: 0, height: 100 })
    await rail.trigger('pointerdown', { clientY: 75 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25])
    wrapper.unmount()
  })

  it('指针取值对齐 step：step=30 时 25 落到 30（max=100 不在格点上仍可达）', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, step: 30 } })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await rail.trigger('pointerdown', { clientX: 25 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([30])
    await wrapper.setProps({ modelValue: 30 })
    await rail.trigger('pointerdown', { clientX: 95 })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([90])
    wrapper.unmount()
  })

  it('disabled：键盘与轨道点击全拦截', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, disabled: true } })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await wrapper.find('.ui-slider__handle--min').trigger('keydown', { key: 'ArrowRight' })
    await rail.trigger('pointerdown', { clientX: 25 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('loading：键盘与轨道点击全拦截（保持可聚焦，行为同禁用）', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50, loading: true } })
    const rail = wrapper.find('.ui-slider__rail')
    mockRailRect(rail.element)
    await wrapper.find('.ui-slider__handle--min').trigger('keydown', { key: 'ArrowRight' })
    await rail.trigger('pointerdown', { clientX: 25 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('浮点 step 精度：0.1 步进三次得到 0.3 而非 0.30000000000000004', async () => {
    const { wrapper, value } = mountHost({ step: 0.1 }, 0)
    const handle = wrapper.find('.ui-slider__handle--min')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    await handle.trigger('keydown', { key: 'ArrowRight' })
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe(0.3)
  })
})
