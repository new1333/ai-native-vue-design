<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@ui/components'
import type { UploadFile } from '@ui/components'

const files = ref<UploadFile[]>([])
</script>

<template>
  <div class="demo-stack">
    <Upload v-model="files" drag>
      <template #trigger>
        <span class="demo-trigger">＋ 选择或拖入附件</span>
      </template>
      <template #list="{ files: items }">
        <ul class="demo-list">
          <li v-for="item in items" :key="item.uid" class="demo-list-item">
            <span class="demo-list-name">{{ item.name }}</span>
            <span :class="['demo-list-status', `demo-list-status--${item.status}`]">{{ item.status }}</span>
          </li>
        </ul>
      </template>
      <template #empty>
        <p class="demo-empty">暂无附件——#empty 插槽在列表为空时渲染。</p>
      </template>
    </Upload>
    <p class="demo-hint">
      #trigger 自定义触发器内容（仍渲染在原生 button 内，键盘可达性不变）；#list 接管整个列表
      （作用域暴露 files，接管后进度条/移除/重试 UI 由使用方自理）；#empty 空态占位。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-trigger {
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-accent);
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.demo-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface-muted);
}

.demo-list-name {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}

.demo-list-status {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}

.demo-list-status--success {
  color: var(--ui-success);
}

.demo-list-status--error {
  color: var(--ui-danger);
}

.demo-list-status--uploading {
  color: var(--ui-accent);
}

.demo-empty {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
