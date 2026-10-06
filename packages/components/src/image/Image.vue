<script setup lang="ts">
/**
 * Image —— 图片组件：懒加载、加载/失败回退与大图预览（Paper 视觉，token-only）。
 *
 * - 状态机：loading（占位）→ loaded（图淡入）/ error（失败视图）；src 变化重置。
 * - lazy：进入视口（IntersectionObserver，仅 mounted 创建）前不渲染 img、不发请求。
 * - fallback：主源失败自动回落；回落也失败落 error（error 插槽可覆盖默认视图）。
 * - preview：图片包裹在原生 button 触发器中（加载完成前 disabled，Enter/Space 原生激活），
 *   打开全屏浮层（role="dialog" aria-modal，Teleport 到 body）：焦点移入面板、
 *   Esc / 遮罩点击 / 关闭按钮关闭、Tab 在浮层内圈定、关闭后焦点回归触发器；
 *   打开期间锁定 body 滚动（shared/useModalLayer 全局计数，与 Dialog/Drawer 互不干扰）。
 * - 状态流转语义（load/error emits、focus/Esc 路径）见 useImage.ts；
 *   一切颜色、间距、圆角、动效时长、z-index 均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CSSProperties } from 'vue'
import {
  IMAGE_ALT_DEFAULT,
  IMAGE_ERROR_TEXT,
  IMAGE_FIT_DEFAULT,
  IMAGE_PREVIEW_CLOSE_LABEL,
  IMAGE_PREVIEW_LABEL_DEFAULT,
  IMAGE_PREVIEW_TRIGGER_LABEL_DEFAULT,
  IMAGE_PREVIEW_TRIGGER_LABEL_PREFIX,
  IMAGE_STATUS_ERROR,
  IMAGE_STATUS_LOADED,
  IMAGE_STATUS_LOADING,
} from './Image.constants'
import { useImage } from './useImage'
import type { ImageEmits, ImageProps, ImageSlots } from './Image.types'

const props = withDefaults(defineProps<ImageProps>(), {
  alt: IMAGE_ALT_DEFAULT,
  fit: IMAGE_FIT_DEFAULT,
  lazy: false,
  preview: false,
})
const emit = defineEmits<ImageEmits>()
defineSlots<ImageSlots>()

const rootRef = ref<HTMLElement | null>(null)
const previewPanelRef = ref<HTMLElement | null>(null)

const {
  status,
  currentSrc,
  imgVisible,
  previewOpen,
  startLazyObserver,
  stopLazyObserver,
  onImgLoad,
  onImgError,
  openPreview,
  closePreview,
  onPreviewKeydown,
  onPreviewBackdropClick,
} = useImage({
  props,
  rootRef,
  previewPanelRef,
  onLoad: (event) => emit('load', event),
  onError: (event) => emit('error', event),
})

// IntersectionObserver 仅 mounted 创建，onBeforeUnmount 销毁（SSR 不触达）。
onMounted(() => {
  startLazyObserver()
})
onBeforeUnmount(() => {
  // 卸载兜底：预览打开状态下卸载也要解除 body 滚动锁（先例：Dialog 的 deactivate 兜底）。
  closePreview()
  stopLazyObserver()
})

const rootClasses = computed(() => ['ui-image', `ui-image--${status.value}`])

/** fit 透传为 img 内联 object-fit。 */
const imgStyle = computed<CSSProperties>(() => ({ objectFit: props.fit }))

/** 预览触发器可读名：有 alt 时「预览图片：{alt}」，否则默认。 */
const triggerLabel = computed(() =>
  props.alt ? `${IMAGE_PREVIEW_TRIGGER_LABEL_PREFIX}${props.alt}` : IMAGE_PREVIEW_TRIGGER_LABEL_DEFAULT,
)

/** 预览浮层可读名：有 alt 时即为图名，否则默认「图片预览」。 */
const previewLabel = computed(() => (props.alt ? props.alt : IMAGE_PREVIEW_LABEL_DEFAULT))
</script>

