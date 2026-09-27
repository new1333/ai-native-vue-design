---
title: Splitter 分割面板
---

<script setup>
import { splitterMeta } from '@ui/components'
import Basic from '@docs-demos/splitter/Basic.vue'
import basicSrc from '@docs-demos/splitter/Basic.vue?raw'
import Vertical from '@docs-demos/splitter/Vertical.vue'
import verticalSrc from '@docs-demos/splitter/Vertical.vue?raw'
import Constraints from '@docs-demos/splitter/Constraints.vue'
import constraintsSrc from '@docs-demos/splitter/Constraints.vue?raw'
import Controlled from '@docs-demos/splitter/Controlled.vue'
import controlledSrc from '@docs-demos/splitter/Controlled.vue?raw'
</script>

# Splitter 分割面板

<ComponentDoc :meta="splitterMeta" dir="splitter">
  <Demo
    title="基础用法"
    anchor="basic"
    description="默认插槽内放若干 SplitterPane 直接子组件（决定面板数量与内容，建议提供稳定 key）；拖拽中间分隔条调整两侧比例，分隔条可聚焦（Tab），← / → 每次 ±1% 微调。Splitter 根占满父容器，使用方需给容器确定高度。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="上下分栏"
    anchor="vertical"
    description="direction='vertical' 为上下分栏：分隔条变为横线（aria-orientation='horizontal'），键盘改用 ↑ / ↓；两个面板内容超出时各自在面板内滚动。"
    :src="verticalSrc"
  >
    <Vertical />
  </Demo>

  <Demo
    title="尺寸约束与折叠"
    anchor="constraints"
    description="约束经 panes 数组按面板顺序声明：min / max 把侧栏限制在 20%–60%，collapsible 允许折叠为 0——拖拽越过吸附阈值（min 的一半）即折叠，向回拖拽或按 Enter 恢复折叠前位置；Home / End 调到主面板最小 / 最大位置。label 作为分隔条的 aria-label。"
    :src="constraintsSrc"
  >
    <Constraints />
  </Demo>

  <Demo
    title="受控模式与事件"
    anchor="controlled"
    description="v-model 绑定百分比数组（总和 100）：拖拽与键盘每步触发 update:modelValue 与 resize，折叠转变触发 collapse（仅组件内交互触发，外部赋值不触发）。受控方也可整体替换数组（如折叠按钮、持久化布局后回填）；拖拽连续触发事件，落盘请自行节流。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>
</ComponentDoc>
