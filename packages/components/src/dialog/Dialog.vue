<script setup lang="ts">
/**
 * Dialog —— 模态对话框：Teleport 至 body 的浮层，含遮罩、标题、正文与底部动作区。
 *
 * - 受控可见性 v-model（modelValue）；遮罩点击关闭可配（closeOnScrim，默认开）；
 *   Esc 关闭；footer 插槽缺省时渲染默认「关闭」按钮（复用本库 Button）。
 * - 可访问名：有标题时 aria-labelledby 关联标题元素；无标题时兜底到 ariaLabel prop
 *   （attrs 写 aria-label 同名受理）或 attrs 透传的 aria-labelledby（引用使用方
 *   自备的命名元素），避免 role="dialog" 无可访问名。
 * - 焦点契约：打开时焦点移入面板并 Tab 循环圈定，关闭后焦点还原到打开前元素。
 * - body 滚动锁定：打开期间挂 class + 行内 overflow 兜底，关闭/卸载时清理。
 * - SSR：挂载前不渲染浮层，仅输出 hidden 占位（ui-dialog 根类），
 *   renderToString 输出稳定；Teleport 只在客户端激活后生效。
 */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, watch } from 'vue'
import { Button } from '../button'
import {
  DIALOG_CLOSE_BUTTON_TEXT,
  DIALOG_CLOSE_ON_SCRIM_DEFAULT,
  DIALOG_SIZE_DEFAULT,
} from './Dialog.constants'
import { useDialog } from './useDialog'
import type {
  DialogCloseReason,
  DialogEmits,
  DialogExpose,
  DialogProps,
  DialogSlots,
} from './Dialog.types'

// 浮层根是「占位 div / Teleport」条件分支（fragment），attrs 不自动继承
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  size: DIALOG_SIZE_DEFAULT,
  closeOnScrim: DIALOG_CLOSE_ON_SCRIM_DEFAULT,
})
const emit = defineEmits<DialogEmits>()
defineSlots<DialogSlots>()

const slots = useSlots()
const attrs = useAttrs()
const titleId = useId()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染。 */
const isMounted = ref(false)
const panelEl = ref<HTMLDivElement | null>(null)

const hasTitle = computed(() => Boolean(props.title) || Boolean(slots.title))
const rootClasses = computed(() => ['ui-dialog', `ui-dialog--${props.size}`])

/**
 * 面板可访问名兜底：有标题时一律以标题关联优先；无标题时落到 attrs 透传的
 * aria-labelledby（使用方自备命名元素的引用），否则落到 ariaLabel prop
 * （attrs 写 aria-label 会被该 prop 同名受理，两条写法汇入同一兜底）。
 */
const panelLabelledBy = computed(() => {
  if (hasTitle.value) return titleId
  const declared = attrs['aria-labelledby']
  return typeof declared === 'string' && declared.length > 0 ? declared : undefined
})

/** aria-label 兜底仅在无标题且非空串时渲染（空串不是合法可访问名）。 */
const panelAriaLabel = computed(() =>
  hasTitle.value || props.ariaLabel === undefined || props.ariaLabel.length === 0
    ? undefined
    : props.ariaLabel,
)

function requestClose(reason: DialogCloseReason): void {
  emit('update:modelValue', false)
  emit('close', reason)
}

const { activate, deactivate, onKeydown, focusDialog } = useDialog({
  panel: () => panelEl.value,
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

defineExpose<DialogExpose>({ focus: focusDialog })
</script>

<template>
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-dialog 根类），不渲染浮层 -->
  <div v-if="!isMounted" class="ui-dialog" hidden></div>
  <Teleport v-else to="body">
    <div v-if="modelValue" :class="rootClasses" @keydown="onKeydown">
      <div class="ui-dialog__scrim" @click="onScrimClick"></div>
      <div
        ref="panelEl"
        class="ui-dialog__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="panelLabelledBy"
        :aria-label="panelAriaLabel"
        tabindex="-1"
      >
        <header v-if="hasTitle" class="ui-dialog__header">
          <h2 :id="titleId" class="ui-dialog__title">
            <slot name="title">{{ title }}</slot>
          </h2>
        </header>
        <div class="ui-dialog__body">
          <slot />
        </div>
        <footer class="ui-dialog__footer">
          <slot name="footer">
            <Button @click="requestClose('footer')">{{ DIALOG_CLOSE_BUTTON_TEXT }}</Button>
          </slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 浮层根：满屏定位 + 居中（z-index 走 modal 层级 token） ───────── */
.ui-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-5);
  font-family: var(--ui-font-sans);
}

/* hidden 占位（SSR/挂载前）：显式压制 display，避免被根分支 class 覆盖 */
.ui-dialog[hidden] {
  display: none;
}

/* ── 遮罩：点击关闭命中区，非交互元素（不聚焦、无 role） ──────────── */
.ui-dialog__scrim {
  position: absolute;
  inset: 0;
  background-color: var(--ui-scrim);
  animation: ui-dialog-scrim-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 面板：surface 底 + lg 圆角 + modal 阴影（token 化） ──────────── */
.ui-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(var(--ui-space-8) * 9); /* md ≈576px；宽度走间距标尺推导（无 dialog 宽度 token，已在结果中提出需求） */
  max-width: 100%;
  max-height: 100%;
  background-color: var(--ui-surface);
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-modal);
  animation: ui-dialog-panel-in var(--ui-motion-default) var(--ui-ease-out);
}

/* 尺寸：sm ≈384px / lg ≈704px（同样由间距标尺推导） */
.ui-dialog--sm .ui-dialog__panel {
  width: calc(var(--ui-space-7) * 8);
}

.ui-dialog--lg .ui-dialog__panel {
  width: calc(var(--ui-space-8) * 11);
}

/* ── 头部 / 正文 / 底部 ──────────────────────────────────────────── */
.ui-dialog__header {
  padding: var(--ui-space-5) var(--ui-space-5) var(--ui-space-2);
}

.ui-dialog__title {
  margin: 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--ui-space-2) var(--ui-space-5);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  padding: var(--ui-space-3) var(--ui-space-5) var(--ui-space-5);
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-dialog-scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes ui-dialog-panel-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * 2));
  }
}
</style>
