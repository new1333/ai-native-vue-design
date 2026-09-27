<script setup lang="ts">
import { ref } from 'vue'
import { Button, Drawer } from '@ui/components'
import type { DrawerCloseReason } from '@ui/components'

const open = ref(false)
const lastReason = ref<DrawerCloseReason | null>(null)

function openDrawer(): void {
  lastReason.value = null
  open.value = true
}

function onClose(reason: DrawerCloseReason): void {
  lastReason.value = reason
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="openDrawer">打开右侧抽屉</Button>
    </div>
    <p class="demo-hint">
      受控 v-model：组件只发出 <code>update:modelValue</code> false，实际显隐由使用方决定。
      最近一次关闭来源：<code>{{ lastReason ?? '尚未关闭' }}</code>
      （Esc、遮罩、头部关闭按钮三条路径都可试，打开后焦点自动移入面板）。
    </p>
    <Drawer v-model="open" @close="onClose">
      <template #header>照片详情</template>
      <p>这是从右侧滑出的详情抽屉。正文超出面板高度时 body 区内部滚动，头部保持可见。</p>
      <p>模态打开期间页面滚动被锁定，焦点圈定在抽屉内，关闭后还原到打开前的元素。</p>
    </Drawer>
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
