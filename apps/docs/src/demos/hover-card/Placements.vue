<script setup lang="ts">
import { HoverCard } from '@ui/components'
import type { HoverCardPlacement } from '@ui/components'

const placements: Array<{ value: HoverCardPlacement; label: string }> = [
  { value: 'top', label: 'top（默认）' },
  { value: 'bottom', label: 'bottom' },
  { value: 'left', label: 'left' },
  { value: 'right', label: 'right' },
]
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <HoverCard v-for="item in placements" :key="item.value" :placement="item.value">
        <template #trigger>
          <button type="button" class="demo-native-trigger">{{ item.label }}</button>
        </template>
        <p class="demo-card-text">placement={{ item.value }}：按触发元素 rect 定位。</p>
      </HoverCard>
    </div>
    <p class="demo-hint">
      placement 提供 top / bottom / left / right 四档方向（默认 top）；不做视口碰撞翻转，
      打开期间滚动 / resize 跟随重排。
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

.demo-native-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
}

.demo-card-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
