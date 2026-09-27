<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const docOptions: CascaderOption[] = [
  {
    label: '前端框架',
    value: 'fe',
    children: [
      { label: 'Vue 3', value: 'vue3', children: [{ label: '组合式 API', value: 'vue3-composition' }, { label: '组件通信', value: 'vue3-props' }] },
      { label: 'React', value: 'react', children: [{ label: 'Hooks', value: 'react-hooks' }] },
    ],
  },
  {
    label: '设计系统',
    value: 'ds',
    children: [
      { label: '设计 Token', value: 'ds-tokens', children: [{ label: '色彩语义', value: 'ds-token-color' }] },
      { label: '无障碍', value: 'ds-a11y' },
    ],
  },
]

const picked = ref<CascaderPath[]>([['fe', 'vue3', 'vue3-composition']])
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-slots-doc">option 插槽（叶子/目录徽标）+ trigger 插槽（已选 chip）</label>
      <Cascader id="cascader-slots-doc" v-model="picked" :options="docOptions" multiple>
        <template #option="{ option }">
          <span class="demo-option">
            {{ option.label }}
            <em class="demo-option-badge" :class="{ 'demo-option-badge--leaf': !option.children?.length }">
              {{ option.children?.length ? '目录' : '叶子' }}
            </em>
          </span>
        </template>
        <template #trigger="{ labels }">
          <span v-if="labels.length > 0" class="demo-chips">
            <span v-for="(pathLabels, index) in labels" :key="index" class="demo-chip">
              {{ pathLabels.join(' › ') }}
            </span>
          </span>
          <span v-else class="demo-chip demo-chip--placeholder">选择要研读的章节</span>
        </template>
      </Cascader>
    </div>
    <p class="demo-hint">
      已选：<code>{{ JSON.stringify(picked) }}</code>
      （option 插槽自定义选项内容，行容器的 role / 键盘 / 选中样式仍由组件承担；trigger 插槽的 scope 提供 paths / labels / multiple）
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

.demo-row :deep(.ui-cascader) {
  width: calc(var(--ui-space-8) * 4);
}

.demo-option {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-option-badge {
  font-style: normal;
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-info);
  background-color: var(--ui-info-soft);
  border-radius: var(--ui-radius-xs);
  padding: 0 var(--ui-space-1);
}

.demo-option-badge--leaf {
  color: var(--ui-success);
  background-color: var(--ui-success-soft);
}

.demo-chips {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  min-width: 0;
  overflow: hidden;
}

.demo-chip {
  flex: none;
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-accent);
  background-color: var(--ui-accent-soft);
  border-radius: var(--ui-radius-xs);
  padding: 0 var(--ui-space-2);
  white-space: nowrap;
}

.demo-chip--placeholder {
  color: var(--ui-text-3);
  background-color: transparent;
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
