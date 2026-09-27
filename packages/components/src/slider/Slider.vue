<script setup lang="ts">
/**
 * Slider —— 滑块选择：单柄 / 双柄范围取值 + Paper 视觉（token-only）。
 *
 * - 柄为 div[role="slider"]（WAI-ARIA slider 模式的标准实现：双柄范围无对应原生元素），
 *   aria-valuemin/max/now 表达值域与当前值，双柄互为边界、钳制不交叉；
 * - 键盘路径（WAI-ARIA Authoring Practices）：←/↓ 减、→/↑ 加、PageUp/PageDown 大步长、
 *   Home/End 直达柄边界；两柄各自为 Tab 停靠点；
 * - 拖拽仅客户端：pointerdown 定柄（轨道点击取最近柄并跳值）→ document 监听移动，
 *   移动连续发 update:modelValue，抬起值有变化才发一次 change（逻辑收口于 useSlider）；
 * - loading：aria-busy="true" + 拦截一切取值路径，但不落 disabled（保持可聚焦，同 Switch 先例）；
 *   disabled：tabindex=-1 移出 Tab 序 + aria-disabled="true"；
 * - marks 刻度与 tooltip 气泡为装饰层（aria-hidden），读屏取值以 aria-valuenow 为准；
 * - attrs 透传：inheritAttrs:false，$attrs 合并到低值柄（单柄即唯一柄，供 aria-label /
 *   aria-describedby 直达，供 FormField 接入）。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  SLIDER_HANDLE_MAX_ARIA_LABEL,
  SLIDER_HANDLE_MIN_ARIA_LABEL,
  SLIDER_MAX_DEFAULT,
  SLIDER_MIN_DEFAULT,
  SLIDER_STEP_DEFAULT,
} from './Slider.constants'
import { useSlider } from './useSlider'
import type { SliderEmits, SliderExpose, SliderHandle, SliderProps, SliderSlots } from './Slider.types'
import type { SliderMark } from './Slider.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SliderProps>(), {
  range: false,
  min: SLIDER_MIN_DEFAULT,
  max: SLIDER_MAX_DEFAULT,
  step: SLIDER_STEP_DEFAULT,
  vertical: false,
  disabled: false,
  loading: false,
})
const emit = defineEmits<SliderEmits>()
defineSlots<SliderSlots>()

const trackEl = ref<HTMLElement | null>(null)
const minHandleEl = ref<HTMLElement | null>(null)
const maxHandleEl = ref<HTMLElement | null>(null)

function handleElFor(handle: SliderHandle): HTMLElement | null {
  const el = handle === 'min' ? minHandleEl.value : maxHandleEl.value
  // 单柄模式下 'max' 请求回落到唯一柄。
  return el ?? minHandleEl.value
}

const {
  pair,
  dragging,
  percentOf,
  handleBounds,
  onTrackPointerDown,
  onHandlePointerDown,
  onHandleKeydown,
  cleanup,
} = useSlider({
  props,
  emit,
  trackEl,
  focusHandle: (handle) => handleElFor(handle)?.focus(),
})

onBeforeUnmount(cleanup)

const classes = computed(() => [
  'ui-slider',
  {
    'ui-slider--vertical': props.vertical,
    'ui-slider--disabled': props.disabled,
    'ui-slider--loading': props.loading,
  },
])

/** disabled 移出 Tab 序；loading 保持可聚焦（aria-busy 表达）。 */
const interactive = computed(() => !props.disabled)

const marksList = computed<readonly SliderMark[]>(() => props.marks ?? [])

const minBounds = computed(() => handleBounds('min'))
const maxBounds = computed(() => handleBounds('max'))

/** 低值柄可读名称：ariaLabel prop 优先；range 模式缺省「最小值」；attrs 可再覆盖。 */
const minHandleAriaLabel = computed(() =>
  props.ariaLabel ?? (props.range ? SLIDER_HANDLE_MIN_ARIA_LABEL : undefined),
)

const fillStyle = computed<Record<string, string>>(() => {
  const low = pair.value[0]
  const high = pair.value[1]
  const from = props.range ? percentOf(low) : 0
  const to = percentOf(props.range ? high : low)
  const size = `${to - from}%`
  const style: Record<string, string> = {}
  if (props.vertical) {
    style.bottom = `${from}%`
    style.height = size
  }
  else {
    style.left = `${from}%`
    style.width = size
  }
  return style
})

