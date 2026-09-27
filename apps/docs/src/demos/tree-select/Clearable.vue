<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const projects: TreeSelectOption[] = [
  {
    label: '纸面设计系统',
    value: 'paper',
    children: [
      { label: '组件库', value: 'components' },
      { label: '文档站', value: 'docs' },
    ],
  },
  { label: '独立应用', value: 'standalone' },
]

const project = ref<TreeSelectModelValue>('components')
const changeCount = ref(0)
const clearCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <TreeSelect
      v-model="project"
      :options="projects"
      clearable
      placeholder="选择项目"
      @change="changeCount++"
      @clear="clearCount++"
    />
    <p class="demo-hint">
      当前值：<code>{{ project ?? 'null（已清空）' }}</code>，
      change 已触发 <code>{{ changeCount }}</code> 次，clear 已触发 <code>{{ clearCount }}</code> 次
      （有已选值且非禁用时显示清空按钮，aria-label="清空" 与折叠箭标互换显示：
      点击发出 update:modelValue(null) 与 clear、不触发 change，焦点交还触发器）
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
