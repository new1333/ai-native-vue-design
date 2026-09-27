<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@ui/components'

const price = ref<[number, number]>([200, 800])

const marks = [
  { value: 0, label: '0' },
  { value: 250, label: '250' },
  { value: 500, label: '500' },
  { value: 750, label: '750' },
  { value: 1000, label: '1000' },
]
</script>

<template>
  <div class="demo-stack">
    <Slider v-model="price" range :min="0" :max="1000" :step="10" :marks="marks" aria-label="价格区间" />
    <p class="demo-hint">
      当前区间：<code>[{{ price[0] }}, {{ price[1] }}]</code>
      （range 模式绑定升序二元组，两柄互为边界、钳制不交叉；轨道点击跳值到指针位置并取最近柄）
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