function handleStyle(handle: SliderHandle): Record<string, string> {
  const value = handle === 'min' ? pair.value[0] : pair.value[1]
  const position = `${percentOf(value)}%`
  return props.vertical ? { bottom: position } : { left: position }
}

function markStyle(mark: SliderMark): Record<string, string> {
  const position = `${percentOf(mark.value)}%`
  return props.vertical ? { bottom: position } : { left: position }
}

/** 刻度覆盖判定：单柄 ≤ 低柄值；range 在两柄之间。 */
function isMarkReached(value: number): boolean {
  return props.range
    ? value >= pair.value[0] && value <= pair.value[1]
    : value <= pair.value[0]
}

function focus(handle?: SliderHandle): void {
  handleElFor(handle ?? 'min')?.focus()
}

function blur(handle?: SliderHandle): void {
  handleElFor(handle ?? 'min')?.blur()
}

defineExpose<SliderExpose>({ focus, blur })
</script>

<template>
  <div :class="classes">
    <div ref="trackEl" class="ui-slider__rail" @pointerdown="onTrackPointerDown">
      <div class="ui-slider__track"></div>
      <div class="ui-slider__fill" :style="fillStyle"></div>
      <span
        v-for="mark in marksList"
        :key="mark.value"
        class="ui-slider__tick"
        :class="{ 'ui-slider__tick--reached': isMarkReached(mark.value) }"
        :style="markStyle(mark)"
        aria-hidden="true"
      ></span>
      <div
        ref="minHandleEl"
        class="ui-slider__handle ui-slider__handle--min"
        :class="{ 'ui-slider__handle--dragging': dragging === 'min' }"
        :style="handleStyle('min')"
        role="slider"
        :tabindex="interactive ? 0 : -1"
        :aria-valuemin="minBounds.min"
        :aria-valuemax="minBounds.max"
        :aria-valuenow="pair[0]"
        :aria-orientation="vertical ? 'vertical' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :aria-label="minHandleAriaLabel"
        v-bind="$attrs"
        @pointerdown="onHandlePointerDown('min', $event)"
        @keydown="onHandleKeydown('min', $event)"
      >
        <div class="ui-slider__tooltip" aria-hidden="true">
          <slot name="tooltip" :value="pair[0]">{{ pair[0] }}</slot>
        </div>
      </div>
      <div
        v-if="range"
        ref="maxHandleEl"
        class="ui-slider__handle ui-slider__handle--max"
        :class="{ 'ui-slider__handle--dragging': dragging === 'max' }"
        :style="handleStyle('max')"
        role="slider"
        :tabindex="interactive ? 0 : -1"
        :aria-valuemin="maxBounds.min"
        :aria-valuemax="maxBounds.max"
        :aria-valuenow="pair[1]"
        :aria-orientation="vertical ? 'vertical' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :aria-label="SLIDER_HANDLE_MAX_ARIA_LABEL"
        @pointerdown="onHandlePointerDown('max', $event)"
        @keydown="onHandleKeydown('max', $event)"
      >
        <div class="ui-slider__tooltip" aria-hidden="true">
          <slot name="tooltip" :value="pair[1]">{{ pair[1] }}</slot>
        </div>
      </div>
    </div>
    <div v-if="marksList.length > 0" class="ui-slider__marks" aria-hidden="true">
      <span
        v-for="mark in marksList"
        :key="mark.value"
        class="ui-slider__mark"
        :class="{ 'ui-slider__mark--reached': isMarkReached(mark.value) }"
        :style="markStyle(mark)"
      >
        <slot name="marks" :mark="mark" :reached="isMarkReached(mark.value)">
          {{ mark.label ?? mark.value }}
        </slot>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ── 根：横向为「轨道 + 刻度标签行」纵排；纵向整体转横排（轨道 + 标签列） ── */
.ui-slider {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  inline-size: 100%;
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
  /* 拖拽防选中（结构性：非视觉取值） */
  user-select: none;
}

.ui-slider--vertical {
  flex-direction: row;
  align-items: stretch;
  /* 纵向滑块需要使用方提供高度容器（meta 与文档页已声明） */
  block-size: 100%;
}

/* ── 轨道命中区：相对定位上下文，内含视觉轨道 / 填充 / 刻度点 / 双柄 ── */
.ui-slider__rail {
  position: relative;
  display: flex;
  align-items: center;
  inline-size: 100%;
  /* 命中区取 --ui-space-4 高度，内嵌 --ui-space-1 视觉轨道（尺寸由间距 token 推导，同 Switch 先例） */
  block-size: var(--ui-space-4);
  /* 拖拽期间不触发滚动/手势（结构性：非视觉取值） */
  touch-action: none;
  cursor: pointer;
}

