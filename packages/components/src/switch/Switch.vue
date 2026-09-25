<script setup lang="ts">
/**
 * Switch —— 开关：button[role="switch"] + aria-checked 的即时生效控件 + Paper 视觉（token-only）。
 *
 * - 语义：role="switch" 恒定，aria-checked 表达开/关（true/false 常驻）；
 *   键盘 Enter/Space 走原生 button 激活路径，不做任何 keydown 拦截。
 * - loading：aria-busy="true" 且一切切换路径（点击/键盘）被拦截，但保持可聚焦——
 *   不落原生 disabled（同 Button 的 loading 语义）；圆点让位旋转指示。
 * - disabled：原生 disabled 属性（移出 Tab 序）。
 * - label prop / 默认插槽提供可读名称（根为 label 元素，点击文本即切换）；
 *   两者皆无时必须由使用方经 attrs 提供 aria-label（attrs 透传到 button）。
 * - 视觉：轨道选中转 accent 实底、圆点转 on-accent，位移动效只走 --ui-motion-* token。
 */
import { computed, ref, useSlots } from 'vue'
import { SWITCH_SIZE_DEFAULT } from './Switch.constants'
import type { SwitchEmits, SwitchExpose, SwitchProps, SwitchSlots } from './Switch.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  loading: false,
  disabled: false,
  label: undefined,
  size: SWITCH_SIZE_DEFAULT,
})
const emit = defineEmits<SwitchEmits>()
defineSlots<SwitchSlots>()

const slots = useSlots()

const buttonEl = ref<HTMLButtonElement | null>(null)

const classes = computed(() => [
  'ui-switch',
  `ui-switch--${props.size}`,
  {
    'ui-switch--checked': props.modelValue,
    'ui-switch--loading': props.loading,
    'ui-switch--disabled': props.disabled,
  },
])

/** 可读名称可见性：label prop 或默认插槽至少其一。 */
const hasLabel = computed(() => props.label !== undefined || slots.default !== undefined)

function onClick(): void {
  // disabled 由原生 disabled 拦截用户路径；loading 不落 disabled，这里兜底一切激活路径。
  if (props.disabled || props.loading) return
  emit('update:modelValue', !props.modelValue)
}

function focus(options?: FocusOptions): void {
  buttonEl.value?.focus(options)
}

function blur(): void {
  buttonEl.value?.blur()
}

defineExpose<SwitchExpose>({ focus, blur })
</script>

<template>
  <label :class="classes">
    <button
      ref="buttonEl"
      type="button"
      class="ui-switch__control"
      role="switch"
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="disabled"
      v-bind="$attrs"
      @click="onClick"
    >
      <span class="ui-switch__thumb" aria-hidden="true">
        <svg
          v-if="loading"
          class="ui-switch__spinner"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="8" stroke-linecap="round" stroke-dasharray="38" stroke-dashoffset="12" />
        </svg>
      </span>
    </button>
    <span v-if="hasLabel" class="ui-switch__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
/* ── 根（label 元素）：点击文本即切换（label 元素对 button 的原生激活关联） ── */
.ui-switch {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  cursor: pointer;
  user-select: none;
}

/* ── 轨道（原生 button 即视觉轨道）：line-strong 底，选中转 accent ───── */
.ui-switch__control {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  border: none; /* 结构性重置：非视觉取值 */
  padding: var(--ui-space-1);
  background-color: var(--ui-border-strong);
  /* 24px 轨道高的一半即全圆角（无圆形半径 token，半径取自间距 token 的二分之一） */
  border-radius: calc(var(--ui-space-5) / 2);
  cursor: inherit;
  transition: background-color var(--ui-motion-default) var(--ui-ease-out);
}

/* 尺寸档位：宽高全部由间距 token 推导（sm：32×20，md：40×24） */
.ui-switch--sm .ui-switch__control {
  inline-size: calc(var(--ui-space-4) * 2);
  block-size: calc(var(--ui-space-4) + var(--ui-space-1));
  border-radius: calc((var(--ui-space-4) + var(--ui-space-1)) / 2);
}

.ui-switch--md .ui-switch__control {
  inline-size: calc(var(--ui-space-5) + var(--ui-space-4));
  block-size: var(--ui-space-5);
}

/* hover：未选轨道加深一档中性灰；选中轨道转 accent-hover（disabled 不响应） */
.ui-switch:hover:not(.ui-switch--disabled):not(.ui-switch--loading) .ui-switch__control {
  background-color: var(--ui-text-3);
}

.ui-switch--checked .ui-switch__control {
  background-color: var(--ui-accent);
}

.ui-switch--checked:hover:not(.ui-switch--disabled):not(.ui-switch--loading) .ui-switch__control {
  background-color: var(--ui-accent-hover);
}

/* ── 圆点：绝对定位，checked 时平移一档行程（sm 12px / md 16px，皆取自间距 token），
   选中转 on-accent 底；动效仅 transform/背景色，时长走 --ui-motion-* token ── */
.ui-switch__thumb {
  position: absolute;
  top: var(--ui-space-1);
  left: var(--ui-space-1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--ui-space-4);
  block-size: var(--ui-space-4);
  border-radius: calc(var(--ui-space-4) / 2);
  background-color: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  /* translateX(0) 为中性零值 */
  transform: translateX(0);
  transition:
    transform var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-switch--sm .ui-switch__thumb {
  inline-size: var(--ui-space-3);
  block-size: var(--ui-space-3);
  border-radius: calc(var(--ui-space-3) / 2);
}

.ui-switch--checked .ui-switch__thumb {
  transform: translateX(var(--ui-space-4)); /* md 行程 = 轨道宽 - 双侧内衬 - 圆点 = 16px */
  background-color: var(--ui-on-accent);
}

.ui-switch--sm.ui-switch--checked .ui-switch__thumb {
  transform: translateX(var(--ui-space-3)); /* sm 行程 = 12px */
}

/* 加载指示：结构性撑满圆点内腔（非内容图标，不取 16/20/24 档）；时长由 token 推导，
   prefers-reduced-motion 下 token 归零自动停止 */
@keyframes ui-switch-spin {
  to {
    transform: rotate(360deg);
  }
}

.ui-switch__spinner {
  inline-size: 100%;
  block-size: 100%;
  color: var(--ui-text-3);
  animation: ui-switch-spin calc(var(--ui-motion-default) * 4) linear infinite;
}

.ui-switch--checked .ui-switch__spinner {
  color: var(--ui-accent);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ─────── */
.ui-switch--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-switch--disabled .ui-switch__control {
  background-color: var(--ui-surface-muted);
}

.ui-switch--disabled .ui-switch__thumb {
  box-shadow: none;
}

.ui-switch__label {
  min-width: 0;
}
</style>
