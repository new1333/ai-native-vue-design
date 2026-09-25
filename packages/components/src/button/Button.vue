<script setup lang="ts">
/**
 * Button —— 按钮组件：ButtonRoot（交互/aria）+ Paper 视觉（token-only）。
 * 视觉档位 variant：primary / secondary / ghost / danger；尺寸 sm / md / lg。
 * 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, inject, ref, useSlots } from 'vue'
import ButtonRoot from './ButtonRoot.vue'
import {
  BUTTON_GROUP_SIZE_KEY,
  BUTTON_NATIVE_TYPE_DEFAULT,
  BUTTON_SIZE_DEFAULT,
  BUTTON_VARIANT_DEFAULT,
} from './Button.constants'
import type { ButtonEmits, ButtonExpose, ButtonProps, ButtonSize, ButtonSlots } from './Button.types'

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: BUTTON_VARIANT_DEFAULT,
  type: BUTTON_NATIVE_TYPE_DEFAULT,
  loading: false,
  disabled: false,
  block: false,
})
const emit = defineEmits<ButtonEmits>()
defineSlots<ButtonSlots>()

const slots = useSlots()

// ButtonGroup 内共享 size：自身未声明时取组值，独立使用落到默认档。
const groupSize = inject(BUTTON_GROUP_SIZE_KEY, undefined)
const resolvedSize = computed<ButtonSize>(
  () => props.size ?? groupSize?.value ?? BUTTON_SIZE_DEFAULT,
)

const classes = computed(() => [
  'ui-button',
  `ui-button--${resolvedSize.value}`,
  `ui-button--${props.variant}`,
  {
    'ui-button--block': props.block,
    'ui-button--loading': props.loading,
  },
])

const rootComponent = ref<InstanceType<typeof ButtonRoot> | null>(null)

function focus(options?: FocusOptions): void {
  rootComponent.value?.focus(options)
}

function blur(): void {
  rootComponent.value?.blur()
}

defineExpose<ButtonExpose>({ focus, blur })

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <ButtonRoot
    ref="rootComponent"
    :type="type"
    :loading="loading"
    :disabled="disabled"
    :class="classes"
    @click="onClick"
  >
    <span v-if="loading" class="ui-button__spinner">
      <svg
        class="ui-button__spinner-svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="8" stroke-linecap="round" stroke-dasharray="38" stroke-dashoffset="12" />
      </svg>
    </span>
    <span v-else-if="slots.icon" class="ui-button__icon">
      <slot name="icon" />
    </span>
    <span class="ui-button__label">
      <slot />
    </span>
    <span v-if="slots.iconRight" class="ui-button__icon ui-button__icon--right">
      <slot name="iconRight" />
    </span>
  </ButtonRoot>
</template>

<style scoped>
/* ── 基底：结构 + token 化的通用视觉 ─────────────────────── */
.ui-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-button-radius);
  font-family: var(--ui-font-sans);
  font-weight: var(--ui-button-font-weight);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out),
    transform var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 尺寸：字号 / 内距 / 图标间距（icon 尺寸 16/20/24 见 CONVENTIONS §2） ── */
.ui-button--sm {
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
}

.ui-button--md {
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-4);
  font-size: var(--ui-text-md);
}

.ui-button--lg {
  gap: var(--ui-space-2);
  padding: var(--ui-space-3) var(--ui-space-5);
  font-size: var(--ui-text-lg);
}

/* ── variant：primary ───────────────────────────────────── */
.ui-button--primary {
  background-color: var(--ui-button-primary-bg);
  border-color: var(--ui-button-primary-bg);
  color: var(--ui-button-primary-fg);
}

.ui-button--primary:hover:not(:disabled) {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
}

.ui-button--primary:active:not(:disabled) {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
  transform: scale(0.98); /* 缩放 ≤2%，白名单内的 transform 动效 */
}

/* ── variant：secondary ─────────────────────────────────── */
.ui-button--secondary {
  background-color: var(--ui-surface);
  border-color: var(--ui-border);
  color: var(--ui-text-1);
}

.ui-button--secondary:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

.ui-button--secondary:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
  transform: scale(0.98);
}

/* ── variant：ghost ─────────────────────────────────────── */
/* transparent 为结构性"无填充/无描边"（非色相取值，无对应 token，已在任务结果中说明） */
.ui-button--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--ui-text-2);
}

.ui-button--ghost:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

.ui-button--ghost:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
  transform: scale(0.98);
}

/* ── variant：danger（柔底 → hover 实底）───────────────── */
.ui-button--danger {
  background-color: var(--ui-danger-soft);
  border-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-button--danger:hover:not(:disabled) {
  background-color: var(--ui-danger);
  border-color: var(--ui-danger);
  color: var(--ui-color-white);
}

.ui-button--danger:active:not(:disabled) {
  background-color: var(--ui-danger);
  border-color: var(--ui-danger);
  color: var(--ui-color-white);
  transform: scale(0.98);
}

/* ── 状态：disabled（置于 variant 之后统一覆盖）─────────── */
.ui-button:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
  transform: none;
}

/* ── 状态：block ────────────────────────────────────────── */
.ui-button--block {
  display: flex;
  width: 100%;
}

/* ── 内部结构：图标 / 文本 / 加载指示 ───────────────────── */
.ui-button__icon,
.ui-button__spinner {
  display: inline-flex;
  flex: none;
  align-items: center;
}

.ui-button__label {
  display: inline-flex;
  align-items: center;
}

.ui-button__icon :deep(svg),
.ui-button__spinner-svg {
  width: 20px;
  height: 20px;
}

.ui-button--sm .ui-button__icon :deep(svg),
.ui-button--sm .ui-button__spinner-svg {
  width: 16px;
  height: 16px;
}

.ui-button--lg .ui-button__icon :deep(svg),
.ui-button--lg .ui-button__spinner-svg {
  width: 24px;
  height: 24px;
}

/* 加载旋转：时长由 token 推导（≈720ms）；reduced-motion 时 token 归零自动停止 */
@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}

.ui-button__spinner-svg {
  animation: ui-button-spin calc(var(--ui-motion-default) * 4) linear infinite;
}
</style>
