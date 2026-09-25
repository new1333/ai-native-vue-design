// behavior spec：排序循环 / 中文拼音排序 / 数据不可变 / 状态切换 / 千行渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import Table from './Table.vue'
import type { TableColumn, TableProps } from './Table.types'

interface Row {
  id: number
  name: string
  score: number
}

const columns: TableColumn<Row>[] = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'score', label: '得分', align: 'right', sortable: true },
]

// 名称用 ASCII，排序断言不依赖 locale 整理规则。
const rows: Row[] = [
  { id: 1, name: 'pine', score: 90 },
  { id: 2, name: 'bamboo', score: 70 },
  { id: 3, name: 'plum', score: 80 },
]

/** 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const TableFixture = Table as unknown as DefineComponent<TableProps<Row>>

function scoreTexts(wrapper: VueWrapper): string[] {
  return wrapper.findAll('tbody tr').map((tr) => tr.findAll('td')[1]?.text() ?? '')
}

function nameTexts(wrapper: VueWrapper): string[] {
  return wrapper.findAll('tbody tr').map((tr) => tr.findAll('td')[0]?.text() ?? '')
}

describe('Table behavior', () => {
  it('可排序列点击循环 asc → desc → none，行序随之切换', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const button = wrapper.find('button.ui-table__sort') // 首个可排序列：name
    expect(wrapper.findAll('tbody td')[0]?.text()).toBe('pine')

    await button.trigger('click') // none → asc
    expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ key: 'name', order: 'asc' })
    expect(scoreTexts(wrapper)).toEqual(['70', '90', '80']) // name: bamboo/pine/plum

    await button.trigger('click') // asc → desc
    expect(wrapper.emitted('sort')?.[1]?.[0]).toEqual({ key: 'name', order: 'desc' })
    expect(scoreTexts(wrapper)).toEqual(['80', '90', '70']) // name: plum/pine/bamboo

    await button.trigger('click') // desc → none
    expect(wrapper.emitted('sort')?.[2]?.[0]).toEqual({ key: 'name', order: 'none' })
    expect(scoreTexts(wrapper)).toEqual(['90', '70', '80']) // 回到 data 原始顺序

    await button.trigger('click') // none → asc 重新开始
    expect(wrapper.emitted('sort')?.[3]?.[0]).toEqual({ key: 'name', order: 'asc' })
    expect(scoreTexts(wrapper)).toEqual(['70', '90', '80']) // 与第一次 asc 一致
  })

  it('数字列按数值排序而非字符串（9 < 10）', async () => {
    const numeric: Row[] = [
      { id: 1, name: 'a', score: 10 },
      { id: 2, name: 'b', score: 9 },
      { id: 3, name: 'c', score: 100 },
    ]
    const wrapper = mount(TableFixture, { props: { columns, data: numeric, rowKey: 'id' } })
    const scoreButton = wrapper.findAll('button.ui-table__sort')[1]
    await scoreButton?.trigger('click') // asc
    expect(scoreTexts(wrapper)).toEqual(['9', '10', '100'])
    await scoreButton?.trigger('click') // desc
    expect(scoreTexts(wrapper)).toEqual(['100', '10', '9'])
  })

  it('中文字符串列按拼音序（locale 感知）排序，而非 Unicode 码点序', async () => {
    // 与 playground 示例数据同源的中文名单：Unicode 码点序为 林→江→沈→程→苏→闻→陆→顾，
    // 拼音序应为 程→顾→江→林→陆→沈→苏→闻。
    const chinese: Row[] = [
      { id: 1, name: '林晚照', score: 92 },
      { id: 2, name: '沈砚', score: 88 },
      { id: 3, name: '顾清桐', score: 75 },
      { id: 4, name: '苏行舟', score: 95 },
      { id: 5, name: '陆知遥', score: 61 },
      { id: 6, name: '江雨眠', score: 83 },
      { id: 7, name: '程既白', score: 79 },
      { id: 8, name: '闻人语', score: 90 },
    ]
    const wrapper = mount(TableFixture, { props: { columns, data: chinese, rowKey: 'id' } })
    const nameButton = wrapper.findAll('button.ui-table__sort')[0]
    expect(nameTexts(wrapper)[0]).toBe('林晚照') // 未排序：保持 data 原始顺序

    await nameButton?.trigger('click') // name asc：拼音序，首行为「程既白」
    expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ key: 'name', order: 'asc' })
    expect(nameTexts(wrapper)).toEqual([
      '程既白',
      '顾清桐',
      '江雨眠',
      '林晚照',
      '陆知遥',
      '沈砚',
      '苏行舟',
      '闻人语',
    ])

    await nameButton?.trigger('click') // name desc：拼音序倒排
    expect(wrapper.emitted('sort')?.[1]?.[0]).toEqual({ key: 'name', order: 'desc' })
    expect(nameTexts(wrapper)).toEqual([
      '闻人语',
      '苏行舟',
      '沈砚',
      '陆知遥',
      '林晚照',
      '江雨眠',
      '顾清桐',
      '程既白',
    ])

    await nameButton?.trigger('click') // none：回到 data 原始顺序
    expect(wrapper.emitted('sort')?.[2]?.[0]).toEqual({ key: 'name', order: 'none' })
    expect(nameTexts(wrapper)).toEqual([
      '林晚照',
      '沈砚',
      '顾清桐',
      '苏行舟',
      '陆知遥',
      '江雨眠',
      '程既白',
      '闻人语',
    ])
  })

  it('切换到另一可排序列：直接进入该列 asc；再点回原列也从头 asc', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id' } })
    const [nameButton, scoreButton] = wrapper.findAll('button.ui-table__sort')
    await nameButton!.trigger('click') // name asc
    await scoreButton!.trigger('click') // 换列 → score asc
    expect(wrapper.emitted('sort')?.[1]?.[0]).toEqual({ key: 'score', order: 'asc' })
    expect(scoreTexts(wrapper)).toEqual(['70', '80', '90'])
    await nameButton!.trigger('click') // 回到 name → asc（非 desc）
    expect(wrapper.emitted('sort')?.[2]?.[0]).toEqual({ key: 'name', order: 'asc' })
  })

  it('排序不改写传入的 data 数组（内部只排浅拷贝）', async () => {
    const data: Row[] = rows.map((row) => ({ ...row }))
    const wrapper = mount(TableFixture, { props: { columns, data, rowKey: 'id' } })
    await wrapper.findAll('button.ui-table__sort')[1]?.trigger('click')
    await wrapper.findAll('button.ui-table__sort')[1]?.trigger('click')
    expect(data).toEqual(rows)
  })

  it('非可排序列表头无按钮：点击不触发 sort', async () => {
    const narrow: TableColumn<Row>[] = [{ key: 'name', label: '名称' }, { key: 'score', label: '得分' }]
    const wrapper = mount(TableFixture, { props: { columns: narrow, data: rows, rowKey: 'id' } })
    expect(wrapper.find('button').exists()).toBe(false)
    await wrapper.findAll('th.ui-table__th')[0]?.trigger('click')
    expect(wrapper.emitted('sort')).toBeUndefined()
  })

  it('data 变化响应式：追加行后行数与内容更新', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: [...rows], rowKey: 'id' } })
    await wrapper.setProps({ data: [...rows, { id: 4, name: '兰', score: 60 }] })
    const bodyRows = wrapper.findAll('tbody .ui-table__row')
    expect(bodyRows).toHaveLength(4)
    expect(bodyRows[3]?.text()).toContain('兰')
  })

  it('loading → false：骨架行切换为数据行', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: rows, rowKey: 'id', loading: true } })
    expect(wrapper.findAll('.ui-table__row--skeleton')).toHaveLength(3)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.ui-table__row--skeleton').exists()).toBe(false)
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(rows.length)
  })

  it('data → []：数据行切换为空态行', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: [...rows], rowKey: 'id' } })
    await wrapper.setProps({ data: [] })
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(1)
    expect(wrapper.find('td.ui-table__empty').text()).toBe('暂无数据')
  })

  it('排序激活后更新 data：仍按当前排序渲染新数据', async () => {
    const wrapper = mount(TableFixture, { props: { columns, data: [...rows], rowKey: 'id' } })
    await wrapper.findAll('button.ui-table__sort')[1]?.trigger('click') // score asc
    await wrapper.setProps({ data: [...rows, { id: 4, name: '兰', score: 60 }] })
    expect(scoreTexts(wrapper)).toEqual(['60', '70', '80', '90'])
  })

  it('rowKey 字段值非 string/number 时回落行下标，渲染不报错', () => {
    interface Flagged {
      id: number
      on: boolean
    }
    const flagged: TableColumn<Flagged>[] = [{ key: 'on', label: '开关' }]
    const data: Flagged[] = [
      { id: 1, on: true },
      { id: 2, on: false },
    ]
    const FlaggedFixture = Table as unknown as DefineComponent<TableProps<Flagged>>
    const wrapper = mount(FlaggedFixture, { props: { columns: flagged, data, rowKey: 'on' } })
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(data.length)
    expect(wrapper.findAll('tbody td.ui-table__td')[0]?.text()).toBe('true')
  })

  it('渲染 1000 行：DOM 行数与单元格数正确、行键唯一、排序后仍完整（不断言耗时）', async () => {
    const big: Row[] = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `行${i + 1}`,
      score: (i * 7) % 1000,
    }))
    const wrapper = mount(TableFixture, { props: { columns, data: big, rowKey: 'id' } })
    const bodyRows = wrapper.findAll('tbody .ui-table__row')
    expect(bodyRows).toHaveLength(1000)
    expect(wrapper.findAll('tbody td.ui-table__td')).toHaveLength(2000)
    expect(bodyRows[0]?.text()).toContain('行1')
    expect(bodyRows[999]?.text()).toContain('行1000')

    await wrapper.findAll('button.ui-table__sort')[1]?.trigger('click') // score asc
    expect(wrapper.findAll('tbody .ui-table__row')).toHaveLength(1000)
    expect(scoreTexts(wrapper)[0]).toBe('0')
    expect(scoreTexts(wrapper)[999]).toBe('999')
  })
})
