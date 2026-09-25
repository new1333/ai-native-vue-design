<script setup lang="ts">
/**
 * Text —— 正文/行内文本组件：任意元素标签（as）+ Paper 排版档位（token-only）。
 *
 * - as：渲染标签（span/p/div），默认 span；attrs 透传到根元素（id/aria-* 等原生可用）。
 * - size：--ui-text-* 字阶（xs..3xl）；weight：400/500/600；color：text-1/2/3（muted 为 text-2 简写）。
 * - 默认左对齐；numeric 开启后数字采用 tabular-nums（--ui-numeric）。
 * - 纯展示、无交互：不绑定事件、不可聚焦。
 * - 一切颜色、字号、行高、字重均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import {
  TEXT_AS_DEFAULT,
  TEXT_COLOR_DEFAULT,
  TEXT_SIZE_DEFAULT,
  TEXT_WEIGHT_DEFAULT,
} from './Text.constants'
import { TYPOGRAPHY_WEIGHT_CLASS } from './Typography.constants'
import type { TextProps, TextSlots } from './Text.types'

const props = withDefaults(defineProps<TextProps>(), {
  as: TEXT_AS_DEFAULT,
  size: TEXT_SIZE_DEFAULT,
  weight: TEXT_WEIGHT_DEFAULT,
  color: TEXT_COLOR_DEFAULT,
  numeric: false,
})
defineSlots<TextSlots>()

const classes = computed(() => [
  'ui-text',
  `ui-text--${props.size}`,
  `ui-text--weight-${TYPOGRAPHY_WEIGHT_CLASS[props.weight]}`,
  `ui-text--${props.color}`,
  {
    'ui-text--numeric': props.numeric,
  },
])
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<style scoped>
/* ── 基底：默认左对齐（设计规约：居中仅用于空状态等明确场景，由使用方覆盖）── */
.ui-text {
  margin: 0; /* 结构性重置：Typography 不自带上文间距，间距由布局层用 --ui-space-* 决定 */
  font-family: var(--ui-font-sans);
  text-align: left;
}

/* ── 字阶 × 行高（12–13→1.5；15 正文→1.7；17–20→1.5；24–30→1.3）──────── */
.ui-text--xs {
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

.ui-text--sm {
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.ui-text--md {
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
}

.ui-text--lg {
  font-size: var(--ui-text-lg);
  line-height: var(--ui-leading-small);
}

.ui-text--xl {
  font-size: var(--ui-text-xl);
  line-height: var(--ui-leading-small);
}

.ui-text--2xl {
  font-size: var(--ui-text-2xl);
  line-height: var(--ui-leading-heading);
}

.ui-text--3xl {
  font-size: var(--ui-text-3xl);
  line-height: var(--ui-leading-heading);
}

/* ── 字重（400/500/600 → token 语义档）────────────────────────────── */
.ui-text--weight-regular {
  font-weight: var(--ui-font-weight-regular);
}

.ui-text--weight-medium {
  font-weight: var(--ui-font-weight-medium);
}

.ui-text--weight-semibold {
  font-weight: var(--ui-font-weight-semibold);
}

/* ── 颜色语义（muted 为 text-2 的简写档）──────────────────────────── */
.ui-text--text-1 {
  color: var(--ui-text-1);
}

.ui-text--text-2,
.ui-text--muted {
  color: var(--ui-text-2);
}

.ui-text--text-3 {
  color: var(--ui-text-3);
}

/* ── 数字场景：tabular-nums 工具档 ────────────────────────────────── */
.ui-text--numeric {
  font-variant-numeric: var(--ui-numeric);
}
</style>
