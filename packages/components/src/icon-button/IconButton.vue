<script setup lang="ts">
/**
 * IconButton —— 仅图标按钮：ButtonRoot（button/ 的无样式交互根，内部即 useButton
 * 的点击网关 + Enter/Space 键盘激活 + aria-busy 语义）+ Paper 视觉（token-only）。
 * 视觉档位 variant：ghost / outline / primary；尺寸 sm / md / lg 映射图标 16/20/24。
 * 必须提供 aria-label 或 aria-labelledby（经 attrs 透传到根 button），
 * 两者皆缺时在开发环境 console.warn 提示。
 * 一切颜色、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useAttrs } from 'vue'
import ButtonRoot from '../button/ButtonRoot.vue'
import {
  ICON_BUTTON_MISSING_LABEL_WARNING,
  ICON_BUTTON_SIZE_DEFAULT,
  ICON_BUTTON_VARIANT_DEFAULT,
} from './IconButton.constants'
import type {
  IconButtonEmits,
  IconButtonExpose,
  IconButtonProps,
  IconButtonSlots,
} from './IconButton.types'

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: ICON_BUTTON_VARIANT_DEFAULT,
  size: ICON_BUTTON_SIZE_DEFAULT,
  loading: false,
  disabled: false,
})
const emit = defineEmits<IconButtonEmits>()
defineSlots<IconButtonSlots>()

const attrs = useAttrs()

/** 仅显式开发构建（vite 注入 import.meta.env.DEV）提示；未知环境保持安静。 */
const IS_DEV =
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true

/** 可访问名是否存在：aria-label 或 aria-labelledby 至少其一且非空白。 */
function hasAccessibleName(): boolean {
  const label = attrs['aria-label']
  if (typeof label === 'string' && label.trim() !== '') return true
  const labelledby = attrs['aria-labelledby']
  return typeof labelledby === 'string' && labelledby.trim() !== ''
}

// 开发期诊断（同 tabs 系 setup 期 warn 模式）：仅图标无文本，缺可访问名即匿名。
if (IS_DEV && !hasAccessibleName()) {
  console.warn(ICON_BUTTON_MISSING_LABEL_WARNING)
}

const classes = computed(() => [
  'ui-icon-button',
  `ui-icon-button--${props.variant}`,
  `ui-icon-button--${props.size}`,
  {
    'ui-icon-button--loading': props.loading,
  },
])

const rootComponent = ref<InstanceType<typeof ButtonRoot> | null>(null)

function focus(options?: FocusOptions): void {
  rootComponent.value?.focus(options)
}

function blur(): void {
  rootComponent.value?.blur()
}

defineExpose<IconButtonExpose>({ focus, blur })

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <ButtonRoot
    ref="rootComponent"
    :loading="loading"
    :disabled="disabled"
    :class="classes"
    @click="onClick"
  >
    <span v-if="loading" class="ui-icon-button__spinner">
      <svg
        class="ui-icon-button__spinner-svg"
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
    <span v-else class="ui-icon-button__icon">
      <slot />
    </span>
  </ButtonRoot>
</template>

<style scoped>
/* ── 基底：方形结构 + token 化通用视觉 ─────────────────── */
.ui-icon-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，同 Button.vue 处理，已在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-button-radius);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out),
    transform var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 尺寸：方形内距（图标渲染尺寸 16/20/24 见下方 Icon Token 注释） ── */
.ui-icon-button--sm {
  padding: var(--ui-space-1);
}

.ui-icon-button--md {
  padding: var(--ui-space-2);
}

.ui-icon-button--lg {
  padding: var(--ui-space-3);
}

/* ── variant：ghost（无底安静，hover 浮现砂底）─────────── */
.ui-icon-button--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--ui-text-2);
}

.ui-icon-button--ghost:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

.ui-icon-button--ghost:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
  transform: scale(0.98); /* 缩放 ≤2%，白名单内的 transform 动效（同 Button.vue） */
}

/* ── variant：outline（描边常规，对应 Button 的 secondary 视觉档）── */
.ui-icon-button--outline {
  background-color: var(--ui-surface);
  border-color: var(--ui-border);
  color: var(--ui-text-1);
}

.ui-icon-button--outline:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

.ui-icon-button--outline:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
  transform: scale(0.98);
}

/* ── variant：primary（accent 实底强调，对应 Button 的 primary 视觉档）── */
.ui-icon-button--primary {
  background-color: var(--ui-button-primary-bg);
  border-color: var(--ui-button-primary-bg);
  color: var(--ui-button-primary-fg);
}

.ui-icon-button--primary:hover:not(:disabled) {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
}

.ui-icon-button--primary:active:not(:disabled) {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
  transform: scale(0.98);
}

/* ── 状态：disabled（置于 variant 之后统一覆盖，同 Button.vue）── */
.ui-icon-button:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
  transform: none;
}

/* ── 内部结构：图标 / 加载指示 ─────────────────────── */
.ui-icon-button__icon,
.ui-icon-button__spinner {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
}

/* Icon Token 规定图标仅 16/20/24 三档，无 --ui-icon-size-* token（同 Button.vue 处理，已在任务结果中提出需求） */
.ui-icon-button__icon :deep(svg),
.ui-icon-button__spinner-svg {
  width: 20px;
  height: 20px;
}

.ui-icon-button--sm .ui-icon-button__icon :deep(svg),
.ui-icon-button--sm .ui-icon-button__spinner-svg {
  width: 16px;
  height: 16px;
}

.ui-icon-button--lg .ui-icon-button__icon :deep(svg),
.ui-icon-button--lg .ui-icon-button__spinner-svg {
  width: 24px;
  height: 24px;
}

/* 加载旋转：时长由 token 推导（≈720ms）；reduced-motion 时 token 归零自动停止（同 Button.vue） */
@keyframes ui-icon-button-spin {
  to {
    transform: rotate(360deg);
  }
}

.ui-icon-button__spinner-svg {
  animation: ui-icon-button-spin calc(var(--ui-motion-default) * 4) linear infinite;
}
</style>
