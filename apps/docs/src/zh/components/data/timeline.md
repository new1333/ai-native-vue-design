---
title: Timeline 时间线
---

<script setup>
import { timelineMeta } from '@ui/components'
import Basic from '@docs-demos/timeline/Basic.vue'
import basicSrc from '@docs-demos/timeline/Basic.vue?raw'
import Alternate from '@docs-demos/timeline/Alternate.vue'
import alternateSrc from '@docs-demos/timeline/Alternate.vue?raw'
import Pending from '@docs-demos/timeline/Pending.vue'
import pendingSrc from '@docs-demos/timeline/Pending.vue?raw'
import Custom from '@docs-demos/timeline/Custom.vue'
import customSrc from '@docs-demos/timeline/Custom.vue?raw'
</script>

# Timeline 时间线

<ComponentDoc :meta="timelineMeta" dir="timeline">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items 按数组顺序自上而下渲染为节点 + 连线的事件列表；每项 title 必填、description / time 可选弱化展示，key 提供稳定 v-for 键（缺省回落下标）。组件纯展示、不排序：传入前先按业务排好时间序。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="中轴交替布局"
    anchor="alternate"
    description="mode 为受控状态：alternate 把内容按渲染下标奇偶交替排到中轴两侧（偶数下标居右、奇数下标居左且右对齐朝向中轴），pending 节点按下标 items.length 参与交替；默认 left 为连线靠左、内容居右的单侧布局。"
    :src="alternateSrc"
  >
    <Alternate />
  </Demo>

  <Demo
    title="进行中（pending）"
    anchor="pending"
    description="pending=true 时在列表末尾追加幽灵节点：accent 脉冲点 + 内置文案「进行中」，表示事件流仍在推进；脉冲动效为 transform/opacity 白名单（加载态豁免），prefers-reduced-motion 降级为静态实心点。#footer 承载「加载更多」类附加操作。"
    :src="pendingSrc"
  >
    <Pending />
  </Demo>

  <Demo
    title="自定义节点与内容"
    anchor="custom"
    description="#dot 覆盖默认圆点（scope.pending 区分幽灵节点，item 为 undefined），#item 覆盖整项排版（scope { item, index }），#footer 渲染于列表之下且 left 档与内容列左缘对齐。自定义视觉值同样只用 var(--ui-*) token。"
    :src="customSrc"
  >
    <Custom />
  </Demo>
</ComponentDoc>

Timeline 是纯展示组件：无 emits、无 exposes，组件自身不可聚焦、不进入 Tab 序；
操作入口（重试、详情、加载更多）放 #footer 或 #item 内由使用方控件承载，
原生键盘行为（Tab / Enter / Space）直接生效。
