<script setup lang="ts">
/**
 * AgentStatus —— agent 运行状态指示组件：以 §14 state semantics 呈现 agent 生命周期状态。
 *
 * - status：queued/running/streaming/waitingForTool/toolRunning/completed/failed/cancelled
 *   八档；状态色走 soft 底 + 同系文字色 token（对齐 Badge 视觉契约，failed 即 destructive danger）。
 * - 运行态（running/streaming/toolRunning）前置指示器组合 Spinner（size sm）；
 *   其余状态用静态小圆点；两者均为纯装饰，整体 aria-hidden，语义由文本承载。
 * - 根元素 role="status" + aria-live="polite"：状态切换时读屏播报最新状态文本。
 * - 纯展示组件：无交互、无 emits；重试/停止等动作由使用方在外部以 IconButton 组合。
 * - 一切颜色、字号、间距、圆角均消费 var(--ui-*) token（paper.css）。
 */
import { computed } from 'vue'
import { Spinner } from '../spinner'
import {
  AGENT_STATUS_ACTIVE_STATES,
  AGENT_STATUS_DEFAULT,
  AGENT_STATUS_LABELS,
} from './AgentStatus.constants'
import type { AgentStatusProps, AgentStatusSlots } from './AgentStatus.types'

const props = withDefaults(defineProps<AgentStatusProps>(), {
  status: AGENT_STATUS_DEFAULT,
  label: undefined,
  detail: undefined,
})
defineSlots<AgentStatusSlots>()

const classes = computed(() => [
  'ui-agent-status',
  `ui-agent-status--${props.status}`,
])

/** 是否运行态：前置指示器组合 Spinner（其余状态用静态圆点）。 */
const isActive = computed(() => AGENT_STATUS_ACTIVE_STATES.includes(props.status))

/** 状态文本：label 缺省时取该状态默认文案（live region 内的可播报内容）。 */
const resolvedLabel = computed(() => props.label ?? AGENT_STATUS_LABELS[props.status])
</script>

<template>
  <div :class="classes" role="status" aria-live="polite">
    <span class="ui-agent-status__icon" aria-hidden="true">
      <slot name="icon">
        <Spinner v-if="isActive" size="sm" :label="resolvedLabel" />
        <span v-else class="ui-agent-status__dot"></span>
      </slot>
    </span>
    <span class="ui-agent-status__body">
      <span class="ui-agent-status__label">
        <slot>{{ resolvedLabel }}</slot>
      </span>
      <span v-if="detail" class="ui-agent-status__detail">{{ detail }}</span>
    </span>
  </div>
</template>

<style scoped>
/* ── 基底：inline-flex 状态条（soft 底 + 同系文字色在各状态档声明）── */
.ui-agent-status {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  max-width: 100%;
}

/* ── 前置指示区：固定 16px 盒（容纳 sm Spinner），整块纯装饰 aria-hidden ── */
.ui-agent-status__icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
}

/* 静态小圆点：尺寸/50% 全圆随 Badge dot 先例（结构性相对半径，--ui-radius-full
   token 需求已在 Badge/Spinner 任务中提出）；颜色随文字色（currentColor） */
.ui-agent-status__dot {
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  border-radius: 50%;
  background-color: currentColor;
}

/* ── 文本列：label 语义色随状态档；detail 弱化补充行 ── */
.ui-agent-status__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 0;
  text-align: left;
}

.ui-agent-status__label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

.ui-agent-status__detail {
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
}

/* ── 状态档：soft 底 + 同系文字色（对齐 Badge；neutral 无专属 token，
      用 surface-muted/text-2 表达；运行态三档同用 accent 表达"正在工作"）── */
.ui-agent-status--queued {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
}

.ui-agent-status--running,
.ui-agent-status--streaming,
.ui-agent-status--toolRunning {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
}

.ui-agent-status--waitingForTool {
  background-color: var(--ui-warning-soft);
  color: var(--ui-warning);
}

.ui-agent-status--completed {
  background-color: var(--ui-success-soft);
  color: var(--ui-success);
}

.ui-agent-status--failed {
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-agent-status--cancelled {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
}
</style>
