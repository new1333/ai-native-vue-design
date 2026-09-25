<script setup lang="ts">
/**
 * Card —— 卡片容器：surface 底 + radius-md + border 描边的复合组件根。
 * 与 CardHeader / CardBody / CardFooter 组合使用，插槽驱动；
 * 静止面默认无阴影，可用 shadow="rest" 打开唯一一档静止阴影。
 * 一切颜色、字号、间距、圆角、阴影均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import { CARD_SHADOW_DEFAULT } from './Card.constants'
import type { CardProps, CardSlots } from './Card.types'

const props = withDefaults(defineProps<CardProps>(), {
  shadow: CARD_SHADOW_DEFAULT,
})
defineSlots<CardSlots>()

const classes = computed(() => ['ui-card', `ui-card--shadow-${props.shadow}`])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style scoped>
/* ── 基底：surface 面 + 描边 + 卡片圆角（radius-md）────────── */
.ui-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* 区块间距：header / body / footer 之间的纵向间距 */
  gap: var(--ui-space-4);
  /* 内边距：Card 允许的 16 / 24 / 32px 中取 24px 档 */
  padding: var(--ui-space-5);
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
}

/* ── shadow="rest"：唯一可选的静止阴影档；默认 none 不产生阴影 ── */
.ui-card--shadow-rest {
  box-shadow: var(--ui-shadow-rest);
}
</style>
