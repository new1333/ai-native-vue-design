<script setup lang="ts">
/**
 * Skeleton —— 骨架占位组件：内容加载前的形状占位（Paper 视觉，token-only）。
 *
 * - 纯装饰元素：根节点恒 aria-hidden="true"，不进入 Tab 序、无交互、无 emits/slots；
 *   加载状态必须由使用方容器声明（如 role="status" / aria-busy）。
 * - variant：line（多行文本占位，末行短尾）/ circle（正圆，头像占位）/ rect（矩形，块面占位）。
 * - shimmer 为 opacity 呼吸关键帧（加载态白名单内的无限循环动效），时长由
 *   --ui-motion-* token 推导；prefers-reduced-motion 时经 token 归零 + 显式 @media 双通道停用。
 * - 一切颜色、间距、圆角、动效时长均消费 var(--ui-*) token（paper.css）。
 * - 单根结构：根元素恒存在——line 时为容器（内含 N 行占位），
 *   circle / rect 时根元素即形状本体（无子元素）。
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { SkeletonDimension, SkeletonProps, SkeletonSlots } from './Skeleton.types'

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: 'line',
  lines: 3,
})
defineSlots<SkeletonSlots>()

const classes = computed(() => ['ui-skeleton', `ui-skeleton--${props.variant}`])

/** 行数：小数向下取整、最小 1（0/负数回退 1）。 */
const lineCount = computed(() => Math.max(1, Math.floor(props.lines)))

/** 数字 → 'Npx'；字符串原样；undefined 交给 CSS 默认（token）。 */
function toCssDimension(value: SkeletonDimension | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * 根元素内联尺寸：
 * - line：width 作用于根容器（行宽随容器 100% 收敛）；
 * - circle：width ?? height 单一来源同时落宽高，保证正圆（两值同给时 width 优先）；
 * - rect：width / height 直接生效。
 */
const rootStyle = computed<CSSProperties>(() => {
  if (props.variant === 'line') {
    return { width: toCssDimension(props.width) }
  }
  if (props.variant === 'circle') {
    const size = toCssDimension(props.width ?? props.height)
    return size ? { width: size, height: size } : {}
  }
  return { width: toCssDimension(props.width), height: toCssDimension(props.height) }
})

/** line：height 为每一行的行高（行数由 v-for 展开）。 */
const lineStyle = computed<CSSProperties>(() =>
  props.variant === 'line' ? { height: toCssDimension(props.height) } : {},
)
</script>

<template>
  <div :class="classes" :style="rootStyle" aria-hidden="true">
    <template v-if="variant === 'line'">
      <div
        v-for="line in lineCount"
        :key="line"
        class="ui-skeleton__line"
        :class="{ 'ui-skeleton__line--last': lineCount > 1 && line === lineCount }"
        :style="lineStyle"
      />
    </template>
  </div>
</template>

<style scoped>
/* ── line 容器：纵向排布，行距走 token ─────────────────── */
.ui-skeleton--line {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

/* ── 占位面统一：muted 面 + opacity 呼吸 shimmer ──────────
   加载态白名单内的无限循环动效；时长由 motion token 推导
   （180ms × 10 = 1.8s），reduced-motion 时 token 归零自动停止。
   脉冲幅度 1 → 0.4 → 1：opacity 不在禁裸值清单
   （颜色/字号/间距/圆角/阴影/动效时长/z-index）内，为动效振幅。 */
.ui-skeleton--circle,
.ui-skeleton--rect,
.ui-skeleton__line {
  background-color: var(--ui-surface-muted);
  animation: ui-skeleton-shimmer calc(var(--ui-motion-default) * 10) ease-in-out infinite;
}

/* ── 圆角随形状 ──────────────────────────────────────────
   line / rect：radius-sm（line 默认行高 12px 时恰为全圆端头）；
   circle 全圆：50% 为形状相对半径（相对值而非绝对裸值）。
   token 圆角阶梯（xs/sm/md/lg）无全圆档，--ui-radius-full 需求已在任务结果中提出。 */
.ui-skeleton__line,
.ui-skeleton--rect {
  border-radius: var(--ui-radius-sm);
}

.ui-skeleton--circle {
  border-radius: 50%;
}

/* ── 默认尺寸：circle/rect 方块 48px（space-7）；rect 宽随容器；
   line 行高 12px（space-3）、宽随容器 ─────────────────── */
.ui-skeleton--circle {
  width: var(--ui-space-7);
  height: var(--ui-space-7);
}

.ui-skeleton--rect {
  width: 100%;
  height: var(--ui-space-7);
}

.ui-skeleton__line {
  width: 100%;
  height: var(--ui-space-3);
}

/* ── 末行短尾：60% 为形状比例（结构性相对值，无对应 token，已在任务结果中提出）；
   用 max-width 而非 width，使用方显式传入 width 时短尾仍然生效。 ── */
.ui-skeleton__line--last {
  max-width: 60%;
}

/* ── reduced-motion：显式停用 shimmer（token 归零之外的直接保险）── */
@media (prefers-reduced-motion: reduce) {
  .ui-skeleton--circle,
  .ui-skeleton--rect,
  .ui-skeleton__line {
    animation: none;
  }
}

@keyframes ui-skeleton-shimmer {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}
</style>
