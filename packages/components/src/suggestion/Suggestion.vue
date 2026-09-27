<script setup lang="ts">
/**
 * Suggestion —— AI 建议追问 chips：推荐提示词以原生 button chips 呈现，
 * 点击/键盘激活上抛 select，由使用方将 item.value 回填输入框（PromptInput）。
 * chips 横向自动换行、间距走 --ui-space-*；视觉只消费 var(--ui-*) token（paper.css）。
 */
import { useSuggestion } from './useSuggestion'
import type { SuggestionEmits, SuggestionProps, SuggestionSlots } from './Suggestion.types'

const props = withDefaults(defineProps<SuggestionProps>(), {
  disabled: false,
  loading: false,
})
const emit = defineEmits<SuggestionEmits>()
defineSlots<SuggestionSlots>()

const { ariaAttrs, select, onItemKeydown } = useSuggestion({
  loading: () => props.loading,
  disabled: () => props.disabled,
  onSelect: (item) => emit('select', item),
})
</script>

<template>
  <div class="ui-suggestion" role="group" v-bind="ariaAttrs">
    <div v-if="$slots.default" class="ui-suggestion__prefix">
      <slot />
    </div>
    <div class="ui-suggestion__list">
      <button
        v-for="(item, index) in items"
        :key="item.value"
        type="button"
        class="ui-suggestion__item"
        :disabled="disabled || item.disabled === true"
        @click="select(item, $event)"
        @keydown="onItemKeydown(item, $event)"
      >
        <slot name="item" :item="item" :index="index">{{ item.label }}</slot>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── 根：分组容器（role=group），纵向排布前置内容与 chips 列表 ── */
.ui-suggestion {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-sans);
}

/* ── 前置内容（default 插槽）：如「推荐追问」标题/说明 ── */
.ui-suggestion__prefix {
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── chips 列表：横向自动换行，间距走 --ui-space-* ── */
.ui-suggestion__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

/* ── chip：原生 button；描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） ── */
.ui-suggestion__item {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-3);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
  color: var(--ui-text-2);
  font-family: inherit;
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-regular);
  line-height: var(--ui-leading-small);
  text-align: start;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out),
    transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-suggestion__item:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
  color: var(--ui-text-1);
}

.ui-suggestion__item:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
  color: var(--ui-text-1);
  transform: scale(0.98); /* 缩放 ≤2%，白名单内的 transform 动效 */
}

/* ── 状态：disabled（原生属性；置于 hover 之后统一覆盖）── */
.ui-suggestion__item:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
  transform: none;
}
</style>
