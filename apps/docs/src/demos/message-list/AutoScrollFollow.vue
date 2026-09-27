<script setup lang="ts">
import { ref } from 'vue'
import { Button, MessageList } from '@ui/components'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([
  { id: 1, role: 'user', content: '先向上滚动看看，再点「追加新消息」。' },
  { id: 2, role: 'assistant', content: '贴底时我会自动跟随新消息；你上翻阅读时，新消息不会把你拉下去。' },
  { id: 3, role: 'user', content: '那怎么回到底部？' },
  { id: 4, role: 'assistant', content: '用 expose 的 scrollToBottom()，就是下面的「回到底部」按钮。' },
  { id: 5, role: 'assistant', content: '再补一条，把列表撑出滚动条。' },
])

let nextId = 6
const replies = [
  '新消息到达：贴底状态下视口自动定位到这里。',
  '又一条新消息：如果你已上翻，这条不会打断你。',
  '继续追加。autoScroll 关闭后，即使贴底也不再自动滚动。',
]
let replyIndex = 0

/** 受控开关：autoScroll 可由使用方随时切换。 */
const autoScroll = ref(true)
/** 贴底状态读数（由 @near-bottom 播报驱动，组件外无需自行测量滚动位置）。 */
const nearBottom = ref(true)
/** MessageList 实例（expose.scrollToBottom）。 */
const listRef = ref<{ scrollToBottom: () => void } | null>(null)

function appendMessage(): void {
  messages.value.push({
    id: nextId++,
    role: 'assistant',
    content: replies[replyIndex++ % replies.length] ?? '',
  })
}

function onNearBottom(value: boolean): void {
  nearBottom.value = value
}

function scrollToBottom(): void {
  listRef.value?.scrollToBottom()
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" :variant="autoScroll ? 'primary' : 'secondary'" @click="autoScroll = !autoScroll">
        autoScroll：{{ autoScroll ? '开（受控）' : '关' }}
      </Button>
      <Button size="sm" variant="secondary" @click="appendMessage">追加新消息</Button>
      <Button size="sm" variant="secondary" :disabled="nearBottom" @click="scrollToBottom">回到底部</Button>
    </div>
    <p class="demo-readout" role="status">
      贴底：{{ nearBottom ? '是 —— 新消息自动跟随' : '否 —— 已上翻，新消息不打扰' }}
      （读数来自 @near-bottom 播报）
    </p>
    <MessageList
      ref="listRef"
      class="demo-chat"
      :messages="messages"
      :message-key="(message) => message.id"
      :auto-scroll="autoScroll"
      aria-label="贴底跟随演示"
      @near-bottom="onNearBottom"
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

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
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
