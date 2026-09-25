<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ meta: ComponentDefinition }>()

const SECTIONS: Array<{ key: keyof ComponentDefinition; label: string }> = [
  { key: 'accessibility', label: '无障碍' },
  { key: 'ssr', label: 'SSR' },
  { key: 'performance', label: '性能' },
  { key: 'styling', label: '样式与定制' },
]
</script>

<template>
  <section class="ui-docs-notes">
    <h2>注意事项</h2>
    <details v-for="section in SECTIONS" :key="section.key" class="ui-docs-notes__item">
      <summary>{{ section.label }}</summary>
      <p>{{ props.meta[section.key] }}</p>
    </details>
  </section>
</template>

<style scoped>
.ui-docs-notes__item {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  margin-bottom: var(--ui-space-2);
}

.ui-docs-notes__item summary {
  padding: var(--ui-space-3) var(--ui-space-4);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-docs-notes__item summary::before {
  content: '▸';
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-notes__item[open] summary::before {
  transform: rotate(90deg);
}

.ui-docs-notes__item p {
  margin: 0;
  padding: 0 var(--ui-space-4) var(--ui-space-4);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}
</style>
