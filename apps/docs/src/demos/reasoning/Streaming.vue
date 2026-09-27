<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button, Reasoning } from '@ui/components'

/** 模拟的思考全文：流式期间按片段追加，完成后定格。 */
const FULL_TEXT =
  '用户问的是月活趋势……先确认统计口径：近四周 MAU 依次为 12.1 / 12.4 / 13.0 / 14.1 万；计算周环比分别为 +2.5% / +4.8% / +8.5%，增速在加快；再拆渠道：自然流量平稳，增量主要来自上周的推荐位改版……结论：趋势健康，建议补充改版前后的留存对比以排除拉新水分。'

const streaming = ref(false)
const done = ref(false)
const content = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function stopStream(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function startStream(): void {
  if (streaming.value) return
  stopStream()
  content.value = ''
  done.value = false
  streaming.value = true
  let index = 0
  timer = setInterval(() => {
    index += 8
    content.value = FULL_TEXT.slice(0, index)
    if (index >= FULL_TEXT.length) {
      stopStream()
      streaming.value = false
      done.value = true
    }
  }, 80)
}

onBeforeUnmount(stopStream)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <p class="demo-label">autoCollapse（默认 true）：流式自动展开 → 结束收起为「已思考 x.xs」</p>
      <Reasoning :content="content" :streaming="streaming" :duration="done ? 3.2 : undefined" />
      <div class="demo-actions">
        <Button size="sm" :disabled="streaming" @click="startStream">
          {{ streaming ? '思考中…' : done ? '重放思考流' : '开始思考流' }}
        </Button>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">autoCollapse=false：结束后保持展开，方便继续阅读中间过程</p>
      <Reasoning
        :content="content"
        :streaming="streaming"
        :auto-collapse="false"
        :duration="done ? 3.2 : undefined"
      />
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: grid;
  gap: var(--ui-space-5);
}

.demo-block {
  display: grid;
  gap: var(--ui-space-2);
}

.demo-label {
  margin: 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-actions {
  display: flex;
  gap: var(--ui-space-2);
}
</style>
