<script setup lang="ts" generic="T">
/**
 * Table —— 泛型数据表格：语义 table/thead(th scope=col)/tbody、可排序列（点击循环
 * asc → desc → none，表头为原生 button 且 th 带 aria-sort）、loading 骨架行、
 * 空态默认文案与 empty 插槽、`cell-<key>` / `header-<key>` 动态插槽。
 * 排序状态机收口在 useTableSort；一切颜色、字号、间距、圆角、动效
 * 均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import {
  TABLE_ACTIVATION_KEYS,
  TABLE_EMPTY_TEXT_DEFAULT,
  TABLE_SKELETON_ROWS,
} from './Table.constants'
import { useTableSort } from './useTableSort'
import type { TableColumn, TableEmits, TableExpose, TableProps, TableSlots } from './Table.types'

const props = withDefaults(defineProps<TableProps<T>>(), {
  loading: false,
})
const emit = defineEmits<TableEmits>()
defineSlots<TableSlots<T>>()

const {
  sortedRows,
  ariaSortValue,
  isSortActive,
  toggleSort,
  clearSort,
} = useTableSort<T>({
  columns: () => props.columns,
  data: () => props.data,
  onSort: (payload) => emit('sort', payload),
})

/** 空态：非 loading 且无数据（响应式）。 */
const isEmpty = computed(() => !props.loading && props.data.length === 0)

