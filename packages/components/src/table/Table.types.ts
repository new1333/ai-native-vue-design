/**
 * table/ —— Table 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Table.meta.ts 的 api 字段保持一致。
 */
import type { ComponentPublicInstance, VNode } from 'vue'

/** 列内容对齐档位；right 面向数字列（tabular-nums）。 */
export type TableAlign = 'left' | 'right'

/** 排序方向；'none' 表示未排序（排序循环 none → asc → desc → none）。 */
export type TableSortOrder = 'asc' | 'desc' | 'none'

/** 行键：取 T 的字段名，或给函数按行计算（返回 string | number）。 */
export type TableRowKey<T> = keyof T | ((row: T, index: number) => string | number)

/** 列定义。key 同时承担取值（row[key]）、单元格/表头插槽命名（cell-<key> / header-<key>）与排序键。 */
export interface TableColumn<T> {
  /**
   * 列键：默认渲染取 row[key]，插槽名为 `cell-${key}` / `header-${key}`。
   * 联合 keyof T 提供字面量补全；保留任意 string 以支持纯插槽列/计算列。
   */
  key: Extract<keyof T, string> | (string & Record<never, never>)
  /** 表头文案（未提供 header-<key> 插槽时渲染）。 */
  label: string
  /** 列宽；number 视为 px，string 原样（如 '30%'）。 */
  width?: string | number
  /** 对齐；'right' 面向数字列，自动应用 tabular-nums。 */
  align?: TableAlign
  /** 可排序：表头渲染为 button，点击循环 asc → desc → none 并发出 sort 事件。 */
  sortable?: boolean
}

/** sort 事件载荷。 */
export interface TableSortPayload {
  /** 当前排序列的 key；order 为 'none' 时保留最后排序键。 */
  key: string
  /** 排序方向。 */
  order: TableSortOrder
}

/** Table 的 Props。 */
export interface TableProps<T> {
  /** 列定义。 */
  columns: TableColumn<T>[]
  /** 行数据；组件内部排序只作用于渲染副本，不改写传入数组。 */
  data: T[]
  /** 行键（必填）：v-for 的 stable key 来源；字段值非 string/number 时回落行下标。 */
  rowKey: TableRowKey<T>
  /** 加载中：表头之外渲染骨架行并置 aria-busy="true"。 */
  loading?: boolean
}

/** Table 的 Emits（Vue 3.3+ 元组语法）。 */
export interface TableEmits {
  /** 排序变化：点击可排序列表头（或键盘 Enter/Space 激活）时发出，载荷 { key, order }。 */
  sort: [payload: TableSortPayload]
}

/** `cell-<key>` 单元格插槽作用域。 */
export interface TableCellScope<T> {
  /** 当前行数据。 */
  row: T
  /** 默认取值 row[column.key]（null/undefined/对象渲染为空串）。 */
  value: unknown
  /** 当前列定义。 */
  column: TableColumn<T>
  /** 当前行下标（按渲染顺序，含排序）。 */
  index: number
}

/** `header-<key>` 表头插槽作用域。 */
export interface TableHeaderScope<T> {
  /** 当前列定义。 */
  column: TableColumn<T>
  /** 列文案（column.label）。 */
  label: string
}

/**
 * Table 的 Slots。单元格与表头插槽按列动态命名且全部可选：
 * `cell-<key>` / `header-<key>`（如 #cell-name、#header-age）。
 * 以映射类型声明（而非必选索引签名），保证插槽对象与 Vue 的内部插槽结构兼容。
 */
export type TableSlots<T> = {
  /** 空态内容；缺省渲染“暂无数据”。仅在非 loading 且 data 为空时出现。 */
  empty?: () => VNode[]
} & {
  /** 单元格插槽 `cell-<key>`：作用域 { row, value, column, index }。 */
  [name in `cell-${string}`]?: (scope: TableCellScope<T>) => VNode[]
} & {
  /** 表头插槽 `header-<key>`：作用域 { column, label }；覆盖后将失去内置排序按钮。 */
  [name in `header-${string}`]?: (scope: TableHeaderScope<T>) => VNode[]
}

/** Table 对外暴露的实例方法。 */
export interface TableExpose {
  /** 复位排序状态到 none（不发 sort 事件）。 */
  clearSort: () => void
}

/** Table 组件实例类型（公共实例形态 + clearSort 暴露）。 */
export type TableInstance = ComponentPublicInstance & TableExpose
