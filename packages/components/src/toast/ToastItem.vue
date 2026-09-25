<script setup lang="ts">
/**
 * ToastItem —— 单条提示的渲染单元（目录内部组件，不从 index.ts 公共导出）。
 *
 * - role=status（error 变体为 role=alert）；变体图标 + 文本 + 关闭按钮。
 * - 自动关闭计时：onMounted 起表；条目 hover 暂停 / 离开恢复；卸载时取消。
 * - 关闭路径统一收敛到 toast.remove(id)（onClose 由单例恰好触发一次）。
 */
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  TOAST_CLOSE_ARIA_LABEL,
  TOAST_CLOSE_ICON_PATHS,
  TOAST_ICON_PATHS,
} from './ToastHost.constants'
import { toast } from './toast'
import { useToastTimer } from './useToastTimer'
import type { ToastItemProps } from './ToastHost.types'

const props = defineProps<ToastItemProps>()

/** error 需要立即被读屏注意（role=alert 隐式 aria-live=assertive），其余为 status（polite）。 */
const itemRole = computed(() => (props.item.variant === 'error' ? 'alert' : 'status'))

const itemClasses = computed(() => [
  'ui-toast__item',
  `ui-toast__item--${props.item.variant}`,
])

const iconPaths = computed(() => TOAST_ICON_PATHS[props.item.variant])

const timer = useToastTimer({
  duration: props.item.duration,
  onExpire: () => toast.remove(props.item.id),
})

onMounted(() => {
  timer.start()
})

onBeforeUnmount(() => {
  timer.cancel()
})

/** 关闭按钮 / 超时共用同一条移除路径。 */
function requestClose(): void {
  toast.remove(props.item.id)
}
</script>

<template>
  <div
    :class="itemClasses"
    :role="itemRole"
    @mouseenter="timer.pause()"
    @mouseleave="timer.resume()"
  >
    <span class="ui-toast__icon">
      <svg
        class="ui-toast__icon-svg"
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
        <path v-for="d in iconPaths" :key="d" :d="d" />
      </svg>
    </span>
    <p class="ui-toast__message">{{ item.message }}</p>
    <button type="button" class="ui-toast__close" :aria-label="TOAST_CLOSE_ARIA_LABEL" @click="requestClose">
      <svg
        class="ui-toast__close-svg"
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
        <path v-for="d in TOAST_CLOSE_ICON_PATHS" :key="d" :d="d" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* ── 条目：surface 底卡片，pop 阴影，固定角堆叠中的一条 ─────────────── */
.ui-toast__item {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
  pointer-events: auto; /* 容器不吃指针事件，交互留给条目 */
  width: calc(var(--ui-space-8) * 5.5); /* ≈352px：间距标尺推导（无 toast 宽度 token，已在任务结果中提出需求） */
  max-width: calc(100vw - var(--ui-space-6));
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，沿 Button 先例，已在任务结果中提出需求） */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-3) var(--ui-space-4);
  background-color: var(--ui-surface);
  box-shadow: var(--ui-shadow-pop);
  animation: ui-toast-item-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 变体图标：soft 底色块 + 变体色描边（全部 token 化） ───────────── */
.ui-toast__icon {
  display: inline-flex;
  flex: none;
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-sm);
}

.ui-toast__icon-svg {
  display: block;
}

.ui-toast__item--success .ui-toast__icon {
  background-color: var(--ui-success-soft);
  color: var(--ui-success);
}

.ui-toast__item--error .ui-toast__icon {
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-toast__item--info .ui-toast__icon {
  background-color: var(--ui-info-soft);
  color: var(--ui-info);
}

.ui-toast__item--warning .ui-toast__icon {
  background-color: var(--ui-warning-soft);
  color: var(--ui-warning);
}

/* ── 文本 ─────────────────────────────────────────────────────────── */
.ui-toast__message {
  flex: 1;
  margin: 0;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  overflow-wrap: anywhere;
}

/* ── 关闭按钮：原生 button，安静图标钮 ────────────────────────────── */
/* transparent 为结构性"无填充/无描边"（非色相取值，无对应 token，沿 Button ghost 先例） */
.ui-toast__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-1);
  border: none;
  border-radius: var(--ui-radius-sm);
  background-color: transparent;
  color: var(--ui-text-3);
  font-family: var(--ui-font-sans);
  cursor: pointer;
}

.ui-toast__close:hover {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

.ui-toast__close-svg {
  display: block;
}

/* ── 入场动效：仅 opacity/transform，时长/缓动走 token ────────────── */
/* prefers-reduced-motion 下 --ui-motion-* 被 paper.css 归零，动画即刻退化为静止 */
@keyframes ui-toast-item-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * -1));
  }
}
</style>
