<script setup lang="ts">
/**
 * PromptInput —— AI 提示词输入框：自适应高度多行输入（maxRows 封顶）
 * + Enter 发送 / Shift+Enter 换行 + 加载中停止（cancel）+ Paper 视觉（token-only）。
 *
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到原生 textarea
 *   （id / aria-label / aria-describedby 等由此直达控件，同 Input/Textarea 先例）。
 * - Enter 发送：仅当 submitOnEnter 且可提交（非空、非禁用、非加载）时拦截
 *   preventDefault 并发出 submit；Shift+Enter 与 IME 组合中的 Enter 走原生换行/确认。
 * - loading：内建发送按钮切换为停止按钮（点击发出 cancel），键盘可达。
 * - 纯受控：submit 不自动清空输入，由使用方经 v-model 置空。
 * - 自适应高度：usePromptInputAutosize 在 mounted 后测量（SSR 不测量），
 *   行数上限以 max-height（token 推导 calc）表达，SSR 即可输出。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useSlots } from 'vue'
import {
  PROMPT_INPUT_ENTER_KEY,
  PROMPT_INPUT_MAX_ROWS_DEFAULT,
  PROMPT_INPUT_STOP_ARIA_LABEL,
  PROMPT_INPUT_SUBMIT_ARIA_LABEL,
  PROMPT_INPUT_SUBMIT_ON_ENTER_DEFAULT,
} from './PromptInput.constants'
import { usePromptInputAutosize } from './usePromptInputAutosize'
import type {
  PromptInputEmits,
  PromptInputExpose,
  PromptInputProps,
  PromptInputSlots,
} from './PromptInput.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PromptInputProps>(), {
  modelValue: '',
  placeholder: undefined,
  maxRows: PROMPT_INPUT_MAX_ROWS_DEFAULT,
  submitOnEnter: PROMPT_INPUT_SUBMIT_ON_ENTER_DEFAULT,
  disabled: false,
  loading: false,
})
const emit = defineEmits<PromptInputEmits>()
defineSlots<PromptInputSlots>()

const slots = useSlots()

const classes = computed(() => [
  'ui-prompt-input',
  {
    'ui-prompt-input--disabled': props.disabled,
    'ui-prompt-input--loading': props.loading,
  },
])

/**
 * 自适应上限：max-height 以 token 推导（字号 × 行高 × 行数），
 * 行数是逻辑量而非视觉取值，随 props.maxRows 响应式更新，SSR 即可输出。
 */
const maxHeightStyle = computed(
  () => `calc(var(--ui-text-md) * var(--ui-leading-small) * ${props.maxRows})`,
)

const controlEl = ref<HTMLTextAreaElement | null>(null)

usePromptInputAutosize({ control: controlEl, source: () => props.modelValue })

/** IME 组合输入中：Enter 用于确认候选词，不得触发发送（组合事件路径跟踪）。 */
const composing = ref(false)

/** 有可提交文本（非空白）。 */
const hasText = computed(() => props.modelValue.trim().length > 0)
/** 发送可用：非禁用、非加载中、有文本。 */
const canSubmit = computed(() => !props.disabled && !props.loading && hasText.value)
/** 停止可用：加载中且非禁用。 */
const canStop = computed(() => props.loading && !props.disabled)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function doSubmit(): void {
  emit('submit', props.modelValue)
}

/** Enter 键路径：Shift+Enter 换行、IME 组合确认均走原生，不拦截。 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== PROMPT_INPUT_ENTER_KEY) return
  if (event.shiftKey || composing.value || event.isComposing) return
  if (!props.submitOnEnter || !canSubmit.value) return
  event.preventDefault()
  doSubmit()
}

function onCompositionStart(): void {
  composing.value = true
}

function onCompositionEnd(): void {
  composing.value = false
}

/** 内建发送/停止按钮：loading 时为停止（发出 cancel），否则为发送。 */
function onActionClick(): void {
  if (props.loading) {
    if (!canStop.value) return
    emit('cancel')
    return
  }
  if (!canSubmit.value) return
  doSubmit()
}

