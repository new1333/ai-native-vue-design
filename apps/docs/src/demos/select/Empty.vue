<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@ui/components'
import type { SelectValue } from '@ui/components'

const first = ref<SelectValue | null>(null)
const second = ref<SelectValue | null>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-field-label">默认空态文案</span>
      <Select v-model="first" :options="[]" />
    </div>
    <div class="demo-row">
      <span class="demo-field-label">自定义 empty-text</span>
      <Select v-model="second" :options="[]" empty-text="选项加载中，请稍候" />
    </div>
    <p class="demo-hint">
      options 为空数组时打开弹层即显示 emptyText（默认「暂无选项」），可用作空选项/加载中的兜底文案。
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

.demo-row :deep(.ui-select) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
