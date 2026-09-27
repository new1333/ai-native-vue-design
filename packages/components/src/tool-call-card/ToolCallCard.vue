<script setup lang="ts">
/**
 * ToolCallCard —— AI 工具调用卡片：工具名 + 状态徽标 + 入参 + 结果，支持人工审批
 * （设计文档 §14.3 Agent Runtime UI · ToolCall；核心原则是 state semantics，
 * 以文字 + Badge 同系色相表达真实状态，不做装饰性动效）。
 *
 * - 状态受控：status 完全由使用方 prop 驱动（queued/running/completed/failed/waitingApproval），
 *   组件不自行流转；状态徽标复用 Badge 语义（soft 底 + 同系文字色 + 装饰性圆点），
 *   并作为常驻 aria-live="polite" live region，状态变化以不打断方式播报。
 * - 入参/结果：字符串原样、其余 JSON 两空格缩进展示（循环引用等序列化失败回退 String）；
 *   failed 时结果区文字转 danger 语义色表达错误输出。#args/#result 插槽可覆盖内容。
 * - 人工审批：仅 status="waitingApproval" 渲染批准/拒绝按钮（原生 button），
 *   点击派发 approve/reject，后续流转由使用方驱动；disabled prop 置灰审批操作。
 * - SSR：无任何浏览器 API、无监听器、无定时器；node renderToString 无异常。
 * - 视觉只消费 var(--ui-*) token（paper.css）；不引入全局 CSS。
 */
import { computed } from 'vue'
import {
  TOOL_CALL_APPROVAL_LABEL,
  TOOL_CALL_APPROVE_LABEL,
  TOOL_CALL_ARGS_LABEL,
  TOOL_CALL_REJECT_LABEL,
  TOOL_CALL_RESULT_LABEL,
  TOOL_CALL_STATUS_BADGE_VARIANT,
  TOOL_CALL_STATUS_CLASS,
  TOOL_CALL_STATUS_DEFAULT,
  TOOL_CALL_STATUS_LABELS,
} from './ToolCallCard.constants'
import type { ToolCallCardEmits, ToolCallCardProps, ToolCallCardSlots } from './ToolCallCard.types'

const props = withDefaults(defineProps<ToolCallCardProps>(), {
  status: TOOL_CALL_STATUS_DEFAULT,
  duration: null,
  disabled: false,
})
const emit = defineEmits<ToolCallCardEmits>()
defineSlots<ToolCallCardSlots>()

const rootClasses = computed(() => [
  'ui-tool-call-card',
  `ui-tool-call-card--${TOOL_CALL_STATUS_CLASS[props.status]}`,
])

/** 状态徽标档位类：复用 Badge variant 词表映射（neutral/info/success/danger/warning）。 */
const statusVariantClass = computed(
  () => `ui-tool-call-card__status--${TOOL_CALL_STATUS_BADGE_VARIANT[props.status]}`,
)

/** 状态标签：live region 的播报文本。 */
const statusLabel = computed(() => TOOL_CALL_STATUS_LABELS[props.status])

/** 时长展示：不传/null 不渲染；<1000ms 显示「Nms」，否则一位小数秒。 */
const durationLabel = computed(() => {
  if (props.duration === null) return ''
  if (props.duration < 1000) return `${props.duration}ms`
  return `${Math.round(props.duration / 100) / 10}s`
})

const showDuration = computed(() => props.duration !== null)

/**
 * 值序列化：字符串原样（保留换行），其余 JSON 两空格缩进；
 * 循环引用等序列化失败回退 String(value)，不抛异常。
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

const hasArgs = computed(() => props.args !== undefined)
const hasResult = computed(() => props.result !== undefined)
const formattedArgs = computed(() => formatValue(props.args))
const formattedResult = computed(() => formatValue(props.result))

/** failed 的结果即错误输出：结果代码块转 danger 语义色。 */
const resultIsError = computed(() => props.status === 'failed')

/**
 * 头部插槽作用域：集中经 v-bind 传入。
 * 不能在 <slot> 上写 :name="name" —— 动态 name 绑定会覆盖插槽出口自身的
 * name 属性（编译期合并为同名 prop），导致具名插槽查找失败。
 */
const headerScope = computed(() => ({
  name: props.name,
  status: props.status,
  duration: props.duration,
}))
</script>