.ui-slider--vertical .ui-slider__rail {
  flex: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  inline-size: var(--ui-space-4);
  block-size: auto;
}

.ui-slider__track {
  inline-size: 100%;
  block-size: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface-muted);
}

.ui-slider--vertical .ui-slider__track {
  inline-size: var(--ui-space-1);
  block-size: 100%;
}

/* ── 填充：accent 实底；单柄 0 → 值，range 两柄之间（定位由内联样式按值轴注入） ── */
.ui-slider__fill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  block-size: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-accent);
}

.ui-slider--vertical .ui-slider__fill {
  top: auto;
  left: 50%;
  transform: translateX(-50%);
  inline-size: var(--ui-space-1);
}

/* ── 刻度点：装饰层，未覆盖 line-strong / 覆盖转 accent ─────────────── */
.ui-slider__tick {
  position: absolute;
  top: 50%;
  inline-size: var(--ui-space-1);
  block-size: var(--ui-space-1);
  border-radius: calc(var(--ui-space-1) / 2);
  background-color: var(--ui-border-strong);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ui-slider__tick--reached {
  background-color: var(--ui-accent);
}

.ui-slider--vertical .ui-slider__tick {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

/* ── 柄：surface 底 + line-strong 描边 + rest 阴影；focus 环交给全局 :focus-visible ── */
.ui-slider__handle {
  position: absolute;
  top: 50%;
  box-sizing: border-box;
  inline-size: var(--ui-space-4);
  block-size: var(--ui-space-4);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input/Button 先例在任务结果中提出需求） */
  border: 1px solid var(--ui-border-strong);
  /* 半径 --ui-radius-md 在 --ui-space-4 柄上被钳制为圆形（半径取自 token，同 Switch 推导法） */
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition:
    border-color var(--ui-motion-fast) var(--ui-ease-out),
    box-shadow var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-slider__handle:hover,
.ui-slider__handle--dragging {
  border-color: var(--ui-accent);
}

.ui-slider--vertical .ui-slider__handle {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

/* ── 值气泡：tooltip 深底反白，hover / 键盘聚焦 / 拖拽时显示（装饰层 aria-hidden） ── */
.ui-slider__tooltip {
  position: absolute;
  bottom: calc(100% + var(--ui-space-2));
  left: 50%;
  transform: translateX(-50%);
  display: none;
  box-sizing: border-box;
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-tooltip);
  color: var(--ui-color-white);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
  white-space: nowrap;
  pointer-events: none;
}

.ui-slider__handle:hover .ui-slider__tooltip,
.ui-slider__handle:focus-visible .ui-slider__tooltip,
.ui-slider__handle--dragging .ui-slider__tooltip {
  display: block;
}

.ui-slider--vertical .ui-slider__tooltip {
  bottom: auto;
  top: 50%;
  left: calc(100% + var(--ui-space-2));
  transform: translateY(-50%);
}

/* ── 刻度标签行：横向为轨道下方一行，纵向为轨道右侧一列 ─────────────── */
.ui-slider__marks {
  position: relative;
  block-size: var(--ui-space-5);
  pointer-events: none;
}

.ui-slider__mark {
  position: absolute;
  top: 0;
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
  white-space: nowrap;
  transform: translateX(-50%);
}

.ui-slider__mark--reached {
  color: var(--ui-text-2);
}

.ui-slider--vertical .ui-slider__marks {
  inline-size: var(--ui-space-7);
  block-size: auto;
}

.ui-slider--vertical .ui-slider__mark {
  top: auto;
  transform: translateY(50%);
}

/* ── loading：取值路径全拦截但保持可聚焦（aria-busy），填充转灰阶提示不可用 ── */
.ui-slider--loading .ui-slider__rail {
  cursor: progress;
}

.ui-slider--loading .ui-slider__fill {
  background-color: var(--ui-text-3);
}

/* ── disabled：灰化 + not-allowed，柄移出 Tab 序（tabindex=-1 + aria-disabled） ── */
.ui-slider--disabled .ui-slider__rail {
  cursor: not-allowed;
}

.ui-slider--disabled .ui-slider__fill {
  background-color: var(--ui-text-3);
}

.ui-slider--disabled .ui-slider__handle {
  background-color: var(--ui-surface-muted);
  box-shadow: none;
}
</style>
