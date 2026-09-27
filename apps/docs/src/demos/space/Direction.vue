<script setup lang="ts">
import { Space } from '@ui/components'
</script>

<template>
  <div class="demo-column">
    <p class="demo-label">direction="row"（默认）：横向排列</p>
    <Space>
      <span class="demo-chip">甲</span>
      <span class="demo-chip">乙</span>
      <span class="demo-chip">丙</span>
    </Space>

    <p class="demo-label">direction="column"：纵向堆叠</p>
    <Space direction="column" size="sm">
      <span class="demo-chip">甲</span>
      <span class="demo-chip">乙</span>
      <span class="demo-chip">丙</span>
    </Space>
  </div>
</template>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
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
</style>
