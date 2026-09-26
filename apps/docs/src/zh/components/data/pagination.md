---
title: Pagination 分页
---

<script setup>
import { paginationMeta } from '@ui/components'
import Basic from '@docs-demos/pagination/Basic.vue'
import basicSrc from '@docs-demos/pagination/Basic.vue?raw'
import Controlled from '@docs-demos/pagination/Controlled.vue'
import controlledSrc from '@docs-demos/pagination/Controlled.vue?raw'
import PageSize from '@docs-demos/pagination/PageSize.vue'
import pageSizeSrc from '@docs-demos/pagination/PageSize.vue?raw'
import Ellipsis from '@docs-demos/pagination/Ellipsis.vue'
import ellipsisSrc from '@docs-demos/pagination/Ellipsis.vue?raw'
</script>

# Pagination 分页

<ComponentDoc :meta="paginationMeta" dir="pagination">
  <Demo
    title="基础用法"
    anchor="basic"
    description="v-model:page 受控，total 与 pageSize 推导总页数；当前页 accent 实底并携带 aria-current，页码数字 tabular-nums 等宽对齐，翻页时宽度不抖动。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="受控页值与页码边界"
    anchor="controlled"
    description="组件自身不持有页状态：显式 :page + @update:page（v-model:page 的展开形式）；受控值越界（改成 99）时展示层收敛（clamp）到末页渲染，但值本身需使用方自行修正。单页数据下上一页/下一页同时原生 disabled。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="每页条数"
    anchor="page-size"
    description="total 固定时 pageSize 决定总页数；按推荐配套动作，切换每页条数后把 page 重置为 1，避免落在旧范围上。"
    :src="pageSizeSrc"
  >
    <PageSize />
  </Demo>

  <Demo
    title="长列表折叠与 siblingCount"
    anchor="ellipsis"
    description="总页数超过 siblingCount×2+5（默认 7）时折叠为 首页 + 滑动窗口 + 尾页，被折叠页码以省略号占位（aria-hidden、不可聚焦）；siblingCount 控制窗口宽度，两个实例共享同一受控页值。"
    :src="ellipsisSrc"
  >
    <Ellipsis />
  </Demo>
</ComponentDoc>
