// behavior spec：开合 / 选中 / v-model 双向 / change 载荷 / 加载闸门 / 点击外部关闭 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import ModelSelector from './ModelSelector.vue'
import { useModelSelector } from './useModelSelector'
import type { ModelSelectorModel, ModelSelectorValue } from './ModelSelector.types'

const MODELS: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude', value: 'claude', provider: 'Anthropic' },
  { label: '旗舰模型', value: 'flagship', provider: 'OpenAI', disabled: true },
  { label: '本地推理', value: 'local', disabled: true },
]

describe('ModelSelector behavior', () => {
  it('点击触发器打开弹层（Teleport 到 body），再点一次切换关闭', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    await trigger.trigger('click')
    const popup = document.querySelector('.ui-model-selector__popup')
    expect(popup?.parentElement).toBe(document.body) // Teleport 直挂 body
    const listbox = popup?.querySelector('.ui-model-selector__listbox')
    expect(listbox).not.toBeNull()
    expect(listbox?.parentElement).toBe(popup) // 面板内承载 listbox
    await trigger.trigger('click')
    expect(document.querySelector('.ui-model-selector__popup')).toBeNull()
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('点击模型：发出 update:modelValue 与 change（载荷为完整模型对象）并关闭弹层', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-model-selector__option')[1] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['claude']])
    expect(wrapper.emitted('change')).toEqual([
      [{ label: 'Claude', value: 'claude', provider: 'Anthropic' }],
    ])
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('v-model 双向绑定：选中更新父状态，父状态变化回落触发器文案', async () => {
    const value = ref<ModelSelectorValue | null>('gpt-4o')
    const Host = defineComponent({
      setup: () => () =>
        h(ModelSelector, {
          models: MODELS,
          modelValue: value.value,
          'onUpdate:modelValue': (v: ModelSelectorValue) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    expect(wrapper.find('button.ui-model-selector__trigger').text()).toContain('GPT-4o')
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-model-selector__option')[1] as HTMLElement).click()
    await nextTick()
    expect(value.value).toBe('claude')
    expect(wrapper.find('button.ui-model-selector__trigger').text()).toContain('Claude')
    value.value = 'flagship'
    await nextTick()
    expect(wrapper.find('button.ui-model-selector__trigger').text()).toContain('旗舰模型')
    wrapper.unmount()
  })

  it('点击禁用模型：不发 update:modelValue/change，弹层保持打开', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    ;(document.querySelectorAll('.ui-model-selector__option')[2] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(document.querySelector('.ui-model-selector__listbox')).not.toBeNull()
    wrapper.unmount()
  })

  it('loading 闸门：弹层显示加载文案、无选项，点击/键盘均不上抛选中', async () => {
    const wrapper = mount(ModelSelector,
      { props: { models: MODELS, loading: true }, attachTo: document.body },
    )
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    await trigger.trigger('click')
    expect(document.querySelector('.ui-model-selector__loading')).not.toBeNull()
    expect(document.querySelector('.ui-model-selector__option')).toBeNull()
    // 高亮被加载闸门清空：Enter 无高亮项可选
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('loading：点击加载文案行（弹层面板内、listbox 外）不关闭弹层', async () => {
    const wrapper = mount(ModelSelector,
      { props: { models: MODELS, loading: true }, attachTo: document.body },
    )
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    ;(document.querySelector('.ui-model-selector__loading') as HTMLElement).click()
    await nextTick()
    expect(document.querySelector('.ui-model-selector__popup')).not.toBeNull()
    wrapper.unmount()
  })

  it('loading 结束后恢复可选：同一实例关闸后选中路径恢复', async () => {
    const loading = ref(true)
    const selected = ref<ModelSelectorValue | null>(null)
    const Host = defineComponent({
      setup: () => () =>
        h(ModelSelector, {
          models: MODELS,
          loading: loading.value,
          'onUpdate:modelValue': (v: ModelSelectorValue) => {
            selected.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    await trigger.trigger('click')
    expect(document.querySelector('.ui-model-selector__loading')).not.toBeNull()
    loading.value = false
    await nextTick()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(selected.value).toBe('gpt-4o')
    expect(wrapper.getComponent(ModelSelector).emitted('update:modelValue')).toEqual([['gpt-4o']])
    wrapper.unmount()
  })

  it('点击外部关闭：弹层内/触发器外目标触发关闭且不上抛事件', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()
    wrapper.unmount()
  })

  it('触发器 blur（Tab 路径）关闭弹层', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__listbox')).not.toBeNull()
    await wrapper.find('button.ui-model-selector__trigger').trigger('blur')
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('disabled：点击触发器不打开弹层', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS, disabled: true } })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__listbox')).toBeNull()
  })

  it('打开时按触发器 rect 计算弹层定位（top/left/min-width 内联落位）', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    const style = document.querySelector('.ui-model-selector__popup')?.getAttribute('style') ?? ''
    expect(style).toContain('top:')
    expect(style).toContain('left:')
    expect(style).toContain('min-width:')
    wrapper.unmount()
  })

  it('打开时弹层定位计入页面滚动偏移（视口 rect + scrollX/scrollY → 文档坐标）', async () => {
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-model-selector__trigger')
    // 桩定触发器视口 rect，模拟「页面滚动后触发器位于视口中下方」的场景
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 120, 160, 32))
    // happy-dom：window.scrollX/scrollY 读取 documentElement 的 scrollLeft/scrollTop
    document.documentElement.scrollLeft = 30
    document.documentElement.scrollTop = 400
    await trigger.trigger('click')
    await nextTick()
    const style = (document.querySelector('.ui-model-selector__popup')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('top:552px') // rect.bottom 152 + scrollY 400
    expect(style).toContain('left:50px') // rect.left 20 + scrollX 30
    expect(style).toContain('min-width:160px') // rect.width 不受滚动影响
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(ModelSelector, { props: { models: MODELS }, attachTo: document.body })
    await wrapper.find('button.ui-model-selector__trigger').trigger('click')
    expect(document.querySelector('.ui-model-selector__listbox')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('useModelSelector 纯状态机：↓/↑ 导航跳过禁用模型并在两端夹住，Home/End 首尾', () => {
    const state = useModelSelector({ models: MODELS, modelValue: () => null })
    state.openList()
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0) // 已选缺失 → 首个可选
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 跳过 index=2/3 的禁用模型
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 末个可选处夹住
    state.moveActive(-1)
    expect(state.activeIndex.value).toBe(0)
    state.toEdge('last')
    expect(state.activeIndex.value).toBe(1)
    state.toEdge('first')
    expect(state.activeIndex.value).toBe(0)
  })

  it('useModelSelector 纯状态机：select 走 onSelect 出口（上抛完整模型对象），禁用项与越界下标被忽略', () => {
    const onSelect = vi.fn()
    const state = useModelSelector({ models: MODELS, modelValue: () => null, onSelect })
    state.select(2)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(99)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(1)
    expect(onSelect).toHaveBeenCalledWith(MODELS[1])
    expect(state.open.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
  })

  it('useModelSelector 纯状态机：loading 闸门清空可选集合并拦截 select，开合仍放行', () => {
    const onSelect = vi.fn()
    const state = useModelSelector({
      models: MODELS,
      modelValue: () => null,
      loading: () => true,
      onSelect,
    })
    state.openList()
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(-1) // 可选集合为空 → 无高亮
    state.moveActive(1)
    state.toEdge('last')
    expect(state.activeIndex.value).toBe(-1)
    state.select(0)
    expect(onSelect).not.toHaveBeenCalled()
    state.closeList()
    expect(state.open.value).toBe(false)
  })

  it('useModelSelector 纯状态机：disabled 总闸拦截开合与键盘', () => {
    const state = useModelSelector({ models: MODELS, modelValue: () => null, disabled: () => true })
    state.toggleList()
    expect(state.open.value).toBe(false)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    state.handleKeydown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  it('useModelSelector 纯状态机：打开落位优先已选模型（即使其不是首个可选）', () => {
    const state = useModelSelector({ models: MODELS, modelValue: () => 'claude' })
    state.openList()
    expect(state.activeIndex.value).toBe(1)
    expect(state.selectedModel.value?.label).toBe('Claude')
  })
})
