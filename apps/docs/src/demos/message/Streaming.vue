<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Button, Message } from '@ui/components'

const FULL_TEXT = '本周 12 次构建：10 次通过、2 次因类型检查失败回滚；主要问题集中在 input-number 的边界值校验。'

const visibleText = ref('')
const streaming = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

function clearTimer(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

/** 模拟流式生成：每 60ms 追加一个字符，完成后停止 streaming。 */
function startStream(): void {
  clearTimer()
  visibleText.value = ''
  streaming.value = true
  timer = setInterval(() => {
    if (visibleText.value.length >= FULL_TEXT.length) {
      clearTimer()
      streaming.value = false
      return
    }
    visibleText.value = FULL_TEXT.slice(0, visibleText.value.length + 1)
  }, 60)
}

onUnmounted(clearTimer)
</script>

<template>
  <div class="demo-stack">
    <Message role="user" name="我" timestamp="14:30" status="sent">
      汇总一下这周的构建情况。
    </Message>
    <Message role="assistant" name="纸面助手" timestamp="14:31" :streaming="streaming">
      {{ visibleText }}<template v-if="!streaming && visibleText.length === 0">（点击下方按钮开始生成）</template>
    </Message>
    <div class="demo-toolbar">
      <Button size="sm" :disabled="streaming" @click="startStream">
        {{ streaming ? '生成中…' : '模拟流式回复' }}
      </Button>
    </div>
    <p class="demo-hint">
      streaming=true 时内容尾部渲染流式光标（prefers-reduced-motion 降级为静态），根元素置
      aria-busy="true"；同一会话建议只有最后一条 assistant 消息处于 streaming。
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
