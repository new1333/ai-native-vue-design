<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ui/components'
import type { DatePickerModelValue } from '@ui/components'

const date = ref<DatePickerModelValue>(null)
const datetime = ref<DatePickerModelValue>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="dp-basic-date">发布日期（date）</label>
      <DatePicker id="dp-basic-date" v-model="date" placeholder="选择发布日期" />
    </div>
    <div class="demo-row">
      <label class="demo-field-label" for="dp-basic-datetime">发布时间（datetime）</label>
      <DatePicker id="dp-basic-datetime" v-model="datetime" type="datetime" />
    </div>
    <p class="demo-hint">
      当前值：date=<code>{{ date ?? 'null（未选）' }}</code>，datetime=<code>{{ datetime ?? 'null（未选）' }}</code>
      （v-model 为按 format 序列化的字符串：date 默认 YYYY-MM-DD、datetime 默认 YYYY-MM-DD HH:mm；
      datetime 形态在面板内提供时间输入，未设置时间按 00:00 合并）
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
