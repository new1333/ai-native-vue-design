<script setup lang="ts">
/**
 * Accordion —— 折叠面板/手风琴：items 驱动的分段展开收起容器。
 * 单开（默认，展开值 key|null）/多开（multiple，展开值 keys 数组）；
 * 非受控可用 defaultValue 指定初始展开（形态随 multiple；受控模式不生效）；
 * 头部为原生 button（aria-expanded + aria-controls + roving tabindex），
 * 面板 role="region" + aria-labelledby，键盘路径遵循 WAI-ARIA Accordion 模式。
 * 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { useId } from 'vue'
import { ACCORDION_MULTIPLE_DEFAULT } from './Accordion.constants'
import { useAccordion } from './useAccordion'
import type { AccordionEmits, AccordionProps, AccordionSlots } from './Accordion.types'

const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: ACCORDION_MULTIPLE_DEFAULT,
})
const emit = defineEmits<AccordionEmits>()
defineSlots<AccordionSlots>()

/** 实例唯一前缀（useId：SSR/水合安全），拼出 trigger/panel 的 aria 关联 id。 */
const baseId = useId()

function triggerId(key: string | number): string {
  return `ui-accordion-${baseId}-trigger-${key}`
}

function panelId(key: string | number): string {
  return `ui-accordion-${baseId}-panel-${key}`
}

const { isOpen, toggleAt, onTriggerKeydown, onTriggerFocus, tabStopIndex, setTriggerRef } =
  useAccordion({
    items: () => props.items,
    multiple: () => props.multiple,
    modelValue: () => props.modelValue,
    defaultValue: () => props.defaultValue,
    emit,
  })
</script>

<template>
  <div class="ui-accordion">
    <div
      v-for="(item, index) in items"
      :key="item.key"
      :class="['ui-accordion__item', { 'ui-accordion__item--open': isOpen(item.key) }]"
    >
      <button
        :id="triggerId(item.key)"
        :ref="(el) => setTriggerRef(index, el)"
        type="button"
        class="ui-accordion__trigger"
        :aria-expanded="isOpen(item.key)"
        :aria-controls="panelId(item.key)"
        :tabindex="index === tabStopIndex ? 0 : -1"
        :disabled="item.disabled ?? false"
        @click="toggleAt(index)"
        @keydown="onTriggerKeydown($event, index)"
        @focus="onTriggerFocus(index)"
      >
        <span class="ui-accordion__title">
          <slot name="title" :item="item" :index="index" :expanded="isOpen(item.key)">
            {{ item.title }}
          </slot>
        </span>
        <span
          :class="['ui-accordion__icon', { 'ui-accordion__icon--open': isOpen(item.key) }]"
        >
          <slot name="icon" :item="item" :index="index" :expanded="isOpen(item.key)">
            <svg
              v-if="isOpen(item.key)"
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
              <path d="M18 15 12 9 6 15" />
            </svg>
            <svg
              v-else
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
          </slot>
        </span>
      </button>
      <div
        :id="panelId(item.key)"
        class="ui-accordion__panel"
        role="region"
        :aria-labelledby="triggerId(item.key)"
        :hidden="!isOpen(item.key)"
      >
        <slot name="default" :item="item" :index="index" :expanded="isOpen(item.key)">
          {{ item.content }}
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 根：条目纵向排列，条目间 8px 呼吸间距 ───────────────── */
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

/* ── 条目：surface 面 + 1px 描边 + 控件圆角（radius-sm）────── */
.ui-accordion__item {
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Card/Button 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
}

/* ── 展开条目：描边加深一档做状态反馈 ────────────────────── */
.ui-accordion__item--open {
  border-color: var(--ui-border-strong);
}

/* ── 头部：原生 button 全宽，标题 + 图标两端对齐 ──────────── */
.ui-accordion__trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  width: 100%;
  padding: var(--ui-space-3) var(--ui-space-4);
  background-color: transparent;
  /* 结构性重置：头部无自绘描边，描边由条目容器承担 */
  border: 0;
  font-family: inherit;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-accordion__trigger:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
}

/* 焦点环交给全局 :focus-visible 约定（paper.css），组件不改写 outline */

.ui-accordion__trigger:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 头部内部：标题 / 图标 ───────────────────────────────── */
.ui-accordion__title {
  flex: 1 1 auto;
}

.ui-accordion__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--ui-text-2);
  transition: color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-accordion__trigger:disabled .ui-accordion__icon {
  color: var(--ui-text-3);
}

/* 图标尺寸档 16/20/24（CONVENTIONS §2 Icon Token）之 16px，随 Button 先例统一约束 */
.ui-accordion__icon :deep(svg) {
  width: 16px;
  height: 16px;
}

/* ── 面板：正文缩进与头部对齐，收起时 hidden 属性整体隐藏 ── */
.ui-accordion__panel {
  padding: 0 var(--ui-space-4) var(--ui-space-4);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

/* 入场揭示：opacity + 位移 4px（≤4px 白名单），时长/缓动走 token；
   prefers-reduced-motion 下 --ui-motion-* 归零立即呈现 */
@keyframes ui-accordion-reveal {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * -1));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ui-accordion__panel:not([hidden]) {
  animation: ui-accordion-reveal var(--ui-motion-default) var(--ui-ease-out);
}
</style>
