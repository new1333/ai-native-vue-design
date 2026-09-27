<script setup lang="ts">
import { ref } from 'vue'
import { Button, Tree } from '@ui/components'
import type { TreeNode } from '@ui/components'

const loading = ref(true)

function toggleLoading(): void {
  loading.value = !loading.value
}

const disabledData: TreeNode[] = [
  {
    key: 'prod',
    title: '生产环境',
    disabled: true,
    children: [{ key: 'prod-db', title: '生产数据库' }],
  },
  { key: 'staging', title: '预发环境' },
]

const emptyData: TreeNode[] = []
</script>

<template>
  <div class="demo-stack">
    <section class="demo-section">
      <h4 class="demo-title">加载中（骨架行 + aria-busy）</h4>
      <div class="demo-row">
        <Button size="sm" @click="toggleLoading">{{ loading ? '完成加载' : '重新加载' }}</Button>
        <span class="demo-hint">loading={{ loading }}</span>
      </div>
      <Tree :data="[]" :loading="loading" />
    </section>

    <section class="demo-section">
      <h4 class="demo-title">禁用节点（不可选/不可勾，仍可展开）</h4>
      <Tree :data="disabledData" checkable />
    </section>

    <section class="demo-section">
      <h4 class="demo-title">空态（empty 插槽覆盖默认文案）</h4>
      <Tree :data="emptyData">
        <template #empty>当前目录为空，先创建一个文件夹</template>
      </Tree>
    </section>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-title {
  margin: 0;
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-2);
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
</style>
