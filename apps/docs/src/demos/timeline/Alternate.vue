<script setup lang="ts">
import { ref } from 'vue'
import { Button, Timeline } from '@ui/components'
import type { TimelineItem, TimelineMode } from '@ui/components'

const mode = ref<TimelineMode>('alternate')

const items: TimelineItem[] = [
  { key: 'v0.1', title: '0.1 内测版', description: '组件骨架与 token 体系', time: '2026-06' },
  { key: 'v0.2', title: '0.2 表单族', description: 'Input / Select / Form', time: '2026-07' },
  { key: 'v0.3', title: '0.3 数据族', description: 'Table / Pagination', time: '2026-08' },
  { key: 'v0.4', title: '0.4 反馈族', description: 'Toast / Alert / Skeleton', time: '2026-09' },
  { key: 'v0.5', title: '0.5 文档站', description: 'meta 驱动的组件文档', time: '2026-09' },
]
</script>

<template>
  <div class="demo-stack">
    <Timeline :items="items" :mode="mode" />
    <div class="demo-actions">
      <Button size="sm" @click="mode = mode === 'left' ? 'alternate' : 'left'">
        {{ mode === 'left' ? '切换为中轴交替' : '切换为单侧布局' }}
      </Button>
    </div>
    <p class="demo-hint">
      mode 为受控状态：alternate 按渲染下标奇偶把内容交替排到中轴两侧
      （偶数下标居右、奇数下标居左且右对齐朝向中轴）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
