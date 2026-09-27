<script setup lang="ts">
import { ref } from 'vue'
import { Button, Tree } from '@ui/components'
import type { TreeExpandPayload, TreeNode } from '@ui/components'

const data: TreeNode[] = [
  {
    key: 'paper',
    title: '纸面 Paper',
    children: [
      {
        key: 'packages',
        title: 'packages',
        children: [
          { key: 'tokens', title: 'tokens' },
          { key: 'components', title: 'components' },
        ],
      },
      {
        key: 'apps',
        title: 'apps',
        children: [{ key: 'playground', title: 'playground' }],
      },
    ],
  },
]

const allParentKeys = ['paper', 'packages', 'apps']

// 受控展开：expandedKeys 完全由外部状态驱动，展开/折叠经 @expand 回写快照
const expandedKeys = ref<string[]>(['paper'])

function onExpand(payload: TreeExpandPayload): void {
  expandedKeys.value = payload.expandedKeys
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Button size="sm" @click="expandedKeys = [...allParentKeys]">全部展开</Button>
      <Button size="sm" @click="expandedKeys = []">全部折叠</Button>
      <span class="demo-hint">expandedKeys：<code>{{ expandedKeys.join('、') || '空' }}</code></span>
    </div>
    <Tree :data="data" :expanded-keys="expandedKeys" @expand="onExpand" />
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
  align-items: center;
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
