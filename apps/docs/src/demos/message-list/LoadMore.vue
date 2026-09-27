<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { MessageList } from '@ui/components'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

/** 初始会话：足够长以产生滚动（滚动到顶部触发 loadMore）。 */
const messages = ref<ChatMessage[]>(
  Array.from({ length: 18 }, (_, i) => ({
    id: 1000 + i,
    role: i % 2 === 0 ? ('assistant' as const) : ('user' as const),
    content: `当前会话消息 ${i + 1}：向上滚动到顶部试试。`,
  })),
)

let oldestId = 1000
let remainingPages = 3
const loading = ref(false)
const hasMore = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

/**
 * loadMore 边沿触发（进入顶部区域发一次）：加载中去重由使用方负责——
 * loading 期间忽略再次触发；前插历史须配 messageKey 稳定键，避免整列表按下标重建。
 */
function onLoadMore(): void {
  if (loading.value || !hasMore.value) return
  loading.value = true
  timer = setTimeout(() => {
    const older: ChatMessage[] = []
    for (let i = 0; i < 8; i++) {
      oldestId -= 1
      older.unshift({
        id: oldestId,
        role: i % 2 === 0 ? 'assistant' : 'user',
        content: `更早的历史消息（id ${oldestId}）：由 @load-more 前插。`,
      })
    }
    messages.value = [...older, ...messages.value]
    remainingPages -= 1
    if (remainingPages === 0) hasMore.value = false
    loading.value = false
  }, 600)
}

onBeforeUnmount(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="demo-stack">
    <p class="demo-readout" role="status">
      <template v-if="loading">正在加载更早消息…</template>
      <template v-else-if="!hasMore">已到最早消息（剩余页数用尽，使用方自行去重与收尾）</template>
      <template v-else>滚动到顶部加载更早历史（@load-more 边沿触发）</template>
    </p>
    <MessageList
      class="demo-chat"
      :messages="messages"
      :message-key="(message) => message.id"
      aria-label="历史消息"
      @load-more="onLoadMore"
    >
      <template #default="{ message }">
        <p class="demo-bubble" :class="`demo-bubble--${message.role}`">{{ message.content }}</p>
      </template>
    </MessageList>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-readout {
  margin: 0;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
}

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
