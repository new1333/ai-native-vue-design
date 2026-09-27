<script setup lang="ts">
import { Tree } from '@ui/components'
import type { TreeNode, TreeNodeSlotScope } from '@ui/components'

const data: TreeNode[] = [
  {
    key: 'assets',
    title: 'assets',
    icon: 'folder',
    children: [
      { key: 'logo', title: 'logo.svg', icon: 'file' },
      { key: 'paper', title: 'paper.css', icon: 'file' },
    ],
  },
  { key: 'main.ts', title: 'main.ts', icon: 'file' },
]

// 图标由使用方在 #node 插槽内自绘（内联 SVG、currentColor、尺寸 16）
function iconOf(icon: TreeNodeSlotScope['icon']): string {
  return icon ?? 'file'
}
</script>

<template>
  <div class="demo-stack">
    <Tree :data="data">
      <template #node="{ title, icon, level, selected }">
        <svg
          v-if="iconOf(icon) === 'folder'"
          class="demo-icon"
          :class="{ 'demo-icon--selected': selected }"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
        <svg
          v-else
          class="demo-icon"
          :class="{ 'demo-icon--selected': selected }"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        </svg>
        <span class="demo-node-title">{{ title }}</span>
        <span class="demo-node-level">L{{ level }}</span>
      </template>
    </Tree>
    <p class="demo-hint">
      #node 作用域提供 node / title / icon / level / expanded / selected / checked / indeterminate /
      disabled；icon 只是 data 透出的字符串标识，图标由使用方渲染（默认渲染只输出 title）。
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
  color: var(--ui-text-3);
}

.demo-icon--selected {
  color: var(--ui-accent);
}

.demo-node-title {
  flex: 1 1 auto;
  min-width: 0;
}

.demo-node-level {
  flex: none;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
