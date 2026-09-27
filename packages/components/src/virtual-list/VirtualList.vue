<script setup lang="ts" generic="T">
/**
 * VirtualList —— 虚拟滚动列表原语：大列表/长会话只渲染可视窗口项，
 * MessageList 等数据密集场景的底座。
 *
 * - windowing：windowing 数学收口在 useVirtualList（headless、SSR 安全）；
 *   已测尺寸（稳定键缓存）优先，未测项按 estimatedItemSize 估算，前缀和定位。
 * - 不劫持原生滚动：滚动条由内容层总尺寸自然产生，组件只监听 scroll（passive）
 *   读取偏移，从不 preventDefault、从不代写 scrollTop/scrollLeft。
 * - 测量：scroll 监听与 ResizeObserver（视口 + 窗口项）一律 onMounted 绑定、
 *   onBeforeUnmount 清理；SSR / 无布局环境按假定视口直出首屏窗口。
 * - 一切颜色、字号、间距均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { CSSProperties } from 'vue'
import {
  VIRTUAL_LIST_EMPTY_TEXT_DEFAULT,
  VIRTUAL_LIST_OVERSCAN_DEFAULT,
  VIRTUAL_LIST_VIEWPORT_FALLBACK,
} from './VirtualList.constants'
import { useVirtualList } from './useVirtualList'
import type { VirtualListEmits, VirtualListProps, VirtualListSlots, VirtualWindowItem } from './VirtualList.types'

const props = withDefaults(defineProps<VirtualListProps<T>>(), {
  overscan: VIRTUAL_LIST_OVERSCAN_DEFAULT,
  horizontal: false,
})
const emit = defineEmits<VirtualListEmits>()
defineSlots<VirtualListSlots<T>>()

const attrs = useAttrs()
const rootRef = ref<HTMLElement | null>(null)

/** 主轴滚动偏移（px）：由 scroll 监听写入（mounted 后），SSR 期恒为 0。 */
const scrollOffset = ref(0)
/** 视口主轴尺寸（px）：初始为假定视口（SSR / 无布局环境直出首屏），挂载后实测覆盖。 */
const viewportSize = ref(VIRTUAL_LIST_VIEWPORT_FALLBACK)

const { measuredSizes, totalSize, range, windowItems } = useVirtualList<T>({
  items: () => props.items,
  // 键是函数值：用 computed Ref 传递（composable 以 unref 解析，避免被当作 getter 误调用）。
  getKey: computed(() => props.getKey),
  estimatedItemSize: () => props.estimatedItemSize,
  overscan: () => props.overscan,
  scrollOffset,
  viewportSize,
})

/** 空态：items 为空时以 empty 插槽替代窗口渲染（响应式）。 */
const isEmpty = computed(() => props.items.length === 0)

/** 有可访问名（aria-label / aria-labelledby 透传）时滚动容器才承担 region 地标角色。 */
const hasAccessibleName = computed(
  () => attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined,
)

/** 内容层尺寸：主轴总尺寸撑起原生滚动条（数据驱动的布局值，非视觉常量）。 */
const innerStyle = computed<CSSProperties>(() =>
  props.horizontal
    ? { width: `${totalSize.value}px`, height: '100%' }
    : { height: `${totalSize.value}px` },
)

/** 窗口项定位：主轴偏移内联（数据驱动布局值）；交叉轴铺满交给样式。 */
function itemStyle(entry: VirtualWindowItem<T>): CSSProperties {
  const offset = `${entry.start}px`
  return props.horizontal ? { left: offset } : { top: offset }
}

/** item 插槽缺省内容：string/number 项渲染其文本，其余渲染为空（对象请用 item 插槽）。 */
function itemText(item: T): string {
  return typeof item === 'string' || typeof item === 'number' ? String(item) : ''
}

// ── 客户端副作用：仅 onMounted 绑定 / onBeforeUnmount 清理，SSR 不执行 ─────────

let viewportObserver: ResizeObserver | null = null
let itemObserver: ResizeObserver | null = null
/** 已 observe 的窗口项元素 → 稳定键（ResizeObserver 回调时还原测量归属）。 */
const observedItems = new Map<Element, string | number>()

/** 主轴滚动偏移读取：垂直 scrollTop，水平 scrollLeft。 */
function readOffset(el: HTMLElement): number {
  return props.horizontal ? el.scrollLeft : el.scrollTop
}

/** 主轴视口尺寸读取：垂直 clientHeight，水平 clientWidth。 */
function readViewportSize(el: HTMLElement): number {
  return props.horizontal ? el.clientWidth : el.clientHeight
}

/** 记录已测尺寸：仅接受正值（无布局环境测量为 0，不入缓存以免污染估算）。 */
function recordSize(key: string | number, size: number): void {
  if (!(size > 0)) return
  if (measuredSizes.value.get(key) !== size) measuredSizes.value.set(key, size)
}

