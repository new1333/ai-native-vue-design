<script setup lang="ts">
/**
 * Artifact —— AI 生成内容画布：Teleport 至 body 的模态浮层，承载 AI 产物
 * （代码/文档）的聚焦展示与操作（复制、关闭）。
 *
 * - 受控可见性 v-model（modelValue）；Esc / 遮罩（closeOnScrim 可配）/
 *   头部「关闭」IconButton 三条关闭路径都发出 update:modelValue false，
 *   close 事件附带来源（scrim / esc / action）。
 * - 焦点契约复用同族 Dialog 的 useDialog：打开时焦点移入面板并 Tab 循环圈定，
 *   关闭后焦点还原；body 滚动锁定同样复用（跨实例计数，支持与 Dialog 嵌套）。
 * - 操作栏为 IconButton 组合：复制（copy 事件 + 尽力写入剪贴板 + 瞬时已复制态）、
 *   关闭。内容渲染不在职责内：default 插槽内容由使用方渲染
 *   （Markdown→HTML、代码高亮均由使用方完成），复制读取正文容器的渲染文本。
 * - attrs 显式落到面板（fragment 根不自动继承）：使用方可经 aria-label 补齐面板名称。
 * - SSR：挂载前不渲染浮层，仅输出 hidden 占位（ui-artifact 根类），
 *   renderToString 输出稳定；Teleport 只在客户端激活后生效。
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import { IconButton } from '../icon-button'
import { useDialog } from '../dialog/useDialog'
import {
  ARTIFACT_CLOSE_LABEL,
  ARTIFACT_CLOSE_ON_SCRIM_DEFAULT,
  ARTIFACT_COPIED_LABEL,
  ARTIFACT_COPIED_RESET_DELAY_MS,
  ARTIFACT_COPY_LABELS,
  ARTIFACT_TYPE_DEFAULT,
  ARTIFACT_TYPE_LABELS,
} from './Artifact.constants'
import type {
  ArtifactCloseReason,
  ArtifactCopyPayload,
  ArtifactEmits,
  ArtifactExpose,
  ArtifactProps,
  ArtifactSlots,
} from './Artifact.types'

// 浮层根是「占位 div / Teleport」条件分支（fragment），attrs 显式落到面板
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ArtifactProps>(), {
  modelValue: false,
  type: ARTIFACT_TYPE_DEFAULT,
  closeOnScrim: ARTIFACT_CLOSE_ON_SCRIM_DEFAULT,
})
const emit = defineEmits<ArtifactEmits>()
defineSlots<ArtifactSlots>()

const slots = useSlots()
const titleId = useId()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染。 */
const isMounted = ref(false)
const panelEl = ref<HTMLDivElement | null>(null)
/** 正文容器：复制动作从这里读取渲染文本（textContent）。 */
const contentEl = ref<HTMLDivElement | null>(null)
/** 已复制的瞬时反馈态（图标与 aria-label 短暂切换后定时复位）。 */
const copied = ref(false)

const hasHeaderSlot = computed(() => Boolean(slots.header))
// header 插槽整体替换默认头部：此时标题不渲染、不自动出具 aria-labelledby，
// 面板可访问名称经 attrs（aria-label）由使用方提供
const hasTitle = computed(() => Boolean(props.title) && !hasHeaderSlot.value)
const rootClasses = computed(() => ['ui-artifact', `ui-artifact--${props.type}`])
const badgeLabel = computed(() => props.language ?? ARTIFACT_TYPE_LABELS[props.type])
const copyLabel = computed(() => (copied.value ? ARTIFACT_COPIED_LABEL : ARTIFACT_COPY_LABELS[props.type]))

function requestClose(reason: ArtifactCloseReason): void {
  emit('update:modelValue', false)
  emit('close', reason)
}

const { activate, deactivate, onKeydown, focusDialog } = useDialog({
  panel: () => panelEl.value,
  onEscape: () => requestClose('esc'),
})

/* ── 复制：emit copy + 尽力写入剪贴板 + 瞬时已复制态（定时复位，卸载清理） ── */
let copiedResetTimer: number | null = null

function clearCopiedReset(): void {
  if (copiedResetTimer === null) return
  window.clearTimeout(copiedResetTimer)
  copiedResetTimer = null
}

/** 尽力写入系统剪贴板：能力缺失或被拒时静默（copy 事件仍发出，由使用方兜底）。 */
function tryWriteClipboard(text: string): void {
  if (typeof navigator === 'undefined') return
  const clipboard = navigator.clipboard
  if (!clipboard) return
  try {
    clipboard.writeText(text).catch(() => {})
  } catch {
    // 同步抛出（环境不支持）时同样静默
  }
}

