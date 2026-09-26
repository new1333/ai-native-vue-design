<script setup lang="ts">
import { ref } from 'vue'
import { Button, Progress } from '@ui/components'

const scanning = ref(true)
</script>

<template>
  <div class="demo-stack">
    <Progress :indeterminate="scanning" :value="65" show-label />
    <div class="demo-actions">
      <Button size="sm" @click="scanning = !scanning">
        {{ scanning ? '切换为确定进度' : '切换为不确定进度' }}
      </Button>
    </div>
    <p class="demo-hint">
      indeterminate 时忽略 value（本例声明了 value=65）、省略 aria-valuenow、隐藏数值标签并播放扫描动画；
      切回确定进度后恢复 aria-valuenow 与标签。
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
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
