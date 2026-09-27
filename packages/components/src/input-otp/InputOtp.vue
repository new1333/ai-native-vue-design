<script setup lang="ts">
/**
 * InputOtp —— 验证码 / OTP 逐格输入组件：定长格子（每格原生 input）+ Paper 视觉（token-only）。
 *
 * - 逐格状态机收口于 useInputOtp：字符过滤（inputMode）、粘贴分发、Backspace 回退、
 *   值出口（update:modelValue / complete）均为纯逻辑；
 * - 自动前进与 DOM 收敛只发生在客户端事件回调内（handleInput / handlePaste / 键盘路径的返回值），
 *   setup 顶层与模块顶层不访问任何浏览器 API，node 环境 renderToString 无异常；
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到 role="group" 容器
 *   （id / aria-label / aria-describedby 等由此落位，供 FormField 接入）；
 *   每格 input 自带「第 N 位，共 M 位」aria-label，焦点环由格子描边承担；
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useSlots } from 'vue'
import {
  INPUT_OTP_CELL_AUTOCOMPLETE,
  INPUT_OTP_INPUT_MODE_DEFAULT,
  INPUT_OTP_LENGTH_DEFAULT,
  inputOtpCellAriaLabel,
} from './InputOtp.constants'
import { useInputOtp } from './useInputOtp'
import type { InputOtpWriteResult } from './useInputOtp'
import type {
  InputOtpEmits,
  InputOtpExpose,
  InputOtpProps,
  InputOtpSlots,
} from './InputOtp.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputOtpProps>(), {
  modelValue: '',
  length: INPUT_OTP_LENGTH_DEFAULT,
  masked: false,
  inputMode: INPUT_OTP_INPUT_MODE_DEFAULT,
  disabled: false,
})
const emit = defineEmits<InputOtpEmits>()
defineSlots<InputOtpSlots>()

const slots = useSlots()

const { effectiveLength, chars, handleInput, handlePaste, handleKeydown } = useInputOtp({
  modelValue: () => props.modelValue,
  length: () => props.length,
  inputMode: () => props.inputMode,
  disabled: () => props.disabled,
  onChange: (next) => emit('update:modelValue', next),
  onComplete: (next) => emit('complete', next),
  onFocusCell: (index) => {
    // 仅键盘事件回调内被调用（客户端焦点管理）。
    cellEls.value[index]?.focus()
  },
})

const classes = computed(() => [
  'ui-input-otp',
  {
    'ui-input-otp--disabled': props.disabled,
  },
])

/** 各格 input 元素引用（函数 ref 收集；unmount 时以 null 回调清位）。 */
const cellEls = ref<Array<HTMLInputElement | null>>([])

function setCellRef(el: unknown, index: number): void {
  cellEls.value[index] = (el as HTMLInputElement | null) ?? null
}

/** 写路径的 DOM 收敛 + 焦点落位：仅在客户端事件回调内被调用。 */
function applyWriteResult(result: InputOtpWriteResult): void {
  result.cells.forEach((cellValue, index) => {
    const el = cellEls.value[index]
    if (el && el.value !== cellValue) el.value = cellValue
  })
  if (result.focusIndex !== null) cellEls.value[result.focusIndex]?.focus()
}

function onCellInput(index: number, event: Event): void {
  const result = handleInput(index, event)
  if (result) applyWriteResult(result)
}

function onCellKeydown(index: number, event: KeyboardEvent): void {
  handleKeydown(index, event)
}

function onCellPaste(index: number, event: ClipboardEvent): void {
  const result = handlePaste(index, event)
  if (result) applyWriteResult(result)
}

/** 聚焦即全选已有字符：直接键入即覆盖（客户端事件回调内的 DOM API）。 */
function onCellFocus(event: FocusEvent): void {
  ;(event.target as HTMLInputElement).select()
}

function focus(index = 0): void {
  cellEls.value[index]?.focus()
}

function blur(): void {
  cellEls.value.forEach((el) => el?.blur())
}

defineExpose<InputOtpExpose>({ focus, blur })
</script>

<template>
  <div :class="classes" role="group" v-bind="$attrs">
    <template v-for="(char, index) in chars" :key="index">
      <input
        :ref="(el) => setCellRef(el, index)"
        class="ui-input-otp__cell"
        :type="masked ? 'password' : 'text'"
        :inputmode="inputMode === 'numeric' ? 'numeric' : 'text'"
        :maxlength="1"
        :value="char"
        :disabled="disabled"
        :autocomplete="index === 0 ? INPUT_OTP_CELL_AUTOCOMPLETE : undefined"
        :aria-label="inputOtpCellAriaLabel(index, effectiveLength)"
        @input="onCellInput(index, $event)"
        @keydown="onCellKeydown(index, $event)"
        @paste="onCellPaste(index, $event)"
        @focus="onCellFocus"
      >
      <span
        v-if="slots.separator && index < effectiveLength - 1"
        class="ui-input-otp__separator"
        aria-hidden="true"
      >
        <slot name="separator" />
      </span>
    </template>
  </div>
</template>

<style scoped>
/* ── 容器：格子与分隔符的排布容器（无边框，描边由每格自行承担） ── */
.ui-input-otp {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-sans);
}

/* ── 单格：原生 input，定长方格（结构尺寸 48 消费 --ui-space-7） ── */
.ui-input-otp__cell {
  box-sizing: border-box;
  flex: none;
  width: var(--ui-space-7);
  height: var(--ui-space-7);
  padding: 0; /* 结构性重置：非视觉取值 */
  text-align: center;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-lg);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-input-otp__cell:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* 焦点指示由格子描边统一承担（转 accent 别名 --ui-input-border-focus）：
   关闭全局 :focus-visible 焦点环，避免描边与 outline 叠出双重边框
   （结构性重置：非视觉取值；描边变化即等价的焦点指示） */
.ui-input-otp__cell:focus {
  outline: none;
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-input-otp--disabled .ui-input-otp__cell {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 格间分隔符：装饰内容（aria-hidden），通常是分组符号 ── */
.ui-input-otp__separator {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
}
</style>
