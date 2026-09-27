// api spec：props 默认值 / DOM 契约 / slots 渲染（含作用域）/ attrs 透传 / 暴露方法。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Slider from './Slider.vue'
import type { SliderExpose } from './Slider.types'

describe('Slider api', () => {
  it('渲染 ui-slider 根容器、轨道与单柄（role=slider），默认不渲染高值柄', () => {
    const wrapper = mount(Slider)
    expect(wrapper.classes()).toContain('ui-slider')
    expect(wrapper.find('.ui-slider__rail').exists()).toBe(true)
    expect(wrapper.find('.ui-slider__handle--min').exists()).toBe(true)
    expect(wrapper.find('.ui-slider__handle--max').exists()).toBe(false)
    expect(wrapper.find('.ui-slider__handle--min').attributes('role')).toBe('slider')
  })

  it('默认档：min=0 / max=100，modelValue 未传回落 min（aria-valuenow="0"）且可聚焦', () => {
    const handle = mount(Slider).find('.ui-slider__handle--min')
    expect(handle.attributes('aria-valuemin')).toBe('0')
    expect(handle.attributes('aria-valuemax')).toBe('100')
    expect(handle.attributes('aria-valuenow')).toBe('0')
    expect(handle.attributes('tabindex')).toBe('0')
  })

  it('modelValue 单值渲染 aria-valuenow；min/max props 透传值域', () => {
    const handle = mount(Slider, { props: { modelValue: 42, min: 10, max: 50 } }).find('.ui-slider__handle--min')
    expect(handle.attributes('aria-valuenow')).toBe('42')
    expect(handle.attributes('aria-valuemin')).toBe('10')
    expect(handle.attributes('aria-valuemax')).toBe('50')
  })

  it('range：双柄渲染，aria-valuenow 各自落位且互为值域边界', () => {
    const wrapper = mount(Slider, { props: { range: true, modelValue: [20, 80] } })
    const min = wrapper.find('.ui-slider__handle--min')
    const max = wrapper.find('.ui-slider__handle--max')
    expect(min.attributes('aria-valuenow')).toBe('20')
    expect(min.attributes('aria-valuemax')).toBe('80')
    expect(max.attributes('aria-valuenow')).toBe('80')
    expect(max.attributes('aria-valuemin')).toBe('20')
  })

  it('range 收到乱序二元组：规范化为升序（aria 按低/高柄落位）', () => {
    const wrapper = mount(Slider, { props: { range: true, modelValue: [80, 20] } })
    expect(wrapper.find('.ui-slider__handle--min').attributes('aria-valuenow')).toBe('20')
    expect(wrapper.find('.ui-slider__handle--max').attributes('aria-valuenow')).toBe('80')
  })

  it('vertical：ui-slider--vertical 修饰类 + aria-orientation="vertical"', () => {
    const wrapper = mount(Slider, { props: { vertical: true } })
    expect(wrapper.classes()).toContain('ui-slider--vertical')
    expect(wrapper.find('.ui-slider__handle--min').attributes('aria-orientation')).toBe('vertical')
    expect(mount(Slider).find('.ui-slider__handle--min').attributes('aria-orientation')).toBeUndefined()
  })

  it('disabled：根修饰类 ui-slider--disabled + 柄 tabindex="-1" + aria-disabled="true"', () => {
    const wrapper = mount(Slider, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('ui-slider--disabled')
    const handle = wrapper.find('.ui-slider__handle--min')
    expect(handle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('aria-disabled')).toBe('true')
  })

  it('loading：aria-busy="true" 且不落 aria-disabled、保持可聚焦（tabindex=0）', () => {
    const handle = mount(Slider, { props: { loading: true } }).find('.ui-slider__handle--min')
    expect(handle.attributes('aria-busy')).toBe('true')
    expect(handle.attributes('aria-disabled')).toBeUndefined()
    expect(handle.attributes('tabindex')).toBe('0')
  })

  it('ariaLabel prop 落在低值柄；range 模式两柄缺省「最小值/最大值」', () => {
    expect(mount(Slider, { props: { ariaLabel: '音量' } }).find('.ui-slider__handle--min').attributes('aria-label')).toBe('音量')

    const range = mount(Slider, { props: { range: true } })
    expect(range.find('.ui-slider__handle--min').attributes('aria-label')).toBe('最小值')
    expect(range.find('.ui-slider__handle--max').attributes('aria-label')).toBe('最大值')
  })

  it('marks：渲染刻度点与标签行，label 优先于数值', () => {
    const wrapper = mount(Slider, {
      props: { modelValue: 50, marks: [{ value: 0, label: '低' }, { value: 50 }, { value: 100 }] },
    })
    expect(wrapper.findAll('.ui-slider__tick')).toHaveLength(3)
    const labels = wrapper.findAll('.ui-slider__mark')
    expect(labels).toHaveLength(3)
    expect(labels[0].text()).toBe('低')
    expect(labels[1].text()).toBe('50')
    expect(wrapper.find('.ui-slider__tick--reached').exists()).toBe(true)
  })

  it('marks 未传：不渲染刻度点与标签行', () => {
    const wrapper = mount(Slider)
    expect(wrapper.find('.ui-slider__tick').exists()).toBe(false)
    expect(wrapper.find('.ui-slider__marks').exists()).toBe(false)
  })

  it('tooltip：缺省渲染当前数值；作用域插槽可自定义（scope.value）', () => {
    const plain = mount(Slider, { props: { modelValue: 42 } })
    expect(plain.find('.ui-slider__tooltip').text()).toBe('42')

    const scoped = mount(Slider, {
      props: { modelValue: 42 },
      slots: { tooltip: ({ value }: { value: number }) => h('span', `${value}%`) },
    })
    expect(scoped.find('.ui-slider__tooltip').text()).toBe('42%')
  })

  it('marks 作用域插槽：收到 mark 与 reached', () => {
    const wrapper = mount(Slider, {
      props: { modelValue: 50, marks: [{ value: 0, label: '低' }, { value: 100, label: '高' }] },
      slots: {
        marks: ({ mark, reached }: { mark: { label?: string }, reached: boolean }) =>
          h('em', { 'data-reached': String(reached) }, mark.label ?? ''),
      },
    })
    const items = wrapper.findAll('.ui-slider__mark em')
    expect(items).toHaveLength(2)
    expect(items[0].attributes('data-reached')).toBe('true')
    expect(items[1].attributes('data-reached')).toBe('false')
  })

  it('attrs 透传（inheritAttrs:false）：aria-label / aria-describedby / id 落在低值柄，不落根容器', () => {
    const wrapper = mount(Slider, {
      attrs: { 'aria-label': '音量', 'aria-describedby': 'volume-hint', id: 'volume-slider' },
    })
    const handle = wrapper.find('.ui-slider__handle--min')
    expect(handle.attributes('aria-label')).toBe('音量')
    expect(handle.attributes('aria-describedby')).toBe('volume-hint')
    expect(handle.attributes('id')).toBe('volume-slider')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('id')).toBeUndefined()
  })

  it('expose focus / blur 为可调用方法', () => {
    const wrapper = mount(Slider)
    const exposed = wrapper.vm as unknown as SliderExpose
    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')
  })

  it('内联定位：水平柄落 left、垂直柄落 bottom，填充随模式切换轴向', () => {
    const horizontal = mount(Slider, { props: { modelValue: 25 } })
    const hHandle = horizontal.find('.ui-slider__handle--min').element as HTMLElement
    const hFill = horizontal.find('.ui-slider__fill').element as HTMLElement
    expect(hHandle.style.left).toBe('25%')
    expect(hFill.style.width).toBe('25%')

    const vertical = mount(Slider, { props: { modelValue: 25, vertical: true } })
    const vHandle = vertical.find('.ui-slider__handle--min').element as HTMLElement
    const vFill = vertical.find('.ui-slider__fill').element as HTMLElement
    expect(vHandle.style.bottom).toBe('25%')
    expect(vFill.style.height).toBe('25%')
  })
})
