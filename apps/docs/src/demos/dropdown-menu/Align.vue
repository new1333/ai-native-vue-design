<script setup lang="ts">
import { ref } from 'vue'
import { DropdownMenu } from '@ui/components'
import type { DropdownMenuItem } from '@ui/components'

const items: DropdownMenuItem[] = [
  { key: 'rename', label: '重命名' },
  { key: 'move', label: '移动到…' },
  { key: 'remove', label: '移除', danger: true },
]

const lastKey = ref<string | null>(null)

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-bar">
      <DropdownMenu :items="items" align="start" @select="onSelect">start 对齐</DropdownMenu>
      <DropdownMenu :items="items" align="end" @select="onSelect">end 对齐</DropdownMenu>
    </div>
    <p class="demo-hint">
      align 控制菜单面板与触发器的水平对齐：start 左缘对齐（默认）、end 右缘对齐
      （纯 CSS 实现，无需测量面板宽度）；两个触发器分别置于容器两端以便观察。
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

.demo-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
