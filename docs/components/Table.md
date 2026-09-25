# Table

> 纸面泛型数据表格：语义 table/thead/tbody、token 化表头与行 hover、可排序列（aria-sort + 循环 asc/desc/none）、loading 骨架行、空态与 cell-/header- 动态插槽。

- **导出名**：`Table`（`@ui/components`）· id `ui-table` · 产品族 Data
- **契约来源**：`packages/components/src/table/Table.meta.ts` / `Table.types.ts` / `Table.vue`

## 是什么

以声明式 columns + data 渲染结构化行列数据，泛型 `T` 贯穿列定义与行数据，内置轻量排序与加载/空态。用户需要浏览并按需排序一组结构化数据。

## 何时用

- 后台列表页、分析结果、键值明细等中等量级结构化数据展示
- 需要按列点击排序（升/降/复位三态循环）的只读表格
- 异步加载需要骨架行占位的数据区
- 部分列需要自定义渲染（状态徽标、操作按钮等 cell-\<key\> 插槽）

## 何时不该用

- 万行级数据用 VirtualTable/DataGrid（windowing + DOM 复用），本组件全量渲染 DOM 行
- 行内编辑、列宽拖拽、单元格聚焦漫游等电子表格语义用 DataGrid
- 无列结构的长列表用 List/虚拟滚动，不要拿 Table 装排版

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns`（必填） | `TableColumn<T>[]` | — | 列定义：key（取值与插槽名）、label、width?（number 视为 px）、align?（left\|right，right 自动 tabular-nums）、sortable?。 |
| `data`（必填） | `T[]` | — | 行数据；排序只作用于内部渲染副本，不改写传入数组。 |
| `rowKey`（必填） | `keyof T \| ((row: T, index: number) => string \| number)` | — | 行键（stable key）：字段名或函数；字段值非 string/number 时回落行下标。 |
| `loading` | `boolean` | `false` | 加载中：tbody 渲染 3 行骨架行（aria-hidden）并在 table 上置 `aria-busy="true"`；骨架期不渲染数据行与空态。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort` | `{ key: string, order: "asc" \| "desc" \| "none" }` | 排序变化：点击可排序列表头按钮（或键盘 Enter/Space 激活）时发出；组件内部已按新状态排序渲染。 |

## Slots

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `cell-<key>` | `{ row: T, value: unknown, column: TableColumn<T>, index: number }` | 按列定制的单元格插槽（如 `#cell-status`）；缺省渲染 String(row[key])（null/undefined/对象为空串）。 |
| `header-<key>` | `{ column: TableColumn<T>, label: string }` | 按列定制的表头插槽（如 `#header-name`）；覆盖后该列失去内置排序按钮与 aria-sort，自定义时需自行补齐排序交互。 |
| `empty` | — | 空态内容；仅在非 loading 且 data 为空时出现，缺省渲染「暂无数据」。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `clearSort` | `() => void` | 复位排序状态到 none（不发 sort 事件）。 |

## 可访问性

- 语义 `<table>`/`<thead>`/`<tbody>`，`th scope="col"`；可排序列 th 常驻 `aria-sort`（ascending/descending/none），激活方向随循环切换，非排序列不写该属性。
- 排序入口为原生 `<button type="button">`，Tab 自然进入，Enter/Space 在 keydown 统一 preventDefault 后由元素 `.click()` 单次激活（Space 不滚动页面）；排序指示 svg aria-hidden，按钮可读名即列 label。
- loading 时 `aria-busy="true"` 且骨架行 aria-hidden；空态为普通 td（colspan 全列）。
- 数字列声明 `align="right"` 以获得 tabular-nums 对齐；排序重计算交给组件，外部仅监听 sort 同步筛选条件。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；`.click()` 仅出现在客户端 keydown 回调内；骨架/空态/aria-sort 均随 SSR 输出。

## 性能边界

纯 computed 派生（排序为浅拷贝排序，不改写 props.data）；无监听器、无测量、无定时器；行使用 rowKey stable key。全量渲染 DOM 行，千行级可用，万行级应改用 VirtualTable。

## 最小用例

```vue
<script setup lang="ts">
import { Table } from '@ui/components'

interface Row { id: number; name: string; score: number }

const rows: Row[] = [
  { id: 1, name: '设计走查', score: 96 },
  { id: 2, name: '可用性测试', score: 88 },
]
const columns = [
  { key: 'name' as const, label: '名称' },
  { key: 'score' as const, label: '得分', align: 'right' as const, sortable: true },
]
</script>

<template>
  <Table :columns="columns" :data="rows" row-key="id" />
</template>
```
