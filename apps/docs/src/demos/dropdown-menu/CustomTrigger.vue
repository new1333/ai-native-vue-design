<script setup lang="ts">
import { ref } from 'vue'
import { Button, DropdownMenu } from '@ui/components'
import type { DropdownMenuItem } from '@ui/components'

const items: DropdownMenuItem[] = [
  { key: 'rename', label: '重命名' },
  { key: 'duplicate', label: '创建副本' },
  { key: 'archive', label: '归档' },
]

const lastKey = ref<string | null>(null)

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <DropdownMenu :items="items" @select="onSelect">
        <Button variant="secondary">更多操作</Button>
      </DropdownMenu>
      <DropdownMenu :items="items" @select="onSelect">
        <button type="button" class="demo-ghost-trigger">原生 button 触发元素</button>
      </DropdownMenu>
    </div>
    <p class="demo-hint">
      默认插槽为单个元素/组件 vnode 时，该元素直接作为触发元素：组件合并
      id、aria-haspopup、aria-expanded、aria-controls 与 click/keydown 监听，不产生嵌套
      button；触发元素须可聚焦，组件触发元素须把 attrs 透传到根元素。
      最近选中：<code>{{ lastKey ?? '尚未选择' }}</code>。
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
  align-items: center;
  gap: var(--ui-space-4);
}

/* 原生元素触发器：观感对齐内建触发器的安静档，全部走 token */
.demo-ghost-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: none;
  background-color: transparent;
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
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
