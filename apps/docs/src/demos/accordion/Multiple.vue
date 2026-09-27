<script setup lang="ts">
import { ref } from 'vue'
import { Accordion } from '@ui/components'
import type { AccordionItem, AccordionMultipleValue } from '@ui/components'

const openKeys = ref<AccordionMultipleValue>(['tokens'])

const items: AccordionItem[] = [
  {
    key: 'tokens',
    title: 'Token 分层',
    content: 'primitive（--ui-color-* / --ui-space-* 等原始档位）→ semantic（--ui-surface / --ui-text-* 等语义角色）→ component（--ui-button-* 等组件别名），组件只消费后两层。',
  },
  {
    key: 'profile',
    title: 'Paper Profile',
    content: 'paper.css 提供 :root 默认档与 :root[data-theme="paper"] 显式档，两档值一致，支持从其他 Profile 切回。',
  },
  {
    key: 'motion',
    title: 'Motion 约定',
    content: '默认时长 180ms（--ui-motion-default），入场 ease-out；prefers-reduced-motion 下所有走 token 的动效立即归零。',
  },
]
</script>

<template>
  <Accordion v-model="openKeys" multiple :items="items" />
</template>
