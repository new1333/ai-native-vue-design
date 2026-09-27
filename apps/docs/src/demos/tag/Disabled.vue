<script setup lang="ts">
import { ref } from 'vue'
import { Tag, Button } from '@ui/components'

const disabled = ref(true)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Tag disabled>已失效分类</Tag>
      <Tag variant="danger" disabled closable>封禁成员（close 不可触发）</Tag>
      <Tag variant="info" closable>正常对照（可关闭）</Tag>
    </div>
    <div class="demo-row">
      <Button size="sm" variant="ghost" @click="disabled = !disabled">
        {{ disabled ? '解除禁用' : '恢复禁用' }}
      </Button>
      <Tag :disabled="disabled" closable>{{ disabled ? '当前：禁用态' : '当前：可用态' }}</Tag>
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}
</style>
