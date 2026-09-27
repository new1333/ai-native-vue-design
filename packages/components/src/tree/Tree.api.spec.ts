// api spec：props 默认值 / emits 声明 / slots 渲染 / 语义结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import Tree from './Tree.vue'
import { TREE_EMPTY_TEXT_DEFAULT, TREE_SKELETON_ROWS } from './Tree.constants'
import type { TreeNode, TreeNodeSlotScope } from './Tree.types'

const data: TreeNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'components',
        title: 'components',
        children: [
          { key: 'button', title: 'Button' },
          { key: 'input', title: 'Input' },
        ],
      },
      { key: 'index', title: 'index.ts' },
    ],
  },
  { key: 'readme', title: 'README.md', disabled: true },
]

/** 非受控默认（展开全部父节点）可见先序：6 个节点。 */
const DEFAULT_VISIBLE_TITLES = ['src', 'components', 'Button', 'Input', 'index.ts', 'README.md']

function items(wrapper: VueWrapper): DOMWrapper<HTMLElement>[] {
  // treeitem 为 div（role 声明），按 HTMLElement 取用（显式桥接，非 any）。
  return wrapper.findAll('[role="treeitem"]') as unknown as DOMWrapper<HTMLElement>[]
}

function itemByText(wrapper: VueWrapper, title: string): DOMWrapper<HTMLElement> {
  const item = items(wrapper).find((node) => node.text() === title)
  if (!item) throw new Error(`treeitem not found: ${title}`)
  return item
}

