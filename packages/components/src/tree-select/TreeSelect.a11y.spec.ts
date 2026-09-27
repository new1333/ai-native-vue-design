// a11y spec：combobox/tree 语义 / aria 属性 / 键盘序列（↓↑→←/Home/End/Enter/Space/Esc/Tab）/ 焦点模型。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TreeSelect from './TreeSelect.vue'
import type { TreeSelectExpose, TreeSelectOption } from './TreeSelect.types'

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

describe('TreeSelect a11y', () => {
  it('触发器：原生 button + role=combobox + aria-haspopup=tree + aria-controls', () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('tree')
    expect(trigger.attributes('aria-controls')).toMatch(/^ui-tree-select-tree-/)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('打开后：aria-controls 指向真实面板 id，aria-expanded=true', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    expect(findTrigger(wrapper).attributes('aria-expanded')).toBe('true')
    const controls = findTrigger(wrapper).attributes('aria-controls') ?? ''
    expect(document.getElementById(controls)?.getAttribute('role')).toBe('tree')
    wrapper.unmount()
  })

  it('面板与节点：role=tree / role=treeitem / aria-level / aria-expanded（仅可展开节点）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    const tree = document.querySelector('.ui-tree-select__tree')
    expect(tree).not.toBeNull()
    expect(tree?.getAttribute('role')).toBe('tree')
    const nodes = treeNodes()
    expect(nodes.map((el) => el.getAttribute('role'))).toEqual(Array.from({ length: 3 }, () => 'treeitem'))
    expect(nodes.map((el) => el.getAttribute('aria-level'))).toEqual(['1', '1', '1'])
    // 可展开节点带 aria-expanded=false，叶子节点不带
    expect(nodes[0].getAttribute('aria-expanded')).toBe('false')
    expect(nodes[1].getAttribute('aria-expanded')).toBeNull()
    // 键盘 → 展开：aria-expanded 翻转且子节点 aria-level=2
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(nodes[0].getAttribute('aria-expanded')).toBe('true')
    expect(nodeByLabel('前端组').getAttribute('aria-level')).toBe('2')
    expect(nodeByLabel('后端组').getAttribute('aria-expanded')).toBeNull()
    wrapper.unmount()
  })

  it('单选选中态：aria-selected 落在已选节点，其余为 false', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE, modelValue: 'design' }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    const nodes = treeNodes()
    expect(nodes[1].getAttribute('aria-selected')).toBe('true')
    expect(nodes[0].getAttribute('aria-selected')).toBe('false')
    expect(nodes[2].getAttribute('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('multiple：aria-selected 按数组成员资格渲染', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, multiple: true, modelValue: ['design', 'fe'] },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    expect(nodeByLabel('设计部').getAttribute('aria-selected')).toBe('true')
    expect(nodeByLabel('研发部').getAttribute('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('checkable：aria-checked 三态（true / mixed / false），不出现 aria-selected', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, checkable: true, modelValue: ['fe'] },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    // 展开研发部（键盘 →：高亮在首个节点）
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(nodeByLabel('研发部').getAttribute('aria-checked')).toBe('mixed')
    expect(nodeByLabel('前端组').getAttribute('aria-checked')).toBe('true')
    expect(nodeByLabel('后端组').getAttribute('aria-checked')).toBe('false')
    expect(nodeByLabel('研发部').getAttribute('aria-selected')).toBeNull()
    wrapper.unmount()
  })

  it('aria-disabled：disabled 节点为 true，可选节点不出现', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    expect(nodeByLabel('运营部').getAttribute('aria-disabled')).toBe('true')
    expect(nodeByLabel('设计部').getAttribute('aria-disabled')).toBeNull()
    wrapper.unmount()
  })

  it('键盘 ↓：关闭态打开并把 aria-activedescendant 落在首个可选节点', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('研发部').id)
    wrapper.unmount()
  })

  it('键盘 ↓/↑：高亮沿可选节点移动（跳过禁用项），aria-activedescendant 同步', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('设计部').id) // 跳过禁用的运营部
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('设计部').id) // 末个可选处夹住
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('研发部').id)
    wrapper.unmount()
  })

  it('键盘 ↑ 在关闭态：打开并把高亮落在末个可选节点', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('设计部').id)
    wrapper.unmount()
  })

  it('键盘 →：展开活动节点（高亮不动）；再按 → 进入首个子节点', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('研发部').id)
    expect(nodeByLabel('前端组').getAttribute('aria-level')).toBe('2')
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('前端组').id)
    wrapper.unmount()
  })

  it('键盘 ←：叶子回父节点；已展开节点折叠（子节点行移除、aria-expanded=false）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('前端组').id)
    // 前端组为叶子 → 回到父节点研发部
    await trigger.trigger('keydown', { key: 'ArrowLeft' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('研发部').id)
    // 研发部已展开 → 折叠
    await trigger.trigger('keydown', { key: 'ArrowLeft' })
    expect(nodeByLabel('研发部').getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelectorAll('.ui-tree-select__node').length).toBe(3)
    wrapper.unmount()
  })

  it('键盘 Home/End：高亮跳到首/尾可选节点', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'End' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('设计部').id)
    await trigger.trigger('keydown', { key: 'Home' })
    expect(trigger.attributes('aria-activedescendant')).toBe(nodeByLabel('研发部').id)
    wrapper.unmount()
  })

  it('键盘 Enter：打开（关闭态）/ 选中高亮项并关闭（打开态）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['design']])
    expect(wrapper.emitted('change')).toEqual([['design']])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Space（" "）：打开面板；受理键被 preventDefault（不触发原生 button 激活/滚动）', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Enter（checkable）：切换高亮节点勾选且面板保持打开', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, checkable: true, modelValue: [] },
      attachTo: document.body,
    })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' }) // 勾选研发部（级联 fe）
    expect(wrapper.emitted('update:modelValue')).toEqual([[['rd', 'fe']]])
    expect(trigger.attributes('aria-expanded')).toBe('true') // stayOpen
    wrapper.unmount()
  })

  it('键盘 Esc：关闭面板且不发出更新', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），触发器 blur 关闭面板', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    await trigger.trigger('blur')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('焦点模型：节点不进 Tab 序（无 tabindex），焦点始终停留在触发器', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    expect(treeNodes().every((el) => !el.hasAttribute('tabindex'))).toBe(true)
    const exposed = wrapper.vm as TreeSelectExpose
    exposed.focus()
    expect(document.activeElement).toBe(trigger.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(trigger.element)
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序）且键盘路径不打开', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE, disabled: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
  })

  it('清空按钮：原生 button + aria-label="清空"，不嵌套在触发器 button 内（DOM 合法）', () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, modelValue: 'design', clearable: true },
    })
    const clear = wrapper.find('button.ui-tree-select__clear')
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('清空')
    expect(clear.find('svg').attributes('aria-hidden')).toBe('true')
    expect(findTrigger(wrapper).element.contains(clear.element)).toBe(false)
  })

  it('装饰图形均 aria-hidden：折叠箭标 / 展开箭标 / 复选框不进入可读内容', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, checkable: true },
      attachTo: document.body,
    })
    expect(wrapper.find('.ui-tree-select__chevron').attributes('aria-hidden')).toBe('true')
    await findTrigger(wrapper).trigger('click')
    expect(nodeByLabel('研发部').querySelector('.ui-tree-select__toggle')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    const checkbox = nodeByLabel('研发部').querySelector('.ui-tree-select__checkbox')
    expect(checkbox?.getAttribute('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})
