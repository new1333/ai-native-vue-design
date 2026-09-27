<script setup lang="ts">
import { ref } from 'vue'
import { Badge, ModelSelector } from '@ui/components'
import type { ModelSelectorModel, ModelSelectorValue } from '@ui/components'

/** 在 ModelSelectorModel 基础上附加使用方自己的扩展字段（此处为免费额度标记）。 */
type DemoModel = ModelSelectorModel & { free?: boolean }

const models: DemoModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'GPT-4o mini', value: 'gpt-4o-mini', provider: 'OpenAI', free: true },
  { label: 'Claude Sonnet', value: 'claude-sonnet', provider: 'Anthropic' },
]

/** 扩展字段读取：组件插槽 scope 按基础类型 ModelSelectorModel 提供，使用方自行窄化。 */
function isFree(model: ModelSelectorModel): boolean {
  return (model as DemoModel).free === true
}

const current = ref<ModelSelectorValue | null>('gpt-4o')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">默认渲染（provider 徽标 + 模型名）</span>
      <ModelSelector v-model="current" :models="models" />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">#option 插槽定制（追加「免费额度」标记）</span>
      <ModelSelector v-model="current" :models="models">
        <template #option="{ model, selected }">
          <Badge variant="neutral">{{ model.provider }}</Badge>
          <span class="slot-option-label">{{ model.label }}</span>
          <Badge v-if="isFree(model)" variant="success">免费额度</Badge>
          <span v-if="selected" class="slot-option-mark" aria-hidden="true">✓</span>
        </template>
      </ModelSelector>
    </div>
    <div class="demo-row">
      <span class="demo-field-label">#trigger 插槽定制（scope: model / open）</span>
      <ModelSelector v-model="current" :models="models">
        <template #trigger="{ model, open }">
          <span class="slot-trigger">
            <Badge v-if="model?.provider" variant="neutral">{{ model.provider }}</Badge>
            <span class="slot-trigger-label">{{ model?.label ?? '选择模型' }}</span>
            <span class="slot-trigger-arrow" :class="{ 'slot-trigger-arrow--open': open }" aria-hidden="true">▾</span>
          </span>
        </template>
      </ModelSelector>
    </div>
    <p class="demo-hint">
      #option 缺省渲染 provider 徽标（badge 形态）+ 模型名；scope 提供 model/index/selected/active。
      #trigger 渲染在触发器 button 内部（role/键盘/aria 仍由组件承载），替换默认内容，勿放入可聚焦元素。
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

.slot-option-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-option-mark {
  flex: none;
  font-size: var(--ui-text-sm);
}

.slot-trigger {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--ui-space-2);
}

.slot-trigger-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot-trigger-arrow {
  flex: none;
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.slot-trigger-arrow--open {
  transform: rotate(180deg); /* 结构性翻转：随 Select 箭标先例 */
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
