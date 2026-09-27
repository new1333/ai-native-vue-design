<script setup lang="ts">
import { ref } from 'vue'
import { PromptInput } from '@ui/components'

const draft = ref('')
const longText = [
  '请帮我梳理这份需求文档：',
  '1. 列出核心目标与成功指标；',
  '2. 指出边界与不做的事项；',
  '3. 给出里程碑拆分建议。',
].join('\n')

function insertLong(): void {
  draft.value = draft.value ? `${draft.value}\n${longText}` : longText
}
</script>

<template>
  <div class="demo-stack">
    <PromptInput v-model="draft" :max-rows="4" placeholder="输入区随内容长高，到 4 行封顶后内部滚动" />
    <div class="demo-toolbar">
      <button type="button" class="demo-button" @click="insertLong">插入多行文本</button>
      <button type="button" class="demo-button" @click="draft = ''">清空</button>
    </div>
    <p class="demo-hint">
      maxRows=4：内容增加时输入区随之长高（mounted 后按内容实测），封顶后 overflow-y: auto 内部滚动。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-toolbar {
  display: flex;
  gap: var(--ui-space-2);
}

.demo-button {
  padding: var(--ui-space-1) var(--ui-space-3);
  /* 描边宽度 1px 为结构性细线 */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-button:hover {
  background-color: var(--ui-surface-muted);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
