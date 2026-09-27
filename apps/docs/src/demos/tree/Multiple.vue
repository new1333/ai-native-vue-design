<script setup lang="ts">
import { ref } from 'vue'
import { Button, Tree } from '@ui/components'
import type { TreeNode } from '@ui/components'

const data: TreeNode[] = [
  {
    key: 'frontend',
    title: '前端组',
    children: [
      { key: 'lin', title: '林晚照' },
      { key: 'shen', title: '沈砚' },
    ],
  },
  {
    key: 'backend',
    title: '后端组',
    children: [{ key: 'gu', title: '顾清桐' }],
  },
  { key: 'qa', title: '质量组' },
]

// 受控多选：v-model 双向绑定 string[]
const selected = ref<string[]>(['lin', 'gu'])
</script>

<template>
  <div class="demo-stack">
    <Tree v-model="selected" :data="data" multiple />
    <div class="demo-row">
      <span class="demo-hint">
        已选（multiple，点击切换、无需修饰键）：<code>{{ selected.length ? selected.join('、') : '无' }}</code>
      </span>
      <Button size="sm" @click="selected = []">清空选择</Button>
    </div>
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
  justify-content: space-between;
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
