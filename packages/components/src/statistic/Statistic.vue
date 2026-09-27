<script setup lang="ts">
/**
 * Statistic —— 数值统计展示：KPI 数值 + 标题 + 趋势 / 倒计时（设计文档 §11.3 KPI）。
 *
 * - 数值走 precision 小数位格式化（非有限数回退 0）；countdown 模式下 value 为
 *   初始剩余秒数，客户端 1s 步进递减（useCountdown），归零停表并发出 finish，
 *   value 变更即受控重置；展示 <1h 为 mm:ss、≥1h 为 HH:mm:ss，precision 忽略。
 * - 展示语义：countdown 根元素 role="timer"（数值计数器）；trend 渲染带
 *   role="img" 可访问名（上升/下降）的方向箭头（up=success / down=danger），
 *   svg aria-hidden；#title/#prefix/#suffix/#default 四插槽覆盖默认渲染。
 * - 纯展示、非交互：不可聚焦、不进入 Tab 序，默认不设 aria-live（避免逐秒打断读屏）；
 *   一切颜色/字号/间距/行高消费 var(--ui-*) token（paper.css）。
 */
import { computed, onBeforeUnmount, onMounted, useSlots, watch } from 'vue'
import { STATISTIC_TREND_LABELS } from './Statistic.constants'
import { formatCountdown, formatStatisticValue, useCountdown } from './useCountdown'
import type { StatisticEmits, StatisticProps, StatisticSlots } from './Statistic.types'

const props = withDefaults(defineProps<StatisticProps>(), {
  value: 0,
  precision: 0,
  prefix: '',
  suffix: '',
  title: '',
  trend: undefined,
  countdown: false,
})
const emit = defineEmits<StatisticEmits>()
defineSlots<StatisticSlots>()
const slots = useSlots()

const { remaining, restart, dispose } = useCountdown({
  active: () => props.countdown,
  totalSeconds: () => props.value,
  onFinish: () => emit('finish'),
})

// 起表只在客户端生命周期（onMounted）；value/countdown 变更即受控重置。
onMounted(() => {
  restart()
})

watch([() => props.countdown, () => props.value], () => {
  restart()
})

onBeforeUnmount(() => {
  dispose()
})

/** 展示文本：countdown 走剩余秒数格式化（precision 忽略），否则走 precision 数值格式化。 */
const display = computed(() =>
  props.countdown
    ? formatCountdown(remaining.value)
    : formatStatisticValue(props.value, props.precision),
)

const rootClasses = computed(() => [
  'ui-statistic',
  { 'ui-statistic--countdown': props.countdown },
])

const trendClasses = computed(() =>
  props.trend ? ['ui-statistic__trend', `ui-statistic__trend--${props.trend}`] : undefined,
)
</script>

<template>
  <div :class="rootClasses" :role="countdown ? 'timer' : undefined">
    <div v-if="title || slots.title" class="ui-statistic__title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="ui-statistic__row">
      <span v-if="prefix || slots.prefix" class="ui-statistic__affix">
        <slot name="prefix">{{ prefix }}</slot>
      </span>
      <span class="ui-statistic__value">
        <slot>{{ display }}</slot>
      </span>
      <span v-if="suffix || slots.suffix" class="ui-statistic__affix">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
      <span
        v-if="trend"
        :class="trendClasses"
        role="img"
        :aria-label="STATISTIC_TREND_LABELS[trend]"
      >
        <svg
          v-if="trend === 'up'"
          class="ui-statistic__trend-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg
          v-else
          class="ui-statistic__trend-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ── 根：块级统计块（标题 + 数值行）────────────────────── */
.ui-statistic {
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

/* ── 标题：弱化档（text-2 / sm）────────────────────────── */
.ui-statistic__title {
  margin-bottom: var(--ui-space-2);
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── 数值行：前后缀与数值基线对齐 ──────────────────────── */
.ui-statistic__row {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-1);
}

/* ── 数值：KPI 主字号 + semibold + tabular-nums ────────── */
.ui-statistic__value {
  color: var(--ui-text-1);
  font-size: var(--ui-text-3xl);
  line-height: var(--ui-leading-heading);
  font-weight: var(--ui-font-weight-semibold);
  font-variant-numeric: var(--ui-numeric);
}

/* ── 前后缀：弱化小一号（¥ / % / 人 等单位）────────────── */
.ui-statistic__affix {
  color: var(--ui-text-2);
  font-size: var(--ui-text-lg);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
}

/* ── 趋势箭头：up=success / down=danger；基线行内垂直居中 ─ */
.ui-statistic__trend {
  display: inline-flex;
  align-items: center;
  align-self: center;
}

.ui-statistic__trend--up {
  color: var(--ui-success);
}

.ui-statistic__trend--down {
  color: var(--ui-danger);
}
</style>
