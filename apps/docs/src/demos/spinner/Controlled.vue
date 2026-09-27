<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Button, Spinner } from '@ui/components'

const loading = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

function refresh(): void {
  loading.value = true
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
    timer = null
  }, 1600)
}

onUnmounted(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Button size="sm" :disabled="loading" @click="refresh">
        {{ loading ? '刷新中…' : '刷新数据' }}
      </Button>
      <Spinner v-if="loading" size="sm" label="正在刷新数据" />
    </div>
    <p class="demo-hint">
      受控用法：loading 由使用方状态驱动，加载期间显示 Spinner 并禁用按钮；任务结束后
      v-if 卸载，role="status" 区域随之移除。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
