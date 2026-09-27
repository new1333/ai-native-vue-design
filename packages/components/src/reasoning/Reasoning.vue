<script setup lang="ts">
/**
 * Reasoning —— AI 思考过程折叠面板（设计文档 §14.2 Response：ThinkingBlock / Reasoning）。
 *
 * - 展开状态机：非受控时内部维护 expanded；受控时（传入 expanded）组件只 emit toggle
 *   上报意向、展示完全随 prop（与 Accordion 受控约定一致）。
 * - 流式语义：streaming false→true 自动展开；true→false 且 autoCollapse 时自动收起。
 *   挂载即 streaming 的实例（非受控）以展开态初始化，该初始态不派发 toggle。
 * - 头部为原生 button（WAI-ARIA Disclosure 模式）：aria-expanded + aria-controls，
 *   正文 role="region" + aria-labelledby，收起以 hidden 表达（内容保留 DOM、SSR 直出）。
 *   Enter/Space 激活由原生 button 平台行为保证，组件不重复实现键盘激活（避免双触发）。
 * - 纯展示状态机：无定时器、无测量、无浏览器 API（useId 为 Vue 同构 API，SSR 安全）。
 * - 视觉只消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, useId, watch } from 'vue'
import {
  REASONING_AUTO_COLLAPSE_DEFAULT,
  REASONING_LABEL_IDLE,
  REASONING_LABEL_STREAMING,
  REASONING_STREAMING_DEFAULT,
} from './Reasoning.constants'
import type { ReasoningEmits, ReasoningProps, ReasoningSlots } from './Reasoning.types'

const props = withDefaults(defineProps<ReasoningProps>(), {
  content: '',
  streaming: REASONING_STREAMING_DEFAULT,
  autoCollapse: REASONING_AUTO_COLLAPSE_DEFAULT,
  // 显式 undefined 默认值：关闭 Vue 对纯 Boolean prop 的缺省 cast（缺省时保持 undefined
  // 而非 false），受控判定 props.expanded !== undefined 才能区分「未传（非受控）」与「传 false」。
  expanded: undefined,
})
const emit = defineEmits<ReasoningEmits>()
defineSlots<ReasoningSlots>()

/** 触发按钮与正文区域的 aria 关联 id（useId：SSR/水合安全、多实例唯一）。 */
const baseId = useId()
const triggerId = `ui-reasoning-${baseId}-trigger`
const contentId = `ui-reasoning-${baseId}-content`

/** 非受控内部展开态：挂载即 streaming 的实例以展开态初始化（流式自动展开语义）。 */
const internalExpanded = ref(props.expanded ?? props.streaming)

/** 受控判定：expanded prop 提供（非 undefined）即受控。 */
const isControlled = computed(() => props.expanded !== undefined)

/** 当前展示的展开态：受控随 prop，非受控随内部状态。 */
const expanded = computed(() =>
  isControlled.value ? Boolean(props.expanded) : internalExpanded.value,
)

/**
 * 展开意向收口：只在展示态与意向不同时生效并派发 toggle。
 * 受控模式只上报意向、不改内部状态（展示随 props.expanded）；非受控直接落内部状态。
 */
function requestExpanded(next: boolean): void {
  if (expanded.value === next) return
  if (isControlled.value) {
    emit('toggle', next)
    return
  }
  internalExpanded.value = next
  emit('toggle', next)
}

/** 触发按钮点击：展开 ⇄ 收起。 */
function onTriggerClick(): void {
  requestExpanded(!expanded.value)
}

/**
 * 流式状态机（挂载后的变化）：false→true 自动展开；true→false 且 autoCollapse 自动收起。
 * 挂载时的初始展开态由 internalExpanded 初始化（或受控 prop）决定，不在此派发。
 */
watch(
  () => props.streaming,
  (streaming) => {
    if (streaming) requestExpanded(true)
    else if (props.autoCollapse) requestExpanded(false)
  },
)

/** 头部默认文案：流式中 / 有耗时（秒，固定一位小数）/ 完成无耗时。 */
const headerLabel = computed(() => {
  if (props.streaming) return REASONING_LABEL_STREAMING
  if (props.duration !== undefined) return `已思考 ${props.duration.toFixed(1)}s`
  return REASONING_LABEL_IDLE
})

const classes = computed(() => [
  'ui-reasoning',
  {
    'ui-reasoning--streaming': props.streaming,
    'ui-reasoning--expanded': expanded.value,
    'ui-reasoning--collapsed': !expanded.value,
  },
])
</script>

<template>
  <div :class="classes">
    <button
      :id="triggerId"
      type="button"
      class="ui-reasoning__trigger"
      :aria-expanded="expanded"
      :aria-controls="contentId"
      @click="onTriggerClick"
    >
      <span class="ui-reasoning__label">
        <slot name="header" :expanded="expanded" :streaming="streaming" :duration="duration">
          {{ headerLabel }}
        </slot>
      </span>
      <span class="ui-reasoning__chevron">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>

    <div
      :id="contentId"
      class="ui-reasoning__content"
      role="region"
      :aria-labelledby="triggerId"
      :hidden="!expanded"
    >
      <slot name="content" :content="content" :streaming="streaming">{{ content }}</slot>
    </div>
  </div>
</template>

<style scoped>
/* ── 基底：面板容器（自身无底色，随所在消息气泡/卡片表面）────────────────── */
.ui-reasoning {
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
}

/* ── 触发按钮：原生 button 的 ghost 形态（WAI-ARIA Disclosure 头部）──────── */
.ui-reasoning__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  margin: 0;
  padding: var(--ui-space-1) var(--ui-space-2);
  border: none; /* 结构性重置：非视觉取值（随 AutoComplete/Alert 先例） */
  background: transparent; /* 结构性无填充：非色相取值（随 AutoComplete 先例） */
  border-radius: var(--ui-radius-sm);
  color: var(--ui-text-2);
  font: inherit;
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-reasoning__trigger:hover {
  color: var(--ui-text-1);
  background-color: var(--ui-surface-muted);
}

/* ── 头部文案：流式以 accent 表达真实生成状态，完成回落 text-2 ────────────── */
.ui-reasoning__label {
  display: inline-flex;
  align-items: center;
}

.ui-reasoning--streaming .ui-reasoning__label {
  color: var(--ui-accent);
}

/* ── chevron 指示：展开时翻转（rotate 为结构性几何角度，非尺寸/颜色取值）──── */
.ui-reasoning__chevron {
  display: inline-flex;
  transition: transform var(--ui-motion-default) var(--ui-ease-out);
}

.ui-reasoning--expanded .ui-reasoning__chevron {
  transform: rotate(180deg);
}

/* ── 思考正文：左缘细线引导 + 弱化排版，pre-wrap 保留换行 ─────────────────── */
.ui-reasoning__content {
  margin-top: var(--ui-space-1);
  padding-left: var(--ui-space-4);
  border-left-width: 1px; /* 结构性细线（无 --ui-border-width token，随 Button/Card 先例在任务结果中提出需求） */
  border-left-style: solid;
  border-left-color: var(--ui-border);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
