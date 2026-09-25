# Pagination

> 纸面数据分页：v-model:page 受控的页码导航，总页数少时全显、多时首尾+滑动窗口+省略号，上一页/下一页边界禁用。

- **导出名**：`Pagination`（`@ui/components`）· id `ui-pagination` · 产品族 Data
- **契约来源**：`packages/components/src/pagination/Pagination.meta.ts` / `Pagination.types.ts` / `Pagination.vue`

## 是什么

把一组按 pageSize 切分的数据页暴露为可跳转的页码导航：`v-model:page` 受控、total/pageSize 推导总页数、siblingCount 控制当前页两侧窗口宽度。用户需要知道数据有多少页、当前在哪页，并跳到目标页。

## 何时用

- 表格 / 列表 / 卡片流底部的分页条
- 数据总量已知（total）且服务端或前端按页取数
- 需要当前页语义暴露给读屏（`aria-current="page"`）
- 长列表需要折叠页码（首尾 + 窗口 + 省略号）保持宽度稳定

## 何时不该用

- 无限滚动 / 加载更多：没有离散页概念时用 Scroll 类方案
- 只有一页且不会增长的数据：Pagination 仍会渲染（可用 v-if 在使用方隐藏）
- 步骤向导（有先后依赖的流程）用 Steps：Pagination 只表达平等的数据页
- 面包屑 / 标签页等导航语义用 Breadcrumb / **Tabs**

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` | `1` | 当前页（1 起始，v-model:page）；超出 [1, pageCount] 时展示层收敛（clamp）后渲染，组件自身不持有页状态。 |
| `total` | `number` | `0` | 数据总条数；与 pageSize 共同推导总页数（负值按 0 处理）。 |
| `pageSize` | `number` | `10` | 每页条数；≤0 按 1 处理避免除零。 |
| `siblingCount` | `number` | `1` | 当前页两侧保留的页码数；总页数 ≤ siblingCount*2+5（默认 7）时全量展开，否则首尾+窗口+省略号。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:page` | `number` | v-model:page 更新：点击页码/上一页/下一页后发出，载荷为目标页码（已收敛进 [1, pageCount]；与当前页相同不发出）。 |

## Slots

无。页码导航结构由 props 推导渲染。

## 可访问性

- 根为 `<nav aria-label="分页">`，内为 `<ul>`/`<li>` 列表语义；上一页/下一页为原生 `<button type="button">` 且仅图标，必须携带 `aria-label="上一页"`/`"下一页"`，chevron svg aria-hidden。
- 当前页按钮 `aria-current="page"`，其余页码按钮以自身数字为可读名，不额外写 role/tabindex；省略号为 `<span aria-hidden="true">` 的非聚焦占位。
- 键盘 Tab 逐按钮可达，Enter/Space 走平台原生激活（组件不劫持 keydown/preventDefault）；焦点环由全局 `:focus-visible` 约定提供。
- 边界禁用（第 1 页的上一页、末页的下一页）用原生 disabled 而非 aria-disabled。

## SSR 行为

`renderToString` 无异常：窗口计算为纯函数，setup 与模块顶层不访问任何浏览器 API；page/total/pageSize/siblingCount 推导的页码序列、aria-label、aria-current、disabled、省略号占位全部随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@ui/components'

const page = ref(1)
const total = 235
</script>

<template>
  <Pagination v-model:page="page" :total="total" :page-size="20" />
</template>
```
