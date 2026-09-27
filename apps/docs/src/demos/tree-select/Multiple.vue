<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const members: TreeSelectOption[] = [
  {
    label: '研发部',
    value: 'rd',
    children: [
      { label: '林一', value: 'lin' },
      { label: '陈二', value: 'chen' },
      { label: '周四', value: 'zhou', disabled: true },
    ],
  },
  {
    label: '设计部',
    value: 'design',
    children: [{ label: '吴五', value: 'wu' }],
  },
]

const selected = ref<TreeSelectModelValue>(['lin', 'wu'])

/** 受控回填：外部直接改数组，触发器与 aria-selected 随之同步。 */
function fillAll(): void {
  selected.value = ['lin', 'chen', 'wu']
}

function reset(): void {
  selected.value = []
}
</script>

<template>
  <div class="demo-stack">
    <TreeSelect
      v-model="selected"
      :options="members"
      multiple
      placeholder="选择成员（可多选）"
    />
    <div class="demo-row">
      <button class="demo-btn" type="button" @click="fillAll">受控回填全部可用成员</button>
      <button class="demo-btn" type="button" @click="reset">清空外部状态</button>
    </div>
    <p class="demo-hint">
      当前值：<code>{{ JSON.stringify(selected) }}</code>
      （multiple 时值为数组，激活节点后弹层保持打开可连续选择；触发器以「、」连接已选 label；
      禁用节点「周四」不可被选中）
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

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-btn {
  border: none; /* 结构性重置：非视觉取值 */
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-btn:hover {
  background-color: var(--ui-accent-soft);
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
