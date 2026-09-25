<script setup lang="ts">
/**
 * Alert —— 页内警示条：柔底信息块（图标位 + 标题 + 正文 + 可选关闭按钮）
 * + Paper 视觉（token-only）。
 *
 * - severity 四档：info / success / warning / danger，对应 --ui-{severity}
 *   与 --ui-{severity}-soft 色彩 token。
 * - live region 角色：danger 为 role="alert"（读屏立即播报），其余为 role="status"（polite）。
 * - closable 渲染原生关闭按钮（aria-label="关闭"），点击仅 emit close；
 *   组件不自行隐藏，显隐由使用方控制（便于撤销、动画等场景）。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, useSlots } from 'vue'
import {
  ALERT_CLOSE_ARIA_LABEL,
  ALERT_CLOSE_ICON_PATHS,
  ALERT_ICON_PATHS,
  ALERT_SEVERITY_DEFAULT,
} from './Alert.constants'
import type { AlertEmits, AlertProps, AlertSlots } from './Alert.types'

const props = withDefaults(defineProps<AlertProps>(), {
  severity: ALERT_SEVERITY_DEFAULT,
  closable: false,
})
const emit = defineEmits<AlertEmits>()
defineSlots<AlertSlots>()

const slots = useSlots()

const classes = computed(() => ['ui-alert', `ui-alert--${props.severity}`])

/** danger 需要立即被读屏注意（role=alert 隐式 aria-live=assertive），其余为 status（polite）。 */
const role = computed(() => (props.severity === 'danger' ? 'alert' : 'status'))

const iconPaths = computed(() => ALERT_ICON_PATHS[props.severity])

/** 关闭仅上报，不改变自身渲染（显隐归使用方）。 */
function onClose(): void {
  emit('close')
}
</script>

<template>
  <div :class="classes" :role="role">
    <span class="ui-alert__icon">
      <slot name="icon">
        <svg
          class="ui-alert__icon-svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path v-for="d in iconPaths" :key="d" :d="d" />
        </svg>
      </slot>
    </span>
    <div class="ui-alert__content">
      <div v-if="title" class="ui-alert__title">{{ title }}</div>
      <div v-if="slots.default" class="ui-alert__body">
        <slot />
      </div>
    </div>
    <button
      v-if="closable"
      type="button"
      class="ui-alert__close"
      :aria-label="ALERT_CLOSE_ARIA_LABEL"
      @click="onClose"
    >
      <svg
        class="ui-alert__close-svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path v-for="d in ALERT_CLOSE_ICON_PATHS" :key="d" :d="d" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* ── 基底：结构 + token 化的通用视觉 ─────────────────────── */
.ui-alert {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-3) var(--ui-space-4);
  font-family: var(--ui-font-sans);
}

/* ── severity：{severity} 柔底 + {severity} 色图标（语义色全部 token 化） ── */
.ui-alert--info {
  background-color: var(--ui-info-soft);
}

.ui-alert--info .ui-alert__icon {
  color: var(--ui-info);
}

.ui-alert--success {
  background-color: var(--ui-success-soft);
}

.ui-alert--success .ui-alert__icon {
  color: var(--ui-success);
}

.ui-alert--warning {
  background-color: var(--ui-warning-soft);
}

.ui-alert--warning .ui-alert__icon {
  color: var(--ui-warning);
}

.ui-alert--danger {
  background-color: var(--ui-danger-soft);
}

.ui-alert--danger .ui-alert__icon {
  color: var(--ui-danger);
}

/* ── 内部结构：图标 / 内容 ───────────────────────────────── */
.ui-alert__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
}

.ui-alert__icon-svg {
  display: block;
}

.ui-alert__content {
  flex: 1 1 auto;
  min-width: 0;
}

.ui-alert__title {
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

.ui-alert__body {
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  overflow-wrap: anywhere;
}

/* 仅在标题与正文并存时收紧两者间距 */
.ui-alert__title + .ui-alert__body {
  margin-top: var(--ui-space-1);
}

/* ── 关闭按钮：原生 button，安静图标钮 ───────────────────── */
/* transparent 为结构性"无填充/无描边"（非色相取值，无对应 token，沿 Button ghost 先例） */
.ui-alert__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-1);
  border: none;
  border-radius: var(--ui-radius-sm);
  background-color: transparent;
  color: var(--ui-text-3);
  font-family: var(--ui-font-sans);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-alert__close:hover {
  color: var(--ui-text-1);
}

.ui-alert__close-svg {
  display: block;
}
</style>
