<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

defineProps<{ meta: ComponentDefinition }>()
</script>

<template>
  <section class="ui-docs-intent">
    <h2>何时使用</h2>
    <p class="ui-docs-intent__what">{{ meta.intent.what }}</p>
    <div class="ui-docs-intent__grid">
      <div class="ui-docs-intent__card ui-docs-intent__card--yes">
        <h3>适用场景</h3>
        <ul>
          <li v-for="item in meta.intent.when" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="ui-docs-intent__card ui-docs-intent__card--no">
        <h3>避免使用</h3>
        <ul>
          <li v-for="item in meta.intent.whenNot" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ui-docs-intent__what {
  color: var(--ui-text-2);
  line-height: var(--ui-leading-body);
}

.ui-docs-intent__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--ui-space-4);
}

.ui-docs-intent__card {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-4) var(--ui-space-5);
}

.ui-docs-intent__card h3 {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-docs-intent__card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-docs-intent__card li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-intent__card li + li {
  margin-top: var(--ui-space-2);
}

.ui-docs-intent__card li::before {
  position: absolute;
  left: 0;
  font-weight: var(--ui-font-weight-semibold);
}

.ui-docs-intent__card--yes li::before {
  content: '✓';
  color: var(--ui-success);
}

.ui-docs-intent__card--no li::before {
  content: '✗';
  color: var(--ui-danger);
}
</style>
