<script setup lang="ts">
/**
 * Stepper —— 步骤条：流程进度与步骤切换（设计文档 §11.5 Steps）。
 *
 * - steps 数组配置步骤（顺序即流程顺序），v-model:modelValue 受控当前步（0 起始）；
 *   组件自身不持有步状态，点击只发出 update:modelValue + change；
 * - 每步状态纯派生：已过步 finish、当前步 process（可经 status 覆盖为 error 等）、未到步 waiting；
 * - clickable 开启时「已完成」步骤渲染为原生 button（点击 / Enter / Space 回退到该步），
 *   当前步与未到步不可交互 —— 只允许回退，不允许跳过未完成步骤前跳；
 * - direction 切换横/纵排布；连接线为结构性细线，状态色走 --ui-* token；
 * - 当前步以 aria-current="step" 暴露给读屏。
 * 一切视觉消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import {
  STEPPER_ACTIVATION_KEYS,
  STEPPER_DIRECTION_DEFAULT,
  STEPPER_STATUS_DEFAULT,
} from './Stepper.constants'
import { useStepper } from './useStepper'
import type { StepperEmits, StepperProps, StepperSlots } from './Stepper.types'

const props = withDefaults(defineProps<StepperProps>(), {
  modelValue: 0,
  status: STEPPER_STATUS_DEFAULT,
  direction: STEPPER_DIRECTION_DEFAULT,
  clickable: false,
})
const emit = defineEmits<StepperEmits>()
defineSlots<StepperSlots>()

const { current, statusFor, canSelect } = useStepper({
  steps: () => props.steps,
  modelValue: () => props.modelValue,
  status: () => props.status,
  clickable: () => props.clickable,
})

const classes = computed(() => ['ui-stepper', `ui-stepper--${props.direction}`])

/** 某步是否渲染为可交互元素（原生 button）：clickable 开启且该步状态为 finish。 */
function isInteractive(index: number): boolean {
  return props.clickable === true && statusFor(index) === 'finish'
}

/** 选中某步：经网关收敛（仅可交互步骤、且网关排除禁用/当前步）后发出。 */
function selectStep(index: number): void {
  if (!canSelect(index)) return
  emit('update:modelValue', index)
  emit('change', index)
}

function onStepClick(index: number): void {
  selectStep(index)
}

function onStepKeydown(event: KeyboardEvent, index: number): void {
  if (!STEPPER_ACTIVATION_KEYS.includes(event.key)) return
  // keydown 统一 preventDefault（拦截原生二次激活与 Space 滚动），
  // 由组件唯一触发选中，保证各环境单次激活（同 TabsTrigger 策略）。
  event.preventDefault()
  selectStep(index)
}
</script>

<template>
  <ol :class="classes" role="list">
    <li
      v-for="(step, index) in props.steps"
      :key="index"
      :class="[
        'ui-stepper__item',
        `ui-stepper__item--${statusFor(index)}`,
        { 'ui-stepper__item--disabled': step.disabled === true },
      ]"
      :aria-current="index === current ? 'step' : undefined"
    >
      <component
        :is="isInteractive(index) ? 'button' : 'div'"
        class="ui-stepper__step"
        :type="isInteractive(index) ? 'button' : undefined"
        :disabled="isInteractive(index) && step.disabled === true ? true : undefined"
        @click="onStepClick(index)"
        @keydown="onStepKeydown($event, index)"
      >
        <span class="ui-stepper__node">
          <slot
            name="icon"
            :step="step"
            :index="index"
            :status="statusFor(index)"
          >
            <svg
              v-if="statusFor(index) === 'finish'"
              class="ui-stepper__icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg
              v-else-if="statusFor(index) === 'error'"
              class="ui-stepper__icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M7 7l10 10M17 7L7 17" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-else class="ui-stepper__num">{{ index + 1 }}</span>
          </slot>
        </span>
        <span class="ui-stepper__body">
          <span class="ui-stepper__title">{{ step.title }}</span>
          <span
            v-if="step.description || $slots.description"
            class="ui-stepper__description"
          >
            <slot
              name="description"
              :step="step"
              :index="index"
              :status="statusFor(index)"
            >{{ step.description }}</slot>
          </span>
        </span>
      </component>
    </li>
  </ol>
</template>

<style scoped>
/* ── 根：列表语义容器；结构性重置列表默认盒模型（非视觉取值） ── */
.ui-stepper {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
}

.ui-stepper--horizontal {
  flex-direction: row;
  align-items: flex-start;
}

