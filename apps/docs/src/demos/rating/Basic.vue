<script setup lang="ts">
import { ref } from 'vue'
import { Rating } from '@ui/components'
import type { RatingValue } from '@ui/components'

const score = ref<RatingValue | undefined>(undefined)
</script>

<template>
  <div class="demo-stack">
    <Rating v-model="score" aria-label="服务满意度" />
    <p class="demo-hint">
      当前评分：<code>{{ score ?? '未评分（undefined）' }}</code>
      （悬停任意星档可预览填充并触发 hoverChange；←→↑↓ 方向键以焦点档为基准步进、
      Enter/Space 选中当前档；aria-label 经 attrs 落在 role="radiogroup" 容器上）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
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
