<script setup lang="ts">
/**
 * Progress —— 进度指示组件：确定（determinate）/ 不确定（indeterminate）进度。
 *
 * - ARIA：根元素 role="progressbar"，aria-valuemin/max 恒为 0/100；
 *   确定态 aria-valuenow = 钳制后的 value；indeterminate 按 ARIA 省略 aria-valuenow。
 * - 可访问名：组件无 label 类 prop（showLabel 仅控制数值标签）；attrs 透传的
 *   aria-label / aria-labelledby 经默认继承落到根元素（即 role=progressbar 元素），
 *   任务名称由使用方提供。
 * - 视觉：填充 --ui-accent、轨道 --ui-surface-muted；条高 sm/md 两档；
 *   端头 2px 用 --ui-radius-xs（该 token 唯一合法用途：进度条端头形状细节）。
 * - indeterminate 扫描为 transform 白名单动效（加载态无限循环豁免）；
 *   prefers-reduced-motion 时显式 @media 停用，降级为静态 50% 半填充。
 * - 纯展示：无交互、无 emits/slots；一切颜色/间距/圆角/动效时长消费 var(--ui-*) token。
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { ProgressProps, ProgressSlots } from './Progress.types'

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  indeterminate: false,
  showLabel: false,
  size: 'md',
})
defineSlots<ProgressSlots>()

/** 钳制到 [0, 100]；非有限数（NaN/±Infinity）回退 0。 */
const clampedValue = computed(() => {
  if (!Number.isFinite(props.value)) return 0
  return Math.min(100, Math.max(0, props.value))
})

const classes = computed(() => [
  'ui-progress',
  `ui-progress--${props.size}`,
  { 'ui-progress--indeterminate': props.indeterminate },
])

const fillClasses = computed(() => [
  'ui-progress__fill',
  { 'ui-progress__fill--indeterminate': props.indeterminate },
])

/** 确定态：进度以内联 width 表达；indeterminate 交给 CSS（50% 半填充 + 扫描动画）。 */
const fillStyle = computed<CSSProperties>(() =>
  props.indeterminate ? {} : { width: `${clampedValue.value}%` },
)

/** ARIA：indeterminate 表示进度未知，aria-valuenow 必须省略。 */
const ariaValueNow = computed(() => (props.indeterminate ? undefined : clampedValue.value))
</script>

<template>
  <div
    :class="classes"
    role="progressbar"
    :aria-valuenow="ariaValueNow"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="ui-progress__track">
      <div :class="fillClasses" :style="fillStyle" />
    </div>
    <span v-if="showLabel && !indeterminate" class="ui-progress__label">{{ clampedValue }}%</span>
  </div>
</template>

<style scoped>
/* ── 根：横排（轨道 + 可选数值标签）──────────────────────
   块级满宽（width: 100%）：轨道的 flex-grow 需要根元素持有真实可用宽度。
   若根宽收缩为内容宽（列向 flex + align-items: flex-start、float 等
   收缩上下文），轨道内容宽为 0、无自由空间可 grow，随之整体塌缩为 0。 */
.ui-progress {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  width: 100%;
}

/* ── 轨道：muted 面 + 端头 2px（--ui-radius-xs：进度条端头专用档）── */
.ui-progress__track {
  flex: 1 1 auto;
  overflow: hidden;
  height: var(--ui-space-2);
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-xs);
}

/* 条高 sm：4px（space-1）；md 默认 8px（space-2） */
.ui-progress--sm .ui-progress__track {
  height: var(--ui-space-1);
}

/* ── 填充：accent 面 + 同档端头；宽度由 value 内联驱动 ──── */
.ui-progress__fill {
  height: 100%;
  background-color: var(--ui-accent);
  border-radius: var(--ui-radius-xs);
}

/* ── indeterminate：50% 半填充 + transform 扫描 ──────────
   白名单动效（transform），加载态的无限循环豁免；时长由 motion
   token 推导（180ms × 11 ≈ 2s）；位移百分比相对填充自身宽度，
   -100% → 200% 覆盖整条轨道的单向扫动。 */
.ui-progress__fill--indeterminate {
  width: 50%;
  animation: ui-progress-indeterminate calc(var(--ui-motion-default) * 11) linear infinite;
}

@keyframes ui-progress-indeterminate {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(200%);
  }
}

/* ── reduced-motion：停用扫描，降级为静态半填充（50% 宽停靠起点）── */
@media (prefers-reduced-motion: reduce) {
  .ui-progress__fill--indeterminate {
    animation: none;
    transform: none;
  }
}

/* ── 数值标签：tabular-nums 对齐数字 ───────────────────── */
.ui-progress__label {
  flex: none;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-2);
}
</style>
