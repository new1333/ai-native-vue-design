<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@ui/components'
import type { SelectOption, SelectValue } from '@ui/components'

const statusOptions: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已归档', value: 'archived' },
]

const levelOptions: SelectOption[] = [
  { label: 'P0 · 紧急', value: 0 },
  { label: 'P1 · 高', value: 1 },
  { label: 'P2 · 中', value: 2 },
]

const status = ref<SelectValue | null>(null)
const level = ref<SelectValue | null>(2)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="select-basic-status">文章状态</label>
      <Select id="select-basic-status" v-model="status" :options="statusOptions" placeholder="选择状态" />
    </div>
    <div class="demo-row">
      <label class="demo-field-label" for="select-basic-level">优先级（number 值）</label>
      <Select id="select-basic-level" v-model="level" :options="levelOptions" />
    </div>
    <p class="demo-hint">
      当前值：status=<code>{{ status ?? 'null（未选）' }}</code>，level=<code>{{ level ?? 'null（未选）' }}</code>
      （v-model 类型为 string | number | null；value 支持字符串与数字，以 === 匹配。id 经 attrs 直达触发器，可被 label[for] 关联）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-field-label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-row :deep(.ui-select) {
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
