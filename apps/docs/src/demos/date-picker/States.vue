<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ui/components'
import type { DatePickerModelValue } from '@ui/components'

const locked = ref<DatePickerModelValue>('2026-10-01')
const busy = ref<DatePickerModelValue>(null)

/** 受控：不用 v-model，显式接管 update:modelValue（如需落库/联动校验）。 */
const manual = ref<DatePickerModelValue>(null)

function onManualUpdate(value: DatePickerModelValue): void {
  manual.value = value
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">整体禁用（disabled）</span>
      <DatePicker v-model="locked" disabled />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">加载中（loading，aria-busy，拦截开合）</span>
      <DatePicker v-model="busy" loading />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">受控绑定（:model-value + @update:model-value）</span>
      <DatePicker :model-value="manual" @update:model-value="onManualUpdate" />
      <button type="button" class="demo-reset" @click="manual = null">置空</button>
    </div>
    <p class="demo-hint">
      disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；loading 呈现
      aria-busy="true" 与 wait 光标、面板不可打开（供异步数据源就绪前的占位）；受控模式下值变化只发
      update:modelValue，是否落值由使用方决定。
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

.demo-row :deep(.ui-date-picker) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-reset {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-button-radius);
  background: var(--ui-surface);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-reset:hover {
  color: var(--ui-text-1);
  border-color: var(--ui-border-strong);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
