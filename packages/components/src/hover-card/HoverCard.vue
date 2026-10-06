<script setup lang="ts">
/**
 * HoverCard —— 悬停预览卡：触发元素（trigger 插槽）+ 用户/条目信息摘要浮层（default 插槽）。
 *
 * - 触发：hover + focus 双触发（两路径同构、不可关闭任一条，保键盘可达）——
 *   指针进入/键盘聚焦经 openDelay 延迟开启；移出/失焦经 closeDelay 宽限关闭，
 *   宽限期内移回触发元素或移入卡片即取消（卡片可停留、可承载轻交互）。
 * - 显隐：受控 v-model（modelValue 传入即受控，显隐完全跟随），不传则非受控内部状态；
 *   一切开合路径统一 emit update:modelValue（契约同 popover/）。
 * - 触发元素经 cloneVNode 克隆合并 id、aria-expanded、aria-controls 与事件监听
 *   （策略同 popover/tooltip/）；插槽为文本/多根/空时回退内建原生 button 触发器。
 * - 浮层 Teleport 至 body：role="dialog"（非模态、不设 aria-modal）经 aria-labelledby
 *   指向触发元素 id；定位与 Esc 收口于 shared 浮层引擎 useFloatingLayer（anchored
 *   策略：rect 测量 + token 间距 + 结构性 translate），打开期间滚动/resize 跟随重排。
 *   无 scrim：非点击驱动、不变暗页面。
 * - 关闭路径：移出触发元素/卡片（宽限后）/ Esc（触发元素或卡片内按下，焦点回归触发元素）。
 * - SSR：不渲染浮层，仅输出触发元素（ui-hover-card 根类包裹）；Teleport 推迟到客户端。
 */
import { cloneVNode, nextTick, onMounted, ref, useAttrs, useId, useSlots } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import { unwrapElement } from '../shared/useFloatingLayer'
import { useControllableOpen } from '../shared/useControllableOpen'
import {
  HOVER_CARD_CLOSE_DELAY_DEFAULT,
  HOVER_CARD_OPEN_DELAY_DEFAULT,
  HOVER_CARD_PLACEMENT_DEFAULT,
} from './HoverCard.constants'
import { useHoverCard } from './useHoverCard'
import type { HoverCardEmits, HoverCardProps, HoverCardSlots } from './HoverCard.types'

// 根为「触发元素 + Teleport」组合，attrs 不自动继承（手动并入触发元素，同 popover/）
defineOptions({ inheritAttrs: false })

// 注意：modelValue 不给默认值；受控与否由「是否绑定 v-model / 直传 :model-value」判定
// （判定收口于 shared useControllableOpen）
const props = withDefaults(defineProps<HoverCardProps>(), {
  openDelay: HOVER_CARD_OPEN_DELAY_DEFAULT,
  closeDelay: HOVER_CARD_CLOSE_DELAY_DEFAULT,
  placement: HOVER_CARD_PLACEMENT_DEFAULT,
})
const emit = defineEmits<HoverCardEmits>()
defineSlots<HoverCardSlots>()

const attrs = useAttrs()
const slots = useSlots()

const triggerId = useId()
const cardId = useId()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染。 */
const isMounted = ref(false)

/** 触发元素：原生元素或组件实例（组件触发元素经 $el 解包，收口于 shared unwrapElement）。 */
const triggerRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const cardRef = ref<HTMLElement | null>(null)

/** 触发元素 getter：模板 ref 解包收口于 shared unwrapElement（组件实例取根 $el）。 */
function triggerElement(): HTMLElement | null {
  return unwrapElement(triggerRef.value)
}

/* ── 显隐：受控/非受控收口于 shared useControllableOpen；开合统一 emit update:modelValue ── */

/**
 * 受控/非受控开合状态：绑定了 v-model 或直传 :model-value 即为受控（setup 时判定一次，
 * 须查原始 vnode props 键存在性，不能凭 props.modelValue 判空——Vue 对 Boolean 型
 * prop 有布尔转型）；受控跟随 modelValue，非受控走内部状态；setOpen 同值短路，
 * 受控只 emit，非受控 emit + 内部落位。
 */
