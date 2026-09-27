<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@ui/components'

const progress = ref(40)

const marks = [
  { value: 0, label: '0' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
]
</script>

<template>
  <div class="demo-stack">
    <div class="demo-vertical-row">
      <Slider v-model="progress" vertical :marks="marks" aria-label="注水进度" class="demo-vertical" />
      <Slider :model-value="70" vertical aria-label="只读对照（禁用）" disabled class="demo-vertical" />
    </div>
    <p class="demo-hint">
      当前值：<code>{{ progress }}</code>
      （vertical 时值自下而上增大，aria-orientation="vertical"；滑块自身不产生高度，
      需要使用方提供固定高度容器，如 <code>height: var(--ui-space-8)</code>）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-vertical-row {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-6);
}

.demo-vertical {
  height: var(--ui-space-8);
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
