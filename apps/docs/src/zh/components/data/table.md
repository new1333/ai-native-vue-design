---
title: Table 表格
---

<script setup>
import { tableMeta } from '@ui/components'
import Basic from '@docs-demos/table/Basic.vue'
import basicSrc from '@docs-demos/table/Basic.vue?raw'
import Sortable from '@docs-demos/table/Sortable.vue'
import sortableSrc from '@docs-demos/table/Sortable.vue?raw'
import AsyncStates from '@docs-demos/table/AsyncStates.vue'
import asyncStatesSrc from '@docs-demos/table/AsyncStates.vue?raw'
import Cells from '@docs-demos/table/Cells.vue'
import cellsSrc from '@docs-demos/table/Cells.vue?raw'
import RowSelection from '@docs-demos/table/RowSelection.vue'
import rowSelectionSrc from '@docs-demos/table/RowSelection.vue?raw'
</script>

# Table 表格

<ComponentDoc :meta="tableMeta" dir="table">
  <Demo
    title="基础用法"
    anchor="basic"
    description="columns + data + rowKey 三要素；数字列用 align: 'right' 自动应用 tabular-nums。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="排序"
    anchor="sortable"
    description="sortable 列的表头渲染为按钮，点击（或键盘 Enter / Space）循环 none → asc → desc → none；排序只作用于内部渲染副本，不改写传入数组。"
    :src="sortableSrc"
  >
    <Sortable />
  </Demo>

  <Demo
    title="行选择"
    anchor="row-selection"
    description="传入 rowSelection 即启用前置选择列：表头全选（含半选态）、行 checkbox、getCheckboxProps 按行禁用；v-model:selectedRowKeys 受控选中键集合，翻页后已选键保持（跨页保持选中，全选会合并历史键）。"
    :src="rowSelectionSrc"
  >
    <RowSelection />
  </Demo>

  <Demo
    title="加载与空态"
    anchor="async-states"
    description="loading 渲染骨架行并置 aria-busy；非 loading 且数据为空时出现空态（缺省文案「暂无数据」）。"
    :src="asyncStatesSrc"
  >
    <AsyncStates />
  </Demo>

  <Demo
    title="自定义单元格与空态插槽"
    anchor="cells"
    description="cell-<key> / header-<key> 按列定制；empty 插槽替换默认空态，可搭配 EmptyState。"
    :src="cellsSrc"
  >
    <Cells />
  </Demo>
</ComponentDoc>
