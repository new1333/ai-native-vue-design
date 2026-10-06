/**
 * useTableRowSelection —— Table 的行选择 composable（headless，纯受控）。
 *
 * 收口三类语义：
 *   1. 行键求值：rowKey 字段/函数统一收口（keyOf），字段值非 string/number 时回落行下标
 *      （与渲染 v-for 的 stable key 同一来源）；
 *   2. 派生：表头全选态（allSelected / someSelected 半选）基于当前渲染行集中的可选行
 *      （getCheckboxProps 禁用的行跳过）；选中态完全由受控 selectedRowKeys 派生，组件不持有副本；
 *   3. 变更：toggleRow / toggleAll 计算下一份键数组后回调 onUpdate（emit
 *      update:selectedRowKeys）。跨页保持以键为准：data 更新不清除历史键，全选只合并
 *      当前行集的键、取消全选只移除当前行集的键。
 *
 * SSR 安全：不访问任何浏览器 API（纯状态派生与回调）。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type {
  TableRowCheckboxProps,
  TableRowKey,
  TableRowKeyValue,
  TableRowSelection,
} from './Table.types'

/** useTableRowSelection 选项。 */
export interface UseTableRowSelectionOptions<T> {
  /** 当前渲染行（响应式来源；按渲染顺序，含排序）。 */
  rows: MaybeRefOrGetter<readonly T[]>
  /** 行键契约（同 props.rowKey）。 */
  rowKey: MaybeRefOrGetter<TableRowKey<T>>
  /** 已选行键（受控来源；组件不持有内部副本）。 */
  selectedRowKeys: MaybeRefOrGetter<readonly TableRowKeyValue[]>
  /** 行选择配置；undefined 表示未启用选择列（派生仍可安全调用，恒为空态）。 */
  rowSelection: MaybeRefOrGetter<TableRowSelection<T> | undefined>
  /** 选择变化回调（发出 update:selectedRowKeys，载荷为完整键数组）。 */
  onUpdate: (keys: TableRowKeyValue[]) => void
}

/** useTableRowSelection 返回值。 */
export interface UseTableRowSelectionReturn<T> {
  /** 行键求值：函数直接求值；字段值取 string/number，其余回落行下标。 */
  keyOf: (row: T, index: number) => TableRowKeyValue
  /** 按行 checkbox 配置（getCheckboxProps 归一化；未配置时为空对象）。 */
  checkboxPropsOf: (row: T, index: number) => TableRowCheckboxProps
  /** 某行是否选中（基于受控 keys）。 */
  isRowSelected: (key: TableRowKeyValue) => boolean
  /** 可选行数（禁用行不计）。 */
  selectableCount: ComputedRef<number>
  /** 表头全选是否勾选：全部可选行均选中且至少存在可选行。 */
  allSelected: ComputedRef<boolean>
  /** 表头全选是否半选（indeterminate）：部分可选行选中。 */
  someSelected: ComputedRef<boolean>
  /** 行 checkbox 切换（禁用行 no-op）；checked 为勾选后的目标态。 */
  toggleRow: (row: T, index: number, checked: boolean) => void
  /** 表头全选/取消全选：勾选合并当前可选行键并保留历史键；取消仅移除当前行集键。 */
  toggleAll: (checked: boolean) => void
}

/** Table 行选择 composable（纯受控：状态来源 selectedRowKeys，变更只经 onUpdate 外发）。 */
export function useTableRowSelection<T>(
  options: UseTableRowSelectionOptions<T>,
): UseTableRowSelectionReturn<T> {
  /** 行键求值：读取当前 rowKey 契约（函数或字段，字段值非 string/number 回落下标）。 */
  function keyOf(row: T, index: number): TableRowKeyValue {
    const source = toValue(options.rowKey)
    if (typeof source === 'function') return source(row, index)
    const value = row[source]
    return typeof value === 'string' || typeof value === 'number' ? value : index
  }

  /** 按行 checkbox 配置：未配置 getCheckboxProps 时为空对象（可选不禁用）。 */
  function checkboxPropsOf(row: T, index: number): TableRowCheckboxProps {
    const selection = toValue(options.rowSelection)
    if (selection?.getCheckboxProps === undefined) return {}
    return selection.getCheckboxProps(row, index)
  }

  /** 当前渲染行集中可选行的键（按渲染顺序；禁用行跳过）。 */
  function selectableKeys(): TableRowKeyValue[] {
    const rows = toValue(options.rows)
    const keys: TableRowKeyValue[] = []
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] as T
      if (!checkboxPropsOf(row, index).disabled) keys.push(keyOf(row, index))
    }
    return keys
  }

  /** 受控选中键集合（Set 派生，避免逐行 O(n) 查找）。 */
  const selectedKeySet = computed<Set<TableRowKeyValue>>(() => new Set(toValue(options.selectedRowKeys)))

  /** 可选行数。 */
  const selectableCount = computed(() => selectableKeys().length)

  /** 全选：全部可选行选中且至少一行可选。 */
  const allSelected = computed(() => {
    const keys = selectableKeys()
    if (keys.length === 0) return false
    return keys.every((key) => selectedKeySet.value.has(key))
  })

  /** 半选：部分（非全部）可选行选中。 */
  const someSelected = computed(() => {
    if (allSelected.value) return false
    return selectableKeys().some((key) => selectedKeySet.value.has(key))
  })

  /** 某行是否选中（受控回显）。 */
  function isRowSelected(key: TableRowKeyValue): boolean {
    return selectedKeySet.value.has(key)
  }

  /** 行切换：禁用行 no-op（原生 disabled 已拦截，此处兜底合成事件）；以 Set 去重并保持既有键序。 */
  function toggleRow(row: T, index: number, checked: boolean): void {
    if (checkboxPropsOf(row, index).disabled) return
    const next = new Set(toValue(options.selectedRowKeys))
    const key = keyOf(row, index)
    if (checked) next.add(key)
    else next.delete(key)
    options.onUpdate([...next])
  }

  /** 全选/取消全选：只作用于当前行集的键，历史键（跨页）保持。 */
  function toggleAll(checked: boolean): void {
    const keys = selectableKeys()
    if (keys.length === 0) return
    const next = new Set(toValue(options.selectedRowKeys))
    for (const key of keys) {
      if (checked) next.add(key)
      else next.delete(key)
    }
    options.onUpdate([...next])
  }

  return {
    keyOf,
    checkboxPropsOf,
    isRowSelected,
    selectableCount,
    allSelected,
    someSelected,
    toggleRow,
    toggleAll,
  }
}
