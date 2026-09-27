<script setup lang="ts">
import { Spinner } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Spinner size="sm" label="正在加载" />
      <Spinner label="正在加载" />
      <Spinner size="lg" label="正在加载" />
    </div>
    <p class="demo-hint">
      sm / md（默认）/ lg 三档：spin 外径 16 / 24 / 32。label 必配——文本以 sr-only
      渲染在 role="status" 内，读屏播报加载状态，视觉上只见图形。
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
  gap: var(--ui-space-5);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