/** 行键：函数直接求值；字段值取 string/number，其余回落行下标。 */
function rowKeyOf(row: T, index: number): string | number {
  const source = props.rowKey
  if (typeof source === 'function') return source(row, index)
  const value = row[source]
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

/** 单元格原始取值 row[column.key]（供插槽作用域）。 */
function cellRawValue(row: T, column: TableColumn<T>): unknown {
  return row[column.key as keyof T]
}

/** 默认单元格文本：null/undefined/对象渲染为空串（对象请用 cell-<key> 插槽）。 */
function cellText(row: T, column: TableColumn<T>): string {
  const value = cellRawValue(row, column)
  if (value === null || value === undefined || typeof value === 'object') return ''
  return String(value)
}

/** 数字列修饰类（右对齐 + tabular-nums）。 */
function cellClasses(column: TableColumn<T>): Record<string, boolean> {
  return { 'ui-table__cell--right': column.align === 'right' }
}

/** 列宽内联样式；number 视为 px（用户数据驱动的布局值，非组件视觉常量）。 */
function columnStyle(column: TableColumn<T>): CSSProperties | undefined {
  if (column.width === undefined) return undefined
  return { width: typeof column.width === 'number' ? `${column.width}px` : column.width }
}

/** 排序指示方向：未激活列显示中性双向箭头。 */
function sortDirection(column: TableColumn<T>): 'asc' | 'desc' | 'both' {
  if (!isSortActive(column)) return 'both'
  return ariaSortValue(column) === 'ascending' ? 'asc' : 'desc'
}

/**
 * 排序按钮键盘激活：Enter/Space 统一在 keydown preventDefault 后由元素 .click()
 * 触发（与 button/ ButtonRoot 同策略），保证单次激活且 Space 不滚动页面。
 */
function onSortKeydown(event: KeyboardEvent): void {
  if (!TABLE_ACTIVATION_KEYS.includes(event.key)) return
  event.preventDefault()
  const target = event.currentTarget
  if (target instanceof HTMLElement) target.click()
}

defineExpose<TableExpose>({ clearSort })
</script>

<template>
  <div class="ui-table">
    <table class="ui-table__table" :aria-busy="loading ? 'true' : undefined">
      <thead class="ui-table__head">
        <tr class="ui-table__head-row">
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="ui-table__th"
            :class="cellClasses(column)"
            :style="columnStyle(column)"
            :aria-sort="ariaSortValue(column)"
          >
            <slot :name="`header-${column.key}`" :column="column" :label="column.label">
              <button
                v-if="column.sortable"
                type="button"
                class="ui-table__sort"
                @click="toggleSort(column)"
                @keydown="onSortKeydown"
              >
                <span class="ui-table__th-label">{{ column.label }}</span>
                <svg
                  class="ui-table__sort-icon"
                  :class="{ 'ui-table__sort-icon--active': isSortActive(column) }"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    v-if="sortDirection(column) === 'asc'"
                    d="M12 19V5M6 11l6-6 6 6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    v-else-if="sortDirection(column) === 'desc'"
                    d="M12 5v14M6 13l6 6 6-6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    v-else
                    d="M8 9l4-4 4 4M8 15l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <span v-else class="ui-table__th-label">{{ column.label }}</span>
            </slot>
          </th>
        </tr>
      </thead>
      <tbody class="ui-table__body">
        <template v-if="loading">
          <tr
            v-for="row in TABLE_SKELETON_ROWS"
            :key="`skeleton-${row}`"
            class="ui-table__row ui-table__row--skeleton"
            aria-hidden="true"
          >
            <td v-for="column in columns" :key="column.key" class="ui-table__td">
              <span class="ui-table__skeleton" />
            </td>
          </tr>
        </template>
        <tr v-else-if="isEmpty" class="ui-table__row ui-table__row--empty">
          <td class="ui-table__td ui-table__empty" :colspan="columns.length">
            <slot name="empty">{{ TABLE_EMPTY_TEXT_DEFAULT }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr v-for="(row, index) in sortedRows" :key="rowKeyOf(row, index)" class="ui-table__row">
            <td
              v-for="column in columns"
              :key="column.key"
              class="ui-table__td"
              :class="cellClasses(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="cellRawValue(row, column)"
                :column="column"
                :index="index"
              >
                {{ cellText(row, column) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ── 外框：边框/底色/圆角全 token；横向滚动为结构性布局 ─────── */
.ui-table {
  box-sizing: border-box;
  width: 100%;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  overflow-x: auto;
}

/* ── 语义 table 基底 ─────────────────────────────────────── */
.ui-table__table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
}

/* ── 表头：surface-muted 底 + border 下边线 ──────────────── */
.ui-table__th {
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface-muted);
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text-2);
  font-weight: var(--ui-font-weight-medium);
  text-align: left;
  white-space: nowrap;
}

/* ── 单元格与行分隔线（末行与外框二选一，结构性收口）──────── */
.ui-table__td {
  padding: var(--ui-space-2) var(--ui-space-3);
  border-bottom: 1px solid var(--ui-border);
}

.ui-table__row:last-child .ui-table__td {
  border-bottom: none;
}

/* ── 数字列：右对齐 + tabular-nums（--ui-numeric token）──── */
.ui-table__cell--right {
  text-align: right;
  font-variant-numeric: var(--ui-numeric);
}

/* ── 行 hover：骨架/空态行不响应 ─────────────────────────── */
.ui-table__row:not(.ui-table__row--skeleton):not(.ui-table__row--empty):hover {
  background-color: var(--ui-surface-muted);
}

/* ── 排序按钮：重置为无填充/无描边（结构语义，非色相取值）─── */
.ui-table__sort {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-table__sort:hover {
  color: var(--ui-text-1);
}

.ui-table__sort-icon {
  width: 16px; /* 图标尺寸 16/20/24 白名单（CONVENTIONS §2） */
  height: 16px;
  color: var(--ui-text-3);
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-table__sort-icon--active,
.ui-table__sort:hover .ui-table__sort-icon {
  color: var(--ui-text-1);
}

/* ── 空态 ────────────────────────────────────────────────── */
.ui-table__empty {
  padding: var(--ui-space-6);
  text-align: center;
  color: var(--ui-text-3);
}

/* ── loading 骨架条：时长由 token 推导（≈900ms），reduced-motion 归零即停 */
.ui-table__skeleton {
  display: block;
  width: 100%;
  height: 1em; /* 相对继承字号（字号来自 --ui-text-sm token）的结构性高度 */
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface-muted);
  animation: ui-table-shimmer calc(var(--ui-motion-default) * 5) var(--ui-ease-out) infinite;
}

@keyframes ui-table-shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
