<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const departments: TreeSelectOption[] = [
  {
    label: '产品部',
    value: 'product',
    children: [
      { label: '产品规划', value: 'planning' },
      { label: '数据分析', value: 'data' },
    ],
  },
  {
    label: '市场部（已冻结）',
    value: 'marketing',
    disabled: true,
    children: [{ label: '品牌公关', value: 'brand' }],
  },
]

const dept = ref<TreeSelectModelValue>('planning')
const frozen = ref<TreeSelectModelValue>('brand')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">整体禁用（disabled）</span>
      <TreeSelect v-model="dept" :options="departments" disabled />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">个别节点禁用（option.disabled，子树一并失效）</span>
      <TreeSelect v-model="frozen" :options="departments" placeholder="选择部门" />
    </div>
    <p class="demo-hint">
      整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；
      个别节点不可用时用 option.disabled（渲染为 aria-disabled="true"，自身与子树均不可选、
      键盘导航自动跳过、级联复选中不参与勾选），而非整体禁用。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-field-label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-row :deep(.ui-tree-select) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
