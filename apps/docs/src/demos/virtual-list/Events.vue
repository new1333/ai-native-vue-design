<script setup lang="ts">
import { ref } from 'vue'
import { VirtualList } from '@ui/components'
import type { VirtualListRange } from '@ui/components'

interface Entry {
  id: number
  title: string
  lines: number
}

const entries: Entry[] = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  title: `记录 ${i + 1}`,
  lines: (i % 4) + 1,
}))

/** visibleRangeChange 读数：当前渲染窗口（含 overscan）。 */
const range = ref<VirtualListRange>({ start: 0, end: 0 })
/** scroll 透传读数：原生滚动偏移。 */
const offset = ref(0)

function onRangeChange(payload: VirtualListRange): void {
  range.value = payload
}

function onScroll(event: Event): void {
  const target = event.target
  if (target instanceof HTMLElement) offset.value = target.scrollTop
}
</script>

<template>
  <div class="demo-events">
    <p class="demo-events__readout" role="status">
      当前渲染窗口：{{ range.start }} – {{ range.end }} · 滚动偏移 {{ offset }}px
      <span class="demo-events__hint">（滚动列表，读数随 @visible-range-change / @scroll 实时变化）</span>
    </p>
    <VirtualList
      class="demo-events__list"
      :items="entries"
      :estimated-item-size="72"
      :get-key="(entry) => entry.id"
      aria-label="遥测记录"
      @scroll="onScroll"
      @visible-range-change="onRangeChange"
    >
      <template #item="{ item }">
        <div class="demo-entry">
          <p class="demo-entry__title">{{ item.title }}</p>
          <!-- 变高内容：实测尺寸按稳定键缓存，前缀和随滚动自动收敛 -->
          <p v-for="line in item.lines" :key="line" class="demo-entry__line">
            变高内容第 {{ line }} 行：估算尺寸只用于首屏推导，实测值会逐步覆盖。
          </p>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<style scoped>
.demo-events__readout {
  margin: 0 0 var(--ui-space-2);
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  font-variant-numeric: var(--ui-numeric);
}

.demo-events__hint {
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
}

.demo-events__list {
  height: calc(var(--ui-space-8) * 5);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-entry {
  padding: var(--ui-space-2) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-border);
}

.demo-entry__title {
  margin: 0 0 var(--ui-space-1);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
}

.demo-entry__line {
  margin: 0;
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-body);
}
</style>
