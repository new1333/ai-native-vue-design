<script setup lang="ts">
import { Button, Tooltip } from '@ui/components'
import type { TooltipPlacement } from '@ui/components'

const placements: TooltipPlacement[] = ['top', 'bottom', 'left', 'right']

const PLACEMENT_LABEL: Record<TooltipPlacement, string> = {
  top: '上方（默认档）',
  bottom: '下方',
  left: '左侧',
  right: '右侧',
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Tooltip v-for="placement in placements" :key="placement" :placement="placement">
        <Button variant="secondary">{{ placement }}</Button>
        <template #content>{{ PLACEMENT_LABEL[placement] }}</template>
      </Tooltip>
    </div>
    <p class="demo-hint">
      placement 只做四方向定位，打开期间切换会按新方向重排；不做视口碰撞翻转，
      需要翻转或跟随滚动请在上层方案解决。
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
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
