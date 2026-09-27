<script setup lang="ts">
import { ScrollArea } from '@ui/components'
import type { ScrollAreaType } from '@ui/components'

const modes: Array<{ type: ScrollAreaType; label: string; note: string }> = [
  { type: 'always', label: 'type="always"', note: '溢出期间恒定可见' },
  { type: 'hover', label: 'type="hover"', note: '悬停区域内时可见' },
  { type: 'scroll', label: 'type="scroll"', note: '滚动中可见，静默 1s 后隐藏' },
  { type: 'auto', label: 'type="auto"（默认）', note: '悬停或滚动中可见' },
]

const rows = Array.from({ length: 16 }, (_, i) => `第 ${i + 1} 行：纸面上的一行内容，用于撑出纵向滚动。`)
</script>

<template>
  <div class="demo-grid">
    <section v-for="mode in modes" :key="mode.type" class="demo-cell">
      <header class="demo-cell__head">
        <code class="demo-cell__label">{{ mode.label }}</code>
        <span class="demo-cell__note">{{ mode.note }}</span>
      </header>
      <ScrollArea :type="mode.type" class="demo-pane" :aria-label="`滚动示例：${mode.type}`">
        <ul class="demo-list">
          <li v-for="(row, i) in rows" :key="i" class="demo-list__item">{{ row }}</li>
        </ul>
      </ScrollArea>
    </section>
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ui-space-4);
}

.demo-cell__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-2);
}

.demo-cell__label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
}

.demo-cell__note {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-pane {
  height: calc(var(--ui-space-8) * 2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-list {
  margin: 0;
  padding: var(--ui-space-2) 0;
  list-style: none;
}

.demo-list__item {
  padding: var(--ui-space-1) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-border);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
}

.demo-list__item:last-child {
  border-bottom: none;
}
</style>
