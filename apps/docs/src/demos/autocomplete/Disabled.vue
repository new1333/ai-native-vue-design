<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@ui/components'
import type { AutoCompleteOption } from '@ui/components'

const withDisabledOptions: AutoCompleteOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已归档（不可选）', value: 'archived', disabled: true },
]

const free = ref('')
const restricted = ref('')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="autocomplete-disabled-whole">整体禁用</label>
      <AutoComplete
        id="autocomplete-disabled-whole"
        v-model="free"
        :options="withDisabledOptions"
        disabled
        placeholder="禁用中，不可输入"
      />
    </div>
    <div class="demo-row">
      <label class="demo-field-label" for="autocomplete-disabled-option">含禁用建议</label>
      <AutoComplete
        id="autocomplete-disabled-option"
        v-model="restricted"
        :options="withDisabledOptions"
        placeholder="输入过滤（↓/↑ 导航自动跳过禁用项）"
      />
    </div>
    <p class="demo-hint">
      当前值：整体禁用=<code>{{ free || '空' }}</code>，含禁用建议=<code>{{ restricted || '空' }}</code>
      （整体 disabled 为原生 disabled；个别建议不可选用 option.disabled → aria-disabled="true"，
      不可被高亮/选中，键盘导航自动跳过）
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

.demo-row :deep(.ui-autocomplete) {
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
