<script setup lang="ts">
import { Space } from '@ui/components'
</script>

<template>
  <div class="demo-column">
    <p class="demo-label">size="sm"：--ui-space-2</p>
    <Space size="sm">
      <span class="demo-chip">间距</span>
      <span class="demo-chip">档位</span>
      <span class="demo-chip">小</span>
    </Space>

    <p class="demo-label">size="md"（默认）：--ui-space-4</p>
    <Space size="md">
      <span class="demo-chip">间距</span>
      <span class="demo-chip">档位</span>
      <span class="demo-chip">中</span>
    </Space>

    <p class="demo-label">size="lg"：--ui-space-6</p>
    <Space size="lg">
      <span class="demo-chip">间距</span>
      <span class="demo-chip">档位</span>
      <span class="demo-chip">大</span>
    </Space>
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
