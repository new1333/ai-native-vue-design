<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Button, Progress } from '@ui/components'

const percent = ref(0)

const running = computed(() => percent.value > 0 && percent.value < 100)

let timer: ReturnType<typeof setInterval> | null = null

function stopTimer(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function startExport(): void {
  stopTimer()
  percent.value = 0
  timer = setInterval(() => {
    percent.value = Math.min(100, percent.value + 10)
    if (percent.value >= 100) stopTimer()
  }, 240)
}

const buttonText = computed(() => {
  if (running.value) return '导出中…'
  return percent.value === 0 ? '开始导出' : '重新导出'
})

onUnmounted(stopTimer)
</script>

<template>
  <div class="demo-stack">
    <p class="demo-hint">正在导出：paper-design-system.pdf（任务名：可见文本 + aria-label 双通道）</p>
    <Progress :value="percent" show-label aria-label="导出进度" />
    <div class="demo-actions">
      <Button size="sm" variant="primary" :disabled="running" @click="startExport">
        {{ buttonText }}
      </Button>
    </div>
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
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
