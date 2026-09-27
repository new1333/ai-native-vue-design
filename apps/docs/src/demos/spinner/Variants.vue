<script setup lang="ts">
import { Spinner } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Spinner label="正在刷新数据" />
      <span class="demo-caption">spin（默认）</span>
    </div>
    <div class="demo-row">
      <Spinner variant="dots" label="正在保存草稿" />
      <span class="demo-caption">dots</span>
    </div>
    <p class="demo-hint">
      两种变体均不表达量值进度——需要 0-100 + aria-valuenow 的量值反馈用 Progress。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-caption {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
