// api spec：props 默认值 / emits 声明 / slots 渲染 / 语义结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import Table from './Table.vue'
import { TABLE_SKELETON_ROWS } from './Table.constants'
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
  { id: 1, name: '松', score: 90 },
  { id: 2, name: '竹', score: 70 },
  { id: 3, name: '梅', score: 80 },
]

/**
 * 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接
 * （显式类型桥接，非 any；props 仍按 TableProps<Row> 全量检查）。
 */
const TableFixture = Table as unknown as DefineComponent<TableProps<Row>>

describe('Table api', () => {
  it('语义结构：根类 ui-table，内含 table/thead/tbody，th 带 scope=col', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    expect(wrapper.classes()).toContain('ui-table')
    expect(wrapper.find('table.ui-table__table').exists()).toBe(true)
    expect(wrapper.find('thead.ui-table__head').exists()).toBe(true)
    expect(wrapper.find('tbody.ui-table__body').exists()).toBe(true)
    const heads = wrapper.findAll('th.ui-table__th')
    expect(heads).toHaveLength(columns.length)
    for (const head of heads) {
      expect(head.attributes('scope')).toBe('col')
    }
    expect(heads[0]?.text()).toContain('名称')
    expect(heads[1]?.text()).toContain('得分')
  })

  it('行/单元格渲染：tbody 行数=data.length，单元格默认取值 row[key]', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const bodyRows = wrapper.findAll('tbody .ui-table__row')
    expect(bodyRows).toHaveLength(rows.length)
    const cells = wrapper.findAll('tbody td.ui-table__td')
    expect(cells).toHaveLength(rows.length * columns.length)
    expect(cells[0]?.text()).toBe('松')
    expect(cells[1]?.text()).toBe('90')
  })

  it('默认不排序：保持 data 原始顺序', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const names = wrapper.findAll('tbody td.ui-table__td').filter((_, i) => i % 2 === 0).map((c) => c.text())
    expect(names).toEqual(['松', '竹', '梅'])
  })

  it('align=right：数字列 th/td 带 ui-table__cell--right，其余列不带', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    expect(wrapper.findAll('th.ui-table__th')[1]?.classes()).toContain('ui-table__cell--right')
    expect(wrapper.findAll('th.ui-table__th')[0]?.classes()).not.toContain('ui-table__cell--right')
    const firstRowCells = wrapper.findAll('tbody tr')[0]?.findAll('td.ui-table__td')
    expect(firstRowCells?.[1]?.classes()).toContain('ui-table__cell--right')
    expect(firstRowCells?.[0]?.classes()).not.toContain('ui-table__cell--right')
  })

  it('width：number 视为 px，string 原样落到 th 内联样式', () => {
    const wide: TableColumn<Row>[] = [
      { key: 'name', label: '名称', width: 120 },
      { key: 'score', label: '得分', width: '30%' },
    ]
    const wrapper = mount(TableFixture, { props: { columns: wide, data: rows, rowKey: 'id' } })
    const heads = wrapper.findAll('th.ui-table__th')
    // 去空白后断言，兼容 happy-dom 的 style 序列化（"width: 120px" / "width:120px"）。
    expect((heads[0]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('width:120px')
    expect((heads[1]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('width:30%')
  })

  it('rowKey 支持函数形式（stable key 来源）', () => {
    const wrapper = mount(TableFixture, {
      props: { columns, data: rows, rowKey: (row: Row) => `row-${row.id}` },
    })
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(rows.length)
    expect(wrapper.findAll('tbody td.ui-table__td')[0]?.text()).toBe('松')
  })

  it('loading 默认 false：无骨架行、table 无 aria-busy', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    expect(wrapper.find('.ui-table__row--skeleton').exists()).toBe(false)
    expect(wrapper.find('table.ui-table__table').attributes('aria-busy')).toBeUndefined()
  })

  it('loading=true：渲染 3 行骨架行、不渲染数据行，table 置 aria-busy="true"', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id', loading: true } })
    const skeletons = wrapper.findAll('.ui-table__row--skeleton')
    expect(skeletons).toHaveLength(TABLE_SKELETON_ROWS)
    expect(wrapper.findAll('tbody td.ui-table__td')).toHaveLength(
      TABLE_SKELETON_ROWS * columns.length,
    )
    expect(wrapper.text()).not.toContain('松')
    expect(wrapper.find('table.ui-table__table').attributes('aria-busy')).toBe('true')
  })

  it('空态默认：非 loading 且 data 为空时渲染“暂无数据”，colspan 跨全列', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: [], rowKey: 'id' } })
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(1)
    const emptyCell = wrapper.find('td.ui-table__empty')
    expect(emptyCell.exists()).toBe(true)
    expect(emptyCell.text()).toBe('暂无数据')
    expect(emptyCell.attributes('colspan')).toBe(String(columns.length))
  })

  it('empty 插槽覆盖默认空态文案', () => {
    const wrapper = mount(TableFixture, {
      props: { columns, data: [], rowKey: 'id' },
      slots: { empty: () => '还没有记录' },
    })
    expect(wrapper.find('td.ui-table__empty').text()).toBe('还没有记录')
    expect(wrapper.text()).not.toContain('暂无数据')
  })

  it('cell-<key> 插槽按列渲染，作用域含 row/value/index', () => {
    const wrapper = mount(TableFixture, {
      props: { columns, data: rows, rowKey: 'id' },
      slots: {
        'cell-name': ({ row, value, index }: { row: Row; value: unknown; index: number }) =>
          `${String(value)}#${row.id}@${index}`,
      },
    })
    const firstRowCells = wrapper.findAll('tbody tr')[0]?.findAll('td.ui-table__td')
    expect(firstRowCells?.[0]?.text()).toBe('松#1@0')
    expect(firstRowCells?.[1]?.text()).toBe('90')
  })

  it('header-<key> 插槽覆盖表头（覆盖后该列无内置排序按钮）', () => {
    const wrapper = mount(TableFixture, {
      props: { columns, data: rows, rowKey: 'id' },
      slots: { 'header-name': ({ label }: { label: string }) => `${label}（必填）` },
    })
    const heads = wrapper.findAll('th.ui-table__th')
    expect(heads[0]?.text()).toContain('名称（必填）')
    expect(heads[0]?.find('button').exists()).toBe(false)
    expect(heads[1]?.find('button.ui-table__sort').exists()).toBe(true)
  })

  it('可排序列表头渲染原生 button；非可排序列不渲染按钮', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const heads = wrapper.findAll('th.ui-table__th')
    expect(heads[0]?.find('button').exists()).toBe(false)
    const sortButton = heads[1]?.find('button.ui-table__sort')
    expect(sortButton?.exists()).toBe(true)
    expect(sortButton?.attributes('type')).toBe('button')
    expect(sortButton?.text()).toContain('得分')
  })

  it('sort 已声明：排序激活时携带 { key, order } 载荷发出', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    await wrapper.find('button.ui-table__sort').trigger('click')
    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ key: 'score', order: 'asc' })
  })
})
