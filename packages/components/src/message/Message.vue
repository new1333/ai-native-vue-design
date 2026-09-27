<script setup lang="ts">
/**
 * Message —— AI 会话消息气泡：user/assistant/system 三角色的单条消息单元。
 *
 * - 布局由 role 决定：user 右对齐（accent-soft 气泡）、assistant 左对齐
 *   （surface + 描边气泡）、system 居中弱化（无气泡配皮）；头像复用 Avatar。
 * - streaming=true 表示 AI 正在生成：内容尾部渲染流式光标（纯 CSS、aria-hidden、
 *   prefers-reduced-motion 降级为静态），根元素置 aria-busy="true"。
 * - status 渲染 meta 行内的状态徽标（sending 脉冲点 / sent 对勾 / error 感叹号），
 *   'error' 额外把 assistant 气泡描边染为 danger 色。
 * - system 角色不渲染内建回退头像列（系统通知惯例）；显式传 avatar 或 #avatar
 *   插槽时照常渲染。不访问任何浏览器 API，SSR（renderToString）安全。
 * - 一切颜色、字号、间距、圆角、动效时长均消费 var(--ui-*) token（paper.css）。
 */
import { computed, useSlots } from 'vue'
import { Avatar } from '../avatar'
import { MESSAGE_ROLE_DEFAULT, MESSAGE_ROLE_LABEL, MESSAGE_STATUS_TEXT } from './Message.constants'
import type { MessageContext, MessageProps, MessageSlots } from './Message.types'

const props = withDefaults(defineProps<MessageProps>(), {
  role: MESSAGE_ROLE_DEFAULT,
  streaming: false,
})
defineSlots<MessageSlots>()

const slots = useSlots()

const rootClasses = computed(() => [
  'ui-message',
  `ui-message--${props.role}`,
  { 'ui-message--status-error': props.status === 'error' },
])

/** 头像可读名称与回退首字母的共同来源：name 优先，缺省回落角色称谓。 */
const resolvedName = computed(() => props.name ?? MESSAGE_ROLE_LABEL[props.role])

/**
 * 头像列是否渲染：user/assistant 恒渲染（无 src 时回退首字母头像）；
 * system 不渲染内建回退头像，仅当显式提供 avatar 或 #avatar 插槽时渲染。
 */
const showAvatar = computed(
  () => props.role !== 'system' || (typeof props.avatar === 'string' && props.avatar !== ''),
)

/** 插槽作用域：当前消息上下文汇总（default / avatar / actions 共用）。 */
const ctx = computed<MessageContext>(() => ({
  role: props.role,
  name: props.name,
  avatar: props.avatar,
  timestamp: props.timestamp,
  streaming: props.streaming,
  status: props.status,
}))
</script>

<template>
  <div :class="rootClasses" :aria-busy="streaming || undefined">
    <div v-if="showAvatar || slots.avatar" class="ui-message__avatar">
      <slot name="avatar" :message="ctx">
        <Avatar :src="avatar" :alt="resolvedName" :name="resolvedName" />
      </slot>
    </div>
    <div class="ui-message__main">
      <div v-if="name || timestamp || status" class="ui-message__meta">
        <span v-if="name" class="ui-message__name">{{ name }}</span>
        <span v-if="timestamp" class="ui-message__time">{{ timestamp }}</span>
        <span v-if="status" class="ui-message__status" :class="`ui-message__status--${status}`">
          <svg
            v-if="status === 'sent'"
            class="ui-message__status-icon"
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
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <svg
            v-else-if="status === 'error'"
            class="ui-message__status-icon"
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
            <path d="M12 6.5v7" />
            <path d="M12 17.25h.01" />
          </svg>
          <span v-else class="ui-message__status-dot" aria-hidden="true" />
          {{ MESSAGE_STATUS_TEXT[status] }}
        </span>
      </div>
      <div class="ui-message__bubble">
        <div class="ui-message__content">
          <slot :message="ctx" />
          <span v-if="streaming" class="ui-message__caret" aria-hidden="true" />
        </div>
      </div>
      <div v-if="slots.actions" class="ui-message__actions">
        <slot name="actions" :message="ctx" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 基底：头像列 + 内容列（meta / 气泡 / 操作区）──────────── */
