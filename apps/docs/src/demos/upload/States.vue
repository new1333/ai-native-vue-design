<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@ui/components'
import type { UploadFile } from '@ui/components'

// 禁用：列表照常呈现，触发器与条目按钮全部原生 disabled，一切变更路径拦截
const locked = ref<UploadFile[]>([
  { uid: 'lock-1', name: '归档.pdf', size: 204800, status: 'success', percent: 100 },
])

// 数量上限：一次选择会使列表超出 maxCount 时整批拒绝并发出 exceed
const limited = ref<UploadFile[]>([])
const exceedNote = ref('（尚未触发 exceed）')

function onExceed(files: File[], fileList: UploadFile[]): void {
  exceedNote.value = `已触发 exceed：现有 ${fileList.length} 个（上限 2），本次尝试选择 ${files.length} 个，整批拒绝。`
}

// 受控：列表完全由外部状态驱动（外部预置 error 条目，重试依赖条目上的 raw 才能重跑上传任务）
const controlled = ref<UploadFile[]>([
  { uid: 'c-1', name: '报告.pdf', size: 409600, status: 'success', percent: 100 },
  { uid: 'c-2', name: '扫描件.png', size: 819200, status: 'error', percent: 40, error: '服务端校验失败' },
])

function clearAll(): void {
  controlled.value = []
}
</script>

<template>
  <div class="demo-stack">
    <Upload v-model="locked" disabled />
    <p class="demo-hint">
      disabled：触发器与列表内按钮原生 disabled（移出 Tab 序），选择/拖拽/移除/重试全部拦截。
    </p>

    <Upload v-model="limited" multiple :max-count="2" @exceed="onExceed" />
    <p class="demo-hint">maxCount=2 + multiple：{{ exceedNote }}</p>

    <Upload v-model="controlled" />
    <div class="demo-actions">
      <button type="button" class="demo-button" @click="clearAll">从外部清空列表（受控）</button>
      <span class="demo-hint">
        列表由外部状态驱动；预置 error 条目须自带 raw（原始 File）才能重试时重跑上传任务，否则重试仅重置为上传中、由使用方驱动落定。
      </span>
    </div>
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
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-button {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: none; /* 结构性重置：非视觉取值 */
  background-color: var(--ui-accent-soft);
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-accent);
  cursor: pointer;
}

.demo-button:hover {
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
