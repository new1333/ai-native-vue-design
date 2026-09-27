<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { ToolCallCard } from '@ui/components'
import type { ToolCallStatus } from '@ui/components'

/** 受控状态：approve/reject 只派发事件，流转完全由使用方驱动（组件不自行变更 status）。 */
const status = ref<ToolCallStatus>('waitingApproval')
const result = ref<unknown>(undefined)
const duration = ref<number | null>(null)

let timer: number | undefined

function onApprove(): void {
  status.value = 'running'
  // 模拟运行时：批准后进入执行，1.2s 后产出结果（定时器仅在使用交互后启动）
  timer = window.setTimeout(() => {
    status.value = 'completed'
    result.value = '已向 ops@example.com 发送「部署通知」，队列编号 #20481。'
    duration.value = 1180
  }, 1200)
}

function onReject(): void {
  status.value = 'failed'
  result.value = 'Error: 调用被人工拒绝，未执行发送。'
}

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearTimeout(timer)
})
</script>

<template>
  <ToolCallCard
    name="send_email"
    :args="{ to: 'ops@example.com', subject: '部署通知', body: '生产环境 v0.4.0 部署完成。' }"
    :result="result"
    :status="status"
    :duration="duration"
    @approve="onApprove"
    @reject="onReject"
  />
</template>
