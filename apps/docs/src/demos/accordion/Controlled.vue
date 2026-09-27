<script setup lang="ts">
import { ref } from 'vue'
import { Accordion, Button } from '@ui/components'
import type { AccordionChangeEvent, AccordionItem, AccordionSingleValue } from '@ui/components'

const current = ref<AccordionSingleValue>('anatomy')
const lastChange = ref('（尚未切换）')

const items: AccordionItem[] = [
  {
    key: 'anatomy',
    title: '组件解剖',
    content: '每个条目由原生 button 头部与 role="region" 面板组成；头部带 aria-expanded 与 aria-controls，面板以 aria-labelledby 回指头部。',
  },
  {
    key: 'keyboard',
    title: '键盘操作',
    content: 'Tab 停靠当前头部（roving tabindex）；Enter / Space 切换展开；↑ / ↓ 在头部间循环移动焦点并跳过禁用项；Home / End 直达首尾可用头部。',
  },
  {
    key: 'data-flow',
    title: '数据流',
    content: '受控模式下组件只 emit 不自行改状态；change 事件携带被切换条目的 key、切换后的 expanded 与完整展开值。',
  },
]

function onChange(event: AccordionChangeEvent): void {
  lastChange.value = `${String(event.key)} → ${event.expanded ? '展开' : '收起'}，value = ${JSON.stringify(event.value)}`
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-toolbar">
      <Button size="sm" @click="current = 'keyboard'">展开「键盘操作」</Button>
      <Button size="sm" @click="current = null">全部收起</Button>
    </div>
    <Accordion v-model="current" :items="items" @change="onChange" />
    <p class="demo-log">最近一次 change：{{ lastChange }}</p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-log {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
}
</style>
