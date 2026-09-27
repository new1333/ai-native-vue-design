<script setup lang="ts">
import { ref } from 'vue'
import { PromptInput } from '@ui/components'

const draft = ref('')
const lastSubmitted = ref('')
const history = ref<string[]>([])

// 提交后清空由使用方完成（组件保持纯受控，submit 不自动清空）
function onSubmit(value: string): void {
  lastSubmitted.value = value
  history.value = [value, ...history.value].slice(0, 3)
  draft.value = ''
}
</script>

<template>
  <div class="demo-stack">
    <PromptInput
      v-model="draft"
      placeholder="给 AI 的提示词，Enter 发送，Shift+Enter 换行"
      @submit="onSubmit"
    />
    <p class="demo-hint">
      最近提交：<code>{{ lastSubmitted || '（尚未提交）' }}</code>
      （v-model 绑定 string；submit 不自动清空，由使用方经 v-model 置空）
    </p>
    <ul v-if="history.length" class="demo-history">
      <li v-for="(item, index) in history" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
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

.demo-history {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
</style>
