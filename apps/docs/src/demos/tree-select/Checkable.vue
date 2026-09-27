<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const permissions: TreeSelectOption[] = [
  {
    label: '系统管理',
    value: 'system',
    children: [
      { label: '用户管理', value: 'user' },
      { label: '角色管理', value: 'role' },
      { label: '日志审计（已下线）', value: 'audit', disabled: true },
    ],
  },
  {
    label: '内容管理',
    value: 'content',
    children: [
      { label: '文章发布', value: 'article' },
      { label: '评论审核', value: 'comment' },
    ],
  },
  { label: '数据看板', value: 'dashboard' },
]

const checked = ref<TreeSelectModelValue>(['article'])
</script>

<template>
  <div class="demo-stack">
    <TreeSelect
      v-model="checked"
      :options="permissions"
      checkable
      clearable
      placeholder="勾选权限"
    />
    <p class="demo-hint">
      当前值：<code>{{ JSON.stringify(checked) }}</code>
      （checkable 级联：勾选父节点展开到全部可选后代，父节点仅在全勾选时记入值、
      部分勾选为半选 aria-checked="mixed"；禁用节点「日志审计」不参与级联；
      输出为先序排列的全勾选值集）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-stack :deep(.ui-tree-select) {
  width: calc(var(--ui-space-8) * 3);
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
