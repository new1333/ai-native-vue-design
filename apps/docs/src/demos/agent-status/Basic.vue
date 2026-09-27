<script setup lang="ts">
import { AgentStatus } from '@ui/components'
import type { AgentStatusState } from '@ui/components'

/** §14 state semantics 八档全集（生命周期顺序展示）。 */
const states: AgentStatusState[] = [
  'queued',
  'running',
  'streaming',
  'waitingForTool',
  'toolRunning',
  'completed',
  'failed',
  'cancelled',
]
</script>

<template>
  <div class="demo-stack">
    <div class="demo-grid">
      <AgentStatus v-for="state in states" :key="state" :status="state" />
    </div>
    <div class="demo-row">
      <AgentStatus
        status="toolRunning"
        label="工具执行中"
        detail="正在执行 web_search（第 3 / 7 步）"
      />
    </div>
    <div class="demo-row">
      <AgentStatus status="streaming">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2Z" />
          </svg>
        </template>
        自定义图形 + 文本
      </AgentStatus>
    </div>
    <p class="demo-hint">
      八档对齐 §14 state semantics：queued / running / streaming / waitingForTool /
      toolRunning / completed / failed / cancelled。运行三档（running / streaming /
      toolRunning）自带 Spinner；状态语义由文本承载，图形纯装饰（aria-hidden）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-5);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
