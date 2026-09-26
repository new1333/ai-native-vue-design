<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@ui/components'
import type { RadioValue } from '@ui/components'

const plan = ref<RadioValue | undefined>('pro')
const channel = ref<RadioValue | undefined>('email')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <p class="demo-field-label">整组禁用（disabled 作用在 RadioGroup 上）</p>
      <RadioGroup v-model="plan" name="plan" disabled aria-label="套餐版本（整组禁用）">
        <Radio value="free" label="免费版" />
        <Radio value="pro" label="专业版" />
      </RadioGroup>
    </div>
    <div class="demo-block">
      <p class="demo-field-label">单项禁用（disabled 作用在单个 Radio 上）</p>
      <RadioGroup v-model="channel" name="channel" aria-label="通知渠道">
        <Radio value="email" label="邮件" />
        <Radio value="sms" label="短信（已停用）" disabled />
        <Radio value="webhook" label="Webhook" />
      </RadioGroup>
    </div>
    <p class="demo-hint">
      单项 disabled 与组 disabled 取或生效：原生 disabled 移出 Tab 序、不参与方向键导航（圆框灰化 + not-allowed 光标）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-field-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
