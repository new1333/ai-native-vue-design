// behavior spec：single/multiple 切换路径 / v-model 双向 / 受控拒改 / 禁用拦截 / roving tabindex 键盘导航。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import ToggleGroup from './ToggleGroup.vue'
import type { ToggleGroupExpose, ToggleValue } from './ToggleGroup.types'

const items = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

describe('ToggleGroup behavior', () => {
  it('single：点击发出 update:modelValue 与 change（载荷为该值），选中态随受控值落位', async () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    const first = wrapper.findAll('button')[0]!
    await first.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    expect(wrapper.emitted('change')).toEqual([['a']])
    // 受控：父层回写后选中态才落位
    await wrapper.setProps({ modelValue: 'a' })
    expect(first.classes()).toContain('ui-toggle-item--checked')
    expect(first.attributes('aria-checked')).toBe('true')
  })

  it('single：radio 语义不反选——点击已选项不发出任何事件', async () => {
    const wrapper = mount(ToggleGroup, { props: { items, modelValue: 'a' } })
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('single 受控拒改：父层不回写时 DOM 选中态保持原值', async () => {
    const wrapper = mount(ToggleGroup, { props: { items, modelValue: 'a' } })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.findAll('button')[1]!.classes()).not.toContain('ui-toggle-item--checked')
    expect(wrapper.findAll('button')[0]!.classes()).toContain('ui-toggle-item--checked')
  })

  it('multiple：点击增删数组，载荷为切换后的完整数组；v-model 双向回落 aria-pressed', async () => {
    const selected = ref<ToggleValue[]>(['a'])
    const Host = defineComponent({
      setup: () => () =>
        h(ToggleGroup, {
          items,
          type: 'multiple',
          modelValue: selected.value,
          'onUpdate:modelValue': (v: ToggleValue | ToggleValue[]) => {
            selected.value = v as ToggleValue[]
          },
        }),
    })
    const wrapper = mount(Host)
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    expect(selected.value).toEqual(['a', 'b'])
    await wrapper.vm.$nextTick()
    expect(buttons[1]!.attributes('aria-pressed')).toBe('true')
    await buttons[0]!.trigger('click')
    expect(selected.value).toEqual(['b'])
    await wrapper.vm.$nextTick()
    expect(buttons[0]!.attributes('aria-pressed')).toBe('false')
  })

  it('整组禁用：点击被拦截，不发出任何事件', async () => {
    const wrapper = mount(ToggleGroup, { props: { items, disabled: true } })
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('单项禁用：该点击被拦截，其余项切换路径正常', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { items: [items[0]!, { ...items[1]!, disabled: true }, items[2]!] },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
  })

  it('roving tabindex：ArrowRight 移动焦点并改写 tabindex（方向键只移焦，不选中）', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('tabindex')).toBe('0')
    await buttons[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1]!.element)
    expect(buttons[0]!.attributes('tabindex')).toBe('-1')
    expect(buttons[1]!.attributes('tabindex')).toBe('0')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('方向键环绕 + 双向 + 垂直方向键均可导航', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('keydown', { key: 'ArrowLeft' }) // 首项左移环绕到末项
    expect(document.activeElement).toBe(buttons[2]!.element)
    await buttons[2]!.trigger('keydown', { key: 'ArrowRight' }) // 末项右移环绕回首项
    expect(document.activeElement).toBe(buttons[0]!.element)
    await buttons[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[1]!.element)
    await buttons[1]!.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('Home / End：跳转首个 / 末个可用项', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(buttons[2]!.element)
    await buttons[2]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('禁用项被方向键跳过：roving 初值落在首个可用项', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { items: [{ ...items[0]!, disabled: true }, items[1]!, items[2]!] },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('tabindex')).toBe('-1')
    expect(buttons[1]!.attributes('tabindex')).toBe('0')
    await buttons[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[2]!.element)
    wrapper.unmount()
  })

  it('真实焦点同步 roving 状态：expose.focus 落点即活动项（tabindex 跟随）', async () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    const buttons = wrapper.findAll('button')
    ;(wrapper.vm as unknown as ToggleGroupExpose).focus()
    expect(document.activeElement).toBe(buttons[0]!.element)
    ;(buttons[2]!.element as HTMLButtonElement).focus()
    await wrapper.vm.$nextTick()
    expect(buttons[2]!.attributes('tabindex')).toBe('0')
    expect(buttons[0]!.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('roving-active 项被禁用时交还 fallback：Tab 落点回到首个可用项', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { items, modelValue: 'b' },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('button')
    ;(buttons[1]!.element as HTMLButtonElement).focus()
    await wrapper.vm.$nextTick()
    expect(buttons[1]!.attributes('tabindex')).toBe('0')
    const next = [{ ...items[0] }, { ...items[1]!, disabled: true }, { ...items[2] }]
    await wrapper.setProps({ items: next })
    expect(buttons[1]!.attributes('tabindex')).toBe('-1')
    expect(buttons[0]!.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('roving-active 项被移除后回退到首个可用项', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { items, modelValue: 'c' },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('button')
    ;(buttons[2]!.element as HTMLButtonElement).focus()
    await wrapper.vm.$nextTick()
    expect(buttons[2]!.attributes('tabindex')).toBe('0')
    await wrapper.setProps({ items: [items[0]!, items[1]!] })
    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(wrapper.findAll('button')[0]!.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })
})
