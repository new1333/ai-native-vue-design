<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, StreamingText, Text } from '@ui/components'

/** 含空行分段与段内换行的累计全文。 */
const ANSWER =
  '「纸面」的排版基线来自纸质文档：标题用衬线与较大字阶，正文保持稳定的字号与行距。\n\n强调色只保留一种墨绿，其余层级交给墨色深浅。\n\n这一取向让生成中的内容也保持纸面的安静感。'

const CHUNK_SIZE = 7
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
  // 进入示例即开始一轮流式，便于直接观察段落化上屏
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
      <StreamingText :content="content" :streaming="streaming" markdown />
    </div>
    <Text size="xs" color="text-3">
      markdown=true：空行切分为原生段落、段内换行保留（安全文本节点渲染）；完整 Markdown 语法（标题/列表/代码块）请在 default 插槽接外部渲染器。
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
</style>
