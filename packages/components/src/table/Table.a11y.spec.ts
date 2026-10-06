// a11y spec：语义结构 / aria-sort / 原生排序按钮 / 键盘 Enter·Space / 骨架 aria。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import Table from './Table.vue'
import type { TableColumn, TableExpose, TableProps, TableRowSelection } from './Table.types'

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

/** 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const TableFixture = Table as unknown as DefineComponent<TableProps<Row>>

describe('Table a11y', () => {
  it('语义 table 结构：table 内 thead/tbody，th 带 scope="col"', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const table = wrapper.find('table.ui-table__table')
    expect(table.exists()).toBe(true)
    expect(table.find('thead').exists()).toBe(true)
    expect(table.find('tbody').exists()).toBe(true)
    for (const head of wrapper.findAll('th.ui-table__th')) {
      expect(head.attributes('scope')).toBe('col')
    }
  })

  it('可排序列 th 常驻 aria-sort；非可排序列不写该属性', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const heads = wrapper.findAll('th.ui-table__th')
    expect(heads[0]?.attributes('aria-sort')).toBeUndefined()
    expect(heads[1]?.attributes('aria-sort')).toBe('none')
  })

  it('aria-sort 随排序循环切换 none → ascending → descending → none', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const head = wrapper.findAll('th.ui-table__th')[1]
    const button = wrapper.find('button.ui-table__sort')
    expect(head?.attributes('aria-sort')).toBe('none')

    await button.trigger('click')
    expect(head?.attributes('aria-sort')).toBe('ascending')

    await button.trigger('click')
    expect(head?.attributes('aria-sort')).toBe('descending')

    await button.trigger('click')
    expect(head?.attributes('aria-sort')).toBe('none')
  })

  it('排序入口为原生 <button type="button">，可读名即列 label；排序图标 aria-hidden', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const button = wrapper.find('button.ui-table__sort')
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toContain('得分')
    const icon = button.find('.ui-table__sort-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('aria-hidden')).toBe('true')
  })

  it('键盘 Enter：触发且仅触发一次 sort（preventDefault 拦截原生二次激活）', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    await wrapper.find('button.ui-table__sort').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ key: 'score', order: 'asc' })
  })

  it('键盘 Space（" "）：触发且仅触发一次 sort', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    await wrapper.find('button.ui-table__sort').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('sort')).toHaveLength(1)
  })

  it('键盘激活时 preventDefault：Enter 与 Space 均被拦截（Space 不滚动页面）', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const button = wrapper.find('button.ui-table__sort').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    button.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    expect(wrapper.emitted('sort')).toHaveLength(1)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    button.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    expect(wrapper.emitted('sort')).toHaveLength(2)
  })

  it('非激活键（Tab、A）不触发 sort', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    await wrapper.find('button.ui-table__sort').trigger('keydown', { key: 'Tab' })
    await wrapper.find('button.ui-table__sort').trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('sort')).toBeUndefined()
  })

  it('loading：table 置 aria-busy="true"，骨架行 aria-hidden="true"', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id', loading: true } })
    expect(wrapper.find('table.ui-table__table').attributes('aria-busy')).toBe('true')
    for (const row of wrapper.findAll('.ui-table__row--skeleton')) {
      expect(row.attributes('aria-hidden')).toBe('true')
    }
  })

  it('非 loading：table 不出现 aria-busy', () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    expect(wrapper.find('table.ui-table__table').attributes('aria-busy')).toBeUndefined()
  })

  it('expose.clearSort()：复位排序，aria-sort 回到 none', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    await wrapper.find('button.ui-table__sort').trigger('click')
    const head = wrapper.findAll('th.ui-table__th')[1]
    expect(head?.attributes('aria-sort')).toBe('ascending')
    ;(wrapper.vm as unknown as TableExpose).clearSort()
    await wrapper.vm.$nextTick()
    expect(head?.attributes('aria-sort')).toBe('none')
    expect(wrapper.emitted('sort')).toHaveLength(1) // 复位不发 sort
  })
})

describe('Table a11y: 行选择', () => {
  const selColumns: TableColumn<Row>[] = [
    { key: 'name', label: '名称' },
    { key: 'score', label: '得分', align: 'right', sortable: true },
  ]
  const selRows: Row[] = [
    { id: 1, name: 'pine', score: 90 },
    { id: 2, name: 'bamboo', score: 70 },
    { id: 3, name: 'plum', score: 80 },
  ]
  const disableBamboo: TableRowSelection<Row> = {
    getCheckboxProps: (row) => ({ disabled: row.name === 'bamboo' }),
  }

  it('选择列 th 带 scope="col"；表头与行 checkbox 均为原生 input（语义原生表达，不书 role/aria-checked）', () => {
    const wrapper = mount(TableFixture, {
      props: { columns: selColumns, data: selRows, rowKey: 'id', rowSelection: {} },
    })
    const heads = wrapper.findAll('th.ui-table__th')
    expect(heads[0]?.attributes('scope')).toBe('col')
    const inputs = wrapper.findAll('input[type="checkbox"]')
    expect(inputs).toHaveLength(selRows.length + 1) // 表头全选 + 行
    for (const input of inputs) {
      expect((input.element as HTMLInputElement).type).toBe('checkbox')
      expect(input.attributes('role')).toBeUndefined()
      expect(input.attributes('aria-checked')).toBeUndefined()
    }
  })

  it('可读名：表头 checkbox aria-label="全选"，行 checkbox aria-label="选择此行"', () => {
    const wrapper = mount(TableFixture, {
      props: { columns: selColumns, data: selRows, rowKey: 'id', rowSelection: {} },
    })
    expect(wrapper.find('thead input[type="checkbox"]').attributes('aria-label')).toBe('全选')
    for (const box of wrapper.findAll('tbody input[type="checkbox"]')) {
      expect(box.attributes('aria-label')).toBe('选择此行')
    }
  })

  it('半选状态经 DOM indeterminate property 暴露给读屏；全选时 checked 且半选清除', async () => {
    const wrapper = mount(TableFixture, {
      props: {
        columns: selColumns,
        data: selRows,
        rowKey: 'id',
        rowSelection: {},
        selectedRowKeys: [1],
      },
      attachTo: document.body,
    })
    const headerInput = wrapper.find('thead input[type="checkbox"]').element as HTMLInputElement
    expect(headerInput.indeterminate).toBe(true)
    expect(headerInput.checked).toBe(false)
    await wrapper.setProps({ selectedRowKeys: [1, 2] })
    expect(headerInput.indeterminate).toBe(true)
    await wrapper.setProps({ selectedRowKeys: [1, 2, 3] })
    expect(headerInput.indeterminate).toBe(false)
    expect(headerInput.checked).toBe(true)
    wrapper.unmount()
  })

  it('禁用行 checkbox 原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const wrapper = mount(TableFixture, {
      props: { columns: selColumns, data: selRows, rowKey: 'id', rowSelection: disableBamboo },
    })
    const boxes = wrapper.findAll('tbody input[type="checkbox"]')
    expect(boxes[1]?.attributes('disabled')).toBeDefined()
    expect(boxes[1]?.attributes('aria-disabled')).toBeUndefined()
    expect(boxes[0]?.attributes('disabled')).toBeUndefined()
  })

  it('键盘路径：行 checkbox keydown 不被拦截（Space 原生切换保留），change 发出 update:selectedRowKeys', async () => {
    const wrapper = mount(TableFixture, {
      props: { columns: selColumns, data: selRows, rowKey: 'id', rowSelection: {} },
      attachTo: document.body,
    })
    const box = wrapper.findAll('tbody input[type="checkbox"]')[0]
    const control = box?.element as HTMLInputElement
    control.focus()
    expect(document.activeElement).toBe(control)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    control.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false) // 原生 Space 切换保留
    await box?.setValue(true) // 键盘切换最终以 change 事件落地
    expect(wrapper.emitted('update:selectedRowKeys')?.[0]?.[0]).toEqual([1])
    wrapper.unmount()
  })
})
