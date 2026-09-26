<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@ui/components'

const PAGE_SIZE = 10
const TOTAL = 86

const page = ref(4)
</script>

<template>
  <div class="demo-stack">
    <Pagination v-model:page="page" :total="TOTAL" :page-size="PAGE_SIZE" />
    <p class="demo-hint">
      当前第 <code>{{ page }}</code> 页 / 共 <code>{{ Math.ceil(TOTAL / PAGE_SIZE) }}</code> 页：
      点击页码或上一页/下一页只发出 update:page，页状态由 v-model:page 持有（组件自身不持有页状态）。
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
