<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@ui/components'

const count = ref<number | null>(1)
const stepCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <InputNumber
      v-model="count"
      :min="1"
      :max="99"
      aria-label="数量"
      @step="stepCount++"
    />
    <p class="demo-hint">
      当前值：<code>{{ count ?? 'null（空）' }}</code>，step 已触发
      <code>{{ stepCount }}</code> 次
      （受控 v-model 为 number | null；点击 +/− 或聚焦后 ↑/↓ 逐 step、PageUp/PageDown 跨
      step×10、Home/End 跳 min/max；边界上原地步进不发事件）
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