.ui-stepper--vertical {
  flex-direction: column;
}

/* ── 行：步骤项 + 连接线；横向拉伸分配、纵向向下生长 ────────── */
.ui-stepper__item {
  display: flex;
  min-width: 0;
}

.ui-stepper--horizontal .ui-stepper__item {
  flex: 1 1 auto;
  align-items: flex-start;
  gap: var(--ui-space-3);
}

/* 末项无连接线，不参与拉伸（多余空间全部让给前序连接线） */
.ui-stepper--horizontal .ui-stepper__item:last-child {
  flex: none;
}

.ui-stepper--vertical .ui-stepper__item {
  flex-direction: column;
  align-items: stretch;
  gap: var(--ui-space-1);
}

/* 连接线：结构性细线 1px（无 --ui-border-width token，需求已在结果中提出） */
.ui-stepper__item:not(:last-child)::after {
  content: '';
  flex: 1;
  border: 0 solid var(--ui-border);
}

/* 横向：顶对齐，线心对准图标节点中心（节点上内边距 + 半径） */
.ui-stepper--horizontal .ui-stepper__item:not(:last-child)::after {
  border-top-width: 1px;
  margin-top: calc(var(--ui-space-2) + var(--ui-space-5) / 2);
}

/* 纵向：线沿左轨生长，与图标节点中心对齐 */
.ui-stepper--vertical .ui-stepper__item:not(:last-child)::after {
  border-left-width: 1px;
  margin-left: calc(var(--ui-space-2) + var(--ui-space-5) / 2);
  margin-top: var(--ui-space-2);
}

/* 已完成步之后的连接线转成功色 */
.ui-stepper__item--finish:not(:last-child)::after {
  border-color: var(--ui-success);
}

/* ── 步骤根：图标节点 + 标题/描述 ───────────────────────────── */
.ui-stepper__step {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-3);
  min-width: 0;
  padding: var(--ui-space-2);
  border: none; /* 结构性重置：无描边（非视觉取值） */
  background: transparent; /* 结构性无填充：非色相取值 */
  font: inherit;
  color: var(--ui-text-2);
  text-align: start;
}

/* 可交互步骤（原生 button）：hover 反馈；焦点环交给全局 :focus-visible */
button.ui-stepper__step {
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

button.ui-stepper__step:hover:not(:disabled) {
  color: var(--ui-text-1);
}

button.ui-stepper__step:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 图标节点：等径圆（直径取间距档 --ui-space-5，同 Avatar/Radio 先例） ── */
.ui-stepper__node {
  box-sizing: border-box;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-5);
  height: var(--ui-space-5);
  border: 1px solid var(--ui-border-strong); /* 细线 1px：结构性（同上） */
  border-radius: calc(var(--ui-space-5) / 2);
  background: transparent;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  font-variant-numeric: var(--ui-numeric);
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-stepper__num {
  font-variant-numeric: var(--ui-numeric);
}

/* waiting（未到）：默认基底，无叠加 */
.ui-stepper__item--finish .ui-stepper__node {
  color: var(--ui-success);
  border-color: var(--ui-success);
  background: var(--ui-success-soft);
}

.ui-stepper__item--process .ui-stepper__node {
  color: var(--ui-on-accent);
  border-color: var(--ui-accent);
  background: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-stepper__item--error .ui-stepper__node {
  color: var(--ui-danger);
  border-color: var(--ui-danger);
  background: var(--ui-danger-soft);
}

/* ── 标题 / 描述 ─────────────────────────────────────────────── */
.ui-stepper__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 0;
}

.ui-stepper__title {
  color: var(--ui-text-2);
  font-size: inherit;
  line-height: inherit;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-stepper__item--finish .ui-stepper__title {
  color: var(--ui-text-1);
}

.ui-stepper__item--process .ui-stepper__title {
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
}

.ui-stepper__item--error .ui-stepper__title {
  color: var(--ui-danger);
  font-weight: var(--ui-font-weight-medium);
}

.ui-stepper__description {
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}

/* ── 禁用步：置灰（置于状态规则之后，覆盖状态色） ────────────── */
.ui-stepper__item--disabled .ui-stepper__node {
  color: var(--ui-text-3);
  border-color: var(--ui-border);
  background: transparent;
}

.ui-stepper__item--disabled .ui-stepper__title {
  color: var(--ui-text-3);
  font-weight: var(--ui-font-weight-regular);
}

.ui-stepper__item--disabled .ui-stepper__description {
  color: var(--ui-text-3);
}
</style>
