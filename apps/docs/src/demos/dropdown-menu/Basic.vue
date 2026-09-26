<script setup lang="ts">
import { ref } from 'vue'
import { DropdownMenu } from '@ui/components'
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
      <DropdownMenu :items="items" @select="onSelect">操作</DropdownMenu>
    </div>
    <p class="demo-hint">
      插槽为文本时回退为内建原生 button 触发器；items 按序渲染为
      <code>role="menuitem"</code>，select 载荷即所选项 key：
      <code>{{ lastKey ?? '尚未选择' }}</code>。
      键盘路径：触发器 Enter / Space / ↓ / ↑ 开合，菜单内 ↓ / ↑ 环绕漫游、Home / End 首尾、
      Enter 选中、Esc / Tab 关闭；选中与键盘关闭后焦点还原触发器。
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
