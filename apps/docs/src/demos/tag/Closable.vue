<script setup lang="ts">
import { ref } from 'vue'
import { Tag, Button } from '@ui/components'

interface SkillTag {
  id: number
  label: string
  variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const initial: SkillTag[] = [
  { id: 1, label: 'Vue 3', variant: 'success' },
  { id: 2, label: 'TypeScript', variant: 'info' },
  { id: 3, label: '前端', variant: 'neutral' },
  { id: 4, label: '紧急招聘', variant: 'warning' },
]

/** 数据源由使用方持有：close 只上报，移除在这里完成。 */
const tags = ref<SkillTag[]>([...initial])

function remove(id: number): void {
  tags.value = tags.value.filter((tag) => tag.id !== id)
}

function restore(): void {
  tags.value = [...initial]
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Tag
        v-for="tag in tags"
        :key="tag.id"
        :variant="tag.variant"
        closable
        @close="remove(tag.id)"
      >
        {{ tag.label }}
      </Tag>
      <span v-if="tags.length === 0" class="demo-empty">已全部移除</span>
    </div>
    <div v-if="tags.length < initial.length" class="demo-row">
      <Button size="sm" variant="ghost" @click="restore">恢复全部</Button>
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

.demo-empty {
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
}
</style>
