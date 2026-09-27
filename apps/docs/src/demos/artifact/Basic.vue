<script setup lang="ts">
import { ref } from 'vue'
import { Artifact, Button } from '@ui/components'
import type { ArtifactCloseReason, ArtifactCopyPayload } from '@ui/components'

const open = ref(false)
const lastReason = ref<ArtifactCloseReason | null>(null)
const lastCopy = ref<ArtifactCopyPayload | null>(null)

function openArtifact(): void {
  lastReason.value = null
  lastCopy.value = null
  open.value = true
}

function onClose(reason: ArtifactCloseReason): void {
  lastReason.value = reason
}

function onCopy(payload: ArtifactCopyPayload): void {
  lastCopy.value = payload
}

const code = `export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
}
`
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="openArtifact">打开代码产物</Button>
    </div>
    <p class="demo-hint">
      受控 v-model 驱动显隐；Esc、遮罩、头部「关闭」按钮三条关闭路径都发出
      <code>update:modelValue</code> false，<code>close</code> 事件附带来源。
      「复制」发出 <code>copy</code> 事件（组件同时尽力写入剪贴板），按钮短暂进入已复制态。
      最近一次关闭来源：<code>{{ lastReason ?? '尚未关闭' }}</code>；
      最近复制字符数：<code>{{ lastCopy ? String(lastCopy.text.length) : '尚未复制' }}</code>
    </p>
    <Artifact
      v-model="open"
      title="sortByTitle 工具函数"
      type="code"
      language="TypeScript"
      @close="onClose"
      @copy="onCopy"
    >
      <pre class="demo-code"><code>{{ code }}</code></pre>
    </Artifact>
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
  gap: var(--ui-space-2);
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

.demo-code {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
}
</style>
