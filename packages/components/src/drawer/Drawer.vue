<script setup lang="ts">
/**
 * Drawer —— 侧滑抽屉浮层：四向（left/right/top/bottom）滑出、模态/非模态。
 *
 * - 受控可见性 v-model（modelValue）；模态下遮罩点击关闭可配（closeOnScrim，默认开）、
 *   焦点圈定 + body 滚动锁定；Esc 关闭（焦点在浮层内即可，非模态同样生效）；
 *   头部右侧内置原生关闭按钮；footer 插槽缺省不渲染底部（无默认按钮）。
 * - 非模态（modal=false）：不渲染遮罩、不抢焦点、不锁滚动、Tab 不圈定，页面保持可交互，
 *   aria-modal 移除；根层 pointer-events 穿透，仅面板可交互。
 * - 焦点契约（模态）：打开时焦点移入面板并 Tab 循环圈定，关闭后焦点还原到打开前元素。
 * - SSR：挂载前不渲染浮层，仅输出 hidden 占位（ui-drawer 根类），
 *   renderToString 输出稳定；Teleport 只在客户端激活后生效。
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import {
  DRAWER_CLOSE_LABEL,
  DRAWER_CLOSE_ON_SCRIM_DEFAULT,
  DRAWER_MODAL_DEFAULT,
  DRAWER_SIDE_DEFAULT,
  DRAWER_SIZE_DEFAULT,
} from './Drawer.constants'
import { useDrawer } from './useDrawer'
import type {
  DrawerCloseReason,
  DrawerEmits,
  DrawerExpose,
  DrawerProps,
  DrawerSlots,
} from './Drawer.types'

// 浮层根是「占位 div / Teleport」条件分支（fragment），attrs 不自动继承
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DrawerProps>(), {
  modelValue: false,
  side: DRAWER_SIDE_DEFAULT,
  size: DRAWER_SIZE_DEFAULT,
  modal: DRAWER_MODAL_DEFAULT,
  closeOnScrim: DRAWER_CLOSE_ON_SCRIM_DEFAULT,
})
const emit = defineEmits<DrawerEmits>()
defineSlots<DrawerSlots>()

const slots = useSlots()
const headerId = useId()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染。 */
const isMounted = ref(false)
const panelEl = ref<HTMLDivElement | null>(null)

const hasHeader = computed(() => Boolean(slots.header))
const hasFooter = computed(() => Boolean(slots.footer))
const rootClasses = computed(() => [
  'ui-drawer',
  `ui-drawer--${props.side}`,
  `ui-drawer--${props.size}`,
  { 'ui-drawer--non-modal': !props.modal },
])

function requestClose(reason: DrawerCloseReason): void {
  emit('update:modelValue', false)
  emit('close', reason)
}

const { activate, deactivate, onKeydown, focusDrawer } = useDrawer({
  panel: () => panelEl.value,
  modal: () => props.modal,
  onEscape: () => requestClose('esc'),
})

function onScrimClick(): void {
  if (props.closeOnScrim) requestClose('scrim')
}

// 打开/关闭副作用（滚动锁、焦点移入/还原）跟随受控状态；flush post 保证 DOM 就绪。
watch(
  () => props.modelValue,
  open => {
    if (open) activate()
    else deactivate()
  },
  { flush: 'post' },
)

onMounted(() => {
  isMounted.value = true
  // 初始即打开：等 Teleport 重渲染落地后激活（activate 内部再等一次 nextTick）。
  if (props.modelValue) activate()
})

onBeforeUnmount(() => {
  // 卸载兜底：打开状态下卸载也要解除滚动锁并还原焦点。
  deactivate()
})

defineExpose<DrawerExpose>({ focus: focusDrawer })
</script>

<template>
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-drawer 根类），不渲染浮层 -->
  <div v-if="!isMounted" class="ui-drawer" hidden></div>
  <Teleport v-else to="body">
    <div v-if="modelValue" :class="rootClasses" @keydown="onKeydown">
      <!-- 模态遮罩：点击关闭命中区，非交互元素（不聚焦、无 role）；非模态不渲染 -->
      <div v-if="modal" class="ui-drawer__scrim" @click="onScrimClick"></div>
      <div
        ref="panelEl"
        class="ui-drawer__panel"
        role="dialog"
        :aria-modal="modal ? 'true' : undefined"
        :aria-labelledby="hasHeader ? headerId : undefined"
        tabindex="-1"
      >
        <header class="ui-drawer__header" :class="{ 'ui-drawer__header--bare': !hasHeader }">
          <div v-if="hasHeader" :id="headerId" class="ui-drawer__heading">
            <slot name="header" />
          </div>
          <button
            type="button"
            class="ui-drawer__close"
            :aria-label="DRAWER_CLOSE_LABEL"
            @click="requestClose('close-button')"
          >
            <svg
              class="ui-drawer__close-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div class="ui-drawer__body">
          <slot />
        </div>
        <footer v-if="hasFooter" class="ui-drawer__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 浮层根：满屏定位（z-index 走 drawer 层级 token） ────────────── */
.ui-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-drawer);
  font-family: var(--ui-font-sans);
}

/* hidden 占位（SSR/挂载前）：显式压制 display，避免被根分支 class 覆盖 */
.ui-drawer[hidden] {
  display: none;
}

