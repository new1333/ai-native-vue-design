<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@ui/components'
import type { AutoCompleteOption } from '@ui/components'

const owners: AutoCompleteOption[] = [
  { label: '林一', value: 'lin' },
  { label: '陈二', value: 'chen' },
  { label: '周四', value: 'zhou' },
]

const owner = ref('陈二')
const clearCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <AutoComplete
      v-model="owner"
      :options="owners"
      placeholder="选择负责人"
      clearable
      @clear="clearCount++"
    />
    <p class="demo-hint">
      当前文本：<code>{{ owner || '空（已清空）' }}</code>，clear 已触发 <code>{{ clearCount }}</code> 次
      （文本非空且非禁用时显示清空按钮，aria-label="清空"；点击发出 update:modelValue('') 与 clear，
      随后走空关键词路径：面板打开 + search('')，焦点交还输入框）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-stack :deep(.ui-autocomplete) {
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
