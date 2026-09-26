<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@ui/components'
import type { SelectOption, SelectValue } from '@ui/components'

const owners: SelectOption[] = [
  { label: '林一', value: 'lin' },
  { label: '陈二', value: 'chen' },
  { label: '周四', value: 'zhou' },
]

const owner = ref<SelectValue | null>('chen')
const clearCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <Select v-model="owner" :options="owners" placeholder="选择负责人" clearable @clear="clearCount++" />
    <p class="demo-hint">
      当前值：<code>{{ owner ?? 'null（已清空）' }}</code>，clear 已触发 <code>{{ clearCount }}</code> 次
      （有已选值且非禁用时显示清空按钮，aria-label="清空" 与折叠箭标互换显示；点击发出 update:modelValue(null) 与 clear，焦点交还触发器）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-stack :deep(.ui-select) {
  width: calc(var(--ui-space-8) * 3);
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
