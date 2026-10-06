// a11y spec：radiogroup 语义 / name 分组 / 原生键盘路径不拦截 / 键盘选中经组转发（自 Radio.a11y.spec.ts 移入的 RadioGroup 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'
import type { RadioValue } from './Radio.types'

function mountGroup(
  radios: Array<{ value: RadioValue; label?: string; disabled?: boolean }>,
  groupProps: Record<string, unknown> = {},
) {
  return mount(RadioGroup, {
    props: { name: 'plan', ...groupProps },
    slots: { default: () => radios.map((r) => h(Radio, { key: r.value, ...r })) },
    attachTo: document.body,
  })
}

describe('RadioGroup a11y', () => {
  it('组容器 role="radiogroup"，attrs 的 aria-label 落容器', () => {
    const wrapper = mountGroup([{ value: 'a', label: '甲' }], { 'aria-label': '套餐' })
    expect(wrapper.attributes('role')).toBe('radiogroup')
    expect(wrapper.attributes('aria-label')).toBe('套餐')
  })

  it('组内 radio 共享组 name（原生互斥与方向键导航的分组依据）', () => {
    const wrapper = mountGroup([{ value: 'a' }, { value: 'b' }])
    for (const input of wrapper.findAll('input')) {
      expect(input.attributes('name')).toBe('plan')
    }
  })

  it('键盘方向键 / Space 均为原生路径：keydown 不被组件拦截（defaultPrevented=false）', () => {
    const wrapper = mountGroup([{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    const control = wrapper.findAll('input')[1]!.element as HTMLInputElement
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowUp', 'ArrowLeft', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    wrapper.unmount()
  })

  it('键盘选中路径：聚焦后原生 change 以该 Radio 的 value 发出（经组转发）', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a', label: '甲' })] },
      attachTo: document.body,
    })
    const control = wrapper.find('input')
    ;(control.element as HTMLInputElement).focus()
    expect(document.activeElement).toBe(control.element)
    await control.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    wrapper.unmount()
  })
})
