<script setup lang="ts">
/**
 * Tooltip —— 纯提示浮层：包裹单个触发元素（默认插槽），无包装 DOM。
 *
 * - 触发：hover（mouseenter/mouseleave）与 focus（focusin/focusout，键盘可达）；
 *   显示延迟 150ms，隐藏始终立即；Esc 立即关闭。
 * - 触发元素经 cloneVNode 克隆合并事件与 aria-describedby（打开时指向浮层 id），
 *   同时透传使用方写在 <Tooltip> 上的 attrs（class / data-* / 既有监听器链式合并）。
 * - 浮层 Teleport 至 body：role="tooltip"、pointer-events:none（纯提示、不承载交互）；
 *   定位在挂载后按触发元素 rect 计算（fixed + --ui-space-2 间距 token）。
 * - SSR：不渲染浮层，仅输出 hidden 占位（ui-tooltip 根类）；Teleport 推迟到客户端。
 */
import { cloneVNode, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import { TOOLTIP_PLACEMENT_DEFAULT } from './Tooltip.constants'
import { useTooltip } from './useTooltip'
import type { TooltipProps, TooltipSlots } from './Tooltip.types'

// 多根（触发元素 + 占位/Teleport）不自动透传 attrs，改由 cloneVNode 手动合并
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: TOOLTIP_PLACEMENT_DEFAULT,
})
defineSlots<TooltipSlots>()

const attrs = useAttrs()
const slots = useSlots()
const tooltipId = useId()

/** 客户端已挂载：SSR 期间恒为 false，占位与浮层分支据此互换。 */
const isMounted = ref(false)

// 触发元素可能是原生元素，也可能是组件（组件取其根元素 $el 测量）
const triggerRef = ref<HTMLElement | ComponentPublicInstance | null>(null)

function getTriggerElement(): HTMLElement | null {
  const current = triggerRef.value
  if (current instanceof HTMLElement) return current
  const inner = (current as ComponentPublicInstance | null)?.$el
  return inner instanceof HTMLElement ? inner : null
}

const { isOpen, floatingStyle, showWithDelay, hideNow, onTriggerKeydown, dispose } = useTooltip({
  placement: () => props.placement,
  trigger: getTriggerElement,
  hasContent: () => Boolean(slots.content),
})

/**
 * 渲染触发元素：克隆默认插槽的首个 vnode，合并交互监听器；
 * 打开时补 aria-describedby 指向浮层 id（关闭时保留使用方自身的取值不被覆写）。
 * 每次渲染重新求值（非 computed），确保 attrs / 插槽内容不因缓存而滞后。
 */
function renderTrigger(): VNode | null {
  const node = slots.default?.()[0]
  if (!node) return null
  const extra: Record<string, unknown> = {
    ...attrs,
    onMouseenter: showWithDelay,
    onMouseleave: hideNow,
    onFocusin: showWithDelay,
    onFocusout: hideNow,
    onKeydown: onTriggerKeydown,
  }
  if (isOpen.value) extra['aria-describedby'] = tooltipId
  // 定向断言为 cloneVNode 的 extraProps 形参类型（非 as any 绕过）
  return cloneVNode(node, extra as Parameters<typeof cloneVNode>[1], true)
}

onMounted(() => {
  isMounted.value = true
})

onBeforeUnmount(() => {
  dispose()
})
</script>

<template>
  <component :is="renderTrigger()" ref="triggerRef" />
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-tooltip 根类），不渲染浮层 -->
  <span v-if="!isMounted" class="ui-tooltip" hidden></span>
  <Teleport v-if="isMounted" to="body">
    <div
      v-if="isOpen"
      :id="tooltipId"
      class="ui-tooltip"
      :class="`ui-tooltip--${placement}`"
      role="tooltip"
      :style="floatingStyle"
    >
      <slot name="content" />
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 浮层：fixed 定位（坐标来自触发元素 rect，间距走 token） ────────── */
.ui-tooltip {
  position: fixed;
  z-index: var(--ui-z-tooltip);
  box-sizing: border-box;
  max-width: calc(var(--ui-space-8) * 6); /* ≈384px；宽度走间距标尺推导（无 tooltip 宽度 token） */
  padding: var(--ui-space-1) var(--ui-space-2);
  background-color: var(--ui-tooltip);
  color: var(--ui-color-white);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  /* 纯提示：不拦截指针（悬停其上不闪烁、无焦点停留），交互请用 DropdownMenu/Popover */
  pointer-events: none;
  animation: ui-tooltip-in var(--ui-motion-fast) var(--ui-ease-out);
}

/* hidden 占位（SSR/挂载前）：显式压制 display，避免被浮层样式覆盖 */
.ui-tooltip[hidden] {
  display: none;
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-tooltip-in {
  from {
    opacity: 0;
  }
}
</style>
