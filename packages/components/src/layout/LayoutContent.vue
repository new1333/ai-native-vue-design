<script setup lang="ts">
/**
 * LayoutContent —— 页面骨架主内容区：语义 <main>，--ui-bg 底、内边距留白。
 * 纯结构 + 插槽驱动，无自有交互；flex 填充剩余空间。
 */
import type { LayoutContentSlots } from './Layout.types'

defineSlots<LayoutContentSlots>()
</script>

<template>
  <main class="ui-layout__content">
    <slot />
  </main>
</template>

<style scoped>
.ui-layout__content {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  padding: var(--ui-space-5);
  background-color: var(--ui-bg);
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
}
</style>
