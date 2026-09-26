<script setup lang="ts">
import { ref } from 'vue'
import { Button, IconButton } from '@ui/components'

const syncing = ref(false)
const clickCount = ref(0)

function onSyncClick(): void {
  clickCount.value += 1
  syncing.value = true
}

function stopSync(): void {
  syncing.value = false
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <IconButton variant="primary" :loading="syncing" aria-label="同步" @click="onSyncClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12a8 8 0 0 1 13.65-5.65L20 8.5" />
          <path d="M20 3.5v5h-5" />
        </svg>
      </IconButton>
      <Button size="sm" :disabled="!syncing" @click="stopSync">结束同步（复位 loading）</Button>
      <IconButton disabled aria-label="删除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
        </svg>
      </IconButton>
    </div>
    <p class="demo-hint">
      click 已触发 {{ clickCount }} 次：loading（图标让位于旋转指示、aria-busy）与 disabled
      时点击和 Enter/Space 均被拦截，计数不变；loading 保持可聚焦，disabled 移出 Tab 序。
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
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
