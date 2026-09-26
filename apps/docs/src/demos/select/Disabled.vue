<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@ui/components'
import type { SelectOption, SelectValue } from '@ui/components'

const regions: SelectOption[] = [
  { label: '华东', value: 'cn-east' },
  { label: '华北', value: 'cn-north' },
]

const plans: SelectOption[] = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版（售罄）', value: 'enterprise', disabled: true },
]

const region = ref<SelectValue | null>('cn-east')
const plan = ref<SelectValue | null>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">整体禁用（disabled）</span>
      <Select v-model="region" :options="regions" disabled />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">个别选项禁用（option.disabled）</span>
      <Select v-model="plan" :options="plans" placeholder="选择版本" />
    </div>
    <p class="demo-hint">
      整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；
      个别选项不可选时用 option.disabled（渲染为 aria-disabled="true"，不可被高亮/选中，键盘导航自动跳过），而非整体禁用。
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
</style>
