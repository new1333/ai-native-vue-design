<script setup lang="ts">
import { ref } from 'vue'
import { Button, Drawer } from '@ui/components'
import type { DrawerSide } from '@ui/components'

const open = ref(false)
const side = ref<DrawerSide>('right')

function openFrom(next: DrawerSide): void {
  side.value = next
  open.value = true
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button @click="openFrom('left')">左侧滑出</Button>
      <Button @click="openFrom('right')">右侧滑出</Button>
      <Button @click="openFrom('top')">顶部滑出</Button>
      <Button @click="openFrom('bottom')">底部滑出</Button>
    </div>
    <p class="demo-hint">
      <code>side</code> 决定滑出方向与贴边位置：left/right 为纵向抽屉（size 作用于宽度），
      top/bottom 为横向抽屉（size 作用于高度）。同一个抽屉实例切换 side 即可换向。
    </p>
    <Drawer v-model="open" :side="side">
      <template #header>四向滑出（当前：{{ side }}）</template>
      <p>面板贴对应边缘滑出，内侧两角带圆角，外侧贴边保持直角。</p>
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
