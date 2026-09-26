<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog } from '@ui/components'
import type { DialogCloseReason } from '@ui/components'

const open = ref(false)
const lastReason = ref<DialogCloseReason | null>(null)

function openDialog(): void {
  lastReason.value = null
  open.value = true
}

function onClose(reason: DialogCloseReason): void {
  lastReason.value = reason
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="openDialog">打开对话框</Button>
    </div>
    <p class="demo-hint">
      受控 v-model：组件只发出 <code>update:modelValue</code> false，实际显隐由使用方决定。
      最近一次关闭来源：<code>{{ lastReason ?? '尚未关闭' }}</code>
      （Esc、遮罩、footer 默认「关闭」按钮三条路径都可试，打开后焦点自动移入面板）。
    </p>
    <Dialog v-model="open" title="删除确认" @close="onClose">
      确定要删除「9 月旅行照片」相册吗？此操作不可撤销。
    </Dialog>
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
</style>
