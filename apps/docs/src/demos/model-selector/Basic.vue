<script setup lang="ts">
import { ref } from 'vue'
import { ModelSelector } from '@ui/components'
import type { ModelSelectorModel, ModelSelectorValue } from '@ui/components'

const models: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude Sonnet', value: 'claude-sonnet', provider: 'Anthropic' },
  { label: 'DeepSeek-V3', value: 'deepseek-v3', provider: 'DeepSeek' },
  { label: '本地 Qwen2.5', value: 'qwen-local', provider: 'Local' },
]

const current = ref<ModelSelectorValue | null>('claude-sonnet')
const changed = ref<ModelSelectorModel | null>(null)

function onChange(model: ModelSelectorModel): void {
  changed.value = model
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="ms-basic-current">当前会话模型</label>
      <ModelSelector
        id="ms-basic-current"
        v-model="current"
        :models="models"
        @change="onChange"
      />
    </div>
    <p class="demo-hint">
      当前值：<code>{{ current ?? 'null（未选）' }}</code>；最近一次 change 载荷：<code>{{
        changed ? `${changed.label}（${changed.provider}）` : '—'
      }}</code>
      （v-model 类型为 string | number | null；provider 渲染为 badge 形态徽标；id 经 attrs 直达触发器，可被 label[for] 关联）
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