<template>
  <div ref="rootRef" :class="rootClasses">
    <!-- preview：img 包裹于原生 button（Enter/Space 原生激活）；加载完成前 disabled
         （不进 Tab 序、不可点击，img 元素全程稳定不重挂载）-->
    <button
      v-if="preview"
      type="button"
      class="ui-image__trigger"
      :disabled="status !== IMAGE_STATUS_LOADED"
      :aria-label="triggerLabel"
      aria-haspopup="dialog"
      @click="openPreview"
    >
      <img
        class="ui-image__img"
        :class="{ 'ui-image__img--loaded': status === IMAGE_STATUS_LOADED }"
        :src="currentSrc"
        :alt="alt"
        :style="imgStyle"
        @load="onImgLoad"
        @error="onImgError"
      />
    </button>
    <img
      v-else-if="imgVisible"
      class="ui-image__img"
      :class="{ 'ui-image__img--loaded': status === IMAGE_STATUS_LOADED }"
      :src="currentSrc"
      :alt="alt"
      :style="imgStyle"
      @load="onImgLoad"
      @error="onImgError"
    />

    <!-- loading：muted 面 + 装饰图标（placeholder 插槽可覆盖） -->
    <div v-if="status === IMAGE_STATUS_LOADING" class="ui-image__placeholder">
      <slot name="placeholder">
        <svg
          class="ui-image__placeholder-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 15.5-4.5-4.5L7 20.5" />
        </svg>
      </slot>
    </div>

    <!-- error：danger 面 + 破图图标 + 文案（error 插槽可覆盖） -->
    <div v-else-if="status === IMAGE_STATUS_ERROR" class="ui-image__error">
      <slot name="error">
        <svg
          class="ui-image__error-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 17 4.5-4.5 3 3" />
          <path d="m13 14.5 2.5-2.5 5.5 5" />
          <path d="M4 4.5 20 20" />
        </svg>
        <span class="ui-image__error-text">{{ IMAGE_ERROR_TEXT }}</span>
      </slot>
    </div>

    <!-- 大图预览浮层：关闭前不参与渲染（SSR 亦不输出） -->
    <Teleport to="body">
      <div
        v-if="previewOpen"
        ref="previewPanelRef"
        class="ui-image__preview"
        role="dialog"
        aria-modal="true"
        :aria-label="previewLabel"
        tabindex="-1"
        @keydown="onPreviewKeydown"
        @click="onPreviewBackdropClick"
      >
        <img class="ui-image__preview-img" :src="currentSrc" :alt="alt" />
        <button
          type="button"
          class="ui-image__preview-close"
          :aria-label="IMAGE_PREVIEW_CLOSE_LABEL"
          @click="closePreview"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根：行内块随图收缩；未加载完成时给最小占位框（space-7=48px），
   避免加载/失败阶段塌陷为零高 ─────────────────────────────── */
.ui-image {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.ui-image:not(.ui-image--loaded) {
  min-width: var(--ui-space-7);
  min-height: var(--ui-space-7);
}

/* ── 图片：填满根框（根未约束时百分比回落自然尺寸），object-fit 由 props 注入；
   加载完成后 opacity 淡入（时长/缓动走 token）──────────────── */
.ui-image__img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--ui-motion-default) var(--ui-ease-out);
}

.ui-image__img--loaded {
  opacity: 1;
}

/* ── 预览触发器：原生 button 结构性重置（透明底、无边框、无内边距）── */
.ui-image__trigger {
  display: block;
  padding: 0;
  border: none;
  background-color: transparent;
  cursor: zoom-in;
}

/* 加载完成前 disabled：光标回落默认，按钮不进 Tab 序（原生 disabled 语义） */
.ui-image__trigger:disabled {
  cursor: default;
}

/* ── loading 占位面：绝对定位填满根框，muted 面 + 弱化图标 ── */
.ui-image__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-3);
}

/* ── error 视图：danger 软面 + danger 图标 + 弱化文案 ─────── */
.ui-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-2);
  background-color: var(--ui-danger-soft);
  color: var(--ui-danger);
}

.ui-image__error-text {
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── 大图预览浮层：全屏遮罩（scrim token）+ 居中大图，层级 modal ── */
.ui-image__preview {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-6);
  background-color: var(--ui-scrim);
}

.ui-image__preview-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
}

/* ── 关闭按钮：右上角，space-7 见方（充足点击热区），hover 提面 ── */
.ui-image__preview-close {
  position: absolute;
  top: var(--ui-space-4);
  right: var(--ui-space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-7);
  height: var(--ui-space-7);
  padding: 0;
  border: none;
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-image__preview-close:hover {
  background-color: var(--ui-surface-muted);
}
</style>
