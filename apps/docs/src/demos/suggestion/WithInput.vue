<script setup lang="ts">
import { ref } from 'vue'
import { Suggestion } from '@ui/components'
import type { SuggestionItem } from '@ui/components'

const items: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的代码示例' },
  { label: '解释取舍', value: '请解释这个设计的取舍与边界' },
]

const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function applySuggestion(item: SuggestionItem): void {
  // Suggestion 只上抛 select；写入输入框并聚焦是使用方的职责
  draft.value = item.value
  inputRef.value?.focus()
}
</script>

<template>
  <div class="demo-col">
    <Suggestion :items="items" aria-label="推荐追问" @select="applySuggestion" />
    <input
      ref="inputRef"
      v-model="draft"
      class="demo-input"
      type="text"
      placeholder="点击 chip 回填提示词，然后直接追问…"
      aria-label="提示词输入框"
    />
  </div>
</template>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

/* 使用方自有元素；描边宽度 1px 为结构性细线（同组件包约定，无 --ui-border-width token） */
.demo-input {
  box-sizing: border-box;
  width: 100%;
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  transition: border-color var(--ui-motion-default) var(--ui-ease-out);
}

.demo-input::placeholder {
  color: var(--ui-text-3);
}

.demo-input:focus {
  border-color: var(--ui-input-border-focus);
  outline: none;
}
</style>
