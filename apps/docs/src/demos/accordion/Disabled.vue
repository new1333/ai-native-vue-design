<script setup lang="ts">
import { Accordion } from '@ui/components'
import type { AccordionItem } from '@ui/components'

const items: AccordionItem[] = [
  {
    key: 'plan',
    title: '当前方案：Paper Profile',
    content: '默认视觉 Profile：纸面底色、松绿强调、有限档位的圆角与阴影；开箱即用，无需额外配置。',
  },
  {
    key: 'draft',
    title: '草稿中：Slate Profile（未开放）',
    disabled: true,
    content: '冷灰系 Profile 仍在设计中，条目置为 disabled：不可展开、键盘导航自动跳过。',
  },
  {
    key: 'archive',
    title: '已归档：Legacy Profile',
    disabled: true,
    content: '旧版视觉已归档，仅保留 token 兼容层；如需访问请联系维护者。',
  },
  {
    key: 'contribute',
    title: '如何贡献新 Profile？',
    content: '在 @ui/tokens 中新增一份完整重声明的 CSS 变量档，并补充 token 单测；组件层零改动。',
  },
]
</script>

<template>
  <Accordion :items="items" />
</template>
