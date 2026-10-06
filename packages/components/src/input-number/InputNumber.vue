<script setup lang="ts">
/**
 * InputNumber —— 数字输入组件：容器（prefix / 原生 input[role=spinbutton] / 增减按钮 / suffix）
 * + Paper 视觉（token-only）。
 *
 * - 步进/范围/精度：数值状态机收口于 useInputNumber（钳制、取整、草稿提交均在此）。
 * - spinbutton 语义：原生 input + role="spinbutton" + aria-valuemin/max/now/valuetext；
 *   ↑/↓ 逐 step、PageUp/PageDown 跨 step×10、Home/End 跳 min/max、Enter 提交草稿。
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到原生 input（id / aria-label /
 *   aria-describedby 等由此直达输入框，供 FormField 接入）。
 * - 增减按钮为原生 button（type=button、aria-label），点击步进；组件禁用或值抵达
 *   对应边界（value<=min 减 / value>=max 加）时原生 disabled（键盘路径钳制不变）。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useSlots } from 'vue'
import {
  INPUT_NUMBER_DECREASE_ARIA_LABEL,
  INPUT_NUMBER_INCREASE_ARIA_LABEL,
  INPUT_NUMBER_STEP_DEFAULT,
} from './InputNumber.constants'
import { useInputNumber } from './useInputNumber'
import type {
  InputNumberEmits,
  InputNumberExpose,
  InputNumberProps,
  InputNumberSlots,
} from './InputNumber.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputNumberProps>(), {
  modelValue: null,
  min: undefined,
  max: undefined,
  step: INPUT_NUMBER_STEP_DEFAULT,
  precision: undefined,
  controls: true,
  disabled: false,
})
const emit = defineEmits<InputNumberEmits>()
defineSlots<InputNumberSlots>()

const slots = useSlots()

const {
  value,
  formatted,
  editingText,
  handleInput,
  handleKeydown,
  commit,
  stepBy,
} = useInputNumber({
  modelValue: () => props.modelValue,
  min: () => props.min,
  max: () => props.max,
  step: () => props.step,
  precision: () => props.precision,
  disabled: () => props.disabled,
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
  onStep: (direction, next) => emit('step', direction, next),
})

const classes = computed(() => [
  'ui-input-number',
  {
    'ui-input-number--disabled': props.disabled,
  },
])

/** 输入框呈现文本：编辑期展示草稿原文，其余时刻展示格式化生效值。 */
const inputText = computed(() => editingText.value ?? formatted.value)

/** spinbutton aria：边界未定义/值为空时不渲染对应属性。 */
const ariaValueMin = computed(() => (props.min !== undefined ? String(props.min) : undefined))
const ariaValueMax = computed(() => (props.max !== undefined ? String(props.max) : undefined))
const ariaValueNow = computed(() => (value.value !== null ? String(value.value) : undefined))
const ariaValueText = computed(() => (value.value !== null ? formatted.value : undefined))

/** 边界禁用：生效值抵达下/上界时对应步进按钮禁用（已无步进空间）；空值不参与（空值步进是确定性入口，见 useInputNumber）。 */
const decreaseDisabled = computed(
  () =>
    props.disabled ||
    (value.value !== null && props.min !== undefined && value.value <= props.min),
)
const increaseDisabled = computed(
  () =>
    props.disabled ||
    (value.value !== null && props.max !== undefined && value.value >= props.max),
)

const inputEl = ref<HTMLInputElement | null>(null)

function focus(options?: FocusOptions): void {
  inputEl.value?.focus(options)
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<InputNumberExpose>({ focus, blur })
</script>

<template>
  <div :class="classes">
    <span v-if="slots.prefix" class="ui-input-number__prefix">
      <slot name="prefix" />
    </span>
    <input
      ref="inputEl"
      class="ui-input-number__control"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      :value="inputText"
      :disabled="disabled"
      :aria-valuemin="ariaValueMin"
      :aria-valuemax="ariaValueMax"
      :aria-valuenow="ariaValueNow"
      :aria-valuetext="ariaValueText"
      v-bind="$attrs"
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="commit"
    >
    <template v-if="controls">
      <button
        type="button"
        class="ui-input-number__decrease"
        :aria-label="INPUT_NUMBER_DECREASE_ARIA_LABEL"
        :disabled="decreaseDisabled"
        @click="stepBy('down')"
      >
        <svg
          class="ui-input-number__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 12h14" stroke-linecap="round" />
        </svg>
      </button>
      <button
        type="button"
        class="ui-input-number__increase"
        :aria-label="INPUT_NUMBER_INCREASE_ARIA_LABEL"
        :disabled="increaseDisabled"
        @click="stepBy('up')"
      >
        <svg
          class="ui-input-number__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
      </button>
    </template>
    <span v-if="slots.suffix" class="ui-input-number__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
/* ── 容器：结构 + token 化视觉（surface 底 / line 描边 / focus accent），与 ui-input 同族 ── */
.ui-input-number {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input 先例在任务结果中提出需求） */
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

.ui-input-number:hover:not(.ui-input-number--disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点指示由容器承担——描边转 accent 别名 --ui-input-border-focus；
   内层原生 input 的全局 :focus-visible 焦点环须关闭（见 __control），避免双重边框 */
.ui-input-number:focus-within {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-input-number--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

/* ── 原生输入框：描边由容器统一承担，自身只保留排版与颜色；数字用等宽数位对齐 ── */
.ui-input-number__control {
  flex: 1 1 auto;
  min-width: 0;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent;
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
  padding: var(--ui-space-2) 0;
}

/* 关闭全局焦点环在内部 input 上的绘制：焦点指示由容器描边（--ui-input-border-focus）
   统一承担，避免容器描边与内层 outline 叠出双重边框（结构性重置：非视觉取值） */
.ui-input-number__control:focus-visible {
  outline: none;
}

.ui-input-number--disabled .ui-input-number__control {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── prefix / suffix：图标与单位容器（svg 尺寸 16/20/24 见 CONVENTIONS §2） ── */
.ui-input-number__prefix,
.ui-input-number__suffix {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-text-2);
}

.ui-input-number__prefix :deep(svg),
.ui-input-number__suffix :deep(svg) {
  /* 图标结构尺寸 20，属 CONVENTIONS §2 Icon Token 允许档位（16/20/24） */
  width: 20px;
  height: 20px;
}

/* ── 增减按钮：原生 button，无填充无描边（结构性重置），色相走 token ── */
.ui-input-number__decrease,
.ui-input-number__increase {
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

.ui-input-number__decrease:hover:not(:disabled),
.ui-input-number__increase:hover:not(:disabled) {
  color: var(--ui-text-1);
}

.ui-input-number__decrease:disabled,
.ui-input-number__increase:disabled {
  cursor: not-allowed;
}
</style>
