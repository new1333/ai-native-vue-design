<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'
import AgentHints from './AgentHints.vue'
import ApiTables from './ApiTables.vue'
import MetaComposition from './MetaComposition.vue'
import MetaIntent from './MetaIntent.vue'
import MetaNotes from './MetaNotes.vue'
import MetaStates from './MetaStates.vue'
import SourceViewer from './SourceViewer.vue'

const props = defineProps<{
  /** 组件 meta（从 @ui/components 公共入口导入） */
  meta: ComponentDefinition
  /** 组件目录名（kebab-case，供源码查看器定位 packages/components/src/<dir>/） */
  dir: string
}>()
</script>

<template>
  <p class="ui-docs-pagedoc__desc">{{ props.meta.identity.description }}</p>

  <MetaIntent :meta="props.meta" />

  <h2 id="import">引入</h2>
  <div class="ui-docs-pagedoc__import">
    <code>import { {{ props.meta.identity.export }} } from '{{ props.meta.identity.package }}'</code>
  </div>

  <h2 id="examples">示例</h2>
  <slot />

  <ApiTables :api="props.meta.api" />
  <MetaStates :states="props.meta.states" />
  <MetaNotes :meta="props.meta" />
  <MetaComposition :composition="props.meta.composition" />
  <AgentHints :agent="props.meta.agent" />
  <SourceViewer :dir="props.dir" />
</template>

<style scoped>
.ui-docs-pagedoc__desc {
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-pagedoc__import {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-ink-950);
  padding: var(--ui-space-3) var(--ui-space-4);
  overflow-x: auto;
}

.ui-docs-pagedoc__import code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-sm);
  color: var(--ui-color-paper);
  /* 压掉 VitePress 行内 code 全局样式（.vp-doc :not(pre) > code）的浅底胶囊：
     本块为深底整行展示，背景/padding/圆角须由容器统一提供 */
  background: transparent;
  padding: 0;
  border-radius: 0;
  white-space: nowrap;
}
</style>
