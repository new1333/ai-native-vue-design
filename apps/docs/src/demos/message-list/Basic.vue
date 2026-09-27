<script setup lang="ts">
import { MessageList } from '@ui/components'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages: ChatMessage[] = [
  { id: 1, role: 'user', content: '帮我总结一下这份需求文档的要点。' },
  { id: 2, role: 'assistant', content: '好的，这份文档的要点有三：一是目标用户与场景；二是核心流程与边界；三是验收标准。' },
  { id: 3, role: 'user', content: '把第二条展开讲讲。' },
  { id: 4, role: 'assistant', content: '第二条的核心是「先跑通主流程」：登录 → 创建会话 → 发送消息 → 流式接收回复，异常分支先降级为提示文案。' },
  { id: 5, role: 'user', content: '明白了，谢谢。' },
  { id: 6, role: 'assistant', content: '不客气，需要我按这个结构起草验收清单的话随时说。' },
]
</script>

<template>
  <!-- 滚动视口高度由使用方给定（组件不代设尺寸）；气泡视觉完全在 #default 插槽内组合 -->
  <MessageList
    class="demo-chat"
    :messages="messages"
    :message-key="(message) => message.id"
    aria-label="会话消息"
  >
    <template #default="{ message }">
      <p class="demo-bubble" :class="`demo-bubble--${message.role}`">{{ message.content }}</p>
    </template>
  </MessageList>
</template>

<style scoped>
.demo-chat {
  height: calc(var(--ui-space-8) * 4);
  padding: var(--ui-space-3) var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-bubble {
  width: fit-content;
  max-width: calc(var(--ui-space-8) * 8);
  margin: 0;
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}

.demo-bubble--user {
  margin-left: auto;
  background-color: var(--ui-accent-soft);
}

.demo-bubble--assistant {
  background-color: var(--ui-surface-muted);
}
</style>
