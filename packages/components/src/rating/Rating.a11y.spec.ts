// a11y spec：radiogroup/radio 语义 / aria-checked / roving tabindex / 键盘路径 / aria-readonly / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Rating from './Rating.vue'
import type { RatingExpose } from './Rating.types'

describe('Rating a11y', () => {
  it('根 role="radiogroup"，attrs 的 aria-label 落根容器', () => {
    const wrapper = mount(Rating, { props: { count: 3 }, attrs: { 'aria-label': '满意度' } })
    expect(wrapper.attributes('role')).toBe('radiogroup')
    expect(wrapper.attributes('aria-label')).toBe('满意度')
  })

  it('每档为原生 button + role="radio"，aria-checked 常驻（true/false），并带可读名称', () => {
    const wrapper = mount(Rating, { props: { count: 3, modelValue: 2 } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(3)
    for (const [i, radio] of radios.entries()) {
      expect(radio.element.tagName).toBe('BUTTON')
      expect(radio.attributes('type')).toBe('button')
      expect(['true', 'false']).toContain(radio.attributes('aria-checked'))
      expect(radio.attributes('aria-label')).toBe(`${i + 1} 星`)
    }
    expect(radios[1]?.attributes('aria-checked')).toBe('true')
    expect(radios[0]?.attributes('aria-checked')).toBe('false')
  })

  it('roving tabindex：已选档 0、其余 -1；未选时首档 0', () => {
    const checked = mount(Rating, { props: { count: 4, modelValue: 2 } })
    const radios = checked.findAll('[role="radio"]')
    expect(radios.map((r) => r.attributes('tabindex'))).toEqual(['-1', '0', '-1', '-1'])

    const none = mount(Rating, { props: { count: 3 } })
    expect(none.findAll('[role="radio"]').map((r) => r.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('readonly：aria-readonly="true" 且全档 tabindex=-1（移出 Tab 序）', () => {
    const wrapper = mount(Rating, { props: { count: 3, readonly: true, modelValue: 2 } })
    expect(wrapper.attributes('aria-readonly')).toBe('true')
    expect(wrapper.findAll('[role="radio"]').map((r) => r.attributes('tabindex'))).toEqual(['-1', '-1', '-1'])
  })

  it('键盘步进路径：方向键被受理（preventDefault）并逐档选中', async () => {
    const wrapper = mount(Rating, {
      props: { count: 4, modelValue: 1 },
      attrs: { 'aria-label': '评分' },
      attachTo: document.body,
    })
    const radios = wrapper.findAll('[role="radio"]')
    ;(radios[0]?.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(radios[0]?.element)

    await radios[0]?.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    expect(document.activeElement).toBe(wrapper.findAll('[role="radio"]')[1]?.element)

    await wrapper.findAll('[role="radio"]')[1]?.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[2], [3]])
    wrapper.unmount()
  })

  it('Enter / Space 走原生 button 激活路径：keydown 不被组件拦截（defaultPrevented=false）', () => {
    const wrapper = mount(Rating, { props: { count: 3 }, attachTo: document.body })
    const control = wrapper.findAll('[role="radio"]')[1]?.element as HTMLButtonElement
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    wrapper.unmount()
  })

  it('键盘清除路径：clearable 时聚焦档位按 Delete/Backspace 清空为未评分（preventDefault）', () => {
    const wrapper = mount(Rating, {
      props: { count: 3, modelValue: 2, clearable: true },
      attachTo: document.body,
    })
    const control = wrapper.findAll('[role="radio"]')[1]?.element as HTMLButtonElement
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const key of ['Delete', 'Backspace']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true) // Backspace 不得触发浏览器后退
    }
    expect(wrapper.emitted('update:modelValue')).toEqual([[undefined], [undefined]])
    wrapper.unmount()
  })

  it('半星键盘路径：allowHalf 时方向键以 0.5 粒度步进', async () => {
    const wrapper = mount(Rating, {
      props: { count: 2, allowHalf: true, modelValue: 0.5 },
      attachTo: document.body,
    })
    const radios = wrapper.findAll('[role="radio"]') // [0.5, 1, 1.5, 2]
    ;(radios[0]?.element as HTMLButtonElement).focus()
    await radios[0]?.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    wrapper.unmount()
  })

  it('图标层为纯装饰（aria-hidden），评分语义由 radio 承载', () => {
    const wrapper = mount(Rating, { props: { count: 2, modelValue: 1 } })
    for (const icon of wrapper.findAll('.ui-rating__icon')) {
      expect(icon.attributes('aria-hidden')).toBe('true')
    }
  })

  it('expose.focus()/blur() 落在 roving 落点档位上（键盘用户入口）', () => {
    const wrapper = mount(Rating, { props: { count: 3, modelValue: 3 }, attachTo: document.body })
    const exposed = wrapper.vm as unknown as RatingExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.findAll('[role="radio"]')[2]?.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.findAll('[role="radio"]')[2]?.element)
    wrapper.unmount()
  })

  it('键盘选中路径：聚焦后原生 click 以该档值发出（Space 激活的等价路径）', async () => {
    const wrapper = mount(Rating, { props: { count: 3 }, attachTo: document.body })
    const control = wrapper.findAll('[role="radio"]')[1]?.element as HTMLButtonElement
    control.focus()
    expect(document.activeElement).toBe(control)
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    wrapper.unmount()
  })
})
