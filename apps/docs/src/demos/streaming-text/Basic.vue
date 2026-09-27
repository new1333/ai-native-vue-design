<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button, StreamingText, Text } from '@ui/components'

/** 模拟一次 AI 回答的累计全文（服务端逐 token 追加，最终形态即此字符串）。 */
const ANSWER =
  '好的，我来解释「纸面」的设计取向：整体以纸质文档为隐喻，界面像一页安静的笔记——低饱和墨色、克制的强调色与稳定的字阶。流式渲染时，回复按节拍逐段上屏；结束后光标收起，全文定格。'

/** 模拟服务端 token：按固定长度切片，逐片追加到 content。 */
const CHUNK_SIZE = 6
const chunks: string[] = []
for (let i = 0; i < ANSWER.length; i += CHUNK_SIZE) {
  chunks.push(ANSWER.slice(i, i + CHUNK_SIZE))
}

const content = ref('')
const streaming = ref(false)
const done = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function stopTimer(): void {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
}

/** 受控流程：使用方只负责追加 content 并翻转 streaming，增量节奏交给组件。 */
function startGenerate(): void {
  stopTimer()
  content.value = ''
  done.value = false
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
  }, 90)
}

function reset(): void {
  stopTimer()
  streaming.value = false
  content.value = ''
  done.value = false
}

/** complete 在 streaming true→false 沿触发一次：组件已定格全文并移除光标。 */
function onComplete(): void {
  done.value = true
}

onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" :disabled="streaming" @click="startGenerate">开始生成</Button>
      <Button variant="secondary" :disabled="streaming || !content" @click="reset">重置</Button>
      <Text size="sm" color="muted">
        状态：{{ streaming ? '流式生成中' : done ? '已完成定格（@complete）' : '待开始' }}
      </Text>
    </div>
    <div class="demo-panel">
      <StreamingText :content="content" :streaming="streaming" @complete="onComplete" />
    </div>
    <Text size="xs" color="text-3">
      streaming=true 期间增量按节拍上屏并渲染光标；流结束后未上屏余量立即定格、光标收起，并派发一次 complete。
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
