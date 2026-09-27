<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@ui/components'

const quantity = ref<number | null>(3)
</script>

<template>
  <div class="demo-stack">
    <InputNumber
      v-model="quantity"
      :min="1"
      :max="20"
      :precision="0"
      aria-label="购买数量"
    >
      <template #prefix>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
          <path d="M3 6h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 9H6" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="9.5" cy="20" r="1" />
          <circle cx="16.5" cy="20" r="1" />
        </svg>
      </template>
      <template #suffix>件</template>
    </InputNumber>
    <p class="demo-hint">
      当前值：<code>{{ quantity ?? 'null（空）' }}</code>
      （#prefix 放图标/货币符号、#suffix 放单位；内联 SVG 遵循 viewBox 0 0 24 24、
      stroke-width 1.5、currentColor，尺寸由组件统一约束；precision=0 限定整数）
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
