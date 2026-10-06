<script setup lang="ts">
/**
 * Textarea —— 多行文本输入组件：容器（原生 textarea / 清空按钮 / 字数统计）+ Paper 视觉（token-only）。
 *
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到原生 textarea
 *   （id / name / aria-describedby 等由此直达控件，供 FormField 接入，同 Input 先例）。
 * - status="error" 推导 aria-invalid="true"，容器描边转 danger。
 * - showCount 在容器右下角以弱文字显示字数：配 maxlength 为 x/y，否则为 x。
 * - 清空按钮为原生 button（type=button、aria-label="清空"，同 Input 先例）：
 *   有值且非 disabled/readonly 时渲染；mousedown preventDefault 保住输入区焦点，
 *   点击清值（update:modelValue("") + clear）并把焦点交还 textarea。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref } from 'vue'
import {
  TEXTAREA_CLEAR_ARIA_LABEL,
  TEXTAREA_RESIZE_DEFAULT,
  TEXTAREA_ROWS_DEFAULT,
  TEXTAREA_STATUS_DEFAULT,
} from './Textarea.constants'
import type { TextareaEmits, TextareaExpose, TextareaProps, TextareaSlots } from './Textarea.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
  rows: TEXTAREA_ROWS_DEFAULT,
  resize: TEXTAREA_RESIZE_DEFAULT,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  maxlength: undefined,
  showCount: false,
  status: TEXTAREA_STATUS_DEFAULT,
  clearable: false,
})
const emit = defineEmits<TextareaEmits>()
defineSlots<TextareaSlots>()

const classes = computed(() => [
  'ui-textarea',
  `ui-textarea--${props.status}`,
  `ui-textarea--resize-${props.resize}`,
  {
    'ui-textarea--disabled': props.disabled,
    'ui-textarea--readonly': props.readonly,
  },
])

/** 字数统计文案：配 maxlength 时 x/y，否则仅 x。 */
const countText = computed(() => {
  const current = props.modelValue.length
  return props.maxlength === undefined ? `${current}` : `${current}/${props.maxlength}`
})

/** 清空按钮渲染条件：可清空 + 有值 + 非禁用/只读（同 Input 的 canClear）。 */
const canClear = computed(
  () => props.clearable && props.modelValue !== '' && !props.disabled && !props.readonly,
)

const textareaEl = ref<HTMLTextAreaElement | null>(null)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', '')
  emit('clear')
  // 清空后把焦点交还输入区，键盘用户可继续输入（客户端事件回调内的 DOM API）。
  textareaEl.value?.focus()
}

function focus(options?: FocusOptions): void {
  textareaEl.value?.focus(options)
}

function blur(): void {
  textareaEl.value?.blur()
}

defineExpose<TextareaExpose>({ focus, blur })
</script>

<template>
  <div :class="classes">
    <textarea
      ref="textareaEl"
      class="ui-textarea__control"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :aria-invalid="status === 'error' ? 'true' : undefined"
      v-bind="$attrs"
      @input="onInput"
    />
    <div v-if="canClear || showCount" class="ui-textarea__meta">
      <button
        v-if="canClear"
        type="button"
        class="ui-textarea__clear"
        :aria-label="TEXTAREA_CLEAR_ARIA_LABEL"
        @mousedown.prevent
        @click="onClear"
      >
        <svg
          class="ui-textarea__clear-icon"
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
      <span v-if="showCount" class="ui-textarea__count">{{ countText }}</span>
    </div>
  </div>
</template>

<style scoped>
/* ── 容器：结构 + token 化视觉（surface 底 / line 描边 / focus accent） ── */
.ui-textarea {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-family: var(--ui-font-sans);
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-textarea:hover:not(.ui-textarea--disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：遵循全局 accent 约定——焦点环由 paper.css 的 :focus-visible 提供（不改写 outline），
   容器描边经 :focus-within 同步转 accent 别名 --ui-input-border-focus */
.ui-textarea:focus-within {
  border-color: var(--ui-input-border-focus);
}

/* ── error 态：danger 描边，hover/focus 均保持 danger 优先于 accent ── */
.ui-textarea--error,
.ui-textarea--error:hover:not(.ui-textarea--disabled),
.ui-textarea--error:focus-within {
  border-color: var(--ui-danger);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-textarea--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

/* ── 原生多行输入区：描边由容器统一承担，自身只保留排版与颜色 ── */
.ui-textarea__control {
  display: block;
  box-sizing: border-box;
  width: 100%;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent;
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  padding: var(--ui-space-2) 0;
  /* 默认锁定拉伸；仅 vertical 档放开（垂直方向），横向拉伸会破坏容器栅格 */
  resize: none;
}

.ui-textarea--resize-vertical .ui-textarea__control {
  resize: vertical;
}

.ui-textarea__control::placeholder {
  color: var(--ui-text-3);
}

.ui-textarea--disabled .ui-textarea__control {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 底部元信息行：清空按钮 + 字数统计右下角排布（任一存在才渲染） ── */
.ui-textarea__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-space-2);
}

/* ── 清空按钮：原生 button，无填充无描边（结构性重置），色相走 token（同 Input 先例） ── */
.ui-textarea__clear {
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

.ui-textarea__clear:hover {
  color: var(--ui-text-1);
}

/* ── 字数统计：右下角弱文字（text-3 + xs + tabular-nums，宽度跳动小） ── */
.ui-textarea__count {
  align-self: flex-end;
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
  line-height: var(--ui-leading-small);
}
</style>
