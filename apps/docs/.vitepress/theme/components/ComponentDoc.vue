<script setup lang="ts">
import { ref } from 'vue'
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

const copied = ref(false)

async function copyImport(): Promise<void> {
  try {
    await navigator.clipboard.writeText(
      `import { ${props.meta.identity.export} } from '${props.meta.identity.package}'`,
    )
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // 剪贴板不可用（非安全上下文等）时静默降级：代码本身可见，可手动复制
  }
}
</script>

<template>
  <p class="ui-docs-pagedoc__desc">{{ props.meta.identity.description }}</p>

  <MetaIntent :meta="props.meta" />

  <h2 id="import">引入</h2>
  <div class="ui-docs-pagedoc__import">
    <code>import { {{ props.meta.identity.export }} } from '{{ props.meta.identity.package }}'</code>
    <button type="button" class="ui-docs-pagedoc__copy" @click="copyImport">
      {{ copied ? '已复制' : '复制' }}
    </button>
  </div>
  <p class="ui-docs-pagedoc__version">契约版本 v{{ props.meta.version }}</p>

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-ink-950);
  padding: var(--ui-space-3) var(--ui-space-4);
}

.ui-docs-pagedoc__import code {
  flex: 1 1 auto;
  /* 允许 flex 子项收缩到内容宽以下，窄屏时长代码在 code 区内横向滚动，按钮保持可见 */
  min-width: 0;
  overflow-x: auto;
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

.ui-docs-pagedoc__copy {
  flex-shrink: 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: transparent;
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-color-paper);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-pagedoc__copy:hover {
  color: var(--ui-surface);
  border-color: var(--ui-color-paper);
}

.ui-docs-pagedoc__version {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  margin: var(--ui-space-1) 0 0;
}
</style>
