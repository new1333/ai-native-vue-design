// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；面板仅客户端（SSR 不出现 tree/treeitem）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import TreeSelect from './TreeSelect.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('TreeSelect ssr', () => {
  it('renderToString 无异常且包含 ui-tree-select 根类与 combobox 触发器', async () => {
    const html = await render(() => h(TreeSelect))
    expect(html).toContain('ui-tree-select')
    expect(html).toContain('<button')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-haspopup="tree"')
  })

  it('默认档：默认 placeholder、aria-expanded=false、aria-controls 随 SSR 输出，无 disabled', async () => {
    const html = await render(() => h(TreeSelect))
    expect(html).toContain('请选择')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="ui-tree-select-tree-')
    expect(html).not.toContain('disabled')
  })

  it('面板仅客户端：SSR 输出不含 tree / treeitem / 空态文案', async () => {
    const html = await render(() =>
      h(TreeSelect, { options: [{ label: '研发部', value: 'rd' }], emptyText: '暂无选项' }),
    )
    expect(html).not.toContain('role="tree"')
    expect(html).not.toContain('role="treeitem"')
    expect(html).not.toContain('暂无选项')
  })

  it('单选已选值：触发器显示节点 label 而非 placeholder', async () => {
    const html = await render(() =>
      h(TreeSelect, {
        options: [
          { label: '研发部', value: 'rd' },
          { label: '设计部', value: 'design' },
        ],
        modelValue: 'design',
      }),
    )
    expect(html).toContain('设计部')
    expect(html).not.toContain('请选择')
  })

  it('multiple 数组值：触发器以「、」连接命中 label 随 SSR 输出', async () => {
    const html = await render(() =>
      h(TreeSelect, {
        options: [
          { label: '研发部', value: 'rd' },
          { label: '设计部', value: 'design' },
        ],
        multiple: true,
        modelValue: ['rd', 'design'],
      }),
    )
    expect(html).toContain('研发部、设计部')
  })

  it('checkable 父值级联：触发器显示全勾选 label 集随 SSR 输出', async () => {
    const html = await render(() =>
      h(TreeSelect, {
        options: [
          {
            label: '研发部',
            value: 'rd',
            children: [{ label: '前端组', value: 'fe' }],
          },
        ],
        checkable: true,
        modelValue: ['rd'],
      }),
    )
    expect(html).toContain('研发部、前端组')
  })

  it('disabled / 自定义 placeholder / 数字 value 随 SSR 输出', async () => {
    const html = await render(() =>
      h(TreeSelect, {
        options: [
          { label: '一级', value: 1 },
          { label: '二级', value: 2 },
        ],
        modelValue: 1,
        placeholder: '选择层级',
        disabled: true,
      }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('一级')
    expect(html).not.toContain('选择层级')
  })

  it('clearable + 有值：清空按钮与 aria-label="清空" 随 SSR 输出，未选/空数组不渲染', async () => {
    const options = [{ label: '研发部', value: 'rd' }]
    const withValue = await render(() =>
      h(TreeSelect, { options, modelValue: 'rd', clearable: true }),
    )
    expect(withValue).toContain('ui-tree-select__clear')
    expect(withValue).toContain('aria-label="清空"')
    const withoutValue = await render(() => h(TreeSelect, { options, clearable: true }))
    expect(withoutValue).not.toContain('ui-tree-select__clear')
    const emptyArray = await render(() =>
      h(TreeSelect, { options, multiple: true, modelValue: [], clearable: true }),
    )
    expect(emptyArray).not.toContain('ui-tree-select__clear')
  })

  it('attrs 透传在 SSR 即落位触发器 button（id / aria-describedby）', async () => {
    const html = await render(() => h(TreeSelect, { id: 'ssr-tree-select', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<button[^>]*id="ssr-tree-select"/)
    expect(html).toMatch(/<button[^>]*aria-describedby="tip"/)
  })
})
