<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const memberOptions: CascaderOption[] = [
  {
    label: '产品部',
    value: 'dept-product',
    children: [
      { label: '产品设计组', value: 'team-design', children: [{ label: '陈一', value: 'u-chen' }, { label: '陈二（借调）', value: 'u-chen-2', disabled: true }] },
      { label: '研究组', value: 'team-research', children: [{ label: '李四', value: 'u-li' }] },
    ],
  },
  {
    label: '工程部',
    value: 'dept-eng',
    children: [
      { label: '前端组', value: 'team-fe', children: [{ label: '王五', value: 'u-wang' }, { label: '赵六', value: 'u-zhao' }] },
    ],
  },
]

const reviewers = ref<CascaderPath[]>([])
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-multiple-reviewers">会签人（multiple，叶子勾选，弹层保持打开可连续勾选）</label>
      <Cascader id="cascader-multiple-reviewers" v-model="reviewers" :options="memberOptions" multiple placeholder="选择会签人" />
    </div>
    <p class="demo-hint">
      已选 {{ reviewers.length }} 条路径：<code>{{ reviewers.length > 0 ? JSON.stringify(reviewers) : '[]' }}</code>
      （multiple 时 modelValue 为路径数组；父节点仅用于展开，不支持勾选聚合；禁用叶子不可勾选）
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

.demo-row :deep(.ui-cascader) {
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
