---
title: Progress 进度条
---

<script setup>
import { progressMeta } from '@ui/components'
import Basic from '@docs-demos/progress/Basic.vue'
import basicSrc from '@docs-demos/progress/Basic.vue?raw'
import Dynamic from '@docs-demos/progress/Dynamic.vue'
import dynamicSrc from '@docs-demos/progress/Dynamic.vue?raw'
import Indeterminate from '@docs-demos/progress/Indeterminate.vue'
import indeterminateSrc from '@docs-demos/progress/Indeterminate.vue?raw'
</script>

# Progress 进度条

<ComponentDoc :meta="progressMeta" dir="progress">
  <Demo
    title="基础用法"
    anchor="basic"
    description="确定进度：value 0-100 自动钳制（越界收敛到边界、非有限数回退 0），透传 aria-valuenow 与填充宽度；showLabel 渲染 tabular-nums 数值标签；size 提供 sm / md 两档条高；任务名由使用方以 aria-label 提供（组件自身不带 label 文本）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="动态进度"
    anchor="dynamic"
    description="value 由使用方状态驱动：进度条与 aria-valuenow 随状态同步更新；任务名以可见文本 + aria-label 双通道提供。"
    :src="dynamicSrc"
  >
    <Dynamic />
  </Demo>

  <Demo
    title="不确定进度"
    anchor="indeterminate"
    description="indeterminate 忽略 value、省略 aria-valuenow（进度未知）并播放扫描动画；prefers-reduced-motion 时降级为静态半填充；showLabel 仅确定进度渲染。"
    :src="indeterminateSrc"
  >
    <Indeterminate />
  </Demo>
</ComponentDoc>
