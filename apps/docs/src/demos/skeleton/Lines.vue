<script setup lang="ts">
import { Skeleton } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <p class="demo-hint">:lines='1' —— 单行，不渲染短尾</p>
      <Skeleton :lines="1" />
    </div>
    <div class="demo-block">
      <p class="demo-hint">:lines='3'（默认）—— 末行短尾，模拟段落收尾</p>
      <Skeleton :lines="3" />
    </div>
    <div class="demo-block">
      <p class="demo-hint">:lines='4' :height='16' —— 自定义行数与行高</p>
      <Skeleton :lines="4" :height="16" />
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
