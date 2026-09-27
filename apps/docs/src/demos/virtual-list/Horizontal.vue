<script setup lang="ts">
import { VirtualList } from '@ui/components'

interface Frame {
  id: number
  label: string
}

const frames: Frame[] = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  label: `帧 ${i + 1}`,
}))
</script>

<template>
  <VirtualList
    class="demo-track"
    :items="frames"
    :estimated-item-size="96"
    horizontal
    :get-key="(frame) => frame.id"
    aria-label="横向胶片轨道"
  >
    <template #item="{ item }">
      <div class="demo-frame">{{ item.label }}</div>
    </template>
  </VirtualList>
</template>

<style scoped>
.demo-track {
  height: calc(var(--ui-space-8) * 2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface-muted);
}

.demo-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: calc(var(--ui-space-8) * 1.5);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
}
</style>
