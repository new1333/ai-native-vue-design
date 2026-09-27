---
title: Spinner 加载指示
---

<script setup>
import { spinnerMeta } from '@ui/components'
import Basic from '@docs-demos/spinner/Basic.vue'
import basicSrc from '@docs-demos/spinner/Basic.vue?raw'
import Variants from '@docs-demos/spinner/Variants.vue'
import variantsSrc from '@docs-demos/spinner/Variants.vue?raw'
import LabelSlot from '@docs-demos/spinner/LabelSlot.vue'
import labelSlotSrc from '@docs-demos/spinner/LabelSlot.vue?raw'
import Controlled from '@docs-demos/spinner/Controlled.vue'
import controlledSrc from '@docs-demos/spinner/Controlled.vue?raw'
</script>

# Spinner 加载指示

<ComponentDoc :meta="spinnerMeta" dir="spinner">
  <Demo
    title="基础用法"
    anchor="basic"
    description="role=status + sr-only 可访问名（label 必配）：紧凑型加载指示，accent 1/4 弧段沿 muted 轨道旋转，720ms/圈（--ui-motion-default 推导，reduced-motion 自动静态化）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="变体：spin / dots"
    anchor="variants"
    description="spin 旋转环与 dots 三点脉冲两种变体；均不表达量值进度——需要 0-100 + aria-valuenow 的量值反馈用 Progress。"
    :src="variantsSrc"
  >
    <Variants />
  </Demo>

  <Demo
    title="自定义可访问名"
    anchor="label-slot"
    description="#label 插槽覆盖默认文本：内容仍以 sr-only 渲染在 role=status 内，读屏播报完整状态句。"
    :src="labelSlotSrc"
  >
    <LabelSlot />
  </Demo>

  <Demo
    title="受控加载"
    anchor="controlled"
    description="典型组合：按钮触发异步任务，loading 期间显示 Spinner 并禁用按钮；显隐由使用方 v-if 驱动，组件本身无受控状态、加载结束后随之卸载。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>
</ComponentDoc>
