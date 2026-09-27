<script setup lang="ts">
/**
 * Rating —— 星级评分：radiogroup 语义的单值选择控件 + Paper 视觉（token-only）。
 *
 * - 语义：根 role="radiogroup"（attrs 的 aria-label 等落根容器）；每档一枚
 *   原生 button 承载 role="radio" 与 aria-checked（true/false 常驻）。
 *   allowHalf 时每颗星拆为左右两个半档 radio（半档 = 0.5）。
 * - 键盘：←→↑↓ 步进到相邻档并选中（preventDefault，焦点随动，roving tabindex）；
 *   Enter/Space 走原生 button 激活路径（click），组件不拦截。
 * - 悬停：进入档位做填充预览并发出 hoverChange(档位值)；离开根容器复位为
 *   hoverChange(undefined)；只读态不响应悬停。
 * - readonly：aria-readonly="true" + 全部交互路径守卫 + 全档 tabindex=-1（移出 Tab 序）。
 * - 受控组件：视觉完全由 modelValue（或悬停预览）派生，须以 v-model 使用。
 * - 图标层为纯视觉（aria-hidden）：默认星形为内联 SVG（viewBox 0 0 24 24 /
 *   stroke-width 1.5 / currentColor），填充 --ui-warning、空星 --ui-text-3；
 *   半星以 clip-path 结构性裁切左半。icon 插槽可整体替换。
 */
import { computed, ref } from 'vue'
import {
  RATING_ARIA_UNIT,
  RATING_DECREASE_KEYS,
  RATING_FULL_STEP,
  RATING_HALF_STEP,
  RATING_INCREASE_KEYS,
} from './Rating.constants'
import type {
  RatingEmits,
  RatingExpose,
  RatingIconState,
  RatingProps,
  RatingSlots,
} from './Rating.types'

const props = withDefaults(defineProps<RatingProps>(), {
  modelValue: undefined,
  count: 5,
  allowHalf: false,
  readonly: false,
  clearable: false,
})
const emit = defineEmits<RatingEmits>()
defineSlots<RatingSlots>()

/** 悬停预览档位（指针悬停期间的临时值；离开根容器复位 undefined）。 */
const hoverValue = ref<number | undefined>(undefined)

/** 步进粒度：allowHalf 时 0.5，否则 1。 */
const stepUnit = computed(() => (props.allowHalf ? RATING_HALF_STEP : RATING_FULL_STEP))

/** 星数（向下取整；非正数不渲染任何星）。 */
const starCount = computed(() => Math.max(0, Math.floor(props.count)))

/** 全部档位值（升序）：整星 1..count；半星 0.5, 1, 1.5, …, count。 */
const steps = computed<number[]>(() =>
  Array.from(
    { length: starCount.value * (props.allowHalf ? 2 : 1) },
    (_, i) => (i + 1) * stepUnit.value,
  ),
)

/** 最大档位（= 星数）。 */
const maxStep = computed(() => steps.value[steps.value.length - 1] ?? 0)

/** 生效值：悬停预览优先，其次受控值；均无时 0 = 全空。 */
const effectiveValue = computed(() => hoverValue.value ?? props.modelValue ?? 0)

/** 单档渲染模型（内部）：档位值 / 视觉修饰（lead = 左半档，trail = 右半档）。 */
interface RadioModel {
  step: number
  modifier: 'lead' | 'trail' | null
}

/** 每颗星的渲染模型：星序号（icon 作用域）/ 填充态 / 覆盖其上的档位按钮。 */
interface StarModel {
  star: number
  state: RatingIconState
  radios: RadioModel[]
}

const starModels = computed<StarModel[]>(() => {
  const fill = effectiveValue.value
  const half = props.allowHalf
  return Array.from({ length: starCount.value }, (_, i) => {
    const star = i + 1
    const state: RatingIconState =
      fill >= star ? 'full' : half && fill >= star - RATING_HALF_STEP ? 'half' : 'empty'
    return {
      star,
      state,
      radios: half
        ? [
            { step: star - RATING_HALF_STEP, modifier: 'lead' as const },
            { step: star, modifier: 'trail' as const },
          ]
        : [{ step: star, modifier: null }],
    }
  })
})

/** roving tabindex 落点：已选档；未选或值越界时退回首档。 */
const tabbableStep = computed<number | undefined>(() => {
  const all = steps.value
  if (all.length === 0) return undefined
  const current = props.modelValue
  return current !== undefined && all.includes(current) ? current : all[0]
})

/** 档位 tabindex：只读全 -1；否则 roving（落点 0，其余 -1）。 */
function tabIndexFor(step: number): 0 | -1 {
  if (props.readonly || tabbableStep.value === undefined) return -1
  return step === tabbableStep.value ? 0 : -1
}

/** 档位可读名称（值 + 单位）。 */
function ariaLabelFor(step: number): string {
  return `${step} ${RATING_ARIA_UNIT}`
}

const classes = computed(() => [
  'ui-rating',
  {
    'ui-rating--half': props.allowHalf,
    'ui-rating--readonly': props.readonly,
  },
])

/* ── 交互路径 ──────────────────────────────────────────────────────── */

function onRadioClick(step: number): void {
  // readonly 已在 tabindex/hover/键盘各路径守卫，这里兜底指针点击（含合成事件）。
  if (props.readonly) return
  emit('update:modelValue', props.clearable && props.modelValue === step ? undefined : step)
}

