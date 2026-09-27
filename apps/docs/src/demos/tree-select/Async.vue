<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

const remote = ref<TreeSelectOption[]>([])
const loading = ref(false)
const loaded = ref(false)
const picked = ref<TreeSelectModelValue>(null)

/** 模拟异步加载：加载完成前面板呈空态（emptyText / empty 插槽兜底）。 */
function load(): void {
  if (loading.value || loaded.value) return
  loading.value = true
  window.setTimeout(() => {
    remote.value = [
      {
        label: '默认分组',
        value: 'default',
        children: [
          { label: '示例条目 A', value: 'a' },
          { label: '示例条目 B', value: 'b' },
        ],
      },
      { label: '独立条目', value: 'single' },
    ]
    loading.value = false
    loaded.value = true
  }, 800)
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">emptyText 兜底（options 为空数组）</span>
      <TreeSelect v-model="picked" :options="remote" empty-text="选项加载中，请稍候" />
      <button class="demo-btn" type="button" :disabled="loading || loaded" @click="load">
        {{ loading ? '加载中…' : loaded ? '已加载' : '加载数据' }}
      </button>
    </div>
    <div class="demo-row">
      <span class="demo-field-label">empty 插槽自定义空态</span>
      <TreeSelect v-model="picked" :options="[]">
        <template #empty>
          <span class="demo-empty">
            <span class="demo-empty__dot" aria-hidden="true"></span>
            组织架构同步中…
          </span>
        </template>
      </TreeSelect>
    </div>
    <p class="demo-hint">
      options 为空数组时打开面板即显示 emptyText（默认「暂无选项」）或 empty 插槽内容，
      可用作空选项 / 加载中场景；左侧示例点「加载数据」后面板即出现真实树节点。
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

.demo-row :deep(.ui-tree-select) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-btn {
  border: none; /* 结构性重置：非视觉取值 */
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-btn:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.demo-btn:hover:not(:disabled) {
  background-color: var(--ui-accent-soft);
}

.demo-empty {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-text-3);
}

.demo-empty__dot {
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-accent);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
