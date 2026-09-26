<script setup lang="ts">
import { ref } from 'vue'
import { Alert, Button } from '@ui/components'

const visible = ref(true)
</script>

<template>
  <div class="demo-stack">
    <Alert
      v-if="visible"
      severity="warning"
      title="额度即将用尽"
      closable
      @close="visible = false"
    >
      本月 API 额度已使用 90%。点击右侧关闭按钮：组件只上报 close，移除由这里的 v-if 完成。
    </Alert>
    <div v-else class="demo-row">
      <Button size="sm" @click="visible = true">恢复显示（close 已触发过）</Button>
    </div>
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
}
</style>
