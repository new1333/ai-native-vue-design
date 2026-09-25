<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ agent: ComponentDefinition['agent'] }>()
</script>

<template>
  <section class="ui-docs-agent">
    <h2 id="agent">给 AI / Agent 的使用提示</h2>
    <details class="ui-docs-agent__details">
      <summary>展开选型与生成提示（来自组件 meta 的 agent 契约）</summary>
      <div class="ui-docs-agent__body">
        <template v-if="props.agent.selectionHints.length">
          <h3>选型提示</h3>
          <ul>
            <li v-for="item in props.agent.selectionHints" :key="item">{{ item }}</li>
          </ul>
        </template>
        <template v-if="props.agent.commonTasks.length">
          <h3>常见任务</h3>
          <ul>
            <li v-for="item in props.agent.commonTasks" :key="item">{{ item }}</li>
          </ul>
        </template>
        <template v-if="props.agent.generationNotes.length">
          <h3>生成注意</h3>
          <ul>
            <li v-for="item in props.agent.generationNotes" :key="item">{{ item }}</li>
          </ul>
        </template>
      </div>
    </details>
  </section>
</template>

<style scoped>
.ui-docs-agent__details {
  border: 1px dashed var(--ui-border-strong);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
}

.ui-docs-agent__details summary {
  padding: var(--ui-space-3) var(--ui-space-4);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  cursor: pointer;
  list-style: none;
}

.ui-docs-agent__details[open] summary {
  border-bottom: 1px dashed var(--ui-border);
}

.ui-docs-agent__body {
  padding: var(--ui-space-4);
}

.ui-docs-agent__body h3 {
  margin: var(--ui-space-3) 0 var(--ui-space-2);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-accent);
}

.ui-docs-agent__body h3:first-child {
  margin-top: 0;
}

.ui-docs-agent__body ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--ui-space-2);
}

.ui-docs-agent__body li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-agent__body li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--ui-text-3);
}
</style>
