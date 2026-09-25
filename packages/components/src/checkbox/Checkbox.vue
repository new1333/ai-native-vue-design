<script setup lang="ts">
/**
 * Checkbox —— 勾选框：原生 input[type=checkbox] 语义 + Paper 自绘方块视觉（token-only）。
 *
 * - 语义：原生 checkbox 承载 checked / disabled / 焦点与键盘（Space 切换）；
 *   根为 label 元素，点击文本即切换，无需 id/for 关联。
 * - 视觉：原生控件绝对定位铺满自绘方块（opacity:0 结构性隐藏，焦点环仍由
 *   全局 :focus-visible 绘制在其热区上）；勾选/半选标记由根修饰类驱动。
 * - indeterminate 是 DOM property（非 attribute）：SSR 无法表达，仅在客户端
 *   onMounted 与 watch 中同步到原生控件；渲染期无副作用。
 * - attrs 透传：inheritAttrs:false，$attrs 全量合并到原生 checkbox
 *   （id / name / aria-describedby 等由此直达控件，同 Input 家族先例）。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onMounted, ref, useSlots, watch } from 'vue'
import type { CheckboxEmits, CheckboxExpose, CheckboxProps, CheckboxSlots } from './Checkbox.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  indeterminate: false,
  label: undefined,
  disabled: false,
})
const emit = defineEmits<CheckboxEmits>()
defineSlots<CheckboxSlots>()

const slots = useSlots()

const inputEl = ref<HTMLInputElement | null>(null)

/** indeterminate 同步：仅客户端执行（onMounted / watch 回调），SSR 渲染期不触碰 DOM。 */
function syncIndeterminate(): void {
  if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
}

onMounted(syncIndeterminate)
watch(() => props.indeterminate, syncIndeterminate)

const classes = computed(() => [
  'ui-checkbox',
  {
    'ui-checkbox--checked': props.modelValue,
    'ui-checkbox--indeterminate': props.indeterminate,
    'ui-checkbox--disabled': props.disabled,
  },
])

/** label 内容可见性：label prop 或默认插槽至少其一。 */
const hasLabel = computed(() => props.label !== undefined || slots.default !== undefined)

function onChange(event: Event): void {
  // 原生 disabled 已拦截用户路径；这里兜底直接派发的合成事件（同 Button guardClick 思路）。
  if (props.disabled) return
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}

function focus(options?: FocusOptions): void {
  inputEl.value?.focus(options)
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<CheckboxExpose>({ focus, blur })
</script>

<template>
  <label :class="classes">
    <span class="ui-checkbox__box">
      <input
        ref="inputEl"
        class="ui-checkbox__control"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        v-bind="$attrs"
        @change="onChange"
      >
      <svg
        class="ui-checkbox__mark ui-checkbox__mark--check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg
        class="ui-checkbox__mark ui-checkbox__mark--dash"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 12h12" stroke-linecap="round" />
      </svg>
    </span>
    <span v-if="hasLabel" class="ui-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
/* ── 根（label 元素）：点击文本即切换（原生 label 关联） ─────────────── */
.ui-checkbox {
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
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-checkbox:hover:not(.ui-checkbox--disabled) .ui-checkbox__box::before {
  border-color: var(--ui-border-strong);
}

/* ── 方块：自绘视觉的定位容器（16px = 图标最小档，结构性尺寸） ──────── */
.ui-checkbox__box {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: var(--ui-space-4);
  block-size: var(--ui-space-4);
}

/* 视觉方块由伪元素绘制，checked/indeterminate 态由根修饰类（受控 props）驱动 */
.ui-checkbox__box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-width: 1px; /* 结构性细线（无 --ui-border-width token，随 Button/Input 先例提出需求） */
  border-style: solid;
  border-color: var(--ui-border-strong);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface);
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 原生控件：绝对定位铺满方块（点击/焦点热区），opacity 结构性隐藏；
   语义（checked/disabled/键盘）与全局 :focus-visible 焦点环仍归属它 ── */
.ui-checkbox__control {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  opacity: 0; /* 结构性隐藏：非视觉取值 */
  cursor: inherit;
}

/* ── 勾选 / 半选：accent 实底，半选优先于勾选展示（对齐原生行为） ──── */
.ui-checkbox--checked .ui-checkbox__box::before,
.ui-checkbox--indeterminate .ui-checkbox__box::before {
  border-color: var(--ui-accent);
  background-color: var(--ui-accent);
}

.ui-checkbox__mark {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  color: var(--ui-on-accent);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-checkbox--checked .ui-checkbox__mark--check {
  opacity: 1;
}

.ui-checkbox--indeterminate .ui-checkbox__mark--dash {
  opacity: 1;
}

/* 半选优先：同一时刻勾选标记让位于短横线 */
.ui-checkbox--indeterminate .ui-checkbox__mark--check {
  opacity: 0;
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ────── */
.ui-checkbox--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-checkbox--disabled .ui-checkbox__box::before {
  border-color: var(--ui-border);
  background-color: var(--ui-surface-muted);
}

.ui-checkbox--disabled .ui-checkbox__mark {
  color: var(--ui-text-3);
}

.ui-checkbox__label {
  min-width: 0;
}
</style>
