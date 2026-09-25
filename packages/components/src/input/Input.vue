<script setup lang="ts">
/**
 * Input —— 单行文本输入组件：容器（prefix / 原生 input / 清空按钮 / suffix）
 * + Paper 视觉（token-only）。
 *
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到原生 input（id / name /
 *   autocomplete / aria-describedby 等由此直达输入框，供 FormField 接入）。
 * - status="error" 推导 aria-invalid="true"，容器描边转 danger。
 * - 清空按钮为原生 button（type=button、aria-label="清空"），点击后焦点交还输入框。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useSlots } from 'vue'
import {
  INPUT_CLEAR_ARIA_LABEL,
  INPUT_STATUS_DEFAULT,
  INPUT_TYPE_DEFAULT,
} from './Input.constants'
import type { InputEmits, InputExpose, InputProps, InputSlots } from './Input.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: INPUT_TYPE_DEFAULT,
  status: INPUT_STATUS_DEFAULT,
  disabled: false,
  readonly: false,
  clearable: false,
})
const emit = defineEmits<InputEmits>()
defineSlots<InputSlots>()

const slots = useSlots()

const classes = computed(() => [
  'ui-input',
  `ui-input--${props.status}`,
  {
    'ui-input--disabled': props.disabled,
    'ui-input--readonly': props.readonly,
  },
])

/** 清空按钮渲染条件：可清空 + 有值 + 非禁用/只读。 */
const canClear = computed(
  () => props.clearable && props.modelValue !== '' && !props.disabled && !props.readonly,
)

const inputEl = ref<HTMLInputElement | null>(null)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', '')
  emit('clear')
  // 清空后把焦点交还输入框，键盘用户可继续输入（客户端事件回调内的 DOM API）。
  inputEl.value?.focus()
}

function focus(options?: FocusOptions): void {
  inputEl.value?.focus(options)
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<InputExpose>({ focus, blur })
</script>

<template>
  <div :class="classes">
    <span v-if="slots.prefix" class="ui-input__prefix">
      <slot name="prefix" />
    </span>
    <input
      ref="inputEl"
      class="ui-input__control"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :aria-invalid="status === 'error' ? 'true' : undefined"
      v-bind="$attrs"
      @input="onInput"
    >
    <button
      v-if="canClear"
      type="button"
      class="ui-input__clear"
      :aria-label="INPUT_CLEAR_ARIA_LABEL"
      @click="onClear"
    >
      <svg
        class="ui-input__clear-icon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </button>
    <span v-if="slots.suffix" class="ui-input__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
/* ── 容器：结构 + token 化视觉（surface 底 / line 描边 / focus accent） ── */
.ui-input {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: 0 var(--ui-space-3);
  font-family: var(--ui-font-sans);
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-input:hover:not(.ui-input--disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点指示完全由容器承担——描边转 accent 别名 --ui-input-border-focus。
   内层原生 input 的全局 :focus-visible 焦点环须关闭（见 __control），
   否则会在容器描边内再叠一圈 outline，形成双重边框 */
.ui-input:focus-within {
  border-color: var(--ui-input-border-focus);
}

/* ── error 态：danger 描边，hover/focus 均保持 danger 优先于 accent ── */
.ui-input--error,
.ui-input--error:hover:not(.ui-input--disabled),
.ui-input--error:focus-within {
  border-color: var(--ui-danger);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-input--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

/* ── 原生输入框：描边由容器统一承担，自身只保留排版与颜色 ── */
.ui-input__control {
  flex: 1 1 auto;
  min-width: 0;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent;
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  padding: var(--ui-space-2) 0;
}

/* 关闭全局焦点环在内部 input 上的绘制：焦点指示由容器描边（--ui-input-border-focus）
   统一承担，避免容器描边与内层 outline 叠出双重边框（结构性重置：非视觉取值） */
.ui-input__control:focus-visible {
  outline: none;
}

.ui-input__control::placeholder {
  color: var(--ui-text-3);
}

.ui-input--disabled .ui-input__control {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── prefix / suffix：图标与单位容器（svg 尺寸 16/20/24 见 CONVENTIONS §2） ── */
.ui-input__prefix,
.ui-input__suffix {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-text-2);
}

.ui-input__prefix :deep(svg),
.ui-input__suffix :deep(svg) {
  width: 20px;
  height: 20px;
}

/* ── 清空按钮：原生 button，无填充无描边（结构性重置），色相走 token ── */
.ui-input__clear {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-3);
  cursor: pointer;
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-input__clear:hover {
  color: var(--ui-text-1);
}
</style>
