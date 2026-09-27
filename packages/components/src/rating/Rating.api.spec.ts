// api spec：Rating 的 props 默认值、emits 声明、slots 渲染、attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Rating from './Rating.vue'

describe('Rating api', () => {
  it('渲染 ui-rating 根容器并携带 role="radiogroup"', () => {
    const wrapper = mount(Rating)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-rating')
    expect(wrapper.attributes('role')).toBe('radiogroup')
  })

  it('默认 count=5：渲染 5 枚整星档 radio；attrs 的 aria-label 落根容器', () => {
    const wrapper = mount(Rating, { attrs: { 'aria-label': '满意度' } })
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(5)
    expect(wrapper.attributes('aria-label')).toBe('满意度')
  })

  it('count 自定义：渲染对应星数；非正数不渲染', () => {
    expect(mount(Rating, { props: { count: 3 } }).findAll('[role="radio"]')).toHaveLength(3)
    expect(mount(Rating, { props: { count: 0 } }).findAll('[role="radio"]')).toHaveLength(0)
  })

  it('allowHalf：每星拆 lead/trail 两个半档 radio（总数 ×2）且根带 --half 修饰', () => {
    const wrapper = mount(Rating, { props: { count: 4, allowHalf: true } })
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(8)
    expect(wrapper.classes()).toContain('ui-rating--half')
    expect(wrapper.findAll('.ui-rating__radio--lead')).toHaveLength(4)
    expect(wrapper.findAll('.ui-rating__radio--trail')).toHaveLength(4)
  })

  it('未传 modelValue：无 aria-checked="true"，首档 tabindex="0"（roving 落点）', () => {
    const wrapper = mount(Rating, { props: { count: 3 } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.filter((r) => r.attributes('aria-checked') === 'true')).toHaveLength(0)
    expect(radios[0]?.attributes('tabindex')).toBe('0')
    expect(radios[1]?.attributes('tabindex')).toBe('-1')
  })

  it('modelValue 命中档位：该档 aria-checked="true" 且 tabindex="0"，其余 -1', () => {
    const wrapper = mount(Rating, { props: { count: 5, modelValue: 3 } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios[2]?.attributes('aria-checked')).toBe('true')
    expect(radios[2]?.attributes('tabindex')).toBe('0')
    expect(radios[0]?.attributes('tabindex')).toBe('-1')
    expect(radios[3]?.attributes('tabindex')).toBe('-1')
  })

  it('modelValue 越界（> count）：roving 落点退回首档，且无命中档', () => {
    const wrapper = mount(Rating, { props: { count: 3, modelValue: 9 } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.filter((r) => r.attributes('aria-checked') === 'true')).toHaveLength(0)
    expect(radios[0]?.attributes('tabindex')).toBe('0')
  })

  it('每档 radio 携带可读名称（档位值 + 星）；半星档为 0.5 粒度', () => {
    const wrapper = mount(Rating, { props: { count: 2, allowHalf: true } })
    const labels = wrapper.findAll('[role="radio"]').map((r) => r.attributes('aria-label'))
    expect(labels).toEqual(['0.5 星', '1 星', '1.5 星', '2 星'])
  })

  it('readonly：根带 --readonly 与 aria-readonly="true"，全部档位移出 Tab 序', () => {
    const wrapper = mount(Rating, { props: { readonly: true, modelValue: 2 } })
    expect(wrapper.classes()).toContain('ui-rating--readonly')
    expect(wrapper.attributes('aria-readonly')).toBe('true')
    for (const radio of wrapper.findAll('[role="radio"]')) {
      expect(radio.attributes('tabindex')).toBe('-1')
    }
  })

  it('非只读时不输出 aria-readonly', () => {
    expect(mount(Rating, { props: { count: 2 } }).attributes('aria-readonly')).toBeUndefined()
  })

  it('icon 插槽：作用域携带 index / value / state，替换默认星形', () => {
    const wrapper = mount(Rating, {
      props: { count: 3, modelValue: 2, allowHalf: true },
      slots: {
        icon: (scope: { index: number; value: number; state: string }) =>
          h('i', { 'data-testid': 'icon' }, `${scope.index}-${scope.value}-${scope.state}`),
      },
    })
    const icons = wrapper.findAll('[data-testid="icon"]')
    expect(icons).toHaveLength(3)
    expect(icons[0]?.text()).toBe('1-1-full')
    expect(icons[1]?.text()).toBe('2-2-full')
    expect(icons[2]?.text()).toBe('3-3-empty')
    expect(wrapper.find('.ui-rating__glyph').exists()).toBe(false)
  })

  it('默认星形：内联 SVG（背景描边层 + 填充层）且图标层 aria-hidden', () => {
    const wrapper = mount(Rating, { props: { count: 1 } })
    const icon = wrapper.find('.ui-rating__icon')
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('svg.ui-rating__glyph').exists()).toBe(true)
    expect(wrapper.find('svg.ui-rating__glyph--fill').exists()).toBe(true)
  })

  it('emits 声明：update:modelValue 与 hoverChange（载荷断言见 behavior spec）', async () => {
    const wrapper = mount(Rating, { props: { count: 3 } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
  })
})
