<script setup lang="ts">
import { Accordion } from '@ui/components'
import type { AccordionItem } from '@ui/components'

const faqs: AccordionItem[] = [
  {
    key: 'install',
    title: '如何接入设计 token？',
    content: '在使用方应用入口一次性引入 @ui/tokens/paper.css，全部 --ui-* 变量即全局生效；组件包自身不引入任何全局 CSS。',
  },
  {
    key: 'single',
    title: '单开与多开有什么区别？',
    content: '默认单开：同一时刻至多一个面板展开，展开新条目时自动收起其余；传 multiple 后允许多个面板同时保持展开。',
  },
  {
    key: 'ssr',
    title: '服务端渲染可用吗？',
    content: '可以。aria 关联 id 由 useId 生成，setup 顶层不访问浏览器 API，renderToString 无异常，初始展开状态随服务端 HTML 输出。',
  },
]
</script>

<template>
  <Accordion :items="faqs" />
</template>
