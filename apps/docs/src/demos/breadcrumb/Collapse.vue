<script setup lang="ts">
import { ref } from 'vue'
import { Breadcrumb } from '@ui/components'

const deepItems = [
  { key: 'home', label: '首页', href: '#/' },
  { key: 'library', label: '组件库', href: '#/library' },
  { key: 'navigation', label: '导航', href: '#/library/navigation' },
  { key: 'breadcrumb', label: '面包屑', href: '#/library/navigation/breadcrumb' },
  { key: 'api', label: 'API', href: '#/library/navigation/breadcrumb/api' },
  { key: 'current', label: 'itemClick 事件' },
]

const maxCount = ref(4)
</script>

<template>
  <div class="demo-stack">
    <Breadcrumb :items="deepItems" :max-count="maxCount" />
    <div class="demo-actions">
      <button
        type="button"
        class="demo-btn"
        :disabled="maxCount <= 3"
        @click="maxCount--"
      >
        收起一层 −
      </button>
      <button
        type="button"
        class="demo-btn"
        :disabled="maxCount >= deepItems.length"
        @click="maxCount++"
      >
        展开一层 +
      </button>
      <span class="demo-value">maxCount = {{ maxCount }}</span>
    </div>
    <p class="demo-hint">
      items 超出 maxCount 时折叠为「首项 + … + 末尾 (maxCount − 2) 项」：
      可见槽位数恰为 maxCount（省略号占位计入），末项（当前页）永远保留、
      aria-current="page" 跟随数据实时转移；maxCount 小于 3 收敛为 3。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-btn {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  font: inherit;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  cursor: pointer;
}

.demo-btn:disabled {
  color: var(--ui-text-3);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

.demo-value {
  font-size: var(--ui-text-sm);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
