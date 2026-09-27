<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Button, Timeline } from '@ui/components'
import type { TimelineItem } from '@ui/components'

const items = ref<TimelineItem[]>([
  { key: 'e1', title: '构建开始', description: 'paper-design-system.tar.gz', time: '15:30:00' },
  { key: 'e2', title: '类型检查通过', time: '15:30:12' },
])

const pending = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

/** 模拟追加一条构建日志：加载期间 pending 显示"进行中"幽灵节点。 */
function appendLog(): void {
  if (pending.value) return
  pending.value = true
  timer = setTimeout(() => {
    const step = items.value.length + 1
    items.value = [
      ...items.value,
      { key: `e${step}`, title: `第 ${step} 步构建完成`, time: `15:30:${String(step * 7).padStart(2, '0')}` },
    ]
    pending.value = false
  }, 900)
}

onUnmounted(clearTimer)
</script>

<template>
  <div class="demo-stack">
    <Timeline :items="items" :pending="pending">
      <template #footer>
        <Button size="sm" :disabled="pending" @click="appendLog">
          {{ pending ? '日志写入中…' : '模拟下一步' }}
        </Button>
      </template>
    </Timeline>
    <p class="demo-hint">
      pending=true 时列表末尾追加"进行中"幽灵节点（accent 脉冲点 + 内置文案），
      表示事件流仍在推进；prefers-reduced-motion 下脉冲降级为静态实心点。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