const { isOpen, setOpen } = useControllableOpen({
  modelValue: () => props.modelValue,
  onUpdate: (value) => emit('update:modelValue', value),
})

/** 请求开启：无 default 插槽（无内容）不开启（受控外部置 true 不受限）。 */
function requestOpen(): void {
  if (!slots.default) return
  setOpen(true)
}

/** 请求关闭；restoreFocus=true（Esc 路径）时焦点回归触发元素。 */
function requestClose(restoreFocus: boolean): void {
  setOpen(false)
  if (restoreFocus) triggerElement()?.focus()
}

const {
  floatingStyle,
  updatePosition,
  onTriggerEnter,
  onTriggerLeave,
  onTriggerFocusout,
  onCardEnter,
  onCardLeave,
  onCardFocusout,
  onTriggerKeydown,
  onCardKeydown,
} = useHoverCard({
  trigger: triggerElement,
  card: () => cardRef.value,
  placement: () => props.placement,
  isOpen: () => isOpen.value,
  hasContent: () => Boolean(slots.default),
  openDelay: () => props.openDelay,
  closeDelay: () => props.closeDelay,
  requestOpen,
  requestClose,
})

onMounted(() => {
  isMounted.value = true
  // 受控初始即打开：watch 不覆盖初始值，等 Teleport 落地后按 rect 定位（同 popover/）。
  if (isOpen.value) void nextTick().then(updatePosition)
})

/* ── 触发元素插槽：单个元素/组件 → 直接作为触发元素；文本/多根/空 → 内建触发器（同 popover/） ── */

/** 默认（trigger 插槽）vnodes（未使用插槽或空数组时为 null）。 */
function slotVNodes(): VNode[] | null {
  const nodes = slots.trigger?.()
  return nodes && nodes.length > 0 ? nodes : null
}

/**
 * 插槽恰好渲染「单个元素/组件 vnode」时返回它（该元素将直接作为触发元素）；
 * 文本/注释/片段 vnode 与多根插槽不可承接触发职责，返回 null 走内建触发器
 * （策略同 popover/）。
 */
function slotTriggerNode(): VNode | null {
  const nodes = slotVNodes()
  if (!nodes || nodes.length !== 1) return null
  const node = nodes[0]
  if (
    typeof node.type === 'string' ||
    typeof node.type === 'object' ||
    typeof node.type === 'function'
  ) {
    return node
  }
  return null
}

function hasSlotTrigger(): boolean {
  return slotTriggerNode() !== null
}

/** 触发元素自身声明的 id（组件触发元素须把 attrs 透传到根元素，id 才可达）。 */
function declaredTriggerId(node: VNode | null): string | null {
  const declared = node?.props?.id
  return typeof declared === 'string' && declared.length > 0 ? declared : null
}

/** 卡片 aria-labelledby：指向触发元素实际 id（插槽声明 id 或组件内定 id）。 */
function triggerLabelledById(): string {
  return declaredTriggerId(slotTriggerNode()) ?? triggerId
}

/**
 * 渲染触发元素：克隆 trigger 插槽的首个（且唯一）元素/组件 vnode，合并 hover/focus/Esc
 * 监听与 aria-expanded（恒有）/ aria-controls（打开时关联卡片 id）；同时透传使用方写在
 * <HoverCard> 上的 attrs（class / data-* / 既有监听器链式合并）。
 * 每次渲染重新求值（非 computed），确保 attrs / 插槽内容不因缓存而滞后（同 tooltip/）。
 */
