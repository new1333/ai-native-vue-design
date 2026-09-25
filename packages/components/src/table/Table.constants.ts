/**
 * table/ —— 逻辑常量收口（排序循环、aria 映射、骨架行数；不是视觉值，视觉只走 --ui-* token）。
 */
import type { TableAlign, TableSortOrder } from './Table.types'

/** align 全集（与 Table.types.ts 的 TableAlign 一一对应）。 */
export const TABLE_ALIGNMENTS: readonly TableAlign[] = ['left', 'right']

/** 排序方向全集。 */
export const TABLE_SORT_ORDERS = ['asc', 'desc', 'none'] as const

/** 排序方向常量（避免裸字符串散落）。 */
export const TABLE_SORT_ASC = 'asc' as const
export const TABLE_SORT_DESC = 'desc' as const
export const TABLE_SORT_NONE = 'none' as const

/** 点击可排序列表头的循环：asc → desc → none → asc（none 起点即 asc）。 */
export const TABLE_SORT_CYCLE: readonly TableSortOrder[] = ['asc', 'desc', 'none']

/**
 * 字符串列排序的整理 locale：简体中文拼音序（程 < 顾 < 江 < …，而非 Unicode 码点序）。
 * 比较器创建与回退策略见 useTableSort.ts 的 createStringCompare。
 */
export const TABLE_SORT_LOCALE = 'zh-Hans-CN'

/** TableSortOrder → aria-sort 值（WAI-ARIA）。 */
export const TABLE_ARIA_SORT: Readonly<Record<TableSortOrder, 'ascending' | 'descending' | 'none'>> = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
}

/** loading 时的骨架行数。 */
export const TABLE_SKELETON_ROWS = 3

/** 空态默认文案（empty 插槽缺省值；文案常量非视觉值）。 */
export const TABLE_EMPTY_TEXT_DEFAULT = '暂无数据'

/**
 * 排序按钮的键盘激活键：与 button/ 的 ButtonRoot 同一策略——
 * keydown 阶段统一 preventDefault 后由元素 .click() 触发，
 * 保证测试环境（happy-dom）与真实浏览器一致且不双触发。
 */
export const TABLE_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']
