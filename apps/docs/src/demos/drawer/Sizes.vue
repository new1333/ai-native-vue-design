<script setup lang="ts">
import { ref } from 'vue'
import { Button, Drawer } from '@ui/components'
import type { DrawerSize } from '@ui/components'

const open = ref(false)
const size = ref<DrawerSize>('md')

function openWith(next: DrawerSize): void {
  size.value = next
  open.value = true
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button @click="openWith('sm')">sm（≈320）</Button>
      <Button @click="openWith('md')">md（≈448）</Button>
      <Button @click="openWith('lg')">lg（≈640）</Button>
    </div>
    <p class="demo-hint">
      <code>size</code> 只控制滑出轴向的宽/高（由间距标尺推导），永不超出视口；
      另一轴向始终占满。档位不够用时优先调整内容布局而非强改宽度。
    </p>
    <Drawer v-model="open" :size="size">
      <template #header>尺寸档位（当前：{{ size }}）</template>
      <p>左侧滑出的纵向抽屉，size 决定面板宽度。</p>
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