<template>
  <div :class="rootClasses">
    <!-- 头部：工具名 + 时长 + 状态徽标；#header 整体接管（接管方自行承担状态播报） -->
    <slot v-if="$slots.header" name="header" v-bind="headerScope"></slot>
    <div v-else class="ui-tool-call-card__header">
      <span class="ui-tool-call-card__name">{{ name }}</span>
      <span class="ui-tool-call-card__header-meta">
        <span v-if="showDuration" class="ui-tool-call-card__duration">{{ durationLabel }}</span>
        <span :class="['ui-tool-call-card__status', statusVariantClass]" aria-live="polite">
          <span class="ui-tool-call-card__status-dot" aria-hidden="true"></span>{{ statusLabel }}
        </span>
      </span>
    </div>

    <!-- 入参区：args 未传不渲染；#args 覆盖内容（区块标签仍由组件渲染） -->
    <div v-if="hasArgs" class="ui-tool-call-card__section">
      <span class="ui-tool-call-card__section-label">{{ TOOL_CALL_ARGS_LABEL }}</span>
      <slot name="args" :args="args" :formatted="formattedArgs">
        <pre class="ui-tool-call-card__code">{{ formattedArgs }}</pre>
      </slot>
    </div>

    <!-- 结果区：result 未传不渲染；failed 时代码块转 danger 语义色 -->
    <div v-if="hasResult" class="ui-tool-call-card__section">
      <span class="ui-tool-call-card__section-label">{{ TOOL_CALL_RESULT_LABEL }}</span>
      <slot name="result" :result="result" :formatted="formattedResult" :status="status">
        <pre :class="['ui-tool-call-card__code', { 'ui-tool-call-card__code--error': resultIsError }]">{{ formattedResult }}</pre>
      </slot>
    </div>

    <!-- 人工审批：仅 waitingApproval 渲染；原生 button 键盘可达，disabled 置灰 -->
    <div
      v-if="status === 'waitingApproval'"
      class="ui-tool-call-card__approval"
      role="group"
      :aria-label="TOOL_CALL_APPROVAL_LABEL"
    >
      <button
        type="button"
        class="ui-tool-call-card__action ui-tool-call-card__action--approve"
        :disabled="disabled"
        @click="emit('approve')"
      >
        {{ TOOL_CALL_APPROVE_LABEL }}
      </button>
      <button
        type="button"
        class="ui-tool-call-card__action ui-tool-call-card__action--reject"
        :disabled="disabled"
        @click="emit('reject')"
      >
        {{ TOOL_CALL_REJECT_LABEL }}
      </button>
    </div>

    <!-- 底部附加区：重试、查看原始输出等额外操作由使用方承载 -->
    <div v-if="$slots.footer" class="ui-tool-call-card__footer">
      <slot name="footer" :status="status" />
    </div>
  </div>
</template>

<style scoped>
/* ── 基底：surface 卡面 + 描边 + 卡片圆角（对齐 Card 基线）────────────── */
.ui-tool-call-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-4);
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Card/Button 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── 头部：名称居左，时长 + 状态徽标居右，窄容器可换行 ────────────────── */
.ui-tool-call-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.ui-tool-call-card__name {
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  overflow-wrap: anywhere;
}

.ui-tool-call-card__header-meta {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.ui-tool-call-card__duration {
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
}

/* ── 状态徽标：复用 Badge 语义（inline-flex 徽标 + soft 底 + 同系文字色 +
      装饰性圆点），同时是状态变化的 aria-live="polite" live region ─────── */
.ui-tool-call-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-xs);
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  white-space: nowrap;
}

.ui-tool-call-card__status-dot {
  flex: none;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background-color: currentColor;
}

/* 档位配色与 Badge.vue 逐档一致：neutral 用 surface-muted/text-2 表达 */
.ui-tool-call-card__status--neutral {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
}

.ui-tool-call-card__status--info {
  background-color: var(--ui-info-soft);
  color: var(--ui-info);
}

.ui-tool-call-card__status--success {
  background-color: var(--ui-success-soft);
  color: var(--ui-success);
}

.ui-tool-call-card__status--danger {
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-tool-call-card__status--warning {
  background-color: var(--ui-warning-soft);
  color: var(--ui-warning);
}

/* ── 入参/结果区：可见小标签 + 代码块 ─────────────────────────────────── */
.ui-tool-call-card__section {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 0;
}

.ui-tool-call-card__section-label {
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-3);
}

.ui-tool-call-card__code {
  box-sizing: border-box;
  margin: 0;
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-sm);
  /* 等宽字体栈缺 --ui-font-mono token（已在任务结果中提出需求）：token 补齐前代码块
     用 sans 档（同 CommandPalette hint 的处理）；补齐后切换 var(--ui-font-mono) */
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* failed：结果即错误输出，文字转 danger 语义色（底色保持 muted，避免整块染红） */
.ui-tool-call-card__code--error {
  color: var(--ui-danger);
}

/* ── 人工审批：批准（accent 实底）+ 拒绝（描边），对齐 Button 档位语义 ── */
.ui-tool-call-card__approval {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.ui-tool-call-card__action {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-1) var(--ui-space-3);
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-button-radius);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-button-font-weight);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tool-call-card__action--approve {
  background-color: var(--ui-button-primary-bg);
  border-color: var(--ui-button-primary-bg);
  color: var(--ui-button-primary-fg);
}

.ui-tool-call-card__action--approve:hover:not(:disabled) {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
}

.ui-tool-call-card__action--reject {
  background-color: var(--ui-surface);
  border-color: var(--ui-border-strong);
  color: var(--ui-text-1);
}

.ui-tool-call-card__action--reject:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
}

/* disabled：不使用裸 opacity，禁用档以 muted 底 + 弱化文字 token 表达 */
.ui-tool-call-card__action:disabled {
  cursor: not-allowed;
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
}

/* ── 底部附加区 ──────────────────────────────────────────────────────── */
.ui-tool-call-card__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}
</style>
