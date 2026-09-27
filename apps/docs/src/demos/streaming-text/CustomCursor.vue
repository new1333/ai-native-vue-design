<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, StreamingText, Text } from '@ui/components'

const ANSWER = '光标经 cursor 插槽整体替换：容器（含 aria-hidden）仍由组件收口，仅 streaming 期间渲染；流结束即随定格一并移除。'

const CHUNK_SIZE = 5
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
      <Text size="sm" color="muted">状态：{{ streaming ? '流式生成中（自定义光标）' : '已完成定格' }}</Text>
    </div>
    <div class="demo-panel">
      <StreamingText :content="content" :streaming="streaming">
        <template #cursor>
          <span class="demo-dot" aria-hidden="true"></span>
        </template>
      </StreamingText>
    </div>
    <Text size="xs" color="text-3">
      默认光标为块状插入符（--ui-accent）；本示例替换为方点。光标容器为装饰元素（aria-hidden），不要在其中放置交互内容。
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

.demo-dot {
  display: inline-block;
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  margin-left: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  background: var(--ui-accent);
  vertical-align: middle;
}
</style>
