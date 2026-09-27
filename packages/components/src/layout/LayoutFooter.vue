<script setup lang="ts">
/**
 * LayoutFooter —— 页面骨架页脚区块：语义 <footer>，surface 面 + 顶部分隔线。
 * 纯结构 + 插槽驱动，无自有交互；landmark 语义由原生标签承担。
 */
import type { LayoutFooterSlots } from './Layout.types'

defineSlots<LayoutFooterSlots>()
</script>

<template>
  <footer class="ui-layout__footer">
    <slot />
  </footer>
</template>

<style scoped>
.ui-layout__footer {
  box-sizing: border-box;
  flex-shrink: 0;
  padding: var(--ui-space-3) var(--ui-space-5);
  background-color: var(--ui-surface);
  /* 分隔线 1px 为结构性细线（无 --ui-border-width token，随 Card/Tabs 先例在任务结果中提出需求） */
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}
</style>
