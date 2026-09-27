// behavior spec：键入过滤 / 选中 / v-model 双向 / 清空 / 防抖 search / 开合路径 / 状态机纯逻辑。
import { describe, expect, it, vi, afterEach } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import AutoComplete from './AutoComplete.vue'
import { useAutoComplete } from './useAutoComplete'
import type {
  AutoCompleteOption,
  AutoCompleteSelectedOption,
} from './AutoComplete.types'

// 任一用例失败时也保证卸载，避免 Teleport 弹层跨用例泄漏污染后续断言。
enableAutoUnmount(afterEach)

const OPTIONS: AutoCompleteOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '南京', value: 'nanjing' },
  { label: '北海（暂不可选）', value: 'beihai', disabled: true },
]

const findInput = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('input.ui-autocomplete__control')

const optionEls = () => [...document.querySelectorAll('.ui-autocomplete__option')] as HTMLElement[]
const optionLabels = () => optionEls().map((el) => el.textContent?.trim())

afterEach(() => {
  vi.useRealTimers()
  // 还原型 spy（如 Element.prototype.scrollIntoView），防跨用例泄漏。
  vi.restoreAllMocks()
})

describe('AutoComplete behavior', () => {
  it('键入打开建议面板并发出 update:modelValue', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).setValue('南')
    expect(wrapper.emitted('update:modelValue')).toEqual([['南']])
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    wrapper.unmount()
  })

  it('默认本地过滤随键入收窄建议（v-model 宿主）', async () => {
    const text = ref('')
    const Host = defineComponent({
      setup: () => () =>
        h(AutoComplete, {
          options: OPTIONS,
          modelValue: text.value,
          'onUpdate:modelValue': (v: string) => {
            text.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const input = findInput(wrapper)
    await input.setValue('北')
    expect(optionLabels()).toEqual(['北京', '北海（暂不可选）'])
    await input.setValue('广州')
    expect(optionLabels()).toEqual([])
    expect(document.querySelector('.ui-autocomplete__empty')).not.toBeNull()
    wrapper.unmount()
  })

  it('filter=false（远程模式）：键入不本地过滤，全量展示', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, filter: false },
      attachTo: document.body,
    })
    await findInput(wrapper).setValue('南')
    expect(optionLabels()).toEqual(['北京', '南京', '北海（暂不可选）'])
    wrapper.unmount()
  })

  it('自定义 filter：拿到归一化建议（value 回退）与关键词原文（受控 keyword）', async () => {
    const filter = vi.fn(
      (option: AutoCompleteSelectedOption, keyword: string) =>
        option.value.toString().toLowerCase().includes(keyword.toLowerCase()),
    )
    const wrapper = mount(AutoComplete, {
      props: {
        options: [...OPTIONS, { label: '杭州' }],
        modelValue: 'beij',
        filter,
      },
      attachTo: document.body,
    })
    await findInput(wrapper).trigger('click')
    expect(filter).toHaveBeenCalled()
    expect(filter.mock.calls[0][0]).toMatchObject({ label: '北京', value: 'beijing' })
    expect(filter.mock.calls[0][1]).toBe('beij')
    expect(optionLabels()).toEqual(['北京'])
    wrapper.unmount()
  })

  it('点击建议：发出 update:modelValue(label) 与 select 并关闭面板', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('click')
    ;(optionEls()[1]).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['南京']])
    expect(wrapper.emitted('select')).toEqual([[{ label: '南京', value: 'nanjing' }]])
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('点击禁用建议：不发出事件且面板保持打开', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('click')
    ;(optionEls()[2]).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    wrapper.unmount()
  })

  it('v-model 双向绑定：键入更新父状态，Enter 选中建议回填文本', async () => {
    const text = ref('')
    const Host = defineComponent({
      setup: () => () =>
        h(AutoComplete, {
          options: OPTIONS,
          modelValue: text.value,
          'onUpdate:modelValue': (v: string) => {
            text.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const input = findInput(wrapper)
    await input.setValue('北')
    expect(text.value).toBe('北')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(text.value).toBe('北京')
    expect((input.element as HTMLInputElement).value).toBe('北京')
    expect(findInput(wrapper).attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('清空按钮：发出 update:modelValue(\'\') 与 clear、面板经空关键词路径打开、焦点交还输入框', async () => {
    vi.useFakeTimers()
    const text = ref('北京')
    const Host = defineComponent({
      setup: () => () =>
        h(AutoComplete, {
          options: OPTIONS,
          modelValue: text.value,
          clearable: true,
          'onUpdate:modelValue': (v: string) => {
            text.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button.ui-autocomplete__clear').trigger('click')
    expect(text.value).toBe('')
    expect(wrapper.getComponent(AutoComplete).emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(findInput(wrapper).element)
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    expect(optionLabels()).toEqual(['北京', '南京', '北海（暂不可选）']) // 空关键词 → 全量
    vi.advanceTimersByTime(200)
    expect(wrapper.getComponent(AutoComplete).emitted('search')).toEqual([['']])
    wrapper.unmount()
  })

  it('search 事件经 debounce 防抖：连续击键合并为最后一次关键词', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).setValue('北')
    await findInput(wrapper).setValue('北京')
    expect(wrapper.emitted('search')).toBeUndefined()
    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('search')).toEqual([['北京']])
    wrapper.unmount()
  })

  it('debounce=0：search 立即同步发出', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, debounce: 0 },
      attachTo: document.body,
    })
    await findInput(wrapper).setValue('北')
    expect(wrapper.emitted('search')).toEqual([['北']])
    wrapper.unmount()
  })

  it('卸载时取消未决防抖 search（onBeforeUnmount 清理）', async () => {
    vi.useFakeTimers()
    const searchEvents: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(AutoComplete, {
          options: OPTIONS,
          onSearch: (keyword: string) => searchEvents.push(keyword),
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await findInput(wrapper).setValue('北')
    wrapper.unmount()
    vi.advanceTimersByTime(1000)
    expect(searchEvents).toEqual([])
  })

  it('点击输入框：关闭态打开面板（空关键词全量展示）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('click')
    expect(findInput(wrapper).attributes('aria-expanded')).toBe('true')
    expect(optionLabels()).toEqual(['北京', '南京', '北海（暂不可选）'])
    wrapper.unmount()
  })

  it('blur（Tab 路径）与点击外部均关闭面板', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('click')
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    await input.trigger('blur')
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()

    await input.trigger('click')
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()
    wrapper.unmount()
  })

  it('disabled：键入路径不打开面板（原生 disabled）', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, disabled: true },
      attachTo: document.body,
    })
    await findInput(wrapper).setValue('北')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('打开时按输入框 rect 计算弹层定位（top/left/minWidth 内联落位）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('click')
    const style = (document.querySelector('.ui-autocomplete__listbox')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('top:')
    expect(style).toContain('left:')
    expect(style).toContain('min-width:')
    wrapper.unmount()
  })

  // 焦点恒驻输入框（aria-activedescendant），option 不获焦、浏览器不会自动滚动非焦点
  // 元素：happy-dom 只能可靠验证滚动的接线（何时滚、滚哪个元素、最小滚动参数），
  // 真实几何滚动行为按 CONVENTIONS §7 归 E2E。
  it('键盘高亮滚动入视口：打开落位与 ↓/↑ 移动后对激活建议 scrollIntoView({block:nearest})', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    const wrapper = mount(AutoComplete, {
      props: { options: [...OPTIONS, { label: '杭州' }, { label: '广州' }] },
      attachTo: document.body,
    })
    const input = findInput(wrapper)
    expect(scrollIntoView).not.toHaveBeenCalled() // 关闭态无高亮，不滚动
    await input.trigger('keydown', { key: 'ArrowUp' }) // 关闭态 ↑：打开并落位末个可选建议（长列表越出弹层可视区）
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.calls[0]).toEqual([{ block: 'nearest' }]) // 最小滚动，不牵动页面
    expect(scrollIntoView.mock.instances[0]).toBe(optionEls().at(-1))
    await input.trigger('keydown', { key: 'ArrowDown' }) // 末个可选处夹住：高亮不变，不重复滚动
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    await input.trigger('keydown', { key: 'ArrowUp' }) // 高亮移动 → 新激活项滚入视口
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(scrollIntoView.mock.instances[1]).toBe(optionEls().at(-2))
    wrapper.unmount()

    // 全部禁用：打开但无高亮（activeIndex=-1），不触发滚动
    const disabled = mount(AutoComplete, {
      props: { options: [{ label: '锁定', value: 'x', disabled: true }] },
      attachTo: document.body,
    })
    await findInput(disabled).trigger('keydown', { key: 'ArrowDown' })
    expect(findInput(disabled).attributes('aria-expanded')).toBe('true')
    expect(findInput(disabled).attributes('aria-activedescendant')).toBeUndefined()
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    disabled.unmount()
  })

  // 建议整体替换（远程结果到达）而高亮下标数值不变：仅监听 [open, activeIndex] 会漏滚，
  // 监听 suggestions 后于 DOM 更新后对（新）激活建议补滚，否则激活项可能滞留可视区外。
  it('异步建议替换（options 变更、activeIndex 不变）后仍对激活建议 scrollIntoView', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('keydown', { key: 'ArrowDown' }) // 打开并落位首项
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(optionEls()[0])
    // 远程结果到达：options 整体替换，新列表首项仍可选 → activeIndex 保持 0（数值不变）
    await wrapper.setProps({ options: [{ label: '杭州' }, { label: '苏州' }, { label: '广州' }] })
    expect(optionLabels()).toEqual(['杭州', '苏州', '广州'])
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(scrollIntoView.mock.instances[1]).toBe(optionEls()[0])
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).trigger('click')
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('useAutoComplete 纯状态机：建议归一化（value 回退）与三种过滤策略', () => {
    const all = [...OPTIONS, { label: '杭州' }]
    const base = { options: () => all, onUpdate: vi.fn(), onSearch: vi.fn(), onSelect: vi.fn() }
    const defaults = useAutoComplete({ ...base, modelValue: () => '北' })
    expect(defaults.suggestions.value.map((option) => option.value)).toEqual(['beijing', 'beihai'])

    const fn = useAutoComplete({
      ...base,
      modelValue: () => '',
      filter: () => (option: AutoCompleteSelectedOption) => option.disabled !== true,
    })
    expect(fn.suggestions.value.map((option) => option.label)).toEqual(['北京', '南京', '杭州'])

    const off = useAutoComplete({ ...base, modelValue: () => '北', filter: () => false })
    expect(off.suggestions.value).toHaveLength(4)
  })

  it('useAutoComplete 纯状态机：↓/↑ 导航跳过禁用项并在两端夹住，openList edge 落位', () => {
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      onUpdate: vi.fn(),
      onSearch: vi.fn(),
      onSelect: vi.fn(),
    })
    state.openList('first')
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0)
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 跳过 index=2 的禁用项
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1) // 末个可选处夹住
    state.moveActive(-1)
    expect(state.activeIndex.value).toBe(0)
    state.openList('last')
    expect(state.activeIndex.value).toBe(1)
    state.closeList()
    expect(state.open.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
  })

  it('useAutoComplete 纯状态机：select 走 onSelect 出口（归一化载荷），禁用项与越界忽略并关闭', () => {
    const onSelect = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      onUpdate: vi.fn(),
      onSearch: vi.fn(),
      onSelect,
    })
    state.openList()
    state.select(2)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(99)
    expect(onSelect).not.toHaveBeenCalled()
    state.select(0)
    expect(onSelect).toHaveBeenCalledWith({ label: '北京', value: 'beijing' })
    expect(state.open.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
  })

  it('useAutoComplete 纯状态机：select 取消未决防抖 search（无陈旧关键词补发）', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const onSelect = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      debounce: () => 200,
      onUpdate: vi.fn(),
      onSearch,
      onSelect,
    })
    state.handleInput('北')
    state.select(0)
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('useAutoComplete 纯状态机：cancelPendingSearch 取消未决 search', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      debounce: () => 200,
      onUpdate: vi.fn(),
      onSearch,
      onSelect: vi.fn(),
    })
    state.handleInput('北')
    state.cancelPendingSearch()
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('useAutoComplete 纯状态机：键盘路径 preventDefault 与开合选中（Enter 无高亮关闭、Esc 关闭、其余键放行）', () => {
    const onSelect = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      onUpdate: vi.fn(),
      onSearch: vi.fn(),
      onSelect,
    })
    const key = (name: string) => {
      const event = { key: name, preventDefault: vi.fn() } as unknown as KeyboardEvent
      state.handleKeydown(event)
      return event
    }
    expect(key('Tab').preventDefault).not.toHaveBeenCalled() // 文本编辑原义放行
    expect(key('Home').preventDefault).not.toHaveBeenCalled()
    expect(key(' ').preventDefault).not.toHaveBeenCalled()
    expect(key('Enter').preventDefault).not.toHaveBeenCalled() // 关闭态 Enter 不打开
    expect(state.open.value).toBe(false)

    const down = key('ArrowDown')
    expect(down.preventDefault).toHaveBeenCalled()
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0)
    key('ArrowUp')
    expect(state.activeIndex.value).toBe(0) // 首端夹住

    const enter = key('Enter')
    expect(enter.preventDefault).toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledWith({ label: '北京', value: 'beijing' })
    expect(state.open.value).toBe(false)

    key('ArrowDown')
    const escape = key('Escape')
    expect(escape.preventDefault).toHaveBeenCalled()
    expect(state.open.value).toBe(false)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('useAutoComplete 纯状态机：disabled 总闸拦截键入与键盘', () => {
    const onUpdate = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      disabled: () => true,
      onUpdate,
      onSearch: vi.fn(),
      onSelect: vi.fn(),
    })
    state.handleInput('北')
    expect(onUpdate).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    state.handleKeydown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  it('useAutoComplete 纯状态机：handleKeywordChange 打开面板并调度 search（清空路径复用）', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      debounce: () => 200,
      onUpdate: vi.fn(),
      onSearch,
      onSelect: vi.fn(),
    })
    state.handleKeywordChange('')
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('useAutoComplete 纯状态机：异步建议替换后高亮越界钳回首个可选', async () => {
    const options = ref<AutoCompleteOption[]>(OPTIONS)
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => options.value,
      onUpdate: vi.fn(),
      onSearch: vi.fn(),
      onSelect: vi.fn(),
    })
    state.openList('last')
    expect(state.activeIndex.value).toBe(1)
    options.value = [{ label: '北京', value: 'beijing' }]
    await nextTick()
    expect(state.activeIndex.value).toBe(0)
    options.value = [{ label: '锁定', value: 'x', disabled: true }]
    await nextTick()
    expect(state.activeIndex.value).toBe(-1)
  })

  it('useAutoComplete 纯状态机：debounce=0 立即发出 search', () => {
    const onSearch = vi.fn()
    const state = useAutoComplete({
      modelValue: () => '',
      options: () => OPTIONS,
      debounce: () => 0,
      onUpdate: vi.fn(),
      onSearch,
      onSelect: vi.fn(),
    })
    state.handleInput('北')
    expect(onSearch).toHaveBeenCalledWith('北')
  })
})
