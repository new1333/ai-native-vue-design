// a11y spec：role / aria 语义随模式 / roving tabindex / 键盘路径（方向键移焦、Space/Enter 不拦截）/ 禁用语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleGroup from './ToggleGroup.vue'
import ToggleItem from './ToggleItem.vue'
import type { ToggleGroupExpose } from './ToggleGroup.types'

const items = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

describe('ToggleGroup a11y', () => {
  it('single：容器 role=radiogroup，项 role=radio + aria-checked 真实反映选中', () => {
    const wrapper = mount(ToggleGroup, { props: { items, modelValue: 'b' } })
    expect(wrapper.attributes('role')).toBe('radiogroup')
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.attributes('role'))).toEqual(['radio', 'radio', 'radio'])
    expect(buttons.map((b) => b.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])
  })

  it('multiple：容器 role=group，项 role=button + aria-pressed（切换按钮语义）', () => {
    const wrapper = mount(ToggleGroup, {
      props: { items, type: 'multiple', modelValue: ['a', 'c'] },
    })
    expect(wrapper.attributes('role')).toBe('group')
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.attributes('role'))).toEqual(['button', 'button', 'button'])
    expect(buttons.map((b) => b.attributes('aria-pressed'))).toEqual(['true', 'false', 'true'])
    expect(buttons[0]!.attributes('aria-checked')).toBeUndefined()
  })

  it('roving tabindex：Tab 落点唯一——首个可用项 tabindex=0，其余 -1', () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    expect(wrapper.findAll('button').map((b) => b.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('方向键移焦（preventDefault 防滚动）：ArrowRight / ArrowLeft', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLButtonElement).focus()
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    buttons[0]!.element.dispatchEvent(right)
    expect(right.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[1]!.element)
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    buttons[1]!.element.dispatchEvent(left)
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('方向键移焦：ArrowUp / ArrowDown / Home / End 全路径', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLButtonElement).focus()
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    buttons[0]!.element.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[1]!.element)
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    buttons[1]!.element.dispatchEvent(up)
    expect(document.activeElement).toBe(buttons[0]!.element)
    const end = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    buttons[0]!.element.dispatchEvent(end)
    expect(document.activeElement).toBe(buttons[2]!.element)
    const home = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
    buttons[2]!.element.dispatchEvent(home)
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('Space / Enter 不被拦截（defaultPrevented=false，保留原生 button 激活路径）', () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const button = wrapper.findAll('button')[0]!.element
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    button.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    button.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('禁用项：原生 disabled（移出 Tab 序），不用 aria-disabled；方向键跳过', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { items: [{ ...items[0]!, disabled: true }, items[1]!, items[2]!] },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('disabled')).toBeDefined()
    expect(buttons[0]!.attributes('aria-disabled')).toBeUndefined()
    expect(buttons[0]!.attributes('tabindex')).toBe('-1')
    ;(buttons[1]!.element as HTMLButtonElement).focus()
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    buttons[1]!.element.dispatchEvent(left) // 前一项禁用 → 环绕跳到最后一个可用项
    expect(document.activeElement).toBe(buttons[2]!.element)
    wrapper.unmount()
  })

  it('整组禁用：全部按钮原生 disabled，组不可 Tab 进入（无 tabindex=0）', () => {
    const wrapper = mount(ToggleGroup, { props: { items, disabled: true } })
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.attributes('tabindex')).toBe('-1')
    }
  })

  it('expose.focus：聚焦组内首个可用项（Tab 进入组的编程式入口）', () => {
    const wrapper = mount(ToggleGroup, {
      props: { items: [{ ...items[0]!, disabled: true }, items[1]!, items[2]!] },
      attachTo: document.body,
    })
    ;(wrapper.vm as unknown as ToggleGroupExpose).focus()
    expect(document.activeElement).toBe(wrapper.findAll('button')[1]!.element)
    wrapper.unmount()
  })

  it('可读名称：组容器经 attrs 提供 aria-label；单项文案即按钮可读名称', () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attrs: { 'aria-label': '视图切换' } })
    expect(wrapper.attributes('aria-label')).toBe('视图切换')
    expect(wrapper.findAll('button')[0]!.text()).toBe('甲')
  })

  it('attrs 落位：组级 attrs 落容器；单项 attrs 透传（inheritAttrs:false）直达按钮', () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attrs: { 'aria-label': '视图切换' } })
    expect(wrapper.attributes('aria-label')).toBe('视图切换')
    const item = mount(ToggleItem, {
      props: { value: 'a', label: '甲' },
      attrs: { 'aria-describedby': 'hint-x' },
    })
    expect(item.attributes('aria-describedby')).toBe('hint-x')
    item.unmount()
    wrapper.unmount()
  })
})
