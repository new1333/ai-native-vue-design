<script setup lang="ts">
import { ref } from 'vue'
import { Button, Stepper } from '@ui/components'
import type { StepperStep } from '@ui/components'

const current = ref(0)

const steps: StepperStep[] = [
  { title: '账号信息' },
  { title: '公司信息' },
  { title: '交付配置' },
  { title: '完成' },
]
</script>

<template>
  <div class="demo-stack">
    <Stepper v-model="current" :steps="steps" />
    <div class="demo-actions">
      <Button size="sm" variant="secondary" :disabled="current === 0" @click="current--">
        上一步
      </Button>
      <Button size="sm" variant="primary" :disabled="current === steps.length - 1" @click="current++">
        下一步
      </Button>
    </div>
    <p class="demo-hint">
      当前步索引：<code>{{ current }}</code>（v-model 受控，0 起始；组件自身不持有步状态，
      已完成步自动派生为 finish、未到步为 waiting）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
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
