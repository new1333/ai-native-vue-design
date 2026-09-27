<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const regionOptions: CascaderOption[] = [
  {
    label: '浙江省',
    value: 'cn-zj',
    children: [{ label: '杭州市', value: 'cn-zj-hz', children: [{ label: '西湖区', value: 'cn-zj-hz-xh' }] }],
  },
  { label: '上海市', value: 'cn-sh', children: [{ label: '黄浦区', value: 'cn-sh-hp' }] },
]

// options 异步加载：为空时打开弹层以 emptyText 兜底（加载中）
const options = ref<CascaderOption[]>([])
const loaded = ref(false)

function loadOptions(): void {
  options.value = regionOptions
  loaded.value = true
}

const region = ref<CascaderPath | null>(null)

const summary = computed(() => (region.value === null ? 'null（未选）' : JSON.stringify(region.value)))
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">options 为空（emptyText 兜底）</span>
      <Cascader v-model="region" :options="options" empty-text="选项加载中…" />
      <button type="button" class="demo-action" :disabled="loaded" @click="loadOptions">
        {{ loaded ? '已加载' : '模拟加载完成' }}
      </button>
    </div>
    <p class="demo-hint">
      当前值：<code>{{ summary }}</code>
      （组件未内建 loading 态；options 为空数组时打开弹层显示 emptyText，可作加载中兜底）
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

.demo-action {
  border: none;
  border-radius: var(--ui-button-radius);
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-size: var(--ui-text-sm);
  font-family: inherit;
  padding: var(--ui-space-2) var(--ui-space-3);
  cursor: pointer;
}

.demo-action:disabled {
  cursor: not-allowed;
  color: var(--ui-text-3);
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
