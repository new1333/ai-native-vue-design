<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@ui/components'
import type { StepperStatus, StepperStep } from '@ui/components'

const current = ref(1)

const steps: StepperStep[] = [
  { title: '创建空间', description: '初始化项目空间与成员' },
  { title: '安装 Tokens', description: '在应用入口引入 paper.css' },
  { title: '接入组件', description: '按需引入组件并替换现有 UI' },
]

const statusLabel: Record<StepperStatus, string> = {
  waiting: '未开始',
  process: '进行中',
  finish: '已完成',
  error: '异常',
}
</script>

<template>
  <div class="demo-stack">
    <Stepper v-model="current" direction="vertical" clickable :steps="steps">
      <template #icon="{ status }">
        <svg
          class="demo-dot"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="5" :class="`demo-dot--${status}`" />
        </svg>
      </template>
      <template #description="{ step, status }">
        {{ step.description }}
        <span class="demo-tag" :class="`demo-tag--${status}`">{{ statusLabel[status] }}</span>
      </template>
    </Stepper>
    <p class="demo-hint">
      direction="vertical" 纵向排布（连接线沿左轨向下，已完成段转 success）；
      icon / description 为作用域插槽（{ step, index, status }），分别替换图标节点内容与描述文本。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-dot {
  display: block;
}

.demo-dot--waiting {
  fill: var(--ui-border-strong);
}

.demo-dot--process {
  fill: var(--ui-accent);
}

.demo-dot--finish {
  fill: var(--ui-success);
}

.demo-dot--error {
  fill: var(--ui-danger);
}

.demo-tag {
  display: inline-block;
  margin-left: var(--ui-space-2);
  padding: 0 var(--ui-space-2);
  border-radius: var(--ui-radius-xs);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

.demo-tag--waiting {
  color: var(--ui-text-3);
  background: var(--ui-surface-muted);
}

.demo-tag--process {
  color: var(--ui-on-accent);
  background: var(--ui-accent);
}

.demo-tag--finish {
  color: var(--ui-success);
  background: var(--ui-success-soft);
}

.demo-tag--error {
  color: var(--ui-danger);
  background: var(--ui-danger-soft);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
