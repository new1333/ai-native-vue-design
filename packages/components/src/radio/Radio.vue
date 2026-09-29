<script setup lang="ts">
/**
 * Radio —— 单选项：原生 input[type=radio]，name / 选中 / 整组禁用来自 RadioGroup 注入。
 *
 * - 键盘行为 100% 原生：同 name 组内方向键移动、Space 选中均为浏览器实现，
 *   组件不绑定任何 keydown（也不改写 tabindex）。
 * - 根为 label 元素：点击文本即选中，无需 id/for。
 * - attrs 透传：inheritAttrs:false，$attrs 合并到原生 radio（同 Input 家族先例）。
 * - 选中态视觉由组受控值驱动（ui-radio--checked）；圆点动效走 --ui-motion-* token。
 * - 脱离组独立使用：注入不到上下文时退化为无 name 的原生 radio（不推荐，不抛错）。
 */
import { computed, inject, ref, useSlots } from 'vue'
import { RADIO_GROUP_CONTEXT_KEY } from './Radio.constants'
import type { RadioExpose, RadioProps, RadioSlots } from './Radio.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<RadioProps>(), {
  label: undefined,
  disabled: false,
})
defineSlots<RadioSlots>()

const slots = useSlots()
const inputEl = ref<HTMLInputElement | null>(null)
const group = inject(RADIO_GROUP_CONTEXT_KEY, undefined)

const inputName = computed(() => group?.name.value)
const disabled = computed(() => props.disabled || (group?.disabled.value ?? false))
/** 选中态完全由组受控值派生（多选一互斥由原生 name 语义兜底）。 */
const checked = computed(() => group !== undefined && group.modelValue.value === props.value)

const classes = computed(() => [
  'ui-radio',
  {
    'ui-radio--checked': checked.value,
    'ui-radio--disabled': disabled.value,
  },
])

/** label 内容可见性：label prop 或默认插槽至少其一。 */
const hasLabel = computed(() => props.label !== undefined || slots.default !== undefined)

function onChange(): void {
  // 原生 disabled 已拦截用户路径；这里兜底直接派发的合成事件（同家族 guard 思路）。
  if (disabled.value) return
  group?.select(props.value)
}

function focus(options?: FocusOptions): void {
  inputEl.value?.focus(options)
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<RadioExpose>({ focus, blur })
</script>

<template>
  <label :class="classes">
    <span class="ui-radio__box">
      <input
        ref="inputEl"
        class="ui-radio__control"
        type="radio"
        :name="inputName"
        :value="value"
        :checked="checked"
        :disabled="disabled"
        v-bind="$attrs"
        @change="onChange"
      >
      <span class="ui-radio__dot" aria-hidden="true" />
    </span>
    <span v-if="hasLabel" class="ui-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
/* ── 根（label 元素）：点击文本即选中（原生 label 关联） ─────────────── */
.ui-radio {
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

.ui-radio:hover:not(.ui-radio--checked):not(.ui-radio--disabled) .ui-radio__box::before {
  /* hover 描边用 control-strong 档：相对 rest 描边真实加深一档，两档主题下均有可见分层 */
  border-color: var(--ui-border-control-strong);
}

/* ── 圆形框：自绘视觉的定位容器（16px = 图标最小档，结构性尺寸） ────── */
.ui-radio__box {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: var(--ui-space-4);
  block-size: var(--ui-space-4);
}

.ui-radio__box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-width: 1px; /* 结构性细线（无 --ui-border-width token，随 Button/Input/Checkbox 先例提出需求） */
  border-style: solid;
  /* 未选态描边用 control 专用档（对底色 ≥3:1，WCAG 1.4.11 非文本对比），不用通用 line-strong */
  border-color: var(--ui-border-control);
  /* 16px 方寸下半径 8px 即圆形（无圆形半径 token，半径取自间距 token 的二分之一） */
  border-radius: calc(var(--ui-space-4) / 2);
  background-color: var(--ui-surface);
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 原生控件：绝对定位铺满圆框（点击/焦点热区），opacity 结构性隐藏；
   语义（checked/disabled/原生键盘）与全局 :focus-visible 焦点环仍归属它 ── */
.ui-radio__control {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  opacity: 0; /* 结构性隐藏：非视觉取值 */
  cursor: inherit;
}

/* ── 选中：accent 实底 + on-accent 圆点（动效走 --ui-motion-* token） ── */
.ui-radio--checked .ui-radio__box::before {
  border-color: var(--ui-accent);
  background-color: var(--ui-accent);
}

.ui-radio__dot {
  position: absolute;
  inset: 0;
  margin: auto;
  inline-size: calc(var(--ui-space-4) / 2);
  block-size: calc(var(--ui-space-4) / 2);
  border-radius: calc(var(--ui-space-4) / 2);
  background-color: var(--ui-on-accent);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-radio--checked .ui-radio__dot {
  opacity: 1;
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ────── */
.ui-radio--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-radio--disabled .ui-radio__box::before {
  border-color: var(--ui-border);
  background-color: var(--ui-surface-muted);
}

.ui-radio--disabled .ui-radio__dot {
  background-color: var(--ui-text-3);
}

.ui-radio__label {
  min-width: 0;
}
</style>
