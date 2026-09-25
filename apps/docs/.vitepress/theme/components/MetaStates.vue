<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ states: ComponentDefinition['states'] }>()

const STATE_LABELS: Record<string, string> = {
  default: '默认',
  hover: '悬停',
  focusVisible: '焦点（:focus-visible）',
  active: '按下',
  disabled: '禁用',
  loading: '加载中',
  error: '错误',
}

interface StateRow {
  key: string
  label: string
  description: string
}

function rows(): StateRow[] {
  return Object.entries(props.states)
    .filter(([, description]) => Boolean(description))
    .map(([key, description]) => ({
      key,
      label: STATE_LABELS[key] ?? key,
      description,
    }))
}
</script>

<template>
  <section class="ui-docs-states">
    <h2>状态与视觉</h2>
    <div class="ui-docs-states__scroll">
      <dl>
        <template v-for="row in rows()" :key="row.key">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.description }}</dd>
        </template>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.ui-docs-states__scroll {
  overflow-x: auto;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
}

dl {
  display: grid;
  grid-template-columns: minmax(120px, max-content) 1fr;
  margin: 0;
  font-size: var(--ui-text-sm);
}

dt {
  padding: var(--ui-space-3) var(--ui-space-4);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  white-space: nowrap;
  border-top: 1px solid var(--ui-border);
  background: var(--ui-surface-muted);
}

dd {
  margin: 0;
  padding: var(--ui-space-3) var(--ui-space-4);
  color: var(--ui-text-2);
  line-height: var(--ui-leading-body);
  border-top: 1px solid var(--ui-border);
}

dt:first-of-type,
dd:first-of-type {
  border-top: none;
}
</style>
