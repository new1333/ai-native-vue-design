<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ composition: ComponentDefinition['composition'] }>()
</script>

<template>
  <section v-if="props.composition.patterns.length || props.composition.related.length" class="ui-docs-comp">
    <h2 id="composition">组合与相关组件</h2>
    <ul v-if="props.composition.patterns.length" class="ui-docs-comp__patterns">
      <li v-for="item in props.composition.patterns" :key="item">{{ item }}</li>
    </ul>
    <div v-if="props.composition.related.length" class="ui-docs-comp__related">
      <span class="ui-docs-comp__label">相关组件</span>
      <span v-for="name in props.composition.related" :key="name" class="ui-docs-comp__chip">{{ name }}</span>
    </div>
    <ul v-if="props.composition.preferred.length" class="ui-docs-comp__preferred">
      <li v-for="item in props.composition.preferred" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>

<style scoped>
.ui-docs-comp__patterns {
  margin: 0 0 var(--ui-space-4);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--ui-space-2);
}

.ui-docs-comp__patterns li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-comp__patterns li::before {
  content: '≡';
  position: absolute;
  left: 0;
  color: var(--ui-accent);
}

.ui-docs-comp__related {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-4);
}

.ui-docs-comp__label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-docs-comp__chip {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  font-variant-numeric: var(--ui-numeric);
}

.ui-docs-comp__preferred {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--ui-space-2);
}

.ui-docs-comp__preferred li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-comp__preferred li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: var(--ui-warning);
}
</style>
