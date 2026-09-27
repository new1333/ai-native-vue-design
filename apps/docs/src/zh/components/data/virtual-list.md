---
title: VirtualList 虚拟列表
---

<script setup>
import { virtualListMeta } from '@ui/components'
import Basic from '@docs-demos/virtual-list/Basic.vue'
import basicSrc from '@docs-demos/virtual-list/Basic.vue?raw'
import Horizontal from '@docs-demos/virtual-list/Horizontal.vue'
import horizontalSrc from '@docs-demos/virtual-list/Horizontal.vue?raw'
import Events from '@docs-demos/virtual-list/Events.vue'
import eventsSrc from '@docs-demos/virtual-list/Events.vue?raw'
import EmptySlot from '@docs-demos/virtual-list/EmptySlot.vue'
import emptySlotSrc from '@docs-demos/virtual-list/EmptySlot.vue?raw'
</script>

# VirtualList 虚拟列表

<ComponentDoc :meta="virtualListMeta" dir="virtual-list">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items + estimatedItemSize + getKey 三要素；滚动视口尺寸由使用方给定（height），建议传 aria-label 让滚动容器成为带名的 region 地标。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="横向模式"
    anchor="horizontal"
    description="horizontal 切换主轴：scrollLeft / 宽度驱动窗口，窗口项 left 定位、纵向铺满。"
    :src="horizontalSrc"
  >
    <Horizontal />
  </Demo>

  <Demo
    title="变高内容与窗口读数"
    anchor="events"
    description="estimatedItemSize 只负责首屏推导，实测尺寸按稳定键缓存后前缀和自动收敛；@visible-range-change 播报渲染窗口（含 overscan），@scroll 原样透传原生滚动事件。"
    :src="eventsSrc"
  >
    <Events />
  </Demo>

  <Demo
    title="空态"
    anchor="empty"
    description="items 为空时渲染 empty 插槽（缺省「暂无数据」），可搭配 EmptyState；数据层负责加载与追加，列表本身不设 loading/禁用态。"
    :src="emptySlotSrc"
  >
    <EmptySlot />
  </Demo>
</ComponentDoc>
