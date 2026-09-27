<script setup lang="ts">
/**
 * Tag —— 分类/属性标签：描边小标签标注对象的分类或属性（如「前端」「VIP」），
 * 区别于 Badge（状态徽标）的计数/状态标注定位。
 *
 * - variant：neutral/success/warning/danger/info；柔底 --ui-*-soft + 同系文字/图标色 --ui-*。
 * - icon：前置图标位（#icon 插槽），组件无内建图标；颜色随文字色（currentColor）。
 * - closable：渲染原生关闭按钮（aria-label="关闭"），点击仅 emit close；
 *   组件不自行移除，显隐由使用方控制（与 Alert 的 close 契约一致）。
 * - disabled：根元素 aria-disabled="true"，关闭按钮置 disabled 且不触发 close。
 * - 纯展示主体：根元素非交互、不可聚焦；唯一交互点为关闭按钮。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, useSlots } from 'vue'
import { TAG_CLOSE_ARIA_LABEL, TAG_CLOSE_ICON_PATHS, TAG_VARIANT_DEFAULT } from './Tag.constants'
import type { TagEmits, TagProps, TagSlots } from './Tag.types'

const props = withDefaults(defineProps<TagProps>(), {
  variant: TAG_VARIANT_DEFAULT,
  closable: false,
  disabled: false,
})
const emit = defineEmits<TagEmits>()
defineSlots<TagSlots>()

const slots = useSlots()

const classes = computed(() => [
  'ui-tag',
  `ui-tag--${props.variant}`,
  { 'ui-tag--disabled': props.disabled },
])

/** 关闭仅上报，不改变自身渲染（移除与否归使用方）；disabled 时原生按钮已不可激活，此处兜底。 */
function onClose(): void {
  if (props.disabled) return
  emit('close')
}
</script>

<template>
  <span :class="classes" :aria-disabled="disabled || undefined">
    <span v-if="slots.icon" class="ui-tag__icon">
      <slot name="icon" />
    </span>
    <slot />
    <button
      v-if="closable"
      type="button"
      class="ui-tag__close"
      :aria-label="TAG_CLOSE_ARIA_LABEL"
      :disabled="disabled"
      @click="onClose"
    >
      <svg
        class="ui-tag__close-svg"
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
        <path v-for="d in TAG_CLOSE_ICON_PATHS" :key="d" :d="d" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
/* ── 基底：inline-flex 描边标签（分类/属性标注，区别于 Badge 的实底徽标） ── */
.ui-tag {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-2);
  border: solid var(--ui-border);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Card 先例在任务结果中提出需求） */
  border-width: 1px;
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  white-space: nowrap;
}

/* ── variant：柔底 + 同系文字/图标色（neutral 无专属 token，用 surface-muted/text-2 表达）── */
.ui-tag--neutral {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
}

.ui-tag--success {
  background-color: var(--ui-success-soft);
  color: var(--ui-success);
}

.ui-tag--warning {
  background-color: var(--ui-warning-soft);
  color: var(--ui-warning);
}

.ui-tag--danger {
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-tag--info {
  background-color: var(--ui-info-soft);
  color: var(--ui-info);
}

/* ── 前置图标位：颜色随文字色（currentColor），装饰性由使用方 svg 自行 aria-hidden ── */
.ui-tag__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
}

/* ── 关闭按钮：原生 button，安静图标钮（与 Alert 家族同一图形语言） ── */
/* transparent 为结构性"无填充/无描边"（非色相取值，无对应 token，沿 Button ghost 先例） */
.ui-tag__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  margin: calc(var(--ui-space-1) * -1);
  padding: var(--ui-space-1);
  border: none;
  border-radius: var(--ui-radius-xs);
  background-color: transparent;
  color: currentColor;
  font-family: var(--ui-font-sans);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tag__close:hover:not(:disabled) {
  color: var(--ui-text-1);
}

.ui-tag__close:disabled {
  cursor: not-allowed;
}

.ui-tag__close-svg {
  display: block;
}

/* ── 状态：disabled（置于 variant 之后统一覆盖，视觉降为 muted） ── */
.ui-tag--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
}
</style>
