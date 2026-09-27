<script setup lang="ts">
/**
 * Breadcrumb —— 面包屑导航：nav[aria-label] + ol/li 的层级路径展示，中间项可折叠。
 *
 * - 项渲染语义（优先 a href 链接语义）：有 href 渲染原生 <a>；无 href 渲染
 *   <button type="button">（点击发 itemClick）；disabled 渲染 aria-disabled 的 span；
 * - 末项视为当前页：aria-current="page"；
 * - maxCount 折叠：首项 + 省略号（aria-hidden 非聚焦占位）+ 末尾若干项（useBreadcrumb）；
 * - 分隔符：separator prop 文本 / separator 插槽 / 缺省内联 chevron 图标，均 aria-hidden；
 * - 一切颜色、字号、间距、动效均消费 var(--ui-*) token（paper.css）。
 */
import { BREADCRUMB_ACTIVATION_KEYS, BREADCRUMB_ARIA_LABEL, BREADCRUMB_ELLIPSIS_CHAR, BREADCRUMB_ELLIPSIS_KEY } from './Breadcrumb.constants'
import { useBreadcrumb } from './useBreadcrumb'
import type { BreadcrumbEmits, BreadcrumbItem, BreadcrumbProps, BreadcrumbSlots } from './Breadcrumb.types'

const props = defineProps<BreadcrumbProps>()
const emit = defineEmits<BreadcrumbEmits>()
defineSlots<BreadcrumbSlots>()

const { displayEntries, itemKeyFor } = useBreadcrumb({
  items: () => props.items,
  maxCount: () => props.maxCount,
})

/** 项点击：disabled 项不绑定处理器，此处再网关兜底（item 插槽自造交互时防穿透）。 */
function onItemClick(item: BreadcrumbItem, index: number, event: MouseEvent): void {
  if (item.disabled === true) return
  emit('itemClick', { item, index, event })
}

/**
 * button 项的键盘激活：Enter/Space 在 keydown 阶段统一 preventDefault
 * （拦截原生二次激活与 Space 滚动）后向目标派发一次真实 click 事件，
 * 由唯一的 @click 路径发出 itemClick，保证跨环境行为一致且不双触发
 * （同 Tabs/useButton 策略）；<a> 项保留原生键盘激活，不劫持。
 */
function onItemKeydown(event: KeyboardEvent): void {
  if (!BREADCRUMB_ACTIVATION_KEYS.includes(event.key)) return
  event.preventDefault()
  const target = event.currentTarget
  if (target instanceof Element) target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}
</script>

<template>
  <nav class="ui-breadcrumb" :aria-label="BREADCRUMB_ARIA_LABEL">
    <ol class="ui-breadcrumb__list">
      <li
        v-for="(entry, position) in displayEntries"
        :key="entry.type === 'item' ? itemKeyFor(entry.index, entry.item) : BREADCRUMB_ELLIPSIS_KEY"
        class="ui-breadcrumb__item"
      >
        <span v-if="position > 0" class="ui-breadcrumb__separator" aria-hidden="true">
          <slot name="separator">
            <span v-if="separator !== undefined">{{ separator }}</span>
            <svg
              v-else
              class="ui-breadcrumb__separator-icon"
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
          </slot>
        </span>

        <template v-if="entry.type === 'item'">
          <slot name="item" :item="entry.item" :index="entry.index" :is-current="entry.isCurrent">
            <span
              v-if="entry.item.disabled === true"
              class="ui-breadcrumb__value ui-breadcrumb__value--disabled"
              aria-disabled="true"
              :aria-current="entry.isCurrent ? 'page' : undefined"
            >
              {{ entry.item.label }}
            </span>
            <a
              v-else-if="entry.item.href !== undefined"
              class="ui-breadcrumb__value ui-breadcrumb__link"
              :class="{ 'ui-breadcrumb__link--current': entry.isCurrent }"
              :href="entry.item.href"
              :aria-current="entry.isCurrent ? 'page' : undefined"
              @click="onItemClick(entry.item, entry.index, $event)"
            >
              {{ entry.item.label }}
            </a>
            <button
              v-else
              type="button"
              class="ui-breadcrumb__value ui-breadcrumb__link"
              :class="{ 'ui-breadcrumb__link--current': entry.isCurrent }"
              :aria-current="entry.isCurrent ? 'page' : undefined"
              @click="onItemClick(entry.item, entry.index, $event)"
              @keydown="onItemKeydown"
            >
              {{ entry.item.label }}
            </button>
          </slot>
        </template>

        <span v-else class="ui-breadcrumb__ellipsis" aria-hidden="true">
          {{ BREADCRUMB_ELLIPSIS_CHAR }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* ── 根：nav 语义容器；列表横排可换行，间距/字号走 token ──── */
.ui-breadcrumb {
  display: block;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.ui-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-1);
  margin: 0; /* 结构性重置：清除列表默认盒模型（非视觉取值） */
  padding: 0;
  list-style: none;
}

.ui-breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  /* 结构性重置：隔离使用方对 li 的样式注入（非视觉取值） */
  margin: 0;
}

/* ── 分隔符：装饰性（aria-hidden），chevron 16px / 文本 ────── */
.ui-breadcrumb__separator {
  display: inline-flex;
  align-items: center;
  color: var(--ui-text-3);
  user-select: none;
}

.ui-breadcrumb__separator-icon {
  flex: none;
}

/* ── 项内容基底：a / button / disabled span 共用 ──────────── */
.ui-breadcrumb__value {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: var(--ui-space-1) var(--ui-space-2);
  border: none; /* 结构性重置：无描边（非视觉取值） */
  background: transparent; /* 结构性无填充：非色相取值 */
  font: inherit;
  color: var(--ui-text-2);
  white-space: nowrap;
}

.ui-breadcrumb__link {
  cursor: pointer;
  text-decoration: none;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-breadcrumb__link:hover {
  color: var(--ui-text-1);
  background-color: var(--ui-surface-muted);
}

/* ── 当前项：text-1 + medium 字重，hover 不再变化 ──────────── */
.ui-breadcrumb__link--current {
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
}

.ui-breadcrumb__link--current:hover {
  color: var(--ui-text-1);
  background-color: transparent;
}

/* ── disabled 项：span + aria-disabled，不可交互 ───────────── */
.ui-breadcrumb__value--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 折叠省略号：aria-hidden 非聚焦占位 ───────────────────── */
.ui-breadcrumb__ellipsis {
  display: inline-flex;
  align-items: center;
  padding: var(--ui-space-1) var(--ui-space-2);
  color: var(--ui-text-3);
  user-select: none;
}
</style>
