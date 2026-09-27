<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroup } from '@ui/components'

const selected = ref<string[]>(['paper', 'ink'])

const options = [
  { value: 'paper', label: '纸面' },
  { value: 'ink', label: '墨色' },
  { value: 'pine', label: '松绿' },
  { value: 'clay', label: '陶土' },
]
</script>

<template>
  <div class="demo-stack">
    <ToggleGroup v-model="selected" type="multiple" :items="options" aria-label="标签筛选" />
    <p class="demo-hint">
      当前选中：<code>{{ selected.join('、') || '（空）' }}</code>
      （multiple 模式：toggle button 语义 + aria-pressed；点击即增删数组，change 同步发出完整数组）
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
