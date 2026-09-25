<script setup lang="ts">
import { ref } from 'vue'
import { Button, toast } from '@ui/components'
import type { ToastId } from '@ui/components'

const stickyId = ref<ToastId | null>(null)
const closedCount = ref(0)

function showSticky(): void {
  closedCount.value = 0
  stickyId.value = toast.info('这条提示不会自动关闭（duration: 0）', {
    duration: 0,
    onClose: () => {
      closedCount.value += 1
    },
  })
}

function removeSticky(): void {
  if (stickyId.value === null) return
  toast.remove(stickyId.value)
  stickyId.value = null
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="primary" :disabled="stickyId !== null" @click="showSticky">
        推入常驻提示（duration 0）
      </Button>
      <Button size="sm" :disabled="stickyId === null" @click="removeSticky">
        toast.remove(id) 手动移除
      </Button>
    </div>
    <p class="demo-hint">
      onClose 回调无论超时、点关闭按钮还是 remove() 都恰好触发一次；当前已触发
      <code>{{ closedCount }}</code> 次。
      （本页上方「基础用法」已挂载 <code>&lt;ToastHost /&gt;</code>，此处直接调用单例。）
    </p>
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

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
