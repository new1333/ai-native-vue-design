<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { AgentStatus, Button, IconButton } from '@ui/components'
import type { AgentStatusState } from '@ui/components'

/**
 * 受控组合演示：AgentStatus 纯展示，status 由本组件（使用方）驱动；
 * 停止/重试等动作用外部 IconButton 组合，工具批准用外部 Button 组合。
 */
const ACTIVE: readonly AgentStatusState[] = ['running', 'streaming', 'waitingForTool', 'toolRunning']

const status = ref<AgentStatusState>('queued')
const detail = ref('空闲 · 点击「开始运行」模拟一次 agent run')

let timers: number[] = []

function schedule(fn: () => void, delay: number): void {
  timers.push(window.setTimeout(fn, delay))
}

function clearTimers(): void {
  for (const id of timers) window.clearTimeout(id)
  timers = []
}

/** 模拟一次运行：queued → running → streaming → waitingForTool（等用户批准） */
function startRun(): void {
  clearTimers()
  status.value = 'queued'
  detail.value = '已加入队列'
  schedule(() => {
    status.value = 'running'
    detail.value = '正在规划执行步骤'
  }, 700)
  schedule(() => {
    status.value = 'streaming'
    detail.value = '正在生成回答与工具调用计划'
  }, 1600)
  schedule(() => {
    status.value = 'waitingForTool'
    detail.value = '等待批准工具调用 web_search'
  }, 2800)
}

/** 批准 → toolRunning →（1/3 概率模拟工具失败）completed / failed */
function approve(): void {
  clearTimers()
  status.value = 'toolRunning'
  detail.value = '正在执行 web_search'
  schedule(() => {
    if (Math.random() < 1 / 3) {
      status.value = 'failed'
      detail.value = 'web_search 超时，可重试'
    } else {
      status.value = 'completed'
      detail.value = '本轮运行结束'
    }
  }, 1400)
}

/** 拒绝工具调用 → cancelled */
function reject(): void {
  clearTimers()
  status.value = 'cancelled'
  detail.value = '已拒绝工具调用，运行终止'
}

/** 停止（外部 IconButton）：任意运行态均可终止 */
function stop(): void {
  clearTimers()
  status.value = 'cancelled'
  detail.value = '运行已被手动停止'
}

onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-panel">
      <div class="demo-panel-head">
        <AgentStatus :status="status" :detail="detail" />
        <span class="demo-panel-actions">
          <IconButton
            v-if="ACTIVE.includes(status)"
            variant="outline"
            size="sm"
            aria-label="停止运行"
            @click="stop"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="7" y="7" width="10" height="10" rx="1.5" />
            </svg>
          </IconButton>
          <IconButton
            v-if="status === 'failed' || status === 'cancelled'"
            variant="outline"
            size="sm"
            aria-label="重试"
            @click="startRun"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </IconButton>
        </span>
      </div>
      <div v-if="status === 'waitingForTool'" class="demo-approve">
        <span class="demo-approve-text">是否批准调用 web_search？</span>
        <Button size="sm" variant="primary" @click="approve">批准</Button>
        <Button size="sm" variant="secondary" @click="reject">拒绝</Button>
      </div>
    </div>
    <div class="demo-row">
      <Button size="sm" variant="secondary" :disabled="ACTIVE.includes(status)" @click="startRun">
        开始运行
      </Button>
    </div>
    <p class="demo-hint">
      AgentStatus 不含内部状态机：status 由使用方受控传入；停止/重试（IconButton）与
      批准/拒绝（Button）都是组件外部组合。工具执行有 1/3 概率模拟失败，可体验 failed
      档与重试动作。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-panel {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
}

.demo-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ui-space-3);
}

.demo-panel-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-approve {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding-top: var(--ui-space-2);
  border-top: 1px solid var(--ui-border);
}

.demo-approve-text {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
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