function focus(options?: FocusOptions): void {
  controlEl.value?.focus(options)
}

function blur(): void {
  controlEl.value?.blur()
}

defineExpose<PromptInputExpose>({ focus, blur })
</script>

<template>
  <div :class="classes">
    <div v-if="slots.prefix" class="ui-prompt-input__prefix">
      <slot name="prefix" />
    </div>
    <textarea
      ref="controlEl"
      class="ui-prompt-input__control"
      rows="1"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :style="{ maxHeight: maxHeightStyle }"
      v-bind="$attrs"
      @input="onInput"
      @keydown="onKeydown"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />
    <div class="ui-prompt-input__footer">
      <div v-if="slots.suffix" class="ui-prompt-input__suffix">
        <slot name="suffix" />
      </div>
      <div class="ui-prompt-input__actions">
        <slot name="actions" />
        <button
          type="button"
          class="ui-prompt-input__send"
          :aria-label="loading ? PROMPT_INPUT_STOP_ARIA_LABEL : PROMPT_INPUT_SUBMIT_ARIA_LABEL"
          :disabled="loading ? !canStop : !canSubmit"
          @click="onActionClick"
        >
          <svg
            v-if="loading"
            class="ui-prompt-input__send-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="7" y="7" width="10" height="10" stroke-linejoin="round" />
          </svg>
          <svg
            v-else
            class="ui-prompt-input__send-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 19V5" stroke-linecap="round" />
            <path d="M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 容器：结构 + token 化视觉（surface 底 / line 描边 / focus accent） ── */
.ui-prompt-input {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input/Textarea 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: var(--ui-space-2) var(--ui-space-3);
  font-family: var(--ui-font-sans);
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-prompt-input:hover:not(.ui-prompt-input--disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点指示由容器承担——描边经 :focus-within 同步转 accent 别名
   --ui-input-border-focus（全局 :focus-visible 焦点环留给内建按钮），同 Input 先例 */
.ui-prompt-input:focus-within {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-prompt-input--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

/* ── prefix：输入区上方内容（附件、上下文标签等使用方内容） ── */
.ui-prompt-input__prefix {
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── 原生多行输入区：描边由容器统一承担；高度由 usePromptInputAutosize 写回，
      行数上限由 max-height（token 推导 calc）钳制，超出内部滚动 ── */
.ui-prompt-input__control {
  display: block;
  box-sizing: border-box;
  width: 100%;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent;
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  padding: 0; /* 结构性重置：纵向留白由容器承担，保证 max-height 精确等于行数上限 */
  resize: none; /* 结构性锁定拉伸：高度由自适应逻辑接管 */
  overflow-y: auto;
}

/* 关闭全局焦点环在内层 textarea 上的绘制：焦点指示由容器描边（--ui-input-border-focus）
   统一承担，避免双重边框（结构性重置，同 Input 先例） */
.ui-prompt-input__control:focus-visible {
  outline: none;
}

.ui-prompt-input__control::placeholder {
  color: var(--ui-text-3);
}

.ui-prompt-input--disabled .ui-prompt-input__control {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 底部操作区：左（suffix 弱信息）/ 右（actions + 内建发送/停止） ── */
.ui-prompt-input__footer {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-prompt-input__suffix {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

.ui-prompt-input__actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--ui-space-2);
  margin-left: auto;
}

/* ── 内建发送/停止按钮：主操作 accent 底（同 Button primary 的 token 取值），
      盒尺寸由 padding token 撑开（16px 图标 + space-2 内距） ── */
.ui-prompt-input__send {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: none; /* 结构性重置：非视觉取值 */
  padding: var(--ui-space-2);
  border-radius: var(--ui-button-radius);
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-prompt-input__send:hover:not(:disabled) {
  background-color: var(--ui-accent-hover);
}

.ui-prompt-input__send:disabled {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-3);
  cursor: not-allowed;
}
</style>
