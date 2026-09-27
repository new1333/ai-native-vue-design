<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from '@ui/components'
import type { TreeNode, TreeSelectPayload } from '@ui/components'

const data: TreeNode[] = [
  {
    key: 'guide',
    title: '使用指南',
    children: [
      { key: 'install', title: '安装' },
      { key: 'tokens', title: '设计令牌' },
    ],
  },
  {
    key: 'components',
    title: '组件',
    children: [
      { key: 'general', title: '通用', children: [{ key: 'button', title: 'Button 按钮' }] },
      { key: 'data', title: '数据', children: [{ key: 'table', title: 'Table 表格' }] },
    ],
  },
  { key: 'changelog', title: '更新日志' },
]

const lastSelect = ref<TreeSelectPayload | null>(null)
</script>

<template>
  <div class="demo-stack">
    <Tree :data="data" @select="lastSelect = $event" />
    <p class="demo-hint">
      最近一次 select 事件：
      <code v-if="lastSelect">key={{ lastSelect.key }}，selected={{ lastSelect.selected }}</code>
      <code v-else>尚未选中</code>
      （默认展开全部父节点；点击标题选中，点击箭头展开/折叠，键盘 ↑↓←→、Enter 均可操作）
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
