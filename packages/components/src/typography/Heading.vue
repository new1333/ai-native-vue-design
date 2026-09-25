<script setup lang="ts">
/**
 * Heading —— 标题组件：h1–h6 层级（as，默认 h2）+ Paper 排版档位（token-only）。
 *
 * - as：标题层级（h1..h6），默认 h2；attrs 透传到根元素。
 * - size：--ui-text-* 字阶（xs..3xl）；weight：400/500/600（默认 600）；color：text-1/2/3（muted 简写）。
 * - 默认左对齐；numeric 开启后数字采用 tabular-nums（--ui-numeric）。
 * - 纯展示、无交互：不绑定事件、不可聚焦；层级语义交给原生 h* 标签。
 * - 一切颜色、字号、行高、字重均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import {
  HEADING_AS_DEFAULT,
  HEADING_COLOR_DEFAULT,
  HEADING_SIZE_DEFAULT,
  HEADING_WEIGHT_DEFAULT,
} from './Heading.constants'
import { TYPOGRAPHY_WEIGHT_CLASS } from './Typography.constants'
import type { HeadingProps, HeadingSlots } from './Heading.types'

const props = withDefaults(defineProps<HeadingProps>(), {
  as: HEADING_AS_DEFAULT,
  size: HEADING_SIZE_DEFAULT,
  weight: HEADING_WEIGHT_DEFAULT,
  color: HEADING_COLOR_DEFAULT,
  numeric: false,
})
defineSlots<HeadingSlots>()

const classes = computed(() => [
  'ui-heading',
  `ui-heading--${props.size}`,
  `ui-heading--weight-${TYPOGRAPHY_WEIGHT_CLASS[props.weight]}`,
  `ui-heading--${props.color}`,
  {
    'ui-heading--numeric': props.numeric,
  },
])
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<style scoped>
/* ── 基底：默认左对齐；标题层级语义由原生 h* 标签承担 ────────────────── */
.ui-heading {
  margin: 0; /* 结构性重置：Typography 不自带上文间距，间距由布局层用 --ui-space-* 决定 */
  font-family: var(--ui-font-sans);
  text-align: left;
}

/* ── 字阶 × 行高（标题按 UI 口径：12–20→1.5；24–30→1.3）──────────────── */
.ui-heading--xs {
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

.ui-heading--sm {
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.ui-heading--md {
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
}

.ui-heading--lg {
  font-size: var(--ui-text-lg);
  line-height: var(--ui-leading-small);
}

.ui-heading--xl {
  font-size: var(--ui-text-xl);
  line-height: var(--ui-leading-small);
}

.ui-heading--2xl {
  font-size: var(--ui-text-2xl);
  line-height: var(--ui-leading-heading);
}

.ui-heading--3xl {
  font-size: var(--ui-text-3xl);
  line-height: var(--ui-leading-heading);
}

/* ── 字重（400/500/600 → token 语义档）────────────────────────────── */
.ui-heading--weight-regular {
  font-weight: var(--ui-font-weight-regular);
}

.ui-heading--weight-medium {
  font-weight: var(--ui-font-weight-medium);
}

.ui-heading--weight-semibold {
  font-weight: var(--ui-font-weight-semibold);
}

/* ── 颜色语义（muted 为 text-2 的简写档）──────────────────────────── */
.ui-heading--text-1 {
  color: var(--ui-text-1);
}

.ui-heading--text-2,
.ui-heading--muted {
  color: var(--ui-text-2);
}

.ui-heading--text-3 {
  color: var(--ui-text-3);
}

/* ── 数字场景：tabular-nums 工具档 ────────────────────────────────── */
.ui-heading--numeric {
  font-variant-numeric: var(--ui-numeric);
}
</style>
