// behavior spec：开合 / 单选 / 多选切换 / 级联复选 / v-model 双向 / 清空 / 点击外部关闭 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import TreeSelect from './TreeSelect.vue'
import {
  buildTreeSelectRecords,
  collectTreeSelectSelectableValues,
  computeTreeSelectCheckedValues,
  isTreeSelectNodeChecked,
  isTreeSelectNodeIndeterminate,
  normalizeTreeSelectCheckedInput,
  useTreeSelect,
} from './useTreeSelect'
import type { TreeSelectModelValue, TreeSelectNodeValue, TreeSelectOption } from './TreeSelect.types'

const TREE: TreeSelectOption[] = [
  {
    label: '研发部',
    value: 'rd',
    children: [
      { label: '前端组', value: 'fe' },
      { label: '后端组', value: 'be', disabled: true },
    ],
  },
  { label: '设计部', value: 'design' },
  { label: '运营部', value: 'ops', disabled: true },
]

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-tree-select__trigger')
const treeNodes = () => [...document.querySelectorAll('.ui-tree-select__node')]
const nodeByLabel = (label: string): HTMLElement => {
  const node = treeNodes().find((el) => el.textContent?.includes(label))
  if (node === undefined) throw new Error(`node ${label} not found`)
  return node as HTMLElement
}

async function openTree(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findTrigger(wrapper).trigger('click')
  await nextTick()
}

async function expandNode(label: string): Promise<void> {
  const toggle = nodeByLabel(label).querySelector('.ui-tree-select__toggle') as HTMLElement
  toggle.click()
  await nextTick()
}

