// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { DefineComponent, VNode } from 'vue'
import Tree from './Tree.vue'
import { TREE_EMPTY_TEXT_DEFAULT } from './Tree.constants'
import type { TreeNode, TreeNodeSlotScope } from './Tree.types'

const data: TreeNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'components',
        title: 'components',
        children: [{ key: 'button', title: 'Button' }],
      },
    ],
  },
  { key: 'readme', title: 'README.md', disabled: true },
]

/** 以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const TreeFixture = Tree as unknown as DefineComponent<{ data: TreeNode[] }>

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Tree ssr', () => {
  it('renderToString 无异常且包含 ui-tree 根类与 role=tree/treeitem 语义', async () => {
    const html = await render(() => h(TreeFixture, { data }))
    expect(html).toContain('ui-tree')
    expect(html).toContain('role="tree"')
    expect(html).toContain('role="treeitem"')
    expect(html).toContain('role="none"')
    expect(html).toContain('aria-level="2"')
  })

  it('非受控默认展开全部父节点：aria-expanded="true" 与全部节点随 SSR 输出', async () => {
    const html = await render(() => h(TreeFixture, { data }))
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('src')
    expect(html).toContain('Button')
    expect(html).toContain('README.md')
    expect(html).toContain('aria-selected="false"')
  })

  it('受控折叠：子树不输出，aria-expanded="false"', async () => {
    const html = await render(() => h(TreeFixture, { data, expandedKeys: [] }))
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Button')
  })

  it('选中值随 SSR 输出（aria-selected="true"）', async () => {
    const html = await render(() => h(TreeFixture, { data, modelValue: 'button' }))
    expect(html).toContain('aria-selected="true"')
  })

  it('checkable：原生 checkbox 与 aria-label 随 SSR 输出', async () => {
    const html = await render(() => h(TreeFixture, { data, checkable: true }))
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('aria-label="Button"')
  })

  it('disabled：aria-disabled="true" 与原生 disabled checkbox 随 SSR 输出', async () => {
    const html = await render(() => h(TreeFixture, { data, checkable: true }))
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('disabled')
  })

  it('loading：aria-busy="true" 与骨架行随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() => h(TreeFixture, { data, loading: true }))
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('ui-tree__item--skeleton')
    expect(html).not.toContain('Button')
  })

  it('空态：默认文案随 SSR 输出且无 role=tree', async () => {
    const html = await render(() => h(TreeFixture, { data: [] }))
    expect(html).toContain(TREE_EMPTY_TEXT_DEFAULT)
    expect(html).not.toContain('role="tree"')
  })

  it('empty / #node 插槽随 SSR 输出（作用域数据可用）', async () => {
    const html = await render(() =>
      h(TreeFixture, { data }, {
        empty: () => '目录为空',
        node: ({ title, level, icon }: TreeNodeSlotScope) => `★${title ?? ''}@L${level}@${icon ?? '-'}`,
      }),
    )
    // node 插槽作用：此处 data 无 icon，占位符输出。
    expect(html).toContain('★src@L1@-')
    // empty 插槽在非空 data 下不渲染。
    expect(html).not.toContain('目录为空')

    const emptyHtml = await render(() => h(TreeFixture, { data: [] }, { empty: () => '目录为空' }))
    expect(emptyHtml).toContain('目录为空')
  })

  it('icon 字段经 #node 作用域透出（默认渲染不消费）', async () => {
    const withIcon: TreeNode[] = [{ key: 'folder', title: 'Folder', icon: 'folder' }]
    const html = await render(() =>
      h(TreeFixture, { data: withIcon }, {
        node: ({ title, icon }: TreeNodeSlotScope) => `${title}:${icon ?? 'none'}`,
      }),
    )
    expect(html).toContain('Folder:folder')
    expect(html).not.toContain('<svg') // 默认渲染无图标注册表；展开箭头仅在父节点出现
  })
})
