// behavior spec：开合 / 选中 / v-model 双向 / 清空 / 点击外部关闭 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Select from './Select.vue'
import { useSelect } from './useSelect'
import type { SelectOption, SelectValue } from './Select.types'

const OPTIONS: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '归档', value: 'archived', disabled: true },
  { label: '删除', value: 'deleted', disabled: true },
]

describe('Select behavior', () => {
  it('点击触发器打开弹层（Teleport 到 body），再点一次切换关闭', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-select__trigger')
    await trigger.trigger('click')
    let listbox = document.querySelector('.ui-select__listbox')
    expect(listbox).not.toBeNull()
    expect(listbox?.parentElement).toBe(document.body)
    await trigger.trigger('click')
    listbox = document.querySelector('.ui-select__listbox')
    expect(listbox).toBeNull()
    wrapper.unmount()
  })

  it('点击选项：发出 update:modelValue 并关闭弹层', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-select__option')[1] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['published']])
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('v-model 双向绑定：选中更新父状态，父状态变化回落触发器文案', async () => {
    const value = ref<SelectValue | null>('draft')
    const Host = defineComponent({
      setup: () => () =>
        h(Select, {
          options: OPTIONS,
          modelValue: value.value,
          'onUpdate:modelValue': (v: SelectValue | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    expect(wrapper.find('button.ui-select__trigger').text()).toContain('草稿')
    await wrapper.find('button.ui-select__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-select__option')[1] as HTMLElement).click()
    await nextTick()
    expect(value.value).toBe('published')
    expect(wrapper.find('button.ui-select__trigger').text()).toContain('已发布')
    value.value = 'archived'
    await nextTick()
    expect(wrapper.find('button.ui-select__trigger').text()).toContain('归档')
    wrapper.unmount()
  })

  it('点击禁用选项：不发出 update:modelValue，弹层保持打开', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-select__option')[2] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-select__listbox')).not.toBeNull()
    wrapper.unmount()
  })

  it('清空按钮：发出 update:modelValue(null) 与 clear，回落占位并交还焦点', async () => {
    const value = ref<SelectValue | null>('draft')
    const Host = defineComponent({
      setup: () => () =>
        h(Select, {
          options: OPTIONS,
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: SelectValue | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button.ui-select__clear').trigger('click')
    expect(value.value).toBeNull()
    expect(wrapper.getComponent(Select).emitted('clear')).toHaveLength(1)
    expect(wrapper.find('button.ui-select__trigger').text()).toContain('请选择')
    expect(document.activeElement).toBe(wrapper.find('button.ui-select__trigger').element)
    wrapper.unmount()
  })

  it('点击外部关闭：弹层内/触发器外目标触发关闭且不发 update:modelValue', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()
    wrapper.unmount()
  })

  it('触发器 blur（Tab 路径）关闭弹层', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    expect(document.querySelector('.ui-select__listbox')).not.toBeNull()
    await wrapper.find('button.ui-select__trigger').trigger('blur')
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('disabled：点击触发器不打开弹层', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, disabled: true } })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
  })

  it('打开时按触发器 rect 计算弹层定位（top/left/minWidth 内联落位）', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    const style = document.querySelector('.ui-select__listbox')?.getAttribute('style') ?? ''
    expect(style).toContain('top:')
    expect(style).toContain('left:')
    expect(style).toContain('min-width:')
    wrapper.unmount()
  })

  it('打开时弹层定位计入页面滚动偏移（视口 rect + scrollX/scrollY → 文档坐标）', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-select__trigger')
    // 桩定触发器视口 rect，模拟「页面滚动后触发器位于视口中下方」的场景
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 120, 160, 32))
    // happy-dom：window.scrollX/scrollY 读取 documentElement 的 scrollLeft/scrollTop
    document.documentElement.scrollLeft = 30
    document.documentElement.scrollTop = 400
    await trigger.trigger('click')
    await nextTick()
    const style = (document.querySelector('.ui-select__listbox')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('top:552px') // rect.bottom 152 + scrollY 400
    expect(style).toContain('left:50px') // rect.left 20 + scrollX 30
    expect(style).toContain('min-width:160px') // rect.width 不受滚动影响
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    await wrapper.find('button.ui-select__trigger').trigger('click')
    expect(document.querySelector('.ui-select__listbox')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('useSelect 纯状态机：↓/↑ 导航跳过禁用项并在两端夹住，Home/End 首尾', () => {
    const state = useSelect({ options: OPTIONS, modelValue: () => null })
    state.openList()
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0) // 已选缺失 → 首个可选
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 跳过 index=2/3 的禁用项
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 末个可选处夹住
    state.moveActive(-1)
    expect(state.activeIndex.value).toBe(0)
    state.toEdge('last')
    expect(state.activeIndex.value).toBe(1)
    state.toEdge('first')
    expect(state.activeIndex.value).toBe(0)
  })

  it('useSelect 纯状态机：select 走 onSelect 出口，禁用项与越界下标被忽略', () => {
    const onSelect = vi.fn()
    const state = useSelect({ options: OPTIONS, modelValue: () => null, onSelect })
    state.select(2)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(99)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(1)
    expect(onSelect).toHaveBeenCalledWith('published')
    expect(state.open.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
  })

  it('useSelect 纯状态机：disabled 总闸拦截开合与键盘', () => {
    const state = useSelect({ options: OPTIONS, modelValue: () => null, disabled: () => true })
    state.toggleList()
    expect(state.open.value).toBe(false)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    state.handleKeydown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  it('useSelect 纯状态机：打开落位优先已选值（即使其不是首个可选）', () => {
    const state = useSelect({ options: OPTIONS, modelValue: () => 'published' })
    state.openList()
    expect(state.activeIndex.value).toBe(1)
    expect(state.selectedOption.value?.label).toBe('已发布')
  })
})
