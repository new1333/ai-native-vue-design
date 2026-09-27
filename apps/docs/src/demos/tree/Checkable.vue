<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from '@ui/components'
import type { TreeCheckPayload, TreeNode } from '@ui/components'

const data: TreeNode[] = [
  {
    key: 'workspace',
    title: '工作区',
    children: [
      {
        key: 'docs',
        title: 'docs',
        children: [
          { key: 'guide', title: '使用指南.md' },
          { key: 'conventions', title: '编写规约.md' },
        ],
      },
      { key: 'config', title: 'paper.css', disabled: true },
      { key: 'readme', title: 'README.md' },
    ],
  },
]

const lastCheck = ref<TreeCheckPayload | null>(null)
</script>

<template>
  <div class="demo-stack">
    <Tree :data="data" checkable @check="lastCheck = $event" />
    <p class="demo-hint">
      最近一次 check 事件（勾选父级会级联到全部可用后代，祖先按「可用子节点是否全勾」回算，
      <code>paper.css</code> 为禁用节点不参与级联）：
      <code v-if="lastCheck">checkedKeys={{ lastCheck.checkedKeys.join('、') || '空' }}</code>
      <code v-else>尚未勾选</code>
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
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
