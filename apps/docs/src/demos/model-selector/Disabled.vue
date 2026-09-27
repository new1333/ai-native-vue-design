<script setup lang="ts">
import { ref } from 'vue'
import { ModelSelector } from '@ui/components'
import type { ModelSelectorModel, ModelSelectorValue } from '@ui/components'

const online: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude Sonnet', value: 'claude-sonnet', provider: 'Anthropic' },
]

// 个别模型不可选（无权限/配额售罄）用 model.disabled，而非整体禁用
const team: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'o1（配额售罄）', value: 'o1', provider: 'OpenAI', disabled: true },
  { label: 'Claude Opus（无权限）', value: 'claude-opus', provider: 'Anthropic', disabled: true },
  { label: '本地 Qwen2.5', value: 'qwen-local', provider: 'Local' },
]

const locked = ref<ModelSelectorValue | null>('gpt-4o')
const picked = ref<ModelSelectorValue | null>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">整体禁用（disabled）</span>
      <ModelSelector v-model="locked" :models="online" disabled />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">个别模型禁用（model.disabled）</span>
      <ModelSelector v-model="picked" :models="team" placeholder="选择模型" />
    </div>
    <p class="demo-hint">
      整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘）；
      个别模型不可选时用 model.disabled（渲染为 aria-disabled="true"，不可被高亮/选中，键盘导航自动跳过），而非整体禁用。
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

.demo-row :deep(.ui-model-selector) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
