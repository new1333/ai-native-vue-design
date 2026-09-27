<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ui/components'
import type { DatePickerDisabledDate, DatePickerModelValue } from '@ui/components'

const enroll = ref<DatePickerModelValue>('2026-09-15')

/** 周末不可报名（disabledDate 与 min/max 取并集）。 */
const weekendOnly: DatePickerDisabledDate = (date) => date.getDay() === 0 || date.getDay() === 6
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">报名日期（min/max + disabledDate + clearable）</span>
      <DatePicker
        v-model="enroll"
        min="2026-09-01"
        max="2026-09-30"
        :disabled-date="weekendOnly"
        clearable
      />
    </div>
    <p class="demo-hint">
      当前值：<code>{{ enroll ?? 'null（未选）' }}</code>
      （固定边界用 min/max、动态规则用 disabledDate，二者取并集：界外与周末渲染为 aria-disabled，
      点击与键盘 roving 均不可选中；clearable 时触发器右端出现清空按钮，点击发出 update:modelValue(null) 与 clear）
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
