<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@ui/components'

const level = ref(60)

const marks = [
  { value: 0, label: '低' },
  { value: 25, label: '较低' },
  { value: 50, label: '中' },
  { value: 75, label: '较高' },
  { value: 100, label: '高' },
]
</script>

<template>
  <div class="demo-stack">
    <Slider v-model="level" :marks="marks" aria-label="湿度档位">
      <template #tooltip="{ value }">
        <span class="demo-tooltip">{{ value }}%</span>
      </template>
      <template #marks="{ mark, reached }">
        <span class="demo-mark" :class="{ 'demo-mark--reached': reached }">{{ mark.label }}</span>
      </template>
    </Slider>
    <p class="demo-hint">
      #tooltip 自定义值气泡内容（作用域 { value }，装饰层 aria-hidden，读屏取值以 aria-valuenow 为准）；
      #marks 自定义刻度标签（作用域 { mark, reached }），reached 表示刻度已被当前值覆盖。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-tooltip {
  font-variant-numeric: var(--ui-numeric);
}

.demo-mark {
  color: inherit;
}

.demo-mark--reached {
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
