<script setup lang="ts">
import { ref } from 'vue'
import { ScrollArea } from '@ui/components'

const position = ref('尚未滚动')

function onScroll(event: Event): void {
  // 载荷为原生 Event：viewport 即 event.currentTarget，读取实时滚动位置
  const viewport = event.currentTarget as HTMLElement
  const x = Math.round(viewport.scrollLeft)
  const y = Math.round(viewport.scrollTop)
  position.value = `scrollLeft ${x} · scrollTop ${y}`
}

const tiles = ['宣纸', '砚台', '毛笔', '镇纸', '印章', '卷轴', '信笺', '墨碟', '笔洗', '臂搁']
</script>

<template>
  <div class="demo-stack">
    <ScrollArea direction="both" class="demo-pane" @scroll="onScroll">
      <div class="demo-row">
        <div v-for="tile in tiles" :key="tile" class="demo-tile">{{ tile }}</div>
      </div>
    </ScrollArea>
    <p class="demo-readout">
      <span class="demo-readout__label">@scroll 回显：</span>
      <span class="demo-readout__value">{{ position }}</span>
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-pane {
  height: calc(var(--ui-space-8) * 2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

/* 内容总宽超出视口：同时撑出横向滚动 */
.demo-row {
  display: flex;
  gap: var(--ui-space-3);
  width: max-content;
  padding: var(--ui-space-3) var(--ui-space-4);
}

.demo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--ui-space-8) * 2);
  min-height: calc(var(--ui-space-8) * 1.5);
  background-color: var(--ui-surface-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-2);
  font-size: var(--ui-text-md);
}

.demo-readout {
  margin: 0;
  display: flex;
  gap: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.demo-readout__label {
  color: var(--ui-text-3);
}

.demo-readout__value {
  color: var(--ui-text-1);
  font-variant-numeric: var(--ui-numeric);
}
</style>