/** scroll 监听：只读偏移 + 透传原生事件（passive，不 preventDefault，不劫持滚动）。 */
function onScroll(event: Event): void {
  const el = rootRef.value
  if (el) scrollOffset.value = readOffset(el)
  emit('scroll', event)
}

/** 视口尺寸变化：重测视口，驱动窗口重算。 */
function onViewportResize(): void {
  measureViewport()
}

/** 窗口项尺寸变化：按稳定键记录实测尺寸，前缀和随之收敛。 */
function onItemResize(entries: ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const key = observedItems.get(entry.target)
    if (key === undefined) continue
    recordSize(key, props.horizontal ? entry.contentRect.width : entry.contentRect.height)
  }
}

/** 测量视口：仅当实测值 > 0 时覆盖假定视口（SSR / 无布局环境保持推导基准）。 */
function measureViewport(): void {
  const el = rootRef.value
  if (!el) return
  const size = readViewportSize(el)
  if (size > 0) viewportSize.value = size
}

/**
 * 同步窗口项测量：按渲染顺序对位 windowItems（v-for 顺序即窗口顺序），
 * 重建 observe 映射（对已观察元素重复 observe 按规范忽略），并同步量测一次
 * （覆盖 ResizeObserver 不可用/不回调的环境；无布局环境量得 0，不会入缓存）。
 */
function syncItemMeasurement(): void {
  const el = rootRef.value
  if (!el) return
  observedItems.clear()
  const entries = windowItems.value
  el.querySelectorAll('.ui-virtual-list__item').forEach((node, order) => {
    const entry = entries[order]
    if (!entry) return
    observedItems.set(node, entry.key)
    itemObserver?.observe(node)
    const rect = node.getBoundingClientRect()
    recordSize(entry.key, props.horizontal ? rect.width : rect.height)
  })
}

// 主轴切换：已测尺寸按旧主轴记录，直接失效重测；视口重测。
watch(
  () => props.horizontal,
  () => {
    measuredSizes.value = new Map()
    measureViewport()
  },
)

// 窗口变化后同步项测量：flush 'post' 保证 DOM 已更新；watcher 仅在客户端触发。
watch(windowItems, () => syncItemMeasurement(), { flush: 'post' })

// 渲染窗口播报：挂载首帧在 onMounted 中发出，此后 start/end 任一变化时发出。
watch(
  [() => range.value.start, () => range.value.end],
  ([start, end], [previousStart, previousEnd]) => {
    if (start === previousStart && end === previousEnd) return
    emit('visibleRangeChange', { start, end })
  },
  { flush: 'post' },
)

onMounted(() => {
  const el = rootRef.value
  if (!el) return
  measureViewport()
  el.addEventListener('scroll', onScroll, { passive: true })
  if (typeof ResizeObserver === 'function') {
    viewportObserver = new ResizeObserver(onViewportResize)
    viewportObserver.observe(el)
    itemObserver = new ResizeObserver(onItemResize)
  }
  emit('visibleRangeChange', { start: range.value.start, end: range.value.end })
  syncItemMeasurement()
})

onBeforeUnmount(() => {
  rootRef.value?.removeEventListener('scroll', onScroll)
  viewportObserver?.disconnect()
  viewportObserver = null
  itemObserver?.disconnect()
  itemObserver = null
  observedItems.clear()
})
</script>

<template>
  <div
    ref="rootRef"
    class="ui-virtual-list"
    :class="{ 'ui-virtual-list--horizontal': horizontal }"
    :role="hasAccessibleName ? 'region' : undefined"
    tabindex="0"
  >
    <div v-if="isEmpty" class="ui-virtual-list__empty">
      <slot name="empty">{{ VIRTUAL_LIST_EMPTY_TEXT_DEFAULT }}</slot>
    </div>
    <div v-else class="ui-virtual-list__inner" :style="innerStyle">
      <div
        v-for="entry in windowItems"
        :key="entry.key"
        class="ui-virtual-list__item"
        :style="itemStyle(entry)"
      >
        <slot name="item" :item="entry.item" :index="entry.index">{{ itemText(entry.item) }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 滚动视口：原生滚动不劫持；键盘可达由 tabindex 提供（焦点环走全局 :focus-visible）── */
.ui-virtual-list {
  position: relative;
  box-sizing: border-box;
  overflow: auto;
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

/* ── 内容层：总尺寸撑起滚动条（尺寸为数据驱动的内联样式）─── */
.ui-virtual-list__inner {
  position: relative;
}

/* ── 窗口项：主轴绝对定位（偏移为数据驱动内联样式）；纵向交叉轴铺满 ── */
.ui-virtual-list__item {
  position: absolute;
  box-sizing: border-box;
  left: 0;
  right: 0;
}

/* ── 水平模式：主轴改横向（left 内联），交叉轴（纵向）铺满 ── */
.ui-virtual-list--horizontal .ui-virtual-list__item {
  top: 0;
  bottom: 0;
  right: auto;
}

/* ── 空态 ────────────────────────────────────────────────── */
.ui-virtual-list__empty {
  padding: var(--ui-space-6);
  text-align: center;
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}
</style>
