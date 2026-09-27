<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@ui/components'
import type { StepperStep } from '@ui/components'

const current = ref(3)
const lastChange = ref<number | null>(null)

const steps: StepperStep[] = [
  { title: '选择套餐' },
  { title: '确认订单' },
  { title: '联系信息', disabled: true },
  { title: '支付' },
]

function onChange(index: number): void {
  lastChange.value = index
}
</script>

<template>
  <div class="demo-stack">
    <Stepper v-model="current" clickable :steps="steps" @change="onChange" />
    <p class="demo-hint">
      clickable 开启后「已完成」步骤渲染为原生 button：点击 / Enter / Space 回退到该步
      （当前步与未到步不可交互，不允许跳过未完成步骤前跳）。
      「联系信息」为禁用的已完成步：原生 disabled，回退被拦截。
    </p>
    <p class="demo-hint">
      最近一次 change：<code>{{ lastChange === null ? '—' : `第 ${lastChange + 1} 步` }}</code>
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
