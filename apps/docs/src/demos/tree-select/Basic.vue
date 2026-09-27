<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const regions: TreeSelectOption[] = [
  {
    label: '华东地区',
    value: 'east',
    children: [
      { label: '上海', value: 'shanghai' },
      { label: '杭州', value: 'hangzhou' },
      { label: '南京', value: 'nanjing' },
    ],
  },
  {
    label: '华北地区',
    value: 'north',
    children: [{ label: '北京', value: 'beijing' }],
  },
  { label: '总部', value: 'hq' },
]

const region = ref<TreeSelectModelValue>('shanghai')
const empty = ref<TreeSelectModelValue>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="tree-select-basic-region">归属地区（单选，默认已选）</label>
      <TreeSelect
        id="tree-select-basic-region"
        v-model="region"
        :options="regions"
        placeholder="选择地区"
      />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">未选态（显示 placeholder）</span>
      <TreeSelect v-model="empty" :options="regions" placeholder="选择地区" />
    </div>
    <p class="demo-hint">
      当前值：region=<code>{{ region ?? 'null（未选）' }}</code>
      （单选值为节点 value 或 null，以 === 匹配；点击可展开节点本身即选中并关闭，点展开箭标仅折叠/展开。
      id 经 attrs 直达触发器，可被 label[for] 关联）
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
