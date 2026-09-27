<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ui/components'
import type { DatePickerModelValue } from '@ui/components'

const range = ref<DatePickerModelValue>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">活动档期（range）</span>
      <DatePicker v-model="range" type="range">
        <template #panel-footer="{ view }">
          <span class="demo-footer-hint">
            正在选择 {{ view.year }} 年 {{ view.month }} 月：点第一下定起点，再点一下定终点（早于起点会重置起点）
          </span>
        </template>
      </DatePicker>
    </div>
    <p class="demo-hint">
      当前值：<code>{{ Array.isArray(range) ? `${range[0]} ~ ${range[1]}` : 'null（未选）' }}</code>
      （range 即 DateRangePicker 形态：v-model 为 [start, end] 元组，起止按升序归位；panel-footer 插槽可放提示或动作，作用域携带当前视图 { year, month }）
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

.demo-footer-hint {
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-3);
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
