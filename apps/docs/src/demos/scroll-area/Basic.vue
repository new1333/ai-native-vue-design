<script setup lang="ts">
import { ScrollArea } from '@ui/components'

const logs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  time: `09:${String(i * 2).padStart(2, '0')}`,
  text: `服务 health-check 第 ${i + 1} 次巡检通过，耗时 ${12 + (i % 7)}ms，实例全部健康。`,
}))
</script>

<template>
  <ScrollArea class="demo-pane">
    <ul class="demo-log">
      <li v-for="log in logs" :key="log.id" class="demo-log__item">
        <span class="demo-log__time">{{ log.time }}</span>
        <span class="demo-log__text">{{ log.text }}</span>
      </li>
    </ul>
  </ScrollArea>
</template>

<style scoped>
/* 滚动视口尺寸由使用方给定（组件不代设高度） */
.demo-pane {
  height: calc(var(--ui-space-8) * 3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-log {
  margin: 0;
  padding: var(--ui-space-2) 0;
  list-style: none;
}

.demo-log__item {
  display: flex;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-border);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.demo-log__time {
  flex: none;
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
}

.demo-log__text {
  color: var(--ui-text-1);
}
</style>
