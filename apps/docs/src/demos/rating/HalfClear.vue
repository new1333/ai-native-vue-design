<script setup lang="ts">
import { ref } from 'vue'
import { Rating } from '@ui/components'
import type { RatingValue } from '@ui/components'

const taste = ref<RatingValue | undefined>(3.5)
</script>

<template>
  <div class="demo-stack">
    <Rating v-model="taste" allow-half clearable aria-label="菜品口味" />
    <p class="demo-hint">
      当前评分：<code>{{ taste ?? '未评分（undefined）' }}</code>
      （allowHalf 时每颗星拆为左右两个半档：点左半得 x.5、右半得整数，←→ 步进同为 0.5 粒度；
      clearable 时再次点击当前评分档位即清除，update:modelValue 以 undefined 发出）
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