describe('Tree api', () => {
  it('语义结构：根类 ui-tree，ul[role=tree] 内 li[role=none] > div[role=treeitem]', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(wrapper.classes()).toContain('ui-tree')
    const list = wrapper.find('ul.ui-tree__list')
    expect(list.attributes('role')).toBe('tree')
    expect(items(wrapper)).toHaveLength(6)
    for (const li of wrapper.findAll('li.ui-tree__item')) {
      expect(li.attributes('role')).toBe('none')
    }
  })

  it('非受控默认展开全部父节点：可见先序与层级正确', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(items(wrapper).map((item) => item.text())).toEqual(DEFAULT_VISIBLE_TITLES)
    const levels = items(wrapper).map((item) => item.attributes('aria-level'))
    expect(levels).toEqual(['1', '2', '3', '3', '2', '1'])
    // aria-setsize/posinset：根级 2 个节点。
    expect(itemByText(wrapper, 'src').attributes('aria-setsize')).toBe('2')
    expect(itemByText(wrapper, 'src').attributes('aria-posinset')).toBe('1')
    expect(itemByText(wrapper, 'README.md').attributes('aria-posinset')).toBe('2')
  })

  it('aria-expanded 仅父节点有：默认展开为 "true"，叶子无该属性', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('true')
    expect(itemByText(wrapper, 'Button').attributes('aria-expanded')).toBeUndefined()
    expect(itemByText(wrapper, 'README.md').attributes('aria-expanded')).toBeUndefined()
  })

  it('expandedKeys 受控折叠：子树不渲染，aria-expanded="false"', () => {
    const wrapper = mount(Tree, { props: { data, expandedKeys: [] } })
    expect(items(wrapper).map((item) => item.text())).toEqual(['src', 'README.md'])
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Button')
  })

  it('modelValue 单选（默认 string）：对应节点 aria-selected="true"', () => {
    const wrapper = mount(Tree, { props: { data, modelValue: 'button' } })
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('true')
    expect(itemByText(wrapper, 'src').attributes('aria-selected')).toBe('false')
  })

  it('multiple：modelValue 为 string[]，多个节点选中', () => {
    const wrapper = mount(Tree, { props: { data, modelValue: ['button', 'input'], multiple: true } })
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('true')
    expect(itemByText(wrapper, 'Input').attributes('aria-selected')).toBe('true')
    expect(itemByText(wrapper, 'src').attributes('aria-selected')).toBe('false')
  })

  it('默认无勾选框；checkable 时每个可见节点渲染原生 checkbox', () => {
    const plain = mount(Tree, { props: { data } })
    expect(plain.find('input[type="checkbox"]').exists()).toBe(false)

    const checkable = mount(Tree, { props: { data, checkable: true } })
    const boxes = checkable.findAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(6)
    expect(boxes[0]?.attributes('type')).toBe('checkbox')
  })

  it('disabled 节点：aria-disabled="true"，checkbox 原生 disabled；其他节点不受影响', () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    const readme = itemByText(wrapper, 'README.md')
    expect(readme.attributes('aria-disabled')).toBe('true')
    expect((readme.find('input[type="checkbox"]').element as HTMLInputElement).disabled).toBe(true)
    const src = itemByText(wrapper, 'src')
    expect(src.attributes('aria-disabled')).toBeUndefined()
    expect((src.find('input[type="checkbox"]').element as HTMLInputElement).disabled).toBe(false)
  })

  it('aria-selected 常驻（true/false），符合 treeitem 的必需 aria-selected', () => {
    const wrapper = mount(Tree, { props: { data } })
    for (const item of items(wrapper)) {
      expect(['true', 'false']).toContain(item.attributes('aria-selected'))
    }
  })

  it('loading 默认 false：无骨架、无 aria-busy', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(wrapper.find('.ui-tree__item--skeleton').exists()).toBe(false)
    expect(wrapper.find('ul.ui-tree__list').attributes('aria-busy')).toBeUndefined()
  })

  it('loading=true：渲染 3 行骨架行、无数据行，ul 置 aria-busy="true"', () => {
    const wrapper = mount(Tree, { props: { data, loading: true } })
    expect(wrapper.findAll('.ui-tree__item--skeleton')).toHaveLength(TREE_SKELETON_ROWS)
    expect(items(wrapper)).toHaveLength(0)
    expect(wrapper.text()).not.toContain('src')
    expect(wrapper.find('ul.ui-tree__list').attributes('aria-busy')).toBe('true')
  })

  it('空态默认：非 loading 且 data 为空时渲染默认文案，无 role=tree', () => {
    const wrapper = mount(Tree, { props: { data: [] } })
    expect(wrapper.find('ul[role="tree"]').exists()).toBe(false)
    expect(wrapper.find('.ui-tree__empty').text()).toBe(TREE_EMPTY_TEXT_DEFAULT)
  })

  it('empty 插槽覆盖默认空态文案', () => {
    const wrapper = mount(Tree, { props: { data: [] }, slots: { empty: () => '目录为空' } })
    expect(wrapper.find('.ui-tree__empty').text()).toBe('目录为空')
    expect(wrapper.text()).not.toContain(TREE_EMPTY_TEXT_DEFAULT)
  })

  it('#node 插槽按节点渲染，作用域含 node/title/level/selected/disabled', () => {
    const wrapper = mount(Tree, {
      props: { data, modelValue: 'button' },
      slots: {
        node: ({ node, title, level, selected, disabled }: TreeNodeSlotScope) =>
          `${title}@L${level}${selected ? '*' : ''}${disabled ? '!' : ''}|${node.key}`,
      },
    })
    expect(itemByText(wrapper, 'Button@L3*|button').exists()).toBe(true)
    expect(itemByText(wrapper, 'README.md@L1!|readme').exists()).toBe(true)
    expect(itemByText(wrapper, 'src@L1|src').exists()).toBe(true)
  })

  it('#node 作用域含 expanded/checked/indeterminate/hasChildren（checkable 场景）', () => {
    const wrapper = mount(Tree, {
      props: { data, checkable: true },
      slots: {
        node: ({ title, hasChildren, expanded, checked, indeterminate }: TreeNodeSlotScope) =>
          `${title}|${hasChildren ? String(expanded) : 'leaf'}|${String(checked)}|${String(indeterminate)}`,
      },
    })
    expect(itemByText(wrapper, 'src|true|false|false').exists()).toBe(true)
    expect(itemByText(wrapper, 'Button|leaf|false|false').exists()).toBe(true)
  })

  it('点击节点发出 update:modelValue 与 select（载荷 { key, node, selected }）', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'Button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('button')
    const selectPayload = wrapper.emitted('select')?.[0]?.[0] as Record<string, unknown>
    expect(selectPayload.key).toBe('button')
    expect(selectPayload.selected).toBe(true)
    expect((selectPayload.node as TreeNode).title).toBe('Button')
  })

  it('点击展开开关发出 expand（载荷 { key, node, expanded, expandedKeys }）', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'src').find('button.ui-tree__toggle').trigger('click')
    expect(wrapper.emitted('expand')?.[0]?.[0]).toEqual({
      key: 'src',
      node: expect.objectContaining({ key: 'src' }),
      expanded: false,
      expandedKeys: ['components'],
    })
  })

  it('checkable：change 勾选发出 check（载荷含级联后 checkedKeys 快照）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'src').find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('check')?.[0]?.[0]).toEqual({
      key: 'src',
      node: expect.objectContaining({ key: 'src' }),
      checked: true,
      checkedKeys: ['src', 'components', 'button', 'input', 'index'],
    })
  })
})
