<script setup lang="ts">
/**
 * Pagination —— 数据分页组件：nav（aria-label=分页）+ 页码列表（全显或 首尾+窗口+省略号）
 * + 上一页/下一页图标按钮。
 *
 * - v-model:page 受控：点击只发出 update:page，组件自身不持有页状态；
 * - 总页数 ≤ siblingCount*2+5（默认 7）全量展开；否则首尾 + 滑动窗口 + 省略号
 *   （省略号为 aria-hidden 的非聚焦占位元素）；
 * - 上一页/下一页为原生 button + aria-label，首/尾边界原生 disabled；
 * - 页码按钮等宽对齐（min-width），数字走 --ui-numeric（tabular-nums）；
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import {
  PAGINATION_ARIA_LABEL,
  PAGINATION_ELLIPSIS_CHAR,
  PAGINATION_NEXT_ARIA_LABEL,
  PAGINATION_PAGE_DEFAULT,
  PAGINATION_PAGE_SIZE_DEFAULT,
  PAGINATION_PREV_ARIA_LABEL,
  PAGINATION_SIBLING_COUNT_DEFAULT,
  PAGINATION_TOTAL_DEFAULT,
} from './Pagination.constants'
import type { PaginationEmits, PaginationProps, PaginationSlots } from './Pagination.types'
import { usePagination } from './usePagination'

const props = withDefaults(defineProps<PaginationProps>(), {
  page: PAGINATION_PAGE_DEFAULT,
  total: PAGINATION_TOTAL_DEFAULT,
  pageSize: PAGINATION_PAGE_SIZE_DEFAULT,
  siblingCount: PAGINATION_SIBLING_COUNT_DEFAULT,
})
const emit = defineEmits<PaginationEmits>()
defineSlots<PaginationSlots>()

const { safePage, items, canPrev, canNext, resolveTarget } = usePagination(() => props)

/** 页码点击：目标页经网关收敛/去重后发出 update:page（受控，组件不改自身状态）。 */
function goToPage(target: number): void {
  const resolved = resolveTarget(target)
  if (resolved === null) return
  emit('update:page', resolved)
}

/** 上一页：首边界已由原生 disabled 拦截，此处再网关兜底（合成事件防穿透）。 */
function goPrev(): void {
  if (!canPrev.value) return
  goToPage(safePage.value - 1)
}

/** 下一页：尾边界同上。 */
function goNext(): void {
  if (!canNext.value) return
  goToPage(safePage.value + 1)
}
</script>

<template>
  <nav class="ui-pagination" :aria-label="PAGINATION_ARIA_LABEL">
    <ul class="ui-pagination__list">
      <li class="ui-pagination__item">
        <button
          type="button"
          class="ui-pagination__nav"
          :aria-label="PAGINATION_PREV_ARIA_LABEL"
          :disabled="!canPrev"
          @click="goPrev"
        >
          <svg
            class="ui-pagination__icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </li>
      <li
        v-for="(item, index) in items"
        :key="item.type === 'page' ? `page-${item.page}` : `ellipsis-${index}`"
        class="ui-pagination__item"
      >
        <button
          v-if="item.type === 'page'"
          type="button"
          class="ui-pagination__page"
          :class="{ 'ui-pagination__page--current': item.page === safePage }"
          :aria-current="item.page === safePage ? 'page' : undefined"
          @click="goToPage(item.page)"
        >
          {{ item.page }}
        </button>
        <span v-else class="ui-pagination__ellipsis" aria-hidden="true">
          {{ PAGINATION_ELLIPSIS_CHAR }}
        </span>
      </li>
      <li class="ui-pagination__item">
        <button
          type="button"
          class="ui-pagination__nav"
          :aria-label="PAGINATION_NEXT_ARIA_LABEL"
          :disabled="!canNext"
          @click="goNext"
        >
          <svg
            class="ui-pagination__icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* ── 根：nav 语义容器；列表横排，间距/字号走 token ────────── */
.ui-pagination {
  display: block;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.ui-pagination__list {
  display: flex;
  align-items: center;
  gap: var(--ui-space-1);
  margin: 0; /* 结构性重置：清除列表默认盒模型（非视觉取值） */
  padding: 0;
  list-style: none;
}

.ui-pagination__item {
  display: inline-flex;
}

/* ── 页码 / 上一页 / 下一页：等宽基底（min-width 对齐 + tabular 数字） ── */
.ui-pagination__page,
.ui-pagination__nav {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 等宽对齐复用间距档 --ui-space-6（无控制件尺寸 token，已在任务结果中提出需求） */
  min-width: var(--ui-space-6);
  padding: var(--ui-space-1) var(--ui-space-2);
  border: none; /* 结构性重置：无描边按钮（非视觉取值） */
  border-radius: var(--ui-radius-sm);
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-2);
  font: inherit;
  font-variant-numeric: var(--ui-numeric); /* 数字 tabular-nums：翻页时宽度不抖动 */
  cursor: pointer;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-pagination__page:hover,
.ui-pagination__nav:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

/* 当前页：accent 实底 + on-accent 文字，hover 加深；焦点环交给全局 :focus-visible */
.ui-pagination__page--current {
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-pagination__page--current:hover {
  background-color: var(--ui-accent-hover);
}

/* ── 边界禁用：上一页/下一页在首/尾页原生 disabled ───────── */
.ui-pagination__nav:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 省略号：span 占位（非聚焦、aria-hidden），等宽对齐 ──── */
.ui-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--ui-space-6);
  padding: var(--ui-space-1) 0;
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
  user-select: none;
}

/* ── 翻页图标：内联 SVG 16 档（CONVENTIONS §2 图标尺寸 16/20/24） ── */
.ui-pagination__icon {
  flex: none;
}
</style>
