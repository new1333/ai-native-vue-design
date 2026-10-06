<script setup lang="ts">
/**
 * Popconfirm —— 气泡确认框：轻量二次确认（title/description + 取消/确认原生按钮），
 * 锚定于触发元素（trigger 插槽，无包装 DOM）。
 *
 * - 开合：点击触发元素开合（非受控，显隐内部管理）；title 与 description 均为空
 *   时不弹层。确认/取消按钮点击先 emit confirm/cancel 再关闭；loading=true（确认
 *   进行中）时确认按钮渲染旋转指示并挂 aria-busy，确认/取消点击均被拦截（防重复
 *   提交，异步完成后由使用方置回 false）；Esc（触发元素或气泡内）、再次点击触发
 *   元素、点击气泡之外区域同样关闭（不发事件）。
 * - 触发元素经 cloneVNode 克隆合并 id、aria-expanded、aria-controls 与事件监听
 *   （策略同 popover/）；插槽为文本/多根/空时回退内建原生 button 触发器。
 * - 气泡 Teleport 至 body：role="dialog"（非模态、不设 aria-modal），aria-labelledby
 *   指向标题元素 id（无 title 时指向触发元素 id），有 description 时 aria-describedby
 *   指向描述元素 id；定位与 Esc 收口于 shared 浮层引擎 useFloatingLayer（anchored
 *   策略：rect 测量 + token 间距 + 结构性 translate），打开期间滚动/resize 跟随重排。
 * - 焦点：气泡 Teleport 至 body 尾部、Tab 序不自然经过，打开时把初始焦点移入气泡
 *   （落在「取消」这一破坏性最小动作，Tab 即达「确认」）；关闭（确认/取消/Esc/
 *   外部点击时焦点在气泡内）把焦点还原到触发元素。
 * - danger=true：确认按钮走 destructive token（--ui-danger-soft 柔底 → hover 实底
 *   --ui-danger），内建图标转 --ui-danger。
 * - SSR：不渲染气泡，仅输出触发元素（ui-popconfirm 根类锚点）；Teleport 推迟到客户端。
 */
import { cloneVNode, nextTick, onMounted, ref, useAttrs, useId, useSlots, watch } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import { unwrapElement } from '../shared/useFloatingLayer'
import {
  POPCONFIRM_CANCEL_TEXT_DEFAULT,
  POPCONFIRM_CONFIRM_TEXT_DEFAULT,
  POPCONFIRM_PLACEMENT_DEFAULT,
} from './Popconfirm.constants'
import { usePopconfirm } from './usePopconfirm'
import type { PopconfirmEmits, PopconfirmProps, PopconfirmSlots } from './Popconfirm.types'

// 根为「触发元素 + Teleport」组合，attrs 不自动继承（手动并入触发元素，同 popover/）
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PopconfirmProps>(), {
  confirmText: POPCONFIRM_CONFIRM_TEXT_DEFAULT,
  cancelText: POPCONFIRM_CANCEL_TEXT_DEFAULT,
  danger: false,
  placement: POPCONFIRM_PLACEMENT_DEFAULT,
  loading: false,
})
const emit = defineEmits<PopconfirmEmits>()
defineSlots<PopconfirmSlots>()

const attrs = useAttrs()
const slots = useSlots()

const cardId = useId()
const triggerId = useId()
const titleId = useId()
const descriptionId = useId()

/** 客户端已挂载：SSR 期间恒为 false，气泡分支不渲染。 */
const isMounted = ref(false)

/** 触发元素：原生元素或组件实例（组件触发元素经 $el 解包，收口于 shared unwrapElement）。 */
const triggerRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const cardRef = ref<HTMLElement | null>(null)
/** 「取消」按钮：打开后初始焦点落点（破坏性最小动作）。 */
const cancelRef = ref<HTMLButtonElement | null>(null)

/** 触发元素 getter：模板 ref 解包收口于 shared unwrapElement（组件实例取根 $el）。 */
function triggerElement(): HTMLElement | null {
  return unwrapElement(triggerRef.value)
}

const { isOpen, floatingStyle, toggle, close, onTriggerKeydown, onCardKeydown } = usePopconfirm({
  placement: () => props.placement,
  trigger: triggerElement,
  card: () => cardRef.value,
  hasContent: () => Boolean(props.title || props.description),
})

/** 确认：先发出事件，随后关闭气泡并焦点回归触发元素；loading 期间拦截（防重复提交）。 */
function onConfirm(): void {
  if (props.loading) return
  emit('confirm')
  close(true)
}

/** 取消：先发出事件，随后关闭气泡并焦点回归触发元素；loading 期间拦截（确认未完成前不可撤出）。 */
function onCancel(): void {
  if (props.loading) return
  emit('cancel')
  close(true)
}

onMounted(() => {
  isMounted.value = true
})

