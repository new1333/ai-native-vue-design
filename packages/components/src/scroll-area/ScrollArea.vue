<script setup lang="ts">
/**
 * ScrollArea —— 滚动区域容器原语：原生滚动 + 装饰滚动条，统一滚动视觉。
 * 真实滚动发生在可聚焦的 viewport（div tabindex=0）上；装饰条 aria-hidden、
 * pointer-events:none，仅作视觉指示。溢出检测 / ResizeObserver / 滚动监听
 * 全部在 onMounted 之后进行并在 onBeforeUnmount 清理；SSR 直出内容与装饰条骨架。
 * 一切颜色、间距、圆角、动效时长、z-index 均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  SCROLL_AREA_DIRECTION_DEFAULT,
  SCROLL_AREA_HIDE_DELAY_MS,
  SCROLL_AREA_TYPE_DEFAULT,
} from './ScrollArea.constants'
import type {
  ScrollAreaEmits,
  ScrollAreaExpose,
  ScrollAreaProps,
  ScrollAreaSlots,
} from './ScrollArea.types'

const props = withDefaults(defineProps<ScrollAreaProps>(), {
  type: SCROLL_AREA_TYPE_DEFAULT,
  direction: SCROLL_AREA_DIRECTION_DEFAULT,
})
const emit = defineEmits<ScrollAreaEmits>()
defineSlots<ScrollAreaSlots>()

const viewportRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// ── 测量结果（仅客户端 mounted 后更新；SSR 初始为未溢出态）───────────
const overflowY = ref(false)
const overflowX = ref(false)
// 拇指几何为运行时测量出的内联百分比（top/height 相对轨道），非静态视觉值
const thumbYHeight = ref(0)
const thumbYTop = ref(0)
const thumbXWidth = ref(0)
const thumbXLeft = ref(0)
// type='scroll' / 'auto'：滚动进行中标记，静默后由定时器复位（显隐由 CSS 消费）
const scrolling = ref(false)

const classes = computed(() => [
  'ui-scroll-area',
  `ui-scroll-area--${props.type}`,
  `ui-scroll-area--direction-${props.direction}`,
  {
    'ui-scroll-area--overflow-y': overflowY.value,
    'ui-scroll-area--overflow-x': overflowX.value,
    'ui-scroll-area--scrolling': scrolling.value,
  },
])

const thumbYStyle = computed(() => ({ height: `${thumbYHeight.value}%`, top: `${thumbYTop.value}%` }))
const thumbXStyle = computed(() => ({ width: `${thumbXWidth.value}%`, left: `${thumbXLeft.value}%` }))

/** 读取 viewport 当前盒模型并刷新溢出标记与拇指几何（纯同步读，无浏览器 API 依赖）。 */
function measure(): void {
  const viewport = viewportRef.value
  if (!viewport) return

  const clientHeight = viewport.clientHeight
  const clientWidth = viewport.clientWidth
  const scrollHeight = viewport.scrollHeight
  const scrollWidth = viewport.scrollWidth

  const canScrollY = props.direction === 'vertical' || props.direction === 'both'
  const canScrollX = props.direction === 'horizontal' || props.direction === 'both'

  overflowY.value = canScrollY && clientHeight > 0 && scrollHeight > clientHeight
  overflowX.value = canScrollX && clientWidth > 0 && scrollWidth > clientWidth

  thumbYHeight.value = overflowY.value ? (clientHeight / scrollHeight) * 100 : 0
  thumbYTop.value = overflowY.value ? (viewport.scrollTop / scrollHeight) * 100 : 0
  thumbXWidth.value = overflowX.value ? (clientWidth / scrollWidth) * 100 : 0
  thumbXLeft.value = overflowX.value ? (viewport.scrollLeft / scrollWidth) * 100 : 0
}

let hideTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

/** type='scroll' / 'auto'：滚动后静默 SCROLL_AREA_HIDE_DELAY_MS 再隐藏，连续滚动重置计时。 */
function scheduleHide(): void {
  if (hideTimer !== null) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    hideTimer = null
    scrolling.value = false
  }, SCROLL_AREA_HIDE_DELAY_MS)
}

function onScroll(event: Event): void {
  measure()
  emit('scroll', event)
  if (props.type === 'scroll' || props.type === 'auto') {
    scrolling.value = true
    scheduleHide()
  }
}