.ui-message {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-3);
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

.ui-message__avatar {
  display: inline-flex;
  flex: none;
}

.ui-message__main {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

/* ── meta 行：name / timestamp / status 徽标 ───────────────── */
.ui-message__meta {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-1);
}

.ui-message__name {
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

.ui-message__time {
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
}

/* ── 状态徽标：可见文案承载语义，图标/圆点均为 aria-hidden 装饰 ── */
.ui-message__status {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

.ui-message__status--error {
  color: var(--ui-danger);
}

.ui-message__status-icon {
  display: block;
}

/* sending 脉冲点：外扩脉冲环（transform/opacity 白名单动效，加载语义
   无限循环豁免，Timeline pending / Progress indeterminate 同策略）；
   时长由 --ui-motion-default 推导（≈2s）。 */
.ui-message__status-dot {
  position: relative;
  flex: none;
  width: var(--ui-space-1);
  height: var(--ui-space-1);
  border-radius: calc(var(--ui-space-1) / 2);
  background-color: var(--ui-text-3);
}

.ui-message__status-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--ui-text-3);
  animation: ui-message-sending calc(var(--ui-motion-default) * 11) var(--ui-ease-out) infinite;
}

@keyframes ui-message-sending {
  from {
    transform: scale(1);
    opacity: 0.4; /* 透明度非禁令枚举项（Timeline 脉冲先例） */
  }

  to {
    transform: scale(2);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-message__status-dot::after {
    display: none;
  }
}

/* ── 气泡：内容宽度自适应，容器限宽由使用方决定（气泡不设固定宽度）── */
.ui-message__bubble {
  box-sizing: border-box;
  max-width: 100%;
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
}

.ui-message__content {
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  overflow-wrap: anywhere;
}

/* ── assistant：surface 底 + 描边（1px 为结构性细线宽度，无
   --ui-border-width token，Card/Timeline 先例，已在任务结果中提出需求）── */
.ui-message--assistant .ui-message__bubble {
  background-color: var(--ui-surface);
  border: 1px solid var(--ui-border);
}

/* ── user：右对齐 + accent-soft 底 ─────────────────────────── */
.ui-message--user {
  flex-direction: row-reverse;
}

.ui-message--user .ui-message__main {
  align-items: flex-end;
}

.ui-message--user .ui-message__meta {
  justify-content: flex-end;
}

.ui-message--user .ui-message__bubble {
  background-color: var(--ui-accent-soft);
}

/* ── system：居中弱化，无气泡配皮（0 为结构重置，非视觉取值）── */
.ui-message--system {
  justify-content: center;
}

.ui-message--system .ui-message__main {
  align-items: center;
}

.ui-message--system .ui-message__meta {
  justify-content: center;
}

.ui-message--system .ui-message__bubble {
  padding: 0;
  background-color: transparent;
}

.ui-message--system .ui-message__content {
  color: var(--ui-text-2);
  text-align: center;
}

/* ── status="error"：assistant 气泡描边染 danger（user 气泡无描边、
   system 无气泡，状态语义由徽标色承担）──────────────────────── */
.ui-message--status-error.ui-message--assistant .ui-message__bubble {
  border-color: var(--ui-danger);
}

/* ── 流式光标：内容尾部 accent 块，闪烁为 opacity 白名单动效
   （生成语义无限循环豁免，Timeline pending 同策略）；reduced-motion
   降级为静态光标。 ─────────────────────────────────────────── */
.ui-message__caret {
  display: inline-block;
  width: calc(var(--ui-space-1) / 2);
  height: calc(var(--ui-text-md) * var(--ui-leading-body));
  margin-left: var(--ui-space-1);
  vertical-align: middle;
  background-color: var(--ui-accent);
  animation: ui-message-caret-blink calc(var(--ui-motion-default) * 6) infinite;
}

@keyframes ui-message-caret-blink {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-message__caret {
    animation: none;
  }
}

/* ── 操作区：气泡之下的使用方控件行（重试 / 复制 / 反馈等）──── */
.ui-message__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-2);
}
</style>
