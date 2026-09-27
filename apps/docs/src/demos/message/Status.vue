<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Button, Message } from '@ui/components'
import type { MessageStatus } from '@ui/components'

const sendingStatus = ref<MessageStatus>('sent')
const failedStatus = ref<MessageStatus>('error')

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

/** 模拟 user 消息发送回执：sending → sent（1s 后送达）。 */
function resendSending(): void {
  clearTimer()
  sendingStatus.value = 'sending'
  timer = setTimeout(() => {
    sendingStatus.value = 'sent'
  }, 1000)
}

/** 模拟失败消息的重试：error → sending → sent。 */
function retry(): void {
  clearTimer()
  failedStatus.value = 'sending'
  timer = setTimeout(() => {
    failedStatus.value = 'sent'
  }, 1000)
}

onUnmounted(clearTimer)
</script>

<template>
  <div class="demo-stack">
    <Message role="user" name="我" timestamp="14:30" :status="sendingStatus">
      帮我把这份会议纪要压缩成一段话。
    </Message>
    <div class="demo-toolbar">
      <Button size="sm" :disabled="sendingStatus === 'sending'" @click="resendSending">
        模拟发送回执（sending → sent）
      </Button>
    </div>

    <Message role="user" name="我" timestamp="14:26" :status="failedStatus">
      这条消息第一次发送失败了（网络中断）。
      <template #actions>
        <Button v-if="failedStatus === 'error'" size="sm" variant="ghost" @click="retry">
          重新发送
        </Button>
      </template>
    </Message>
    <p class="demo-hint">
      status 三档徽标：sending 脉冲点「发送中」、sent 对勾「已发送」、error danger 色「发送失败」；
      error 时 assistant 气泡描边同步染 danger。#actions 可据作用域里的 message.status 条件渲染操作。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-toolbar {
  display: flex;
  justify-content: flex-end;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
