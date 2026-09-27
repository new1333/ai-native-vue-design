<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@ui/components'
import type { AutoCompleteOption } from '@ui/components'

const languages: AutoCompleteOption[] = [
  { label: 'TypeScript', value: 'ts' },
  { label: 'JavaScript', value: 'js' },
  { label: 'Vue', value: 'vue' },
  { label: 'Python', value: 'py' },
]

const text = ref('')
</script>

<template>
  <div class="demo-stack">
    <AutoComplete v-model="text" :options="languages" placeholder="搜索语言">
      <template #prefix>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" stroke-linecap="round" />
        </svg>
      </template>
      <template #suffix>
        <span class="demo-unit">语言</span>
      </template>
      <template #option="{ option, active }">
        <span class="demo-option-label">{{ option.label }}</span>
        <code class="demo-option-value" :class="{ 'demo-option-value--active': active }">{{
          option.value
        }}</code>
      </template>
      <template #empty>
        <span>没有匹配「{{ text }}」的语言，换个关键词试试</span>
      </template>
    </AutoComplete>
    <p class="demo-hint">
      当前文本：<code>{{ text || '空' }}</code>
      （option 作用域插槽拿到 { option, index, active }，此处给机器值加了徽标并随 active 高亮；
      prefix 放搜索图标，suffix 在清空按钮之后；empty 覆盖默认空态文案）
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

.demo-unit {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-option-label {
  margin-right: var(--ui-space-2);
}

.demo-option-value {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  padding: 0 var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface-muted);
}

.demo-option-value--active {
  color: var(--ui-accent);
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
