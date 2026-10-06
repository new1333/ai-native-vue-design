// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { DefineComponent, VNode } from 'vue'
import Table from './Table.vue'
import type { TableColumn, TableProps } from './Table.types'

interface Row {
  id: number
  name: string
  score: number
}

const columns: TableColumn<Row>[] = [
  { key: 'name', label: '名称' },
  { key: 'score', label: '得分', align: 'right', sortable: true },
]

const rows: Row[] = [
  { id: 1, name: 'pine', score: 90 },
  { id: 2, name: 'bamboo', score: 70 },
]

/** 泛型组件的 T 无法经 h 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const TableFixture = Table as unknown as DefineComponent<TableProps<Row>>

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Table ssr', () => {
  it('renderToString 无异常且包含 ui-table 根类与语义结构', async () => {
    const html = await render(() => h(TableFixture, { columns, data: rows, rowKey: 'id' }))
    expect(html).toContain('ui-table')
    expect(html).toContain('<table')
    expect(html).toContain('<thead')
    expect(html).toContain('<tbody')
    expect(html).toContain('scope="col"')
  })

  it('数据行与单元格内容随 SSR 输出', async () => {
    const html = await render(() => h(TableFixture, { columns, data: rows, rowKey: 'id' }))
    expect(html).toContain('pine')
    expect(html).toContain('bamboo')
    expect(html).toContain('90')
  })

  it('可排序列：th 带 aria-sort="none"，表头为原生 button（type=button）', async () => {
    const html = await render(() => h(TableFixture, { columns, data: rows, rowKey: 'id' }))
    expect(html).toContain('aria-sort="none"')
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
  })

  it('loading：aria-busy="true" 与骨架行随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() =>
      h(TableFixture, { columns, data: rows, rowKey: 'id', loading: true }),
    )
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('ui-table__row--skeleton')
    expect(html).not.toContain('pine')
  })

  it('空态：默认文案“暂无数据”与 colspan 随 SSR 输出', async () => {
    const html = await render(() => h(TableFixture, { columns, data: [], rowKey: 'id' }))
    expect(html).toContain('暂无数据')
    expect(html).toContain('colspan="2"')
  })

  it('empty / cell-<key> / header-<key> 插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(TableFixture, { columns, data: rows, rowKey: 'id' }, {
        empty: () => '还没有记录',
        'cell-name': ({ row }: { row: Row }) => `★${row.name}`,
        'header-name': ({ label }: { label: string }) => `${label}!`,
      }),
    )
    expect(html).toContain('★pine')
    expect(html).toContain('名称!')
  })

  it('行选择：选择列（表头全选 + 行 checkbox）与禁用态随 SSR 输出（不触达浏览器 API）', async () => {
    const html = await render(() =>
      h(TableFixture, {
        columns,
        data: rows,
        rowKey: 'id',
        rowSelection: { getCheckboxProps: (row: Row) => ({ disabled: row.name === 'bamboo' }) },
        selectedRowKeys: [1],
      }),
    )
    expect(html).toContain('scope="col"') // 选择列 th 同样带 scope
    // 表头全选 + 每行各一个 checkbox
    expect(html.split('type="checkbox"').length - 1).toBe(rows.length + 1)
    expect(html).toContain('disabled') // 禁用行随 SSR 输出（原生 disabled 属性）
  })

  it('remote + 可排序列：SSR 无异常，排序按钮与 aria-sort 照常输出', async () => {
    const html = await render(() =>
      h(TableFixture, { columns, data: rows, rowKey: 'id', remote: true }),
    )
    expect(html).toContain('<button')
    expect(html).toContain('aria-sort="none"')
    expect(html).toContain('pine')
  })
})
