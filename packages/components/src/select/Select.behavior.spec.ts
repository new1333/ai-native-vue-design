// behavior spec：开合 / 选中 / v-model 双向 / 清空 / 点击外部关闭 / 受控 open /
// 弹层跟随（scroll capture + resize）/ Dialog 内嵌层级 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
// happy-dom 的全局 URL 以窗口 location 为相对基准（非 file:），读取源文件须用 node:url 的 URL
import { URL as NodeURL } from 'node:url'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Dialog } from '../dialog'
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

  it('Dialog 内嵌 Select：弹层为 body 直接子元素，层级 token 实值大于 Dialog（scrim 所在层叠上下文）', async () => {
    // 层级断言不依赖真实渲染层级（happy-dom 不注入 SFC scoped 样式）：
    // ① DOM 结构断言——弹层与 Dialog 浮层根同为 body 直接子元素，z-index 直接可比；
    // ② 数值断言——从组件源码样式规则提取各自绑定的 --ui-z-* token 名，
    //    再解析 @ui/tokens 的 paper.css 得实值比较（zLadder：popover 档 > modal 档）。
    const selectSource = readFileSync(new NodeURL('./Select.vue', import.meta.url), 'utf8')
    const dialogSource = readFileSync(new NodeURL('../dialog/Dialog.vue', import.meta.url), 'utf8')
    const paperCss = readFileSync(new NodeURL('../../../tokens/src/paper.css', import.meta.url), 'utf8')

    // .ui-select__listbox 规则内绑定的层级 token（regex 要求类名后紧跟花括号）
    const listboxRule = selectSource.match(/\.ui-select__listbox\s*\{[^}]*\}/)?.[0] ?? ''
    const listboxToken = listboxRule.match(/z-index:\s*var\((--ui-z-[a-z-]+)\)/)?.[1]
    // Dialog 的 z-index 在浮层根 .ui-dialog 上；scrim（.ui-dialog__scrim）无自身
    // z-index，随该根的层叠上下文参与比较
    const dialogRule = dialogSource.match(/\.ui-dialog\s*\{[^}]*\}/)?.[0] ?? ''
    const dialogToken = dialogRule.match(/z-index:\s*var\((--ui-z-[a-z-]+)\)/)?.[1]
    expect(listboxToken, 'Select 弹层应绑定 --ui-z-* token').toBeTruthy()
    expect(dialogToken, 'Dialog 浮层根应绑定 --ui-z-* token').toBeTruthy()

    function zValue(token: string): number {
      const match = paperCss.match(new RegExp(`${token.replace(/-/g, '\\-')}\\s*:\\s*(\\d+)\\s*;`))
      expect(match, `paper.css 应声明 ${token}`).toBeTruthy()
      return Number(match?.[1])
    }

    const wrapper = mount(Dialog, {
      props: { modelValue: true, title: '内嵌选择器' },
      slots: { default: () => h(Select, { options: OPTIONS }) },
      attachTo: document.body,
    })
    await nextTick()

    // Dialog 打开后，其内部 Select 的触发器可点击展开弹层
    const trigger = document.querySelector<HTMLButtonElement>('.ui-dialog .ui-select__trigger')
    expect(trigger).not.toBeNull()
    trigger?.click()
    await nextTick()

    const listbox = document.querySelector('.ui-select__listbox')
    const dialogRoot = document.querySelector('.ui-dialog')
    expect(listbox).not.toBeNull()
    expect(listbox?.parentElement).toBe(document.body)
    expect(dialogRoot?.parentElement).toBe(document.body)

    // 层级契约：弹层档实值必须大于 modal 档实值（否则弹层被 scrim 与面板整体压住）
    expect(zValue(listboxToken!)).toBeGreaterThan(zValue(dialogToken!))
    wrapper.unmount()
  })

  it('受控：Esc 只发 update:open(false)，父未响应前弹层保持打开，父置 false 后关闭', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, open: true }, attachTo: document.body })
    await nextTick()
    await wrapper.find('button.ui-select__trigger').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(document.querySelector('.ui-select__listbox')).not.toBeNull() // 完全受控：父未置 false 不自行关闭
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    wrapper.unmount()
  })

  it('受控初始 open=true：挂载即打开并按触发器 rect 定位（onMounted 补一次重排）', async () => {
    document.documentElement.scrollTop = 0
    document.documentElement.scrollLeft = 0
    const wrapper = mount(Select, { props: { options: OPTIONS, open: true }, attachTo: document.body })
    // 引擎侧 watch 不覆盖初始 true；onMounted 路径在 Teleport 落地后按 rect 定位
    vi.spyOn(wrapper.find('button.ui-select__trigger').element, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(20, 120, 160, 32),
    )
    await nextTick()
    await nextTick()
    const style = (document.querySelector('.ui-select__listbox')?.getAttribute('style') ?? '').replace(
      /\s+/g,
      '',
    )
    expect(style).toContain('top:152px') // rect.bottom 152 + scrollY 0
    expect(style).toContain('left:20px')
    expect(style).toContain('min-width:160px')
    wrapper.unmount()
  })

  it('打开期间滚动/视口变化：scroll（capture）与 resize 按最新触发器 rect 重定位', async () => {
    // 隔离用例间共享 document 的滚动偏移（window.scrollY/scrollX 读取 documentElement）
    document.documentElement.scrollTop = 0
    document.documentElement.scrollLeft = 0
    const docAdd = vi.spyOn(document, 'addEventListener')
    const winAdd = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-select__trigger')
    let rect = new DOMRect(20, 100, 160, 32)
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockImplementation(() => rect)
    // 引擎在 onMounted 常驻注册跟随（isOpen 守卫）：scroll 以 capture 捕获任意祖先
    // 滚动容器（文档坐标定位只天然跟随文档滚动），resize 挂 window
    expect(docAdd).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(winAdd).toHaveBeenCalledWith('resize', expect.any(Function))
    await trigger.trigger('click')
    await nextTick()
    const style = () =>
      (document.querySelector('.ui-select__listbox')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style()).toContain('top:132px') // rect.bottom 100 + 32（scrollY=0）
    // 触发器位于滚动容器内/滚动后视口位置变化：面板跟随新 rect 重排（重渲染等 microtask 落地）
    rect = new DOMRect(20, 40, 160, 32)
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(style()).toContain('top:72px')
    expect(style()).toContain('left:20px')
    // 视口变化（缩放/侧栏折叠）：触发器变宽 → minWidth 跟随
    rect = new DOMRect(20, 40, 240, 32)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(style()).toContain('min-width:240px')
    docAdd.mockRestore()
    winAdd.mockRestore()
    wrapper.unmount()
  })

  it('关闭后 scroll/resize 由引擎 isOpen 守卫短路（不再读取 rect），卸载时一并解绑', async () => {
    document.documentElement.scrollTop = 0
    document.documentElement.scrollLeft = 0
    const wrapper = mount(Select, { props: { options: OPTIONS }, attachTo: document.body })
    const trigger = wrapper.find('button.ui-select__trigger')
    const rectSpy = vi.spyOn(trigger.element, 'getBoundingClientRect')
    rectSpy.mockReturnValue(new DOMRect(20, 100, 160, 32))
    await trigger.trigger('click')
    await nextTick()
    expect(document.querySelector('.ui-select__listbox')).not.toBeNull()
    await trigger.trigger('click') // 关闭（引擎监听常驻，回调以 isOpen 守卫短路）
    expect(document.querySelector('.ui-select__listbox')).toBeNull()
    const callsAfterClose = rectSpy.mock.calls.length
    document.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(rectSpy.mock.calls.length).toBe(callsAfterClose) // 关闭态不再触发定位计算（不读 rect）
    const docRemove = vi.spyOn(document, 'removeEventListener')
    const winRemove = vi.spyOn(window, 'removeEventListener')
    wrapper.unmount()
    expect(docRemove).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(winRemove).toHaveBeenCalledWith('resize', expect.any(Function))
    rectSpy.mockRestore()
    docRemove.mockRestore()
    winRemove.mockRestore()
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
