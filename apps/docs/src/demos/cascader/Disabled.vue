<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const envOptions: CascaderOption[] = [
  {
    label: '生产环境',
    value: 'prod',
    children: [
      { label: '华东集群', value: 'cn-east' },
      { label: '华北集群（停服维护）', value: 'cn-north', disabled: true },
    ],
  },
  {
    label: '预发环境（整体禁用）',
    value: 'staging',
    disabled: true,
    children: [{ label: '华东集群', value: 'staging-east' }],
  },
  { label: '本地开发', value: 'local' },
]

const cluster = ref<CascaderPath | null>(['prod', 'cn-east'])
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">整体禁用（disabled）</span>
      <Cascader v-model="cluster" :options="envOptions" disabled />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">节点级禁用（option.disabled）</span>
      <Cascader v-model="cluster" :options="envOptions" placeholder="选择部署集群" />
    </div>
    <p class="demo-hint">
      整体 disabled 用原生 disabled（移出 Tab 序、拦截开合/键盘/悬停）；个别节点不可用时用 option.disabled
      （aria-disabled="true"，不可被高亮/悬停展开/选中，键盘导航自动跳过），而非整体禁用。
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
</style>
