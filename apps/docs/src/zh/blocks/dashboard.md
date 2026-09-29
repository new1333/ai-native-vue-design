---
title: 数据仪表盘 Dashboard
description: 统计卡、筛选、可排序表格、分页与用量配额组成的运营总览页
---

<script setup>
import DashboardBlock from '@docs-blocks/DashboardBlock.vue'
import dashboardSrc from '@docs-blocks/DashboardBlock.vue?raw'
</script>

# 数据仪表盘 Dashboard

运营 / 监控类页面的标准骨架：顶部统计卡行，主区以 Tab 切换「服务状态」（筛选 + 可排序表格 + 分页）与「用量配额」（进度条）。数据为确定性生成的 23 行演示数据。

<p class="block-try"><span class="block-try__label">试试</span>点表头排序（请求数 / 错误率 / 延迟）；用环境下拉与搜索框过滤并观察分页归位；切到「用量与配额」；点刷新看表格 loading 骨架。</p>

<BlockPreview :src="dashboardSrc">
  <DashboardBlock />
</BlockPreview>

## 组成

| 区域 | 组件 |
| --- | --- |
| 统计卡 | [Statistic](/components/data/statistic)（`trend` 趋势、`precision` 精度）+ [Card](/components/general/card) |
| 视图切换 | [Tabs](/components/navigation/tabs) 家族（`v-model:value` + 懒渲染 `TabsContent`） |
| 筛选 | [Select](/components/inputs/select)（环境 / 时间范围）+ [Input](/components/inputs/input)（搜索） |
| 数据表 | [Table](/components/data/table)（`sortable` 列、`cell-*` 插槽、`loading` 骨架、`empty` 插槽） |
| 状态列 | [Badge](/components/general/badge)（`dot` + 语义 `variant`） |
| 分页 | [Pagination](/components/data/pagination)（`v-model:page`，过滤后归一） |
| 用量 | [Progress](/components/data/progress) + [Skeleton](/components/data/skeleton)（占位预告） |

## 复制使用

- 依赖：`@ui/tokens/paper.css` + `@ui/components`；
- 「复制源码」保存为 `src/blocks/DashboardBlock.vue`；
- `allServices` 换成接口数据：表格内部排序只作用于渲染副本，服务端排序可接 `@sort` 事件；
- 分页是外部受控（`v-model:page` + 切片），筛选变化时记得像本块一样把页码归 1；
- `refresh()` 的演示延迟换成真实请求的 loading 开关即可。
