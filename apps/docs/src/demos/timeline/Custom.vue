<script setup lang="ts">
import { Timeline } from '@ui/components'
import type { TimelineItem } from '@ui/components'

const items: TimelineItem[] = [
  { key: 'ok', title: '部署成功', description: '生产环境已更新到 0.5.0', time: '11:02' },
  { key: 'warn', title: '缓存未命中', description: 'CDN 节点回源拉取静态资源', time: '11:03' },
  { key: 'fail', title: '一条告警', description: '接口 P99 延迟超过阈值，已自动恢复', time: '11:05' },
]
</script>

<template>
  <div class="demo-stack">
    <Timeline :items="items">
      <!-- #dot：按节点语义自定义圆点（视觉值只走 --ui-* token） -->
      <template #dot="{ item }">
        <span
          class="demo-dot"
          :class="{
            'demo-dot--success': item?.key === 'ok',
            'demo-dot--warning': item?.key === 'warn',
            'demo-dot--danger': item?.key === 'fail',
          }"
        />
      </template>
      <!-- #item：整项排版覆盖默认渲染 -->
      <template #item="{ item, index }">
        <div class="demo-item">
          <span class="demo-item__index">#{{ index + 1 }}</span>
          <span class="demo-item__title">{{ item.title }}</span>
          <span class="demo-item__desc">{{ item.description }}</span>
        </div>
      </template>
      <!-- #footer：末尾附加区（left 档与内容列左缘对齐） -->
      <template #footer>
        <a class="demo-more" href="#" @click.prevent>查看完整部署日志</a>
      </template>
    </Timeline>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-dot {
  display: block;
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  border-radius: calc(var(--ui-space-2) / 2);
  background-color: var(--ui-color-ink-400);
}

.demo-dot--success {
  background-color: var(--ui-success);
}

.demo-dot--warning {
  background-color: var(--ui-warning);
}

.demo-dot--danger {
  background-color: var(--ui-danger);
}

.demo-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--ui-space-2);
}

.demo-item__index {
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-3);
}

.demo-item__title {
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
}

.demo-item__desc {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-more {
  font-size: var(--ui-text-sm);
  color: var(--ui-accent);
  text-decoration: none;
}

.demo-more:hover {
  color: var(--ui-accent-hover);
  text-decoration: underline;
}
</style>
