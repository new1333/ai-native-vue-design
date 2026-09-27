<script setup lang="ts">
import { Button, Popover } from '@ui/components'
import type { PopoverPlacement } from '@ui/components'

const placements: PopoverPlacement[] = ['top', 'bottom', 'left', 'right']

const PLACEMENT_LABEL: Record<PopoverPlacement, string> = {
  top: '上方（默认档）',
  bottom: '下方',
  left: '左侧',
  right: '右侧',
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popover v-for="placement in placements" :key="placement" :placement="placement" arrow>
        <template #trigger>
          <Button variant="secondary">{{ placement }}</Button>
        </template>
        {{ PLACEMENT_LABEL[placement] }}：带箭头的气泡卡片。
      </Popover>
    </div>
    <p class="demo-hint">
      arrow 显示指向触发元素的小箭头；placement 只做四方向定位，不做视口碰撞翻转，
      打开期间滚动 / resize 会跟随重排。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-6);
  align-items: center;
  padding: var(--ui-space-7) var(--ui-space-4);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