describe('TreeSelect behavior', () => {
  it('点击触发器打开面板（Teleport 到 body），再点一次切换关闭', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    let tree = document.querySelector('.ui-tree-select__tree')
    expect(tree).not.toBeNull()
    expect(tree?.parentElement).toBe(document.body)
    await findTrigger(wrapper).trigger('click')
    tree = document.querySelector('.ui-tree-select__tree')
    expect(tree).toBeNull()
    wrapper.unmount()
  })

  it('单选：点击节点发出 update:modelValue + change 并关闭面板', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    nodeByLabel('设计部').click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['design']])
    expect(wrapper.emitted('change')).toEqual([['design']])
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
    wrapper.unmount()
  })

  it('展开箭标点击：仅切换展开（子节点出现/消失），不发出选中且面板不关闭', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    await expandNode('研发部')
    expect(treeNodes().map((el) => el.textContent?.trim())).toEqual([
      '研发部',
      '前端组',
      '后端组',
      '设计部',
      '运营部',
    ])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    await expandNode('研发部')
    expect(treeNodes().length).toBe(3)
    wrapper.unmount()
  })

  it('单选 v-model 双向绑定：选中更新父状态，父状态变化回落触发器文案（打开落位自动展开父链）', async () => {
    const value = ref<string | null>('fe')
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: TREE,
          modelValue: value.value,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (v === null || typeof v === 'string') value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    expect(findTrigger(wrapper).text()).toContain('前端组')
    await openTree(wrapper)
    // 打开落位：已选深层节点 → 父链自动展开，可见且高亮
    expect(nodeByLabel('前端组').getAttribute('aria-level')).toBe('2')
    const activeId = findTrigger(wrapper).attributes('aria-activedescendant')
    expect(activeId).toBe(nodeByLabel('前端组').id)
    nodeByLabel('设计部').click()
    await nextTick()
    expect(value.value).toBe('design')
    expect(findTrigger(wrapper).text()).toContain('设计部')
    wrapper.unmount()
  })

  it('multiple：点击节点切换成员资格（数组载荷），面板保持打开', async () => {
    const value = ref<TreeSelectNodeValue[]>([])
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: TREE,
          multiple: true,
          modelValue: value.value,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (Array.isArray(v)) value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await openTree(wrapper)
    nodeByLabel('设计部').click()
    await nextTick()
    expect(value.value).toEqual(['design'])
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    await expandNode('研发部')
    nodeByLabel('前端组').click()
    await nextTick()
    expect(value.value).toEqual(['design', 'fe'])
    expect(findTrigger(wrapper).text()).toContain('设计部、前端组')
    nodeByLabel('设计部').click()
    await nextTick()
    expect(value.value).toEqual(['fe'])
    wrapper.unmount()
  })

  it('checkable：点击父节点级联勾选可选子树（禁用后代不计入），面板保持打开', async () => {
    const value = ref<TreeSelectNodeValue[]>([])
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: TREE,
          checkable: true,
          modelValue: value.value,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (Array.isArray(v)) value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await openTree(wrapper)
    nodeByLabel('研发部').click()
    await nextTick()
    expect(value.value).toEqual(['rd', 'fe']) // be 为禁用后代，不进级联
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    wrapper.unmount()
  })

  it('checkable：取消部分子节点 → 父节点转半选；半选父点按 → 级联全选', async () => {
    // 需要两个可用子节点：取消其一后父节点仍有可选后代处于勾选 → 半选
    const WIDE: TreeSelectOption[] = [
      {
        label: '研发部',
        value: 'rd',
        children: [
          { label: '前端组', value: 'fe' },
          { label: '测试组', value: 'qa' },
        ],
      },
    ]
    const value = ref<TreeSelectNodeValue[]>(['rd', 'qa'])
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: WIDE,
          checkable: true,
          modelValue: value.value,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (Array.isArray(v)) value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await openTree(wrapper)
    await expandNode('研发部')
    expect(nodeByLabel('研发部').getAttribute('aria-checked')).toBe('true')
    // 取消勾选其中一个子节点 → 父节点半选，输出只剩另一子节点
    nodeByLabel('前端组').click()
    await nextTick()
    expect(value.value).toEqual(['qa'])
    expect(nodeByLabel('研发部').getAttribute('aria-checked')).toBe('mixed')
    // 半选状态点按父节点 → 视为全选（级联到全部可选后代）
    nodeByLabel('研发部').click()
    await nextTick()
    expect(value.value).toEqual(['rd', 'fe', 'qa'])
    expect(nodeByLabel('研发部').getAttribute('aria-checked')).toBe('true')
    wrapper.unmount()
  })

  it('checkable：初始仅勾选子节点 → 父节点半选（aria-checked=mixed），点按父节点 → 全选', async () => {
    const value = ref<TreeSelectNodeValue[]>(['fe'])
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: TREE,
          checkable: true,
          modelValue: value.value,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (Array.isArray(v)) value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await openTree(wrapper)
    expect(nodeByLabel('研发部').getAttribute('aria-checked')).toBe('mixed')
    nodeByLabel('研发部').click()
    await nextTick()
    expect(value.value).toEqual(['rd', 'fe'])
    wrapper.unmount()
  })

  it('disabled 节点：点击不发出任何更新，面板保持打开', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    nodeByLabel('运营部').click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    wrapper.unmount()
  })

  it('disabled 节点的子节点随父失效：点击不发出更新、aria-disabled 为 true、键盘导航跳过', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    await expandNode('研发部')
    expect(nodeByLabel('后端组').getAttribute('aria-disabled')).toBe('true')
    nodeByLabel('后端组').click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 键盘：↓ 从研发部落在前端组，再 ↓ 跳过后端组（禁用）落在设计部
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('前端组').id)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('设计部').id)
    wrapper.unmount()
  })

  it('清空按钮：单选发出 update:modelValue(null) 与 clear、不发 change，回落占位并交还焦点', async () => {
    const value = ref<string | null>('design')
    const Host = defineComponent({
      setup: () => () =>
        h(TreeSelect, {
          options: TREE,
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: TreeSelectModelValue) => {
            if (v === null || typeof v === 'string') value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button.ui-tree-select__clear').trigger('click')
    expect(value.value).toBeNull()
    expect(wrapper.getComponent(TreeSelect).emitted('clear')).toHaveLength(1)
    expect(wrapper.getComponent(TreeSelect).emitted('change')).toBeUndefined()
    expect(findTrigger(wrapper).text()).toContain('请选择')
    expect(document.activeElement).toBe(findTrigger(wrapper).element)
    wrapper.unmount()
  })

  it('清空按钮：multiple/checkable 发出 update:modelValue([])', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, checkable: true, modelValue: ['rd'], clearable: true },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-tree-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('点击外部关闭：面板内/触发器外目标触发关闭且不发更新', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()
    wrapper.unmount()
  })

  it('触发器 blur（Tab 路径）关闭面板', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    await findTrigger(wrapper).trigger('blur')
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
    wrapper.unmount()
  })

  it('disabled：点击触发器不打开面板', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE, disabled: true } })
    await findTrigger(wrapper).trigger('click')
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
  })

  it('打开时按触发器 rect 计算面板定位（top/left/minWidth 内联落位）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    const style = document.querySelector('.ui-tree-select__tree')?.getAttribute('style') ?? ''
    expect(style).toContain('top:')
    expect(style).toContain('left:')
    expect(style).toContain('min-width:')
    wrapper.unmount()
  })

  it('打开时面板定位计入页面滚动偏移（视口 rect + scrollX/scrollY → 文档坐标）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    // 桩定触发器视口 rect，模拟「页面滚动后触发器位于视口中下方」的场景
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 120, 160, 32))
    // happy-dom：window.scrollX/scrollY 读取 documentElement 的 scrollLeft/scrollTop
    document.documentElement.scrollLeft = 30
    document.documentElement.scrollTop = 400
    await trigger.trigger('click')
    await nextTick()
    const style = (document.querySelector('.ui-tree-select__tree')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('top:552px') // rect.bottom 152 + scrollY 400
    expect(style).toContain('left:50px') // rect.left 20 + scrollX 30
    expect(style).toContain('min-width:160px') // rect.width 不受滚动影响
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('受控：Esc 只发 update:open(false)，父未响应前面板保持打开，父置 false 后关闭', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, open: true },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(document.querySelector('.ui-tree-select__tree')).not.toBeNull() // 完全受控：父未置 false 不自行关闭
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
    wrapper.unmount()
  })

  it('受控初始 open=true：挂载即打开并按触发器 rect 定位（onMounted 补一次重排）', async () => {
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, open: true },
      attachTo: document.body,
    })
    vi.spyOn(findTrigger(wrapper).element, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(20, 120, 160, 32),
    )
    await nextTick()
    await nextTick()
    const style = (document.querySelector('.ui-tree-select__tree')?.getAttribute('style') ?? '').replace(
      /\s+/g,
      '',
    )
    expect(style).toContain('top:152px') // rect.bottom 152 + scrollY 0
    expect(style).toContain('left:20px')
    expect(style).toContain('min-width:160px')
    wrapper.unmount()
  })

  it('引擎常驻注册 scroll(capture)/resize 跟随（isOpen 守卫）；打开期间滚动按最新触发器 rect 重定位', async () => {
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    const docAdd = vi.spyOn(document, 'addEventListener')
    const winAdd = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const rectSpy = vi.spyOn(trigger.element, 'getBoundingClientRect')
    rectSpy.mockReturnValue(new DOMRect(20, 120, 160, 32))
    // 引擎在 onMounted 常驻注册（followViewport）：scroll 以 capture 捕获任意祖先
    // 滚动容器（文档坐标定位只天然跟随文档滚动），resize 挂 window
    expect(docAdd).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(winAdd).toHaveBeenCalledWith('resize', expect.any(Function))
    await trigger.trigger('click')
    await nextTick()
    const treeStyle = () =>
      (document.querySelector('.ui-tree-select__tree')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(treeStyle()).toContain('top:152px')
    rectSpy.mockReturnValue(new DOMRect(20, 300, 160, 32)) // 滚动容器滚动后触发器视口位置变化
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(treeStyle()).toContain('top:332px')
    docAdd.mockRestore()
    winAdd.mockRestore()
    rectSpy.mockRestore()
    wrapper.unmount()
  })

  it('打开期间 window resize 触发重定位；关闭后 scroll/resize 由 isOpen 守卫短路（不再读取 rect），卸载时解绑', async () => {
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const rectSpy = vi.spyOn(trigger.element, 'getBoundingClientRect')
    rectSpy.mockReturnValue(new DOMRect(0, 100, 200, 30))
    await trigger.trigger('click')
    await nextTick()
    rectSpy.mockReturnValue(new DOMRect(40, 100, 200, 30)) // 视口变窄，触发器左移
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    const style = (document.querySelector('.ui-tree-select__tree')?.getAttribute('style') ?? '').replace(
      /\s+/g,
      '',
    )
    expect(style).toContain('left:40px')

    await trigger.trigger('click') // 关闭（引擎监听常驻，回调以 isOpen 守卫短路）
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
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

  it('useTreeSelect 纯状态机：展开后可见列表为先序遍历，↓/↑ 跳过禁用节点并在两端夹住', () => {
    const state = useTreeSelect({ options: TREE, primaryValue: () => null })
    expect(state.visibleNodes.value.map((node) => node.option.value)).toEqual(['rd', 'design', 'ops'])
    state.expand('rd')
    expect(state.visibleNodes.value.map((node) => node.option.value)).toEqual([
      'rd',
      'fe',
      'be',
      'design',
      'ops',
    ])
    state.openList()
    expect(state.open.value).toBe(true)
    expect(state.activeIndex.value).toBe(0) // 首个可选
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(1)
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(3) // 跳过 be(2) 的禁用项 → design
    state.moveActive(1)
    expect(state.activeIndex.value).toBe(3) // 末个可选处夹住（ops 禁用）
    state.moveActive(-1)
    expect(state.activeIndex.value).toBe(1)
    state.toEdge('last')
    expect(state.activeIndex.value).toBe(3)
    state.toEdge('first')
    expect(state.activeIndex.value).toBe(0)
  })

  it('useTreeSelect 纯状态机：collapse/expand/toggleExpand 控制展开集合，moveIntoFirstChild/moveToParent 移动高亮', () => {
    const state = useTreeSelect({ options: TREE, primaryValue: () => null })
    state.openList()
    expect(state.activeIndex.value).toBe(0) // rd
    state.toggleExpand('rd')
    expect(state.expanded.value.has('rd')).toBe(true)
    expect(state.visibleNodes.value.length).toBe(5)
    state.collapse('rd')
    expect(state.visibleNodes.value.length).toBe(3)
    state.expand('rd')
    expect(state.visibleNodes.value.length).toBe(5)
    // 已展开 → 高亮进入首个子节点（fe）
    state.moveIntoFirstChild()
    expect(state.visibleNodes.value[state.activeIndex.value]?.option.value).toBe('fe')
    // 叶子 → 回到父节点（rd）
    state.moveToParent()
    expect(state.visibleNodes.value[state.activeIndex.value]?.option.value).toBe('rd')
  })

  it('useTreeSelect 纯状态机：Enter/Space 走 onActivate 出口——单选激活即关闭，stayOpen 保持打开', () => {
    const onActivate = vi.fn()
    const single = useTreeSelect({ options: TREE, primaryValue: () => null, onActivate })
    single.openList()
    single.handleKeydown({ key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    expect(onActivate).toHaveBeenCalledWith(TREE[0])
    expect(single.open.value).toBe(false)

    const multi = useTreeSelect({
      options: TREE,
      primaryValue: () => null,
      stayOpen: () => true,
      onActivate,
    })
    multi.openList()
    multi.handleKeydown({ key: ' ', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    expect(onActivate).toHaveBeenCalledTimes(2)
    expect(multi.open.value).toBe(true)
  })

  it('useTreeSelect 纯状态机：disabled 总闸拦截开合与键盘', () => {
    const state = useTreeSelect({ options: TREE, primaryValue: () => null, disabled: () => true })
    state.toggleList()
    expect(state.open.value).toBe(false)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    state.handleKeydown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  it('useTreeSelect 纯状态机：打开落位优先已选值并展开其父链', () => {
    const state = useTreeSelect({ options: TREE, primaryValue: () => 'fe' })
    expect(state.visibleNodes.value.map((node) => node.option.value)).toEqual(['rd', 'design', 'ops'])
    state.openList()
    expect(state.expanded.value.has('rd')).toBe(true)
    const feIndex = state.visibleNodes.value.findIndex((node) => node.option.value === 'fe')
    expect(state.activeIndex.value).toBe(feIndex)
  })

  it('级联纯函数：归一化展开父值 / 全勾选输出先序 / 半选判定 / 可选子树收集', () => {
    const checked = normalizeTreeSelectCheckedInput(TREE, ['rd'])
    expect([...checked].sort()).toEqual(['fe', 'rd'])
    expect(computeTreeSelectCheckedValues(TREE, checked)).toEqual(['rd', 'fe'])
    const partial = normalizeTreeSelectCheckedInput(TREE, ['fe'])
    expect(computeTreeSelectCheckedValues(TREE, partial)).toEqual(['fe'])
    const rd = TREE[0]
    expect(isTreeSelectNodeIndeterminate(rd, partial)).toBe(true)
    expect(isTreeSelectNodeChecked(rd, partial)).toBe(false)
    expect(isTreeSelectNodeChecked(rd, checked)).toBe(true)
    // 禁用节点不参与级联：可选子树不含 be
    expect(collectTreeSelectSelectableValues(rd)).toEqual(['rd', 'fe'])
    expect(buildTreeSelectRecords(TREE).get('fe')?.parent?.value).toBe('rd')
  })
})
