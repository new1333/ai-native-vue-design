<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button, ModelSelector } from '@ui/components'
import type { ModelSelectorModel, ModelSelectorValue } from '@ui/components'

const staticModels: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude Sonnet', value: 'claude-sonnet', provider: 'Anthropic' },
]

// 模拟异步拉取模型清单：拉取期间 :loading（弹层显示加载文案、拦截选中）
const refreshing = ref(false)
const listModels = ref<ModelSelectorModel[]>([])
const current = ref<ModelSelectorValue | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined

function fetchModels(): void {
  refreshing.value = true
  // 1200ms 为演示用的模拟网络延迟（JS 逻辑，非视觉值）
  timer = setTimeout(() => {
    listModels.value = [...staticModels, { label: 'DeepSeek-V3', value: 'deepseek-v3', provider: 'DeepSeek' }]
    refreshing.value = false
  }, 1200)
}

onBeforeUnmount(() => {
  if (timer !== undefined) clearTimeout(timer)
})
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">静态加载态（:loading="true"）</span>
      <ModelSelector :models="staticModels" loading placeholder="选择模型" />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">模拟拉取后可选</span>
      <ModelSelector
        v-model="current"
        :models="listModels"
        :loading="refreshing"
        placeholder="选择模型"
        empty-text="模型清单为空"
      />
      <Button variant="secondary" :disabled="refreshing" @click="fetchModels">
        {{ refreshing ? '拉取中…' : '刷新模型列表' }}
      </Button>
    </div>
    <p class="demo-hint">
      loading 期间打开弹层显示 loadingText（默认「模型列表加载中…」）、不渲染选项、拦截一切选中路径，根级 aria-busy="true"；
      触发器保持可开合，让用户看到加载反馈。models 为空且非加载中时以 emptyText 兜底。
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
