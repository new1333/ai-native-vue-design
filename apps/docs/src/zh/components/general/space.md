---
title: Space 间距
---

<script setup>
import { spaceMeta } from '@ui/components'
import Basic from '@docs-demos/space/Basic.vue'
import basicSrc from '@docs-demos/space/Basic.vue?raw'
import Direction from '@docs-demos/space/Direction.vue'
import directionSrc from '@docs-demos/space/Direction.vue?raw'
import Size from '@docs-demos/space/Size.vue'
import sizeSrc from '@docs-demos/space/Size.vue?raw'
import WrapAlign from '@docs-demos/space/WrapAlign.vue'
import wrapAlignSrc from '@docs-demos/space/WrapAlign.vue?raw'
</script>

# Space 间距

<ComponentDoc :meta="spaceMeta" dir="space">
  <Demo
    title="横排（默认）"
    anchor="basic"
    description="默认 direction=row、size=md（--ui-space-4）、align=center。间距全权交给 flex gap，不要给子元素手写 margin；子元素语义与 Tab 序不受容器影响。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="方向"
    anchor="direction"
    description="direction=column 时纵向堆叠，容器为 inline-flex、宽度收缩至内容；需要撑满时在使用方侧自行给定宽度。"
    :src="directionSrc"
  >
    <Direction />
  </Demo>

  <Demo
    title="间距档位"
    anchor="size"
    description="size 三档映射设计 token：sm→--ui-space-2、md→--ui-space-4（默认）、lg→--ui-space-6。选档对齐页面节奏：紧邻元素 sm、同组控件 md、分区之间 lg；精确像素间距不在 API 内。"
    :src="sizeSrc"
  >
    <Size />
  </Demo>

  <Demo
    title="换行与对齐"
    anchor="wrap-align"
    description="wrap 开启后空间不足自动换行，换行处间距同样由 gap 承担；align 控制交叉轴对齐（默认 center，避免异高子元素被拉伸），文字基线场景用 baseline。"
    :src="wrapAlignSrc"
  >
    <WrapAlign />
  </Demo>
</ComponentDoc>
