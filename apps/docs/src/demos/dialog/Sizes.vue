<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog } from '@ui/components'
import type { DialogSize } from '@ui/components'

const open = ref(false)
const size = ref<DialogSize>('md')

function openWith(next: DialogSize): void {
  size.value = next
  open.value = true
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" @click="openWith('sm')">size: sm</Button>
      <Button size="sm" @click="openWith('md')">size: md（默认）</Button>
      <Button size="sm" @click="openWith('lg')">size: lg</Button>
    </div>
    <p class="demo-hint">
      三档宽度（sm / md / lg，由间距标尺推导），超出视口时收窄到 100%，不会溢出。
    </p>
    <Dialog v-model="open" :size="size" :title="`尺寸档位：${size}`">
      <p>面板宽度随 <code>size</code> 档位变化；正文区超高时内部滚动，头部与底部保持可见。</p>
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