onMounted(() => {
  measure()
  // ResizeObserver 观察 viewport 与内容包裹层：容器或内容尺寸变化驱动重测
  const viewport = viewportRef.value
  if (viewport && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measure()
    })
    resizeObserver.observe(viewport)
    if (contentRef.value) resizeObserver.observe(contentRef.value)
  }
})

onBeforeUnmount(() => {
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})

function update(): void {
  measure()
}

defineExpose<ScrollAreaExpose>({ update })
</script>

<template>
  <div :class="classes">
    <div ref="viewportRef" class="ui-scroll-area__viewport" tabindex="0" @scroll="onScroll">
      <div ref="contentRef" class="ui-scroll-area__content">
        <slot />
      </div>
    </div>
    <div class="ui-scroll-area__bar ui-scroll-area__bar--vertical" aria-hidden="true">
      <div class="ui-scroll-area__thumb ui-scroll-area__thumb--vertical" :style="thumbYStyle" />
    </div>
    <div class="ui-scroll-area__bar ui-scroll-area__bar--horizontal" aria-hidden="true">
      <div class="ui-scroll-area__thumb ui-scroll-area__thumb--horizontal" :style="thumbXStyle" />
    </div>
  </div>
</template>

<style scoped>
/* ── 基底：定位上下文（装饰条锚定容器边缘）────────────────── */
.ui-scroll-area {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
}

/* ── viewport：唯一真实滚动者；隐藏原生滚动条，视觉交给装饰条 ── */
.ui-scroll-area__viewport {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ui-scroll-area__viewport::-webkit-scrollbar {
  display: none;
}

/* 方向档位：被排除方向的溢出直接裁剪（与溢出检测的方向门槛一致） */
.ui-scroll-area--direction-vertical .ui-scroll-area__viewport {
  overflow-y: auto;
  overflow-x: hidden;
}

.ui-scroll-area--direction-horizontal .ui-scroll-area__viewport {
  overflow-x: auto;
  overflow-y: hidden;
}

.ui-scroll-area--direction-both .ui-scroll-area__viewport {
  overflow: auto;
}

/* ── 装饰滚动条：仅视觉指示，不承接指针交互 ────────────────── */
.ui-scroll-area__bar {
  position: absolute;
  z-index: var(--ui-z-sticky);
  overflow: hidden;
  pointer-events: none;
  border-radius: var(--ui-radius-xs);
  opacity: 1;
  transition: opacity var(--ui-motion-default) var(--ui-ease-out);
}

.ui-scroll-area__bar--vertical {
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--ui-space-2);
}

.ui-scroll-area__bar--horizontal {
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--ui-space-2);
}

/* 无溢出（或方向被排除）时不渲染对应装饰条 */
.ui-scroll-area__bar--vertical,
.ui-scroll-area__bar--horizontal {
  display: none;
}

.ui-scroll-area--overflow-y .ui-scroll-area__bar--vertical,
.ui-scroll-area--overflow-x .ui-scroll-area__bar--horizontal {
  display: block;
}

/* ── type 档位的可见时机：always 恒显；hover/auto 悬停可见；scroll/auto 滚动中可见 ── */
.ui-scroll-area--hover .ui-scroll-area__bar,
.ui-scroll-area--auto .ui-scroll-area__bar {
  opacity: 0;
}

.ui-scroll-area--hover:hover .ui-scroll-area__bar,
.ui-scroll-area--auto:hover .ui-scroll-area__bar,
.ui-scroll-area--scrolling .ui-scroll-area__bar {
  opacity: 1;
}

/* ── 拇指：宽度/位置由测量内联百分比决定，最小可点尺寸走 token ── */
.ui-scroll-area__thumb {
  position: absolute;
  background-color: var(--ui-border-strong);
  border-radius: var(--ui-radius-xs);
}

.ui-scroll-area__thumb--vertical {
  left: 0;
  right: 0;
  min-height: var(--ui-space-2);
}

.ui-scroll-area__thumb--horizontal {
  top: 0;
  bottom: 0;
  min-width: var(--ui-space-2);
}

/* 悬停区域 / 滚动进行中：拇指加深一档 */
.ui-scroll-area--hover:hover .ui-scroll-area__thumb,
.ui-scroll-area--auto:hover .ui-scroll-area__thumb,
.ui-scroll-area--scrolling .ui-scroll-area__thumb {
  background-color: var(--ui-text-3);
}
</style>
