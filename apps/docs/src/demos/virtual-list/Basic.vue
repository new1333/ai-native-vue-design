<script setup lang="ts">
import { VirtualList } from '@ui/components'

interface Message {
  id: number
  sender: string
  text: string
}

const senders = ['林晚照', '沈砚', '顾清桐', '苏行舟', '陆知遥']

const messages: Message[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  sender: senders[i % senders.length],
  text: `第 ${i + 1} 条消息：全量 1000 项中只有可视窗口附近约 24 项真实存在于 DOM。`,
}))
</script>

<template>
  <VirtualList
    class="demo-list"
    :items="messages"
    :estimated-item-size="56"
    :get-key="(message) => message.id"
    aria-label="会话消息"
  >
    <template #item="{ item }">
      <article class="demo-message">
        <span class="demo-message__sender">{{ item.sender }}</span>
        <span class="demo-message__text">{{ item.text }}</span>
      </article>
    </template>
  </VirtualList>
</template>

<style scoped>
.demo-list {
  /* 滚动视口尺寸由使用方给定（组件不代设高度） */
  height: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-message {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  padding: var(--ui-space-2) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-border);
}

.demo-message__sender {
  color: var(--ui-text-2);
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
}

.demo-message__text {
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}
</style>
