<script setup lang="ts">
/**
 * EmptyState —— 空状态占位：图标 + 标题 + 说明 + 下一步操作，整体居中。
 *
 * - 设计文档允许的居中场景（空态 / 404 等）：容器纵向 flex、水平垂直内容居中。
 * - icon 插槽缺省时渲染内建克制线稿图标；action 插槽承载使用方的下一步操作按钮。
 * - 文字层级克制：标题 text-2、说明 text-3，间距全部走 --ui-space-* token。
 * - 一切颜色、字号、间距均消费 var(--ui-*) token（paper.css）。
 */
import { useSlots } from 'vue'
import type { EmptyStateProps, EmptyStateSlots } from './EmptyState.types'

defineProps<EmptyStateProps>()
defineSlots<EmptyStateSlots>()

const slots = useSlots()
</script>

<template>
  <div class="ui-empty-state">
    <div class="ui-empty-state__icon">
      <slot name="icon">
        <svg
          class="ui-empty-state__icon-svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path
            d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"
          />
        </svg>
      </slot>
    </div>
    <div v-if="title" class="ui-empty-state__title">{{ title }}</div>
    <div v-if="description" class="ui-empty-state__description">{{ description }}</div>
    <div v-if="slots.action" class="ui-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
/* ── 容器：空态居中（设计文档允许的居中场景：空状态、404 等） ── */
.ui-empty-state {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--ui-space-7) var(--ui-space-5);
  font-family: var(--ui-font-sans);
}

/* ── 图标位：克制线稿，text-3 弱化（svg 尺寸 16/20/24 见 CONVENTIONS §2） ── */
.ui-empty-state__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--ui-text-3);
}

.ui-empty-state__icon-svg {
  display: block;
}

/* ── 文字：标题 text-2、说明 text-3，间距走 space token ────────── */
.ui-empty-state__title {
  margin-top: var(--ui-space-4);
  color: var(--ui-text-2);
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

.ui-empty-state__description {
  margin-top: var(--ui-space-1);
  /* ≈672px 阅读栏上限：间距标尺推导（无 reading-width token，沿 ToastItem 宽度推导先例） */
  max-width: calc(var(--ui-space-8) * 10.5);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── 下一步操作区：承载使用方的按钮 ──────────────────────────── */
.ui-empty-state__action {
  display: inline-flex;
  margin-top: var(--ui-space-5);
}
</style>