function onCopy(): void {
  const payload: ArtifactCopyPayload = {
    text: contentEl.value?.textContent ?? '',
    type: props.type,
    language: props.language,
  }
  emit('copy', payload)
  tryWriteClipboard(payload.text)
  copied.value = true
  clearCopiedReset()
  copiedResetTimer = window.setTimeout(() => {
    copied.value = false
    copiedResetTimer = null
  }, ARTIFACT_COPIED_RESET_DELAY_MS)
}

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
  clearCopiedReset()
  // 卸载兜底：打开状态下卸载也要解除滚动锁并还原焦点。
  deactivate()
})

defineExpose<ArtifactExpose>({ focus: focusDialog })
</script>

<template>
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-artifact 根类），不渲染浮层 -->
  <div v-if="!isMounted" class="ui-artifact" hidden></div>
  <Teleport v-else to="body">
    <div v-if="modelValue" :class="rootClasses" @keydown="onKeydown">
      <div class="ui-artifact__scrim" @click="onScrimClick"></div>
      <div
        ref="panelEl"
        class="ui-artifact__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="hasTitle ? titleId : undefined"
        tabindex="-1"
        v-bind="$attrs"
      >
        <!-- header 插槽：整体替换默认头部（标题/徽标/操作栏全部交由使用方） -->
        <header v-if="hasHeaderSlot" class="ui-artifact__header">
          <slot name="header" />
        </header>
        <header v-else class="ui-artifact__header">
          <div class="ui-artifact__heading">
            <h2 v-if="hasTitle" :id="titleId" class="ui-artifact__title">{{ title }}</h2>
            <span class="ui-artifact__badge">{{ badgeLabel }}</span>
          </div>
          <div class="ui-artifact__actions">
            <IconButton variant="ghost" size="sm" :aria-label="copyLabel" @click="onCopy">
              <svg
                v-if="copied"
                class="ui-artifact__action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg
                v-else
                class="ui-artifact__action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </IconButton>
            <IconButton variant="ghost" size="sm" :aria-label="ARTIFACT_CLOSE_LABEL" @click="requestClose('action')">
              <svg
                class="ui-artifact__action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </IconButton>
          </div>
        </header>
        <div ref="contentEl" class="ui-artifact__body">
          <slot />
        </div>
        <footer v-if="slots.footer" class="ui-artifact__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 浮层根：满屏定位 + 居中（z-index 走 modal 层级 token） ───────── */
.ui-artifact {
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
.ui-artifact[hidden] {
  display: none;
}

/* ── 遮罩：点击关闭命中区，非交互元素（不聚焦、无 role） ──────────── */
.ui-artifact__scrim {
  position: absolute;
  inset: 0;
  background-color: var(--ui-scrim);
  animation: ui-artifact-scrim-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 面板：surface 底 + lg 圆角 + modal 阴影（token 化） ──────────── */
.ui-artifact__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(var(--ui-space-8) * 12); /* ≈768px；画布宽度走间距标尺推导（无 artifact 宽度 token，已在结果中提出需求） */
  max-width: 100%;
  max-height: 100%;
  background-color: var(--ui-surface);
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-modal);
  animation: ui-artifact-panel-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 头部：标题/徽标 + IconButton 操作栏 ─────────────────────────── */
.ui-artifact__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2) var(--ui-space-2) var(--ui-space-2) var(--ui-space-5);
  /* 结构性细线：无 --ui-border-width token（同 IconButton.vue 处理，已在结果中提出需求） */
  border-bottom: 1px solid var(--ui-border);
}

.ui-artifact__heading {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  min-width: 0;
}

.ui-artifact__title {
  margin: 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-artifact__badge {
  flex: none;
  padding: var(--ui-space-1) var(--ui-space-2);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-xs);
}

.ui-artifact__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--ui-space-1);
}

.ui-artifact__action-icon {
  display: block;
}

/* ── 正文：画布滚动区（横向溢出的代码也可见） ─────────────────────── */
.ui-artifact__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--ui-space-5);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

/* ── 底部：仅在提供 footer 插槽时渲染 ────────────────────────────── */
.ui-artifact__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  padding: var(--ui-space-3) var(--ui-space-5);
  /* 结构性细线：同 header */
  border-top: 1px solid var(--ui-border);
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-artifact-scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes ui-artifact-panel-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * 2));
  }
}
</style>
