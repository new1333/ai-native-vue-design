<script setup lang="ts">
/**
 * LayoutHeader —— 页面骨架顶栏区块：语义 <header>，surface 面 + 底部分隔线。
 * 纯结构 + 插槽驱动，无自有交互；landmark 语义由原生标签承担。
 */
import type { LayoutHeaderSlots } from './Layout.types'

defineSlots<LayoutHeaderSlots>()
</script>

<template>
  <header class="ui-layout__header">
    <slot />
  </header>
</template>

<style scoped>
/* ── 顶栏：surface 面；min-height 走间距标尺（--ui-space-8 = 64px 档）──────── */
.ui-layout__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--ui-space-3);
  min-height: var(--ui-space-8);
  padding: var(--ui-space-2) var(--ui-space-5);
  background-color: var(--ui-surface);
  /* 分隔线 1px 为结构性细线（无 --ui-border-width token，随 Card/Tabs 先例在任务结果中提出需求） */
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
}
</style>