// 打开后把初始焦点移入气泡：气泡 Teleport 至 body 尾部、Tab 序不自然经过，
// 焦点落在「取消」（破坏性最小动作，WAI-ARIA dialog 惯例），Tab 即达「确认」。
watch(isOpen, (open) => {
  if (open) void nextTick().then(() => cancelRef.value?.focus())
})

/* ── 触发元素插槽：单个元素/组件 → 直接作为触发元素；文本/多根/空 → 内建触发器 ── */

/**
 * 插槽恰好渲染「单个元素/组件 vnode」时返回它（该元素将直接作为触发元素）；
 * 文本/注释/片段 vnode 与多根插槽不可承接触发职责，返回 null 走内建触发器
 * （策略同 popover/）。
 */
function slotTriggerNode(): VNode | null {
  const nodes = slots.trigger?.()
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

/**
 * 气泡 aria-labelledby：有 title 时指向标题元素 id（气泡以标题为名）；
 * 无 title 时指向触发元素实际 id（插槽声明 id 或组件内定 id，策略同 popover/）。
 */
function labelledById(): string {
  if (props.title) return titleId
  return declaredTriggerId(slotTriggerNode()) ?? triggerId
}

/**
 * 渲染触发元素：克隆 trigger 插槽的首个（且唯一）元素/组件 vnode，合并交互监听与
 * aria-expanded（恒有）/ aria-controls（打开时关联气泡 id）；同时透传使用方写在
 * <Popconfirm> 上的 attrs（class / data-* / 既有监听器链式合并）。
 * 每次渲染重新求值（非 computed），确保 attrs / 插槽内容不因缓存而滞后（同 tooltip/）。
 */
function renderTrigger(): VNode | null {
  const node = slotTriggerNode()
  if (!node) return null
  const extra: Record<string, unknown> = {
    ...attrs,
    onClick: toggle,
    onKeydown: onTriggerKeydown,
    'aria-expanded': isOpen.value ? 'true' : 'false',
    'aria-controls': isOpen.value ? cardId : undefined,
  }
  // 原生 button 触发元素未显式声明 type 时补 button（防表单内误提交，同 popover/）
  if (node.type === 'button' && node.props?.type === undefined) extra.type = 'button'
  if (declaredTriggerId(node) === null) extra.id = triggerId
  // 定向断言为 cloneVNode 的 extraProps 形参类型（非 as any 绕过，同 tooltip/）
  return cloneVNode(node, extra as Parameters<typeof cloneVNode>[1], true)
}
</script>

<template>
  <div class="ui-popconfirm">
    <!-- 插槽为单个元素/组件：该元素即触发元素（克隆合并 id/aria/事件，不包内建层） -->
    <component v-if="hasSlotTrigger()" :is="renderTrigger()" ref="triggerRef" />
    <!-- 插槽为文本/多根/空：回退内建原生 button 触发器（策略同 popover/） -->
    <button
      v-else
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="ui-popconfirm__trigger"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="isOpen ? cardId : undefined"
      v-bind="$attrs"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" />
    </button>
    <!-- 气泡仅客户端渲染（SSR 不输出）；打开时 Teleport 至 body -->
    <Teleport v-if="isMounted && isOpen" to="body">
      <div
        :id="cardId"
        ref="cardRef"
        class="ui-popconfirm__card"
        :class="`ui-popconfirm__card--${placement}`"
        role="dialog"
        :aria-labelledby="labelledById()"
        :aria-describedby="description ? descriptionId : undefined"
        :style="floatingStyle"
        @keydown="onCardKeydown"
      >
        <div class="ui-popconfirm__header">
          <span class="ui-popconfirm__icon" :class="{ 'ui-popconfirm__icon--danger': danger }">
            <slot name="icon">
              <svg
                class="ui-popconfirm__icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path d="M12 9v4.5m0 3h.01" stroke-linecap="round" />
                <path
                  d="M10.29 4.1 2.4 17.52a1.94 1.94 0 0 0 1.68 2.9h15.84a1.94 1.94 0 0 0 1.68-2.9L13.71 4.1a1.94 1.94 0 0 0-3.42 0Z"
                  stroke-linejoin="round"
                />
              </svg>
            </slot>
          </span>
          <div class="ui-popconfirm__body">
            <p v-if="title" :id="titleId" class="ui-popconfirm__title">{{ title }}</p>
            <p v-if="description" :id="descriptionId" class="ui-popconfirm__description">
              {{ description }}
            </p>
          </div>
        </div>
        <div class="ui-popconfirm__actions">
          <button
            ref="cancelRef"
            type="button"
            class="ui-popconfirm__btn ui-popconfirm__btn--cancel"
            :aria-disabled="loading ? 'true' : undefined"
            @click="onCancel"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="ui-popconfirm__btn"
            :class="danger ? 'ui-popconfirm__btn--danger' : 'ui-popconfirm__btn--confirm'"
            :aria-busy="loading ? 'true' : undefined"
            @click="onConfirm"
          >
            <span v-if="loading" class="ui-popconfirm__btn-spinner">
              <svg
                class="ui-popconfirm__btn-spinner-svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke-linecap="round"
                  stroke-dasharray="38"
                  stroke-dashoffset="12"
                />
              </svg>
            </span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根：行内锚点（气泡不占位，同 popover/） ───────────────────────── */
.ui-popconfirm {
  position: relative;
  display: inline-flex;
  font-family: var(--ui-font-sans);
}

/* ── 触发器（回退路径）：插槽为文本/多根/空时的内建原生 button（secondary 观感）；
   插槽为单个元素/组件时不渲染该层，触发元素视觉由其自身负责（如 Button） ── */
.ui-popconfirm__trigger {
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

.ui-popconfirm__trigger:hover {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

/* ── 气泡：surface 底 + md 圆角 + pop 阴影，fixed 定位（坐标来自触发元素 rect）；
   层级走 body 级非模态弹层档 --ui-z-popover（高于 drawer/modal，低于 toast） ── */
.ui-popconfirm__card {
  position: fixed;
  z-index: var(--ui-z-popover);
  box-sizing: border-box;
  max-width: calc(var(--ui-space-8) * 6); /* ≈384px；宽度走间距标尺推导（无气泡宽度 token） */
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
  animation: ui-popconfirm-in var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── 头部：图标 + 标题/描述 ─────────────────────────────────────────── */
.ui-popconfirm__header {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
}

.ui-popconfirm__icon {
  display: inline-flex;
  flex-shrink: 0;
  margin-top: var(--ui-space-1);
  color: var(--ui-warning);
}

.ui-popconfirm__icon--danger {
  color: var(--ui-danger);
}

/* 内建图标 16px 档（Icon Token：16/20/24，此处用 --ui-space-4 标尺取值） */
.ui-popconfirm__icon svg {
  display: block;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
}

.ui-popconfirm__body {
  min-width: 0;
}

.ui-popconfirm__title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
}

.ui-popconfirm__description {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

/* 标题与描述相邻时留一行间距 */
.ui-popconfirm__title + .ui-popconfirm__description {
  margin-top: var(--ui-space-1);
}

/* ── 动作区：取消（左）/ 确认（右），右对齐 ─────────────────────────── */
.ui-popconfirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-3);
}

.ui-popconfirm__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: var(--ui-space-1);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-button-radius);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-button-font-weight);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 确认 loading：旋转指示（currentColor 随确认/危险档文字色，Button 家族同款） ── */
.ui-popconfirm__btn-spinner {
  display: inline-flex;
  flex: none;
  align-items: center;
}