function renderTrigger(): VNode | null {
  const node = slotTriggerNode()
  if (!node) return null
  const extra: Record<string, unknown> = {
    ...attrs,
    onKeydown: onTriggerKeydown,
    onMouseenter: onTriggerEnter,
    onMouseleave: onTriggerLeave,
    onFocusin: onTriggerEnter,
    onFocusout: onTriggerFocusout,
    'aria-expanded': isOpen.value ? 'true' : 'false',
    'aria-controls': isOpen.value ? cardId : undefined,
  }
  // 原生 button 触发元素未显式声明 type 时补 button（防表单内误提交，同 popover/）
  if (node.type === 'button' && node.props?.type === undefined) extra.type = 'button'
  if (declaredTriggerId(node) === null) extra.id = triggerId
  // 定向断言为 cloneVNode 的 extraProps 形参类型（非 as any 绕过，同 tooltip/popover/）
  return cloneVNode(node, extra as Parameters<typeof cloneVNode>[1], true)
}
</script>

<template>
  <div class="ui-hover-card">
    <!-- 插槽为单个元素/组件：该元素即触发元素（克隆合并 id/aria/事件，不包内建层） -->
    <component v-if="hasSlotTrigger()" :is="renderTrigger()" ref="triggerRef" />
    <!-- 插槽为文本/多根/空：回退内建原生 button 触发器（策略同 popover/） -->
    <button
      v-else
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="ui-hover-card__trigger"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="isOpen ? cardId : undefined"
      v-bind="$attrs"
      @keydown="onTriggerKeydown"
      @mouseenter="onTriggerEnter"
      @mouseleave="onTriggerLeave"
      @focusin="onTriggerEnter"
      @focusout="onTriggerFocusout"
    >
      <slot name="trigger" />
    </button>
    <!-- 浮层仅客户端渲染（SSR 不输出）；打开时 Teleport 至 body -->
    <Teleport v-if="isMounted && isOpen" to="body">
      <div
        :id="cardId"
        ref="cardRef"
        class="ui-hover-card__card"
        :class="`ui-hover-card__card--${placement}`"
        role="dialog"
        :aria-labelledby="triggerLabelledById()"
        :style="floatingStyle"
        @mouseenter="onCardEnter"
        @mouseleave="onCardLeave"
        @focusout="onCardFocusout"
        @keydown="onCardKeydown"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根：行内锚点（浮层不占位，同 popover/） ───────────────────────── */
.ui-hover-card {
  position: relative;
  display: inline-flex;
  font-family: var(--ui-font-sans);
}

/* ── 触发器（回退路径）：插槽为文本/多根/空时的内建原生 button（secondary 观感）；
   插槽为单个元素/组件时不渲染该层，触发元素视觉由其自身负责（如 Button） ── */
.ui-hover-card__trigger {
  display: inline-flex;
  align-items: center;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-radius-sm);
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface);
  border-color: var(--ui-border);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-hover-card__trigger:hover {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

/* ── 卡片：surface 底 + md 圆角 + pop 阴影，按 placement 定位（坐标来自触发元素 rect，
   anchored 策略输出视口坐标，须 fixed 定位——absolute 会按文档坐标解析，页面滚动后卡片漂出视口）；
   与 tooltip 的本质差异：卡片可停留（pointer-events:auto），承载摘要与轻交互 ── */
.ui-hover-card__card {
  position: fixed;
  box-sizing: border-box;
  max-width: calc(var(--ui-space-8) * 6); /* ≈384px；宽度走间距标尺推导（无 hover-card 宽度 token） */
  padding: var(--ui-space-4);
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  box-shadow: var(--ui-shadow-pop);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-1);
  /* 层级走 body 级非模态弹层档 --ui-z-popover（高于 drawer/modal、低于 toast），
     且低于 tooltip（500），使卡片内元素挂载的 tooltip 仍可覆盖卡片 */
  z-index: var(--ui-z-popover);
  animation: ui-hover-card-in var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity 为白名单内的结构性入场动效；卡片 transform 被定位占用，故只动 opacity（同 tooltip/popover/） */
@keyframes ui-hover-card-in {
  from {
    opacity: 0;
  }
}
</style>
