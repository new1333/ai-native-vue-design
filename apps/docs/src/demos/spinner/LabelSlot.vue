<script setup lang="ts">
import { Spinner } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Spinner label="正在导出">
      <template #label>正在导出 <strong>paper-design-system.pdf</strong></template>
    </Spinner>
    <p class="demo-hint">
      #label 插槽覆盖默认文本：内容仍以 sr-only 渲染在 role="status" 内，读屏播报完整状态句。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
