---
title: Divider 分隔线
---

<script setup>
import { dividerMeta } from '@ui/components'
import Basic from '@docs-demos/divider/Basic.vue'
import basicSrc from '@docs-demos/divider/Basic.vue?raw'
import Labeled from '@docs-demos/divider/Labeled.vue'
import labeledSrc from '@docs-demos/divider/Labeled.vue?raw'
import Vertical from '@docs-demos/divider/Vertical.vue'
import verticalSrc from '@docs-demos/divider/Vertical.vue?raw'
</script>

# Divider 分隔线

<ComponentDoc :meta="dividerMeta" dir="divider">
  <Demo
    title="水平分隔"
    anchor="basic"
    description="水平为默认方向：无标签时渲染语义 hr，上下间距已内置（--ui-space-5），无需额外 margin；仅需要留白不要线时请用布局间距。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="带标签"
    anchor="label"
    description="label 插槽（仅水平生效）：标签居中、两侧细线；提供后根元素由 hr 变为 div[role=separator]。标签保持 2–4 字短词。"
    :src="labeledSrc"
  >
    <Labeled />
  </Demo>

  <Demo
    title="垂直分隔"
    anchor="vertical"
    description="direction 为 vertical：假定置于 flex 行内（align-self: stretch 拉伸高度），适合工具栏 / 并排动作之间的竖线分组；label 插槽不生效。"
    :src="verticalSrc"
  >
    <Vertical />
  </Demo>
</ComponentDoc>
