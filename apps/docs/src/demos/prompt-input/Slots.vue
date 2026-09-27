<script setup lang="ts">
import { ref } from 'vue'
import { PromptInput } from '@ui/components'

const draft = ref('')
const scene = ref('代码评审')
const scenes = ['代码评审', '文案润色', '头脑风暴']

const templates: Record<string, string> = {
  代码评审: '请审查以下代码，按「正确性 / 可读性 / 性能」三方面给出意见：\n',
  文案润色: '请润色下面的文案，保持原意并使语气更自然：\n',
  头脑风暴: '请围绕下面的主题给出 5 个不同角度的想法：\n',
}

function pickScene(next: string): void {
  scene.value = next
}

function insertTemplate(): void {
  draft.value = draft.value + (templates[scene.value] ?? '')
}

function onSubmit(): void {
  draft.value = ''
}
</script>

<template>
  <div class="demo-stack">
    <PromptInput
      v-model="draft"
      placeholder="输入提示词"
      @submit="onSubmit"
    >
      <template #prefix>
        <div class="demo-scenes">
          <span class="demo-scenes-label">场景</span>
          <button
            v-for="item in scenes"
            :key="item"
            type="button"
            class="demo-scene"
            :class="{ 'demo-scene--active': item === scene }"
            @click="pickScene(item)"
          >
            {{ item }}
          </button>
        </div>
      </template>
      <template #suffix>
        <span class="demo-shortcut">Enter 发送 · Shift+Enter 换行</span>
      </template>
      <template #actions>
        <button type="button" class="demo-action" @click="insertTemplate">插入模板</button>
      </template>
    </PromptInput>
    <p class="demo-hint">
      prefix 放上下文标签，suffix 放快捷键提示；actions 为增量扩展，内建发送按钮始终保留在最右侧。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-scenes {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-scenes-label {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-scene {
  padding: var(--ui-space-1) var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线 */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: transparent;
  color: var(--ui-text-2);
  font-size: var(--ui-text-xs);
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-scene--active {
  border-color: transparent;
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
}

.demo-action {
  padding: var(--ui-space-1) var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线 */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-size: var(--ui-text-xs);
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-action:hover {
  background-color: var(--ui-surface-muted);
}

.demo-shortcut {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