/* ── 非模态：根层点击穿透，页面保持可交互；仅面板可命中 ───────────── */
.ui-drawer--non-modal {
  pointer-events: none;
}

.ui-drawer--non-modal .ui-drawer__panel {
  pointer-events: auto;
}

/* ── 遮罩：点击关闭命中区，非交互元素（不聚焦、无 role） ──────────── */
.ui-drawer__scrim {
  position: absolute;
  inset: 0;
  background-color: var(--ui-scrim);
  animation: ui-drawer-scrim-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 面板：surface 底 + modal 阴影（token 化）；定位/尺寸按 side × size 落位 ── */
.ui-drawer__panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: var(--ui-surface);
  box-shadow: var(--ui-shadow-modal);
  animation-duration: var(--ui-motion-default);
  animation-timing-function: var(--ui-ease-out);
}

/* 四向定位：贴边滑出；内侧两角圆角（外侧贴边保持直角，默认初始值，不写裸 0） */
.ui-drawer--left .ui-drawer__panel {
  top: 0;
  bottom: 0;
  left: 0;
  border-top-right-radius: var(--ui-radius-lg);
  border-bottom-right-radius: var(--ui-radius-lg);
  animation-name: ui-drawer-in-left;
}

.ui-drawer--right .ui-drawer__panel {
  top: 0;
  bottom: 0;
  right: 0;
  border-top-left-radius: var(--ui-radius-lg);
  border-bottom-left-radius: var(--ui-radius-lg);
  animation-name: ui-drawer-in-right;
}

.ui-drawer--top .ui-drawer__panel {
  top: 0;
  left: 0;
  right: 0;
  border-bottom-left-radius: var(--ui-radius-lg);
  border-bottom-right-radius: var(--ui-radius-lg);
  animation-name: ui-drawer-in-top;
}

.ui-drawer--bottom .ui-drawer__panel {
  bottom: 0;
  left: 0;
  right: 0;
  border-top-left-radius: var(--ui-radius-lg);
  border-top-right-radius: var(--ui-radius-lg);
  animation-name: ui-drawer-in-bottom;
}

/* 尺寸（滑出轴向）：sm≈320 / md≈448 / lg≈640，由间距标尺推导，永不超出视口 */
.ui-drawer--left.ui-drawer--sm .ui-drawer__panel,
.ui-drawer--right.ui-drawer--sm .ui-drawer__panel {
  width: calc(var(--ui-space-8) * 5);
  max-width: 100%;
}

.ui-drawer--left.ui-drawer--md .ui-drawer__panel,
.ui-drawer--right.ui-drawer--md .ui-drawer__panel {
  width: calc(var(--ui-space-8) * 7);
  max-width: 100%;
}

.ui-drawer--left.ui-drawer--lg .ui-drawer__panel,
.ui-drawer--right.ui-drawer--lg .ui-drawer__panel {
  width: calc(var(--ui-space-8) * 10);
  max-width: 100%;
}

.ui-drawer--top.ui-drawer--sm .ui-drawer__panel,
.ui-drawer--bottom.ui-drawer--sm .ui-drawer__panel {
  height: calc(var(--ui-space-8) * 5);
  max-height: 100%;
}

.ui-drawer--top.ui-drawer--md .ui-drawer__panel,
.ui-drawer--bottom.ui-drawer--md .ui-drawer__panel {
  height: calc(var(--ui-space-8) * 7);
  max-height: 100%;
}

.ui-drawer--top.ui-drawer--lg .ui-drawer__panel,
.ui-drawer--bottom.ui-drawer--lg .ui-drawer__panel {
  height: calc(var(--ui-space-8) * 10);
  max-height: 100%;
}

/* ── 头部 / 正文 / 底部 ──────────────────────────────────────────── */
.ui-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button 先例在任务结果中提出需求） */
  border-bottom: 1px solid var(--ui-border);
  padding: var(--ui-space-3) var(--ui-space-5);
}

/* 无 header 插槽时头部仅剩关闭按钮：靠右排布 */
.ui-drawer__header--bare {
  justify-content: flex-end;
}

.ui-drawer__heading {
  min-width: 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-drawer__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--ui-space-4) var(--ui-space-5);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button 先例在任务结果中提出需求） */
  border-top: 1px solid var(--ui-border);
  padding: var(--ui-space-3) var(--ui-space-5);
}

/* ── 头部关闭按钮：原生 button + 内联 SVG（currentColor，尺寸 20 见 CONVENTIONS §2） ── */
.ui-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: var(--ui-space-1);
  border: none; /* 结构性重置：非视觉取值 */
  background-color: transparent;
  border-radius: var(--ui-radius-sm);
  color: var(--ui-text-2);
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-drawer__close:hover {
  color: var(--ui-text-1);
  background-color: var(--ui-surface-muted);
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token）；滑距为面板自身 100%（贴边滑出语义） */
@keyframes ui-drawer-scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes ui-drawer-in-left {
  from {
    transform: translateX(-100%);
  }
}

@keyframes ui-drawer-in-right {
  from {
    transform: translateX(100%);
  }
}

@keyframes ui-drawer-in-top {
  from {
    transform: translateY(-100%);
  }
}

@keyframes ui-drawer-in-bottom {
  from {
    transform: translateY(100%);
  }
}
</style>
