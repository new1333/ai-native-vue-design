<script setup lang="ts">
/**
 * Spinner —— 加载指示组件：紧凑型 loading 状态（Paper 视觉，token-only）。
 *
 * - 区别于 Progress（量值进度）：Spinner 表达"进行中但无量值"的等待，
 *   刻意不携带 progressbar / aria-valuenow 等进度语义。
 * - ARIA：根元素 role="status"（polite live region）；label 必配，
 *   以 sr-only 文本渲染为可访问名；图形本体（svg / dots）aria-hidden。
 * - variant：spin（SVG 旋转环，transform 白名单动效）/ dots（三点 opacity 脉冲）；
 *   均为加载态无限循环豁免，时长由 --ui-motion-* token 推导；
 *   prefers-reduced-motion 时 token 归零 + 显式 @media 停用（双通道）。
 * - 纯展示：无交互、无 emits；一切颜色/间距/动效时长消费 var(--ui-*) token。
 */
import { computed } from 'vue'
import type { SpinnerProps, SpinnerSlots } from './Spinner.types'

const props = withDefaults(defineProps<SpinnerProps>(), {
  variant: 'spin',
  size: 'md',
})
defineSlots<SpinnerSlots>()

const classes = computed(() => [
  'ui-spinner',
  `ui-spinner--${props.variant}`,
  `ui-spinner--${props.size}`,
])
</script>

<template>
  <div :class="classes" role="status">
    <svg
      v-if="variant === 'spin'"
      class="ui-spinner__svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="ui-spinner__ring" cx="12" cy="12" r="9" stroke-width="1.5" />
      <circle
        class="ui-spinner__arc"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        pathLength="100"
        stroke-dasharray="25 75"
      />
    </svg>
    <template v-else>
      <span v-for="dot in 3" :key="dot" class="ui-spinner__dot" aria-hidden="true" />
    </template>
    <span class="ui-spinner__label">
      <slot name="label">{{ label }}</slot>
    </span>
  </div>
</template>

<style scoped>
/* ── 根：行内弹性容器，承载图形与 sr-only 可访问名 ───────
   inline-flex：Spinner 常嵌入文本行/按钮旁，随内容收缩不独占整行；
   relative 让 sr-only 名的 absolute 定位锚定在组件内部。 */
.ui-spinner {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-accent);
}

/* ── spin：SVG 旋转环（transform 白名单动效）────────────
   720ms/圈（--ui-motion-default × 4，与 Button 内建加载指示同源）；
   pathLength=100 归一化环周长，dasharray 25/75 = 1/4 圆弧。
   svg 几何数值（viewBox/r/cx/cy/dasharray）为结构性图形参数。 */
.ui-spinner__svg {
  display: block;
  width: var(--ui-space-5);
  height: var(--ui-space-5);
  animation: ui-spinner-spin calc(var(--ui-motion-default) * 4) linear infinite;
}

.ui-spinner--sm .ui-spinner__svg {
  width: var(--ui-space-4);
  height: var(--ui-space-4);
}

.ui-spinner--lg .ui-spinner__svg {
  width: var(--ui-space-6);
  height: var(--ui-space-6);
}

/* 环轨道 muted 面；进度弧 currentColor（随根 --ui-accent） */
.ui-spinner__ring {
  stroke: var(--ui-surface-muted);
}

/* ── dots：三点 opacity 脉冲（Skeleton shimmer 同族白名单动效）──
   周期 1.08s（--ui-motion-default × 6）；50% 为结构性相对半径
   （全圆，Skeleton circle 先例；--ui-radius-full 需求已提出）。 */
.ui-spinner--dots {
  gap: var(--ui-space-1);
}

.ui-spinner__dot {
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  border-radius: 50%;
  background-color: currentColor;
  animation: ui-spinner-pulse calc(var(--ui-motion-default) * 6) ease-in-out infinite;
}

.ui-spinner--sm .ui-spinner__dot {
  width: var(--ui-space-1);
  height: var(--ui-space-1);
}

.ui-spinner--lg .ui-spinner__dot {
  width: var(--ui-space-3);
  height: var(--ui-space-3);
}

.ui-spinner--lg.ui-spinner--dots {
  gap: var(--ui-space-2);
}

/* 相位错开：负延迟提前进入周期，各错 1/3 周期 = token × 2（360ms） */
.ui-spinner__dot:nth-child(2) {
  animation-delay: calc(var(--ui-motion-default) * -2);
}

.ui-spinner__dot:nth-child(3) {
  animation-delay: calc(var(--ui-motion-default) * -4);
}

/* ── sr-only 可访问名：视觉隐藏、读屏可达 ───────────────
   4px 盒（--ui-space-1）+ overflow hidden + clip-path inset(50%)
   完全裁剪；absolute 脱离文档流不影响图形布局。
   clip/比例均为结构性数值，无裸色值/字号/间距。 */
.ui-spinner__label {
  position: absolute;
  width: var(--ui-space-1);
  height: var(--ui-space-1);
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ── reduced-motion：token 归零之外的显式停用保险 ────────
   静态降级：spin 停在 1/4 弧、dots 恒满 opacity；
   加载状态仍由 role="status" 内的可访问名文本播报。 */
@media (prefers-reduced-motion: reduce) {
  .ui-spinner__svg,
  .ui-spinner__dot {
    animation: none;
  }
}

@keyframes ui-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ui-spinner-pulse {
  from,
  to {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>
