/**
 * useTableSort —— Table 的排序状态机 composable（headless）。
 *
 * 收口三类语义：
 *   1. 状态：sortKey / sortOrder，点击可排序列循环 none → asc → desc → none；
 *   2. 派生：sortedRows（data 的浅拷贝排序，不改写传入数组）与 th 的 aria-sort 值；
 *      字符串列按 zh-Hans-CN 拼音序比较（Intl.Collator，见 TABLE_SORT_LOCALE），
 *      数字列按数值比较；
 *   3. 失效复位：columns 变化后当前排序键不存在时自动复位为 none。
 *
 * SSR 安全：不访问任何浏览器 API（Intl 为 ECMA-402 内建）；.click() 只由组件在客户端 keydown 回调中触发。
 */
import { computed, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import {
  TABLE_ARIA_SORT,
  TABLE_SORT_ASC,
  TABLE_SORT_CYCLE,
  TABLE_SORT_LOCALE,
  TABLE_SORT_NONE,
} from './Table.constants'
import type { TableColumn, TableSortOrder, TableSortPayload } from './Table.types'

/** useTableSort 选项。 */
export interface UseTableSortOptions<T> {
  /** 列定义（响应式来源）。 */
  columns: MaybeRefOrGetter<TableColumn<T>[]>
  /** 行数据（响应式来源；只读消费，排序作用于副本）。 */
  data: MaybeRefOrGetter<readonly T[]>
  /** 用户排序（点击/键盘激活）回调，用于发出 sort 事件。 */
  onSort?: (payload: TableSortPayload) => void
}

/** th 的 aria-sort 值：仅可排序列给出，其余列不写该属性。 */
export type TableAriaSortValue = 'ascending' | 'descending' | 'none'

/** useTableSort 返回值。 */
export interface UseTableSortReturn<T> {
  /** 当前排序键（'' 表示从未排序；order=none 时保留最后排序键）。 */
  sortKey: Ref<string>
  /** 当前排序方向。 */
  sortOrder: Ref<TableSortOrder>
  /** 渲染行：order 为 none 或排序键失效时等于 data 的浅拷贝。 */
  sortedRows: ComputedRef<T[]>
  /** 计算某列 th 的 aria-sort；非可排序列返回 undefined（不写属性）。 */
  ariaSortValue: (column: TableColumn<T>) => TableAriaSortValue | undefined
  /** 某列是否处于激活排序（asc/desc），驱动指示图标。 */
  isSortActive: (column: TableColumn<T>) => boolean
  /** 切换某列排序（非可排序列为 no-op）；走 none → asc → desc → none 循环并回调 onSort。 */
  toggleSort: (column: TableColumn<T>) => void
  /** 复位排序到 none（不发 sort 事件）。 */
  clearSort: () => void
}

/** 循环的下一档：asc → desc → none → asc。 */
function nextOrder(order: TableSortOrder): TableSortOrder {
  const index = TABLE_SORT_CYCLE.indexOf(order)
  return TABLE_SORT_CYCLE[(index + 1) % TABLE_SORT_CYCLE.length] ?? TABLE_SORT_ASC
}

/**
 * 字符串列的 locale 感知比较器工厂（locale 为 zh-Hans-CN，拼音序）。
 * 回退链：Intl.Collator 缺失或构造失败 → String.prototype.localeCompare（显式 locale）
 * → 码点比较（无 Intl 的极端运行时）。
 * Intl 是 ECMA-402 内建对象（非浏览器 API），Node 环境同样可用；
 * full-icu 的 Node 下 zh-Hans-CN 拼音整理可用，small-icu/缺数据环境会静默回落
 * 根 locale 整理（不抛异常），模块顶层创建 SSR 安全。
 */
function createStringCompare(locale: string): (a: string, b: string) => number {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator === 'function') {
      const collator = new Intl.Collator(locale)
      return (a, b) => collator.compare(a, b)
    }
  } catch {
    // locale 非法等构造异常：走 localeCompare 回退。
  }
  return (a, b) => {
    try {
      return a.localeCompare(b, locale)
    } catch {
      return a < b ? -1 : a > b ? 1 : 0
    }
  }
}

/** 字符串比较函数：模块级单例，排序热路径零构造开销（远快于逐次 localeCompare）。 */
const compareStrings = createStringCompare(TABLE_SORT_LOCALE)

/** 排序比较：双方均为有限数字时按数值，其余按字符串 locale 感知（拼音序）比较。 */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b)) {
    return a - b
  }
  return compareStrings(String(a), String(b))
}

/** Table 排序状态机 composable。 */
export function useTableSort<T>(options: UseTableSortOptions<T>): UseTableSortReturn<T> {
  const sortKey = ref('')
  const sortOrder = ref<TableSortOrder>(TABLE_SORT_NONE)

  // 当前生效的可排序列（键存在且声明 sortable）。
  const activeColumn = computed<TableColumn<T> | null>(() => {
    if (sortOrder.value === TABLE_SORT_NONE) return null
    const columns = toValue(options.columns)
    return columns.find((column) => column.key === sortKey.value && column.sortable) ?? null
  })

  // columns 变化后排序键失效（或列不再 sortable）时复位，避免悬挂的 aria-sort。
  watch(
    () => toValue(options.columns),
    () => {
      if (sortOrder.value !== TABLE_SORT_NONE && activeColumn.value === null) {
        clearSort()
      }
    },
  )

  const sortedRows = computed<T[]>(() => {
    const rows = [...toValue(options.data)]
    const column = activeColumn.value
    if (column === null) return rows
    const direction = sortOrder.value === TABLE_SORT_ASC ? 1 : -1
    const key = column.key as keyof T
    // Array.prototype.sort 现代引擎稳定；只排浅拷贝，不改写 props.data。
    return rows.sort((a, b) => direction * compareValues(a[key], b[key]))
  })

  function ariaSortValue(column: TableColumn<T>): TableAriaSortValue | undefined {
    if (!column.sortable) return undefined
    if (column.key !== sortKey.value) return TABLE_ARIA_SORT.none
    return TABLE_ARIA_SORT[sortOrder.value]
  }

  function isSortActive(column: TableColumn<T>): boolean {
    return column.key === sortKey.value && sortOrder.value !== TABLE_SORT_NONE
  }

  function toggleSort(column: TableColumn<T>): void {
    if (!column.sortable) return
    if (sortKey.value !== column.key) {
      sortKey.value = column.key
      sortOrder.value = TABLE_SORT_ASC
    } else {
      sortOrder.value = nextOrder(sortOrder.value)
    }
    options.onSort?.({ key: sortKey.value, order: sortOrder.value })
  }

  function clearSort(): void {
    sortKey.value = ''
    sortOrder.value = TABLE_SORT_NONE
  }

  return { sortKey, sortOrder, sortedRows, ariaSortValue, isSortActive, toggleSort, clearSort }
}
