// a11y spec：role / aria 属性完整性与键盘全路径（方向键 / PageUp/PageDown / Home / End / preventDefault / 焦点管理）。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Slider from './Slider.vue'
import type { SliderExpose, SliderValue } from './Slider.types'

/** 受控 Host：键盘步进后 aria-valuenow 应随 v-model 回流更新。 */
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

describe('Slider a11y', () => {
  it('柄为 role="slider" 且可聚焦（tabindex=0），两柄各自为 Tab 停靠点', () => {
    const single = mount(Slider).find('.ui-slider__handle--min')
    expect(single.attributes('role')).toBe('slider')
    expect(single.attributes('tabindex')).toBe('0')

    const range = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    expect(range.find('.ui-slider__handle--min').attributes('tabindex')).toBe('0')
    expect(range.find('.ui-slider__handle--max').attributes('tabindex')).toBe('0')
  })

  it('aria-valuemin / aria-valuemax / aria-valuenow 完整且随受控值落位', () => {
    const handle = mount(Slider, { props: { modelValue: 42 } }).find('.ui-slider__handle--min')
    expect(handle.attributes('aria-valuemin')).toBe('0')
    expect(handle.attributes('aria-valuemax')).toBe('100')
    expect(handle.attributes('aria-valuenow')).toBe('42')
  })

  it('range：两柄互为值域边界（低柄 valuemax=高柄值，高柄 valuemin=低柄值）', () => {
    const wrapper = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    const min = wrapper.find('.ui-slider__handle--min')
    const max = wrapper.find('.ui-slider__handle--max')
    expect(min.attributes('aria-valuemin')).toBe('0')
    expect(min.attributes('aria-valuemax')).toBe('80')
    expect(max.attributes('aria-valuemin')).toBe('20')
    expect(max.attributes('aria-valuemax')).toBe('100')
  })

  it('vertical：aria-orientation="vertical"（水平不输出该属性）', () => {
    expect(mount(Slider, { props: { vertical: true } }).find('.ui-slider__handle--min').attributes('aria-orientation')).toBe('vertical')
    expect(mount(Slider).find('.ui-slider__handle--min').attributes('aria-orientation')).toBeUndefined()
  })

  it('可读名称：range 两柄缺省「最小值/最大值」；ariaLabel prop 落低值柄；attrs aria-label 优先', () => {
    const range = mount(Slider, { props: { range: true } })
    expect(range.find('.ui-slider__handle--min').attributes('aria-label')).toBe('最小值')
    expect(range.find('.ui-slider__handle--max').attributes('aria-label')).toBe('最大值')

    expect(mount(Slider, { props: { ariaLabel: '音量' } }).find('.ui-slider__handle--min').attributes('aria-label')).toBe('音量')
    expect(mount(Slider, { attrs: { 'aria-label': '音量' } }).find('.ui-slider__handle--min').attributes('aria-label')).toBe('音量')
  })

  it('disabled：tabindex="-1" + aria-disabled="true"；loading：aria-busy="true" 且不落 aria-disabled', () => {
    const disabled = mount(Slider, { props: { disabled: true } }).find('.ui-slider__handle--min')
    expect(disabled.attributes('tabindex')).toBe('-1')
    expect(disabled.attributes('aria-disabled')).toBe('true')

    const loading = mount(Slider, { props: { loading: true } }).find('.ui-slider__handle--min')
    expect(loading.attributes('aria-busy')).toBe('true')
    expect(loading.attributes('aria-disabled')).toBeUndefined()
    expect(loading.attributes('tabindex')).toBe('0')
  })

  it('装饰层 aria-hidden：tooltip 气泡、刻度点与刻度标签不进读屏树', () => {
    const wrapper = mount(Slider, {
      props: { modelValue: 50, marks: [{ value: 0 }, { value: 100 }] },
    })
    expect(wrapper.find('.ui-slider__tooltip').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-slider__marks').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-slider__tick').attributes('aria-hidden')).toBe('true')
  })

  it('键盘全路径：八键步进后 aria-valuenow 随 v-model 回流更新', async () => {
    const cases = [
      { key: 'ArrowRight', expected: '51' },
      { key: 'ArrowUp', expected: '51' },
      { key: 'ArrowLeft', expected: '49' },
      { key: 'ArrowDown', expected: '49' },
      { key: 'PageUp', expected: '60' },
      { key: 'PageDown', expected: '40' },
      { key: 'Home', expected: '0' },
      { key: 'End', expected: '100' },
    ] as const
    for (const { key, expected } of cases) {
      const { wrapper } = mountHost()
      const handle = wrapper.find('.ui-slider__handle--min')
      await handle.trigger('keydown', { key })
      await nextTick()
      expect(handle.attributes('aria-valuenow')).toBe(expected)
      wrapper.unmount()
    }
  })

  it('处理过的按键 preventDefault（页面不滚动）；未处理按键不拦截不发事件', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 } })
    const handleEl = wrapper.find('.ui-slider__handle--min').element

    const handled = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    handleEl.dispatchEvent(handled)
    expect(handled.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([49])
    await wrapper.setProps({ modelValue: 49 })

    const ignored = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    handleEl.dispatchEvent(ignored)
    expect(ignored.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('range 高值柄键盘可达：← 移动高柄且值回流', async () => {
    const { wrapper, value } = mountHost({ range: true }, [20, 80])
    await wrapper.find('.ui-slider__handle--max').trigger('keydown', { key: 'ArrowLeft' })
    expect(value.value).toEqual([20, 79])
  })

  it('expose.focus() 把焦点交到柄上（键盘路径入口）', async () => {
    const wrapper = mount(Slider, { attachTo: document.body })
    const exposed = wrapper.vm as unknown as SliderExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('.ui-slider__handle--min').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('.ui-slider__handle--min').element)
    wrapper.unmount()
  })

  it('指针路径与键盘衔接：轨道点击后焦点落在被选中的柄上', async () => {
    const wrapper = mount(Slider, {
      props: { range: true, modelValue: [20, 80] },
      attachTo: document.body,
    })
    const rail = wrapper.find('.ui-slider__rail')
    const spy = vi.spyOn(rail.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 16,
      right: 100,
      bottom: 16,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)
    await rail.trigger('pointerdown', { clientX: 70 })
    expect(document.activeElement).toBe(wrapper.find('.ui-slider__handle--max').element)
    spy.mockRestore()
    wrapper.unmount()
  })
})
