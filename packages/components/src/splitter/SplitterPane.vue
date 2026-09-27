<script setup lang="ts">
/**
 * SplitterPane —— Splitter 的面板子组件：承载面板内容。
 *
 * 必须作为 Splitter 的直接子组件使用：面板区域（尺寸 / 折叠显隐）由父级
 * Splitter 渲染与控制；本组件只输出内容盒（100% 填充分到的区域、超出滚动）。
 * 面板约束（min/max/collapsible/label）统一经 Splitter 的 panes 属性按面板
 * 顺序声明——约束需要在拖拽/键盘的事件回调（渲染期之外）参与求解，panes
 * prop 是唯一能响应式到达那里的来源；刻意不在本组件声明同名 props。
 */
import type { SplitterPaneSlots } from './Splitter.types'

defineSlots<SplitterPaneSlots>()
</script>

<template>
  <div class="ui-splitter__pane-content">
    <slot />
  </div>
</template>

<style scoped>
/* ── 内容盒：填满父级分配的区域，内容超出时面板内滚动 ─────── */
.ui-splitter__pane-content {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: auto;
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
}
</style>
