<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const dirOptions: CascaderOption[] = [
  {
    label: '制品库',
    value: 'repo',
    children: [
      { label: 'npm', value: 'npm', children: [{ label: '@ui/tokens', value: 'pkg-tokens' }, { label: '@ui/components', value: 'pkg-components' }] },
      { label: 'pnpm', value: 'pnpm', children: [{ label: 'workspace 根', value: 'pkg-root' }] },
    ],
  },
  {
    label: '文档站',
    value: 'docs',
    children: [
      { label: '组件页', value: 'components', children: [{ label: 'inputs', value: 'dir-inputs' }] },
      { label: '指南', value: 'guide', children: [{ label: '快速上手', value: 'dir-quickstart' }] },
    ],
  },
]

const strictPath = ref<CascaderPath | null>(null)
const loosePath = ref<CascaderPath | null>(['docs'])
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-trigger-hover">expandTrigger="hover"（悬停父级即展开）</label>
      <Cascader id="cascader-trigger-hover" v-model="strictPath" :options="dirOptions" expand-trigger="hover" placeholder="悬停逐级浏览，选到叶子" />
    </div>
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-trigger-loose">changeOnSelect（允许停在中间层级提交）</label>
      <Cascader id="cascader-trigger-loose" v-model="loosePath" :options="dirOptions" expand-trigger="hover" change-on-select placeholder="可停任意层级" />
    </div>
    <p class="demo-hint">
      strictPath=<code>{{ strictPath ? JSON.stringify(strictPath) : 'null（仅叶子可提交）' }}</code>，
      loosePath=<code>{{ loosePath ? JSON.stringify(loosePath) : 'null' }}</code>
      （changeOnSelect 下点击/Enter 父节点会提交其路径并继续展开下级）
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
