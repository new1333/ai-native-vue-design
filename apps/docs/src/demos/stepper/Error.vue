<script setup lang="ts">
import { ref } from 'vue'
import { Button, Stepper } from '@ui/components'
import type { StepperStep } from '@ui/components'

const current = ref(2)
const hasError = ref(true)

const steps: StepperStep[] = [
  { title: '基本信息', description: '账号与联系方式' },
  { title: '资质上传', description: '营业执照与许可证' },
  { title: '实名核验', description: '当前步：核验服务返回失败' },
  { title: '开通完成' },
]
</script>

<template>
  <div class="demo-stack">
    <Stepper v-model="current" :status="hasError ? 'error' : undefined" :steps="steps" />
    <div class="demo-actions">
      <Button size="sm" variant="secondary" @click="hasError = !hasError">
        {{ hasError ? '模拟修复（恢复 process）' : '模拟出错（置 error）' }}
      </Button>
    </div>
    <p class="demo-hint">
      status="error" 只覆盖当前步的呈现：节点转 danger、标题转 danger 字重 medium；
      前序已完成步仍为 finish，未到步仍为 waiting。
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
</style>
