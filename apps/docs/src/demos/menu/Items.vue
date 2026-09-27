<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@ui/components'
import type { MenuOption } from '@ui/components'

const items: MenuOption[] = [
  { value: 'dashboard', label: '仪表盘' },
  {
    value: 'content',
    label: '内容管理',
    children: [
      { value: 'articles', label: '文章' },
      { value: 'media', label: '媒体库' },
      { value: 'comments', label: '评论', disabled: true },
    ],
  },
  { value: 'users', label: '用户' },
  { value: 'trash', label: '回收站', disabled: true },
]

const current = ref('dashboard')
</script>

<template>
  <div class="demo-stack">
    <Menu v-model:model-value="current" :items="items">
      <template #icon="{ item }">
        <svg
          v-if="'children' in item && item.children"
          class="demo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <svg
          v-else
          class="demo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      </template>
      <template #item="{ item, disabled }">
        {{ item.label }}{{ disabled ? '（禁用）' : '' }}
      </template>
    </Menu>
    <p class="demo-hint">
      items 数组驱动：含 children 的项渲染为可展开组（组节点不可选中）；#icon 按 item 定制图标，
      #item 作用域插槽拿到 { item, active, disabled } 覆盖叶子项内容。当前激活项：{{ current }}
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-icon {
  flex: none;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
