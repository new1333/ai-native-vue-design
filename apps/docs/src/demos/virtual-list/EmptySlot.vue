<script setup lang="ts">
import { ref } from 'vue'
import { Button, EmptyState, VirtualList } from '@ui/components'

interface Notice {
  id: number
  text: string
}

const notices = ref<Notice[]>([])

function toggle(): void {
  notices.value = notices.value.length
    ? []
    : [{ id: 1, text: '系统通知：欢迎使用纸面组件库。' }]
}
</script>

<template>
  <div class="demo-empty">
    <VirtualList
      class="demo-empty__list"
      :items="notices"
      :estimated-item-size="56"
      :get-key="(notice) => notice.id"
      aria-label="通知列表"
    >
      <template #item="{ item }">
        <div class="demo-empty__row">{{ item.text }}</div>
      </template>
      <template #empty>
        <EmptyState title="还没有通知" description="拉取到新消息后会出现在这里。" />
      </template>
    </VirtualList>
    <Button size="sm" @click="toggle">
      {{ notices.length ? '清空列表（回到空态）' : '载入一条通知' }}
    </Button>
  </div>
</template>

<style scoped>
.demo-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ui-space-3);
}

.demo-empty__list {
  width: 100%;
  height: calc(var(--ui-space-8) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-empty__row {
  padding: var(--ui-space-2) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}
</style>
