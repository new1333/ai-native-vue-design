<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, StreamingText, Text } from '@ui/components'

const ANSWER = 'default 插槽接管「已上屏文本」的渲染：作用域提供 text（已上屏部分）与 streaming（是否生成中）。此处用 text 实时驱动强调色，并显示生成中徽标——完整 Markdown/语法高亮渲染器也经此接入。'

const CHUNK_SIZE = 6
const chunks: string[] = []
for (let i = 0; i < ANSWER.length; i += CHUNK_SIZE) {
  chunks.push(ANSWER.slice(i, i + CHUNK_SIZE))
}

const content = ref('')
const streaming = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function stopTimer(): void {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
}

function startGenerate(): void {
  stopTimer()
  content.value = ''
  streaming.value = true
  let index = 0
  timer = setInterval(() => {
    if (index >= chunks.length) {
      streaming.value = false
      stopTimer()
      return
    }
    content.value += chunks[index]
    index += 1
  }, 80)
}

onMounted(() => {
  startGenerate()
})

onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="secondary" :disabled="streaming" @click="startGenerate">重新生成</Button>
      <Text size="sm" color="muted">状态：{{ streaming ? '流式生成中' : '已完成定格' }}</Text>
    </div>
    <div class="demo-panel">
      <StreamingText :content="content" :streaming="streaming">
        <template #default="{ text, streaming: live }">
          <span class="demo-custom" :class="{ 'demo-custom--live': live }">{{ text }}</span>
          <span v-if="live" class="demo-tag">生成中</span>
        </template>
      </StreamingText>
    </div>
    <Text size="xs" color="text-3">
      自定义渲染时内置纯文本/段落结构不再输出，流式光标仍由组件收口（可用 cursor 插槽进一步替换）。
    </Text>
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
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-panel {
  min-height: var(--ui-space-8);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-4);
}

.demo-custom {
  color: var(--ui-text-2);
}

.demo-custom--live {
  color: var(--ui-text-1);
}

.demo-tag {
  display: inline-block;
  margin-left: var(--ui-space-2);
  padding: 0 var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}
</style>
