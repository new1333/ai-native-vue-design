<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@ui/components'

const price = ref<number | null>(9.5)
</script>

<template>
  <div class="demo-stack">
    <InputNumber
      v-model="price"
      :min="0"
      :step="0.5"
      :precision="2"
      aria-label="单价"
    >
      <template #prefix>¥</template>
    </InputNumber>
    <p class="demo-hint">
      当前值：<code>{{ price ?? 'null（空）' }}</code>
      （step=0.5 + precision=2：提交/步进后按两位小数取整并格式化展示——1 显示为
      "1.00"；步进加法的浮点噪声（0.1+0.2）按操作数小数位归正）
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
