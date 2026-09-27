<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@ui/components'

const percent = ref<number | null>(50)
</script>

<template>
  <div class="demo-stack">
    <InputNumber
      v-model="percent"
      :min="0"
      :max="100"
      :step="5"
      aria-label="百分比"
    >
      <template #suffix>%</template>
    </InputNumber>
    <p class="demo-hint">
      当前值：<code>{{ percent ?? 'null（空）' }}</code>
      （min=0 / max=100 / step=5：aria-valuemin/max 随边界渲染，aria-valuenow 恒为钳制后的生效值；
      试着键入 999 后回车——越界提交被钳到 100 并回写。空值时步进从 min=0 起步）
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