function onRadioEnter(step: number): void {
  if (props.readonly) return
  hoverValue.value = step
  emit('hoverChange', step)
}

function onRootLeave(): void {
  if (props.readonly || hoverValue.value === undefined) return
  hoverValue.value = undefined
  emit('hoverChange', undefined)
}

function onRadioKeydown(event: KeyboardEvent, current: number): void {
  if (props.readonly) return
  const delta = RATING_INCREASE_KEYS.includes(event.key)
    ? stepUnit.value
    : RATING_DECREASE_KEYS.includes(event.key)
      ? -stepUnit.value
      : 0
  if (delta === 0) return // Enter/Space 等交给原生 button 激活路径，不拦截
  const next = Math.min(maxStep.value, Math.max(stepUnit.value, current + delta))
  if (next === current) return // 边界档位再往同向步进：与原生 radio 一致为空操作
  event.preventDefault()
  emit('update:modelValue', next)
  focusStep(next)
}

/* ── 档位元素登记（客户端 ref；SSR 期间不执行，Map 恒为空） ───────────── */

const radioEls = new Map<number, HTMLButtonElement>()

function setRadioRef(step: number | null, el: unknown): void {
  if (step === null) return
  if (el instanceof HTMLButtonElement) radioEls.set(step, el)
  else radioEls.delete(step)
}

function focusStep(step: number): void {
  radioEls.get(step)?.focus()
}

function focus(options?: FocusOptions): void {
  if (props.readonly || tabbableStep.value === undefined) return
  radioEls.get(tabbableStep.value)?.focus(options)
}

function blur(): void {
  if (props.readonly || tabbableStep.value === undefined) return
  radioEls.get(tabbableStep.value)?.blur()
}

defineExpose<RatingExpose>({ focus, blur })
</script>

<template>
  <div
    :class="classes"
    role="radiogroup"
    :aria-readonly="readonly ? 'true' : undefined"
    @mouseleave="onRootLeave"
  >
    <span v-for="m in starModels" :key="m.star" class="ui-rating__star">
      <span class="ui-rating__icon" :class="`ui-rating__icon--${m.state}`" aria-hidden="true">
        <slot name="icon" :index="m.star" :value="m.star" :state="m.state">
          <svg
            class="ui-rating__glyph"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <svg
            class="ui-rating__glyph ui-rating__glyph--fill"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </slot>
      </span>
      <button
        v-for="radio in m.radios"
        :key="radio.step"
        :ref="(el) => setRadioRef(radio.step, el)"
        type="button"
        class="ui-rating__radio"
        :class="radio.modifier ? `ui-rating__radio--${radio.modifier}` : undefined"
        role="radio"
        :aria-checked="modelValue === radio.step ? 'true' : 'false'"
        :aria-label="ariaLabelFor(radio.step)"
        :tabindex="tabIndexFor(radio.step)"
        @click="onRadioClick(radio.step)"
        @keydown="onRadioKeydown($event, radio.step)"
        @mouseenter="onRadioEnter(radio.step)"
      ></button>
    </span>
  </div>
</template>

<style scoped>
/* ── 根（radiogroup 容器）：星横排，星间距走 token；attrs（aria-label 等）落根 ── */
.ui-rating {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  font-family: var(--ui-font-sans);
}

/* ── 单颗星：图标层与交互层的定位容器（24px 星形取 --ui-space-5，同 Radio 16px 先例） ── */
.ui-rating__star {
  position: relative;
  display: inline-flex;
  flex: none;
  inline-size: var(--ui-space-5);
  block-size: var(--ui-space-5);
}

/* ── 图标层：纯视觉（aria-hidden），填充态由状态类驱动；动效只走 --ui-motion-* ── */
.ui-rating__icon {
  position: relative;
  display: inline-flex;
  inline-size: 100%;
  block-size: 100%;
}

.ui-rating__glyph {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  color: var(--ui-text-3);
}

/* 填充层：与背景星形同路径叠放，opacity 过渡切换（prefers-reduced-motion 下 token 归零） */
.ui-rating__glyph--fill {
  position: absolute;
  inset: 0;
  color: var(--ui-warning);
  opacity: 0;
  transition: opacity var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-rating__icon--full .ui-rating__glyph--fill {
  opacity: 1;
}

/* 半星：结构性裁切右半（inset 的 50% 为半星语义的结构性取值，非视觉参数） */
.ui-rating__icon--half .ui-rating__glyph--fill {
  opacity: 1;
  clip-path: inset(0 50% 0 0);
}

/* ── 交互层：透明原生 button 覆盖星区（role="radio"，语义/点击热区/焦点环归属它） ── */
.ui-rating__radio {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: none; /* 结构性重置：非视觉取值 */
  padding: 0;
  background: transparent;
  cursor: pointer;
}

/* 半星档：左右各占星区一半（50% 为结构性取值） */
.ui-rating--half .ui-rating__radio--lead {
  inset: 0 auto 0 0;
  inline-size: 50%;
}

.ui-rating--half .ui-rating__radio--trail {
  inset: 0 0 0 auto;
  inline-size: 50%;
}

/* ── 只读：禁交互（光标回归默认 + tabindex=-1 + 交互守卫），视觉保持原色 ── */
.ui-rating--readonly .ui-rating__radio {
  cursor: default;
}
</style>
