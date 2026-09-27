<script setup lang="ts">
import { Accordion } from '@ui/components'
import type { AccordionItem } from '@ui/components'

const items: AccordionItem[] = [
  {
    key: 'define',
    title: '什么是 AI-native 组件库？',
  },
  {
    key: 'meta',
    title: 'meta 契约是什么？',
  },
  {
    key: 'agent',
    title: '生成代理如何选型？',
  },
]

const answers: Record<string, string[]> = {
  define: [
    '以设计 token 为唯一视觉事实源，',
    '以 meta 元数据为机器可读契约，',
    '为 AI 协作流程（选型、生成、评审）而设计的 Vue 3 组件库。',
  ],
  meta: [
    '每个组件导出一份 ComponentDefinition：',
    '身份、意图（何时用/不用）、API 面、状态、无障碍与 SSR 契约；',
    '文档页的 API 表格与注意事项全部由 meta 渲染，不手抄。',
  ],
  agent: [
    '读 intent.when / whenNot 判断适用性，',
    '对照 constraints 与 composition.related 排除冲突组合，',
    '按 agent.generationNotes 的提示生成符合契约的用法。',
  ],
}
</script>

<template>
  <Accordion :items="items" multiple>
    <template #title="{ index, item }">
      <span class="demo-title">
        <span class="demo-index">{{ String(index + 1).padStart(2, '0') }}</span>
        {{ item.title }}
      </span>
    </template>
    <template #icon="{ expanded }">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path v-if="expanded" d="M5 12h14" />
        <path v-else d="M12 5v14M5 12h14" />
      </svg>
    </template>
    <template #default="{ item }">
      <ul class="demo-answer">
        <li v-for="(line, i) in answers[item.key] ?? []" :key="i">{{ line }}</li>
      </ul>
    </template>
  </Accordion>
</template>

<style scoped>
.demo-title {
  display: inline-flex;
  align-items: baseline;
  gap: var(--ui-space-3);
}

.demo-index {
  font-variant-numeric: var(--ui-numeric);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-answer {
  margin: 0;
  padding: 0;
  padding-left: var(--ui-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  list-style: none;
}
</style>
