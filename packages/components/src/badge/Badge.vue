<script setup lang="ts">
/**
 * Badge —— 状态徽标组件：soft 底 + 同系文字色 token，可选前置小圆点（token-only）。
 *
 * - variant：neutral/success/warning/danger/info；底色 --ui-*-soft、文字 --ui-*（同系）。
 * - dot：前置小圆点，颜色随文字色（currentColor）；纯装饰，aria-hidden。
 * - 纯展示、无交互：不绑定事件、不可聚焦、无 hover/focus 态。
 * - 一切颜色、字号、间距、圆角均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import { BADGE_VARIANT_DEFAULT } from './Badge.constants'
import type { BadgeProps, BadgeSlots } from './Badge.types'

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: BADGE_VARIANT_DEFAULT,
  dot: false,
})
defineSlots<BadgeSlots>()

const classes = computed(() => [
  'ui-badge',
  `ui-badge--${props.variant}`,
])
</script>

<template>
  <span :class="classes">
    <span v-if="dot" class="ui-badge__dot" aria-hidden="true"></span>
    <slot />
  </span>
</template>

<style scoped>
/* ── 基底：inline-flex 徽标，soft 底 + 同系文字色在 variant 档声明 ─────── */
.ui-badge {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-xs);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  white-space: nowrap;
}

/* ── variant：soft 底 + 同系文字色（neutral 无专属 token，用 surface-muted/text-2 表达）── */
.ui-badge--neutral {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
}

.ui-badge--success {
  background-color: var(--ui-success-soft);
  color: var(--ui-success);
}

.ui-badge--warning {
  background-color: var(--ui-warning-soft);
  color: var(--ui-warning);
}

.ui-badge--danger {
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-badge--info {
  background-color: var(--ui-info-soft);
  color: var(--ui-info);
}

/* ── 前置小圆点：尺寸用 em/50% 比例值（随字号缩放，非绝对设计维度，随 Button
      transform 白名单先例在任务结果中说明）；颜色随文字色（currentColor） ── */
.ui-badge__dot {
  flex: none;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background-color: currentColor;
}
</style>
