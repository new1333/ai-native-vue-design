<script setup lang="ts" generic="T">
/**
 * MessageList —— AI 会话消息列表：滚动容器 + 贴底自动滚动（设计文档 §14.3 Conversation）。
 *
 * - 两种内容模式：messages prop（数据模式，逐条经 default 插槽渲染）或
 *   未提供 messages 时默认插槽直接分发内容（分发模式）。
 * - 贴底自动滚动：autoScroll 且视口处于贴底阈值内时，内容更新后跟随新消息；
 *   滚动状态机收口在 useMessageListScroll（测量仅发生在 mounted 之后的客户端路径）。
 * - 语义：role="log"（WAI-ARIA 聊天日志模式，新内容礼貌播报）+ tabindex="0"
 *   键盘可达滚动视口，不拦截任何按键、不劫持原生滚动。
 * - 空态复用 EmptyState；长会话窗口化（windowing）由 VirtualList 承担，本组件不虚拟化。
 * - 一切颜色、字号、间距均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useSlots } from 'vue'
import { EmptyState } from '../empty-state'
import { MESSAGE_LIST_EMPTY_TITLE, MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT } from './MessageList.constants'
import { useMessageListScroll } from './useMessageListScroll'
import type {
  MessageListEmits,
  MessageListExpose,
  MessageListMessageScope,
  MessageListProps,
  MessageListSlots,
} from './MessageList.types'

const props = withDefaults(defineProps<MessageListProps<T>>(), {
  messages: undefined,
  autoScroll: true,
  nearBottomThreshold: MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT,
  messageKey: undefined,
})
const emit = defineEmits<MessageListEmits>()
defineSlots<MessageListSlots<T>>()

const slots = useSlots()
/** 滚动容器 ref（组件创建，composable 只读写其 value）。 */
const rootRef = ref<HTMLElement | null>(null)

const {
  attach,
  detach,
  scrollToBottom,
  followIfNear,
} = useMessageListScroll({
  rootRef,
  autoScroll: () => props.autoScroll,
  nearBottomThreshold: () => props.nearBottomThreshold,
  onNearBottomChange: (value) => emit('nearBottom', value),
  onLoadMore: () => emit('loadMore'),
  onScroll: (event) => emit('scroll', event),
})

/** 数据模式判定：messages prop 提供（含显式空数组）即按逐条结构渲染。 */
const isPropMode = computed(() => props.messages !== undefined)

/** 数据模式渲染源：messages 未提供时给模板一个稳定的空数组（不渲染）。 */
const propMessages = computed<T[]>(() => props.messages ?? [])

/** 分发模式空态判定：未提供 messages 且未提供默认插槽内容。 */
const hasDefaultSlot = computed(() => typeof slots.default === 'function')

/** 空态：无消息可渲染（数据模式空数组 / 分发模式无默认插槽）。 */
const isEmpty = computed(() => (isPropMode.value ? propMessages.value.length === 0 : !hasDefaultSlot.value))

/** 消息键：messageKey 函数求值，缺省回落渲染下标。 */
function keyOf(message: T, index: number): string | number {
  const source = props.messageKey
  return source ? source(message, index) : index
}

/** default 插槽缺省内容：string/number 消息渲染其文本，其余渲染为空（对象请用 default 插槽）。 */
function messageText(message: T): string {
  return typeof message === 'string' || typeof message === 'number' ? String(message) : ''
}

/**
 * 分发模式（messages 未提供）传给默认插槽的占位作用域：
 * 直接分发的子节点不消费作用域；若误用 #default="{ message }"，message 为 undefined。
 */
function distributedScope(): MessageListMessageScope<T> {
  return { message: undefined as unknown as T, index: -1 }
}

// 客户端副作用：监听绑定 / 首帧定位仅 onMounted；清理 onBeforeUnmount；跟随在 onUpdated。
onMounted(attach)
onBeforeUnmount(detach)
onUpdated(() => followIfNear())

defineExpose<MessageListExpose>({ scrollToBottom })
</script>

<template>
  <div ref="rootRef" class="ui-message-list" role="log" tabindex="0">
    <div v-if="isEmpty" class="ui-message-list__empty">
      <slot name="empty">
        <EmptyState :title="MESSAGE_LIST_EMPTY_TITLE" />
      </slot>
    </div>
    <template v-else-if="isPropMode">
      <div
        v-for="(message, index) in propMessages"
        :key="keyOf(message, index)"
        class="ui-message-list__item"
      >
        <slot :message="message" :index="index">{{ messageText(message) }}</slot>
      </div>
    </template>
    <div v-else class="ui-message-list__content">
      <slot v-bind="distributedScope()" />
    </div>
  </div>
</template>

<style scoped>
/* ── 滚动视口：原生滚动（高度由使用方给定，如 style="height: …"）───────── */
.ui-message-list {
  box-sizing: border-box;
  overflow-y: auto;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-1);
}

/* ── 消息条目间距：仅做纵向节奏，气泡视觉由 default 插槽内容决定 ───────── */
.ui-message-list__item + .ui-message-list__item {
  margin-top: var(--ui-space-2);
}

/* ── 空态包裹：EmptyState 自带居中与配色，这里只给内边距 ───────────────── */
.ui-message-list__empty {
  padding: var(--ui-space-6) var(--ui-space-4);
}
</style>