/* 16px 档图标尺寸（Icon Token：16/20/24）；svg 几何数值（dasharray/offset）同 Button 内建加载指示 */
.ui-popconfirm__btn-spinner-svg {
  width: 16px;
  height: 16px;
  animation: ui-popconfirm-spin calc(var(--ui-motion-default) * 4) linear infinite;
}

/* 加载旋转：时长由 token 推导（≈720ms）；reduced-motion 时随 --ui-motion-default 归零停转 */
@keyframes ui-popconfirm-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 确认（常规）：primary 观感（实底强调色） */
.ui-popconfirm__btn--confirm {
  background-color: var(--ui-accent);
  border-color: var(--ui-accent);
  color: var(--ui-on-accent);
}

.ui-popconfirm__btn--confirm:hover {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
}

.ui-popconfirm__btn--confirm:active {
  background-color: var(--ui-accent-hover);
  border-color: var(--ui-accent-hover);
}

/* 确认（危险动作）：destructive token，柔底 → hover/按压实底白字（Button danger 同款） */
.ui-popconfirm__btn--danger {
  background-color: var(--ui-danger-soft);
  border-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-popconfirm__btn--danger:hover {
  background-color: var(--ui-danger);
  border-color: var(--ui-danger);
  color: var(--ui-color-white);
}

.ui-popconfirm__btn--danger:active {
  background-color: var(--ui-danger);
  border-color: var(--ui-danger);
  color: var(--ui-color-white);
}

/* 取消：secondary 观感（surface 底 + 描边） */
.ui-popconfirm__btn--cancel {
  background-color: var(--ui-surface);
  border-color: var(--ui-border);
  color: var(--ui-text-1);
}

.ui-popconfirm__btn--cancel:hover {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

.ui-popconfirm__btn--cancel:active {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity 为白名单内的结构性入场动效；气泡 transform 被定位占用，故只动 opacity（同 tooltip/） */
@keyframes ui-popconfirm-in {
  from {
    opacity: 0;
  }
}
</style>
