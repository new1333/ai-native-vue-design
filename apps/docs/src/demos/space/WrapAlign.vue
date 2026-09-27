<script setup lang="ts">
import { Space } from '@ui/components'

const aligns = ['start', 'center', 'end', 'baseline', 'stretch'] as const
</script>

<template>
  <div class="demo-column">
    <p class="demo-label">wrap：空间不足时换行，换行处间距同样由 gap 承担</p>
    <Space wrap size="sm" class="demo-wrap-area">
      <span v-for="i in 12" :key="i" class="demo-chip">标签 {{ i }}</span>
    </Space>

    <p class="demo-label">align：交叉轴对齐（异高子元素）</p>
    <div v-for="align in aligns" :key="align" class="demo-align-row">
      <span class="demo-align-name">align="{{ align }}"</span>
      <Space :align="align">
        <span class="demo-chip demo-chip--tall">高</span>
        <span class="demo-chip">标准</span>
        <span class="demo-chip demo-chip--low">矮</span>
      </Space>
    </div>
  </div>
</template>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

/* Space 为 inline-flex：需撑满行宽时由使用方给定宽度（结构性尺寸，非视觉取值） */
.demo-wrap-area {
  width: 100%;
}

.demo-align-row {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.demo-align-name {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--ui-space-1) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface-muted);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
}

.demo-chip--tall {
  padding-block: var(--ui-space-4);
}

.demo-chip--low {
  padding-block: 0;
  color: var(--ui-text-2);
}
</style>
