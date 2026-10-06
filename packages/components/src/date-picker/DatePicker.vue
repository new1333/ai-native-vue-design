<script setup lang="ts">
/**
 * DatePicker —— 日期选择器：触发器（dialog 弹出语义）+ Teleport 弹层面板
 * （role=grid 月视图 + roving 键盘）+ Paper 视觉（token-only）。
 *
 * - 状态机在 useDatePicker.ts（纯逻辑，无 DOM）；弹层定位（dropdown 策略：文档
 *   坐标 top/left + minWidth 对齐触发器宽度）与点击外部关闭收口于 shared 浮层
 *   引擎 useFloatingLayer；本组件承接的 DOM 副作用只剩 roving 焦点落位、Tab
 *   圈定与面板自身键盘处理（Esc 在面板内受理，不走引擎）。
 * - 焦点模型遵循 WAI-ARIA date-picker dialog（modal dialog）：触发器原生 button
 *   （aria-haspopup="dialog"），打开后焦点移入月网格（roving tabindex），面板
 *   aria-modal + Tab 在面板内首尾环绕圈定（不逃逸到背景页面），Esc/Tab（触发器上）/
 *   点击外部关闭并把焦点交还触发器。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport）；引擎的 document 点击
 *   监听在引擎侧 onMounted 注册、onBeforeUnmount 移除，本组件不再直接触碰。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import {
  DATE_PICKER_CLEAR_ARIA_LABEL,
  DATE_PICKER_FOCUSABLE_SELECTOR,
  DATE_PICKER_GRID_ARIA_LABEL,
  DATE_PICKER_NEXT_MONTH_ARIA_LABEL,
  DATE_PICKER_PANEL_LABELS,
  DATE_PICKER_PLACEHOLDER_DEFAULTS,
  DATE_PICKER_PREV_MONTH_ARIA_LABEL,
  DATE_PICKER_RANGE_SEPARATOR,
  DATE_PICKER_TAB_KEY,
  DATE_PICKER_TIME_ARIA_LABEL,
  DATE_PICKER_WEEKDAYS,
} from './DatePicker.constants'
import { startOfDay, useDatePicker } from './useDatePicker'
import type { DatePickerCell, DatePickerEmits, DatePickerExpose, DatePickerProps } from './DatePicker.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: null,
  // open 不给默认值：受控与否由「是否传入 open / onUpdate:open 键」判定
  // （收口于 shared useControllableOpen，Boolean prop 布尔转型不能凭值判空）。
  type: 'date',
  format: undefined,
  min: undefined,
  max: undefined,
  disabledDate: undefined,
  placeholder: undefined,
  disabled: false,
  loading: false,
  clearable: false,
})
const emit = defineEmits<DatePickerEmits>()

/** 面板与格子的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const panelId = `ui-date-picker-panel-${useId()}`

const rootEl = ref<HTMLDivElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const panelEl = ref<HTMLDivElement | null>(null)

/** 浮层仅客户端：SSR 输出中不出现面板。 */
const mounted = ref(false)

const {
  open,
  viewYear,
  viewMonth,
  activeIndex,
  timeValue,
  weeks,
  panelView,
  openPanel,
  closePanel,
  togglePanel,
  changeMonth,
  selectCell,
  setTime,
  isSelectedDate,
  isRangeStart,
  isRangeEnd,
  isInRange,
  handleGridKeydown,
} = useDatePicker({
  type: () => props.type,
  modelValue: () => props.modelValue,
  open: () => props.open,
  onOpenChange: (value) => emit('update:open', value),
  format: () => props.format,
  min: () => props.min,
  max: () => props.max,
  disabledDate: () => props.disabledDate,
  disabled: () => props.disabled,
  loading: () => props.loading,
  onSelect: (value) => emit('update:modelValue', value),
  onPanelChange: (view) => emit('panelChange', view),
  onClose: () => {
    // 选择路径关闭时焦点仍在面板内（格子按钮），交还触发器；外部点击路径不动焦点。
    if (panelEl.value?.contains(document.activeElement) === true) triggerEl.value?.focus()
  },
})

const rootClasses = computed(() => [
  'ui-date-picker',
  {
    'ui-date-picker--open': open.value,
    'ui-date-picker--disabled': props.disabled,
    'ui-date-picker--loading': props.loading,
  },
])

/** 实际生效的占位文案：placeholder prop 优先，否则按形态取默认。 */
const resolvedPlaceholder = computed(
  () => props.placeholder ?? DATE_PICKER_PLACEHOLDER_DEFAULTS[props.type],
)

/** 触发器文案：range 为 "start ~ end"，其余为格式化字符串，未选回落占位。 */
const displayLabel = computed(() => {
  const value = props.modelValue
  if (value === null) return resolvedPlaceholder.value
  return Array.isArray(value)
    ? `${value[0]}${DATE_PICKER_RANGE_SEPARATOR}${value[1]}`
    : value
})
const showPlaceholder = computed(() => props.modelValue === null)

/** 清空按钮渲染条件：可清空 + 有已选值 + 非禁用/加载。 */
const canClear = computed(
  () => props.clearable && props.modelValue !== null && !props.disabled && !props.loading,
)

/**
 * 弹层定位与点击外部关闭收口于 shared useFloatingLayer（dropdown 策略）：打开时
 * 等面板 Teleport 落地后按触发器 rect + 页面滚动偏移换算文档坐标（top/left +
 * minWidth 对齐触发器宽度）；面板与文档同滚，但触发器位于滚动容器内（非文档滚动）
 * 或视口 resize 引起重排时会脱锚——传 followViewport 由引擎按 scroll（capture）/
 * resize 跟随重排（isOpen 守卫，关闭态零工作，不抢网格焦点）；document（capture）
 * 点击落在根容器或面板内放行，否则关闭。Esc 不走引擎（closeOnEscape false），
 * 在面板自身键盘处理内受理并把焦点交还触发器（见 onPanelKeydown）。
 */
const { floatingStyle, updatePosition } = useFloatingLayer({
  isOpen: () => open.value,
  anchor: () => triggerEl.value,
  strategy: 'dropdown',
  followViewport: true,
  closeOnOutsideClick: true,
  insideElements: () => [rootEl.value, panelEl.value],
  closeOnEscape: false,
  onRequestClose: () => closePanel(),
})

/** 打开时把焦点移入月网格的 roving 高亮格（tabindex=0 的唯一格子）。 */
function focusActiveCell(): void {
  const cell = panelEl.value?.querySelector<HTMLButtonElement>('.ui-date-picker__day[tabindex="0"]')
  cell?.focus()
}

watch(open, (isOpen) => {
  if (!isOpen) return
  // 面板定位由引擎侧在打开后的 nextTick 重排；此处只承接 roving 焦点落位。
  void nextTick(focusActiveCell)
})

function onTriggerClick(): void {
  togglePanel()
}

function onTriggerKeydown(event: KeyboardEvent): void {
  // Tab 放行默认行为并先关面板；↓ 便捷开面板（Enter/Space 走原生 button 激活）。
  if (event.key === 'Tab') {
    if (open.value) closePanel()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openPanel()
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  // Esc 在面板任意处（含时间输入）受理：关闭并交还触发器焦点。
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
    triggerEl.value?.focus()
    return
  }
  // Tab 圈定（modal dialog）：面板中部放行默认行为交由原生 Tab 序，仅首尾环绕拦截。
  if (event.key === DATE_PICKER_TAB_KEY) trapPanelTab(event)
}

/**
 * 面板内 Tab 圈定（先例 dialog/useDialog handleTab）：焦点在面板可聚焦元素间
 * 首尾环绕，Shift+Tab 反向；焦点已逃逸到面板外时拉回首个，杜绝 Tab 从翻月
 * 按钮/时间输入/panel-footer 逃逸到被面板遮挡的背景页面。选择器排除
 * tabindex="-1"，roving 网格仅高亮格参与 Tab 序（见 DATE_PICKER_FOCUSABLE_SELECTOR）。
 */
function trapPanelTab(event: KeyboardEvent): void {
  const panel = panelEl.value
  if (panel === null) return
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>(DATE_PICKER_FOCUSABLE_SELECTOR))
  if (focusable.length === 0) {
    event.preventDefault()
    panel.focus() // 面板 tabindex="-1"：程序化聚焦锚点，不进 Tab 序
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  const insidePanel = active instanceof Node && panel.contains(active)
  if (event.shiftKey) {
    if (!insidePanel || active === first) {
      event.preventDefault()
      last.focus()
    }
    return
  }
  if (!insidePanel || active === last) {
    event.preventDefault()
    first.focus()
  }
}

/** 月网格键盘代理：状态机处理后把 DOM 焦点跟随到新的 roving 高亮格。 */
function onGridKeydown(event: KeyboardEvent): void {
  handleGridKeydown(event)
  if (event.defaultPrevented) void nextTick(focusActiveCell)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', null)
  emit('clear')
  triggerEl.value?.focus()
}

onMounted(() => {
  mounted.value = true
  // 受控初始即打开：引擎侧 watch 不覆盖初始值，此处等 Teleport 落地后补一次
  // 定位与 roving 焦点落位（同 popover/ 的受控初始打开路径）。
  if (open.value) {
    void nextTick(() => {
      updatePosition()
      focusActiveCell()
    })
  }
})

/** 单格类名：邻接月/今天/选中/禁用/范围起止/之间。 */
function dayClasses(cell: DatePickerCell): Record<string, boolean> {
  const day = startOfDay(cell.date)
  return {
    'ui-date-picker__day--outside': !cell.inMonth,
    'ui-date-picker__day--today': cell.today,
    'ui-date-picker__day--selected': isSelectedDate(day),
    'ui-date-picker__day--disabled': cell.disabled,
    'ui-date-picker__day--range-start': isRangeStart(day),
    'ui-date-picker__day--range-end': isRangeEnd(day),
    'ui-date-picker__day--in-range': isInRange(day) && !isRangeStart(day) && !isRangeEnd(day),
  }
}

/** 单格 aria-selected：单选已选日或范围起止日。 */
function dayAriaSelected(cell: DatePickerCell): boolean {
  const day = startOfDay(cell.date)
  return isSelectedDate(day) || isRangeStart(day) || isRangeEnd(day)
}

function onTimeInput(event: Event): void {
  setTime((event.target as HTMLInputElement).value)
}

function focus(options?: FocusOptions): void {
  triggerEl.value?.focus(options)
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose<DatePickerExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <button
      ref="triggerEl"
      type="button"
      class="ui-date-picker__trigger"
      aria-haspopup="dialog"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId"
      :aria-busy="props.loading ? 'true' : undefined"
      :disabled="props.disabled"
      v-bind="$attrs"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot
        name="trigger"
        :value="props.modelValue"
        :display="displayLabel"
        :open="open"
        :disabled="props.disabled || props.loading"
      >
        <span class="ui-date-picker__label" :class="{ 'ui-date-picker__label--placeholder': showPlaceholder }">
          {{ displayLabel }}
        </span>
        <svg
          class="ui-date-picker__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
          <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" stroke-linecap="round" />
        </svg>
      </slot>
    </button>
    <button
      v-if="canClear"
      type="button"
      class="ui-date-picker__clear"
      :aria-label="DATE_PICKER_CLEAR_ARIA_LABEL"
      @mousedown.prevent
      @click="onClear"
    >
      <svg
        class="ui-date-picker__clear-icon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </button>
    <Teleport v-if="mounted && open" to="body">
      <div
        :id="panelId"
        ref="panelEl"
        class="ui-date-picker__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="DATE_PICKER_PANEL_LABELS[props.type]"
        tabindex="-1"
        :style="floatingStyle"
        @keydown="onPanelKeydown"
      >
        <div class="ui-date-picker__header">
          <button
            type="button"
            class="ui-date-picker__nav ui-date-picker__nav--prev"
            :aria-label="DATE_PICKER_PREV_MONTH_ARIA_LABEL"
            @click="changeMonth(-1)"
          >
            <svg
              class="ui-date-picker__nav-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M14.5 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div class="ui-date-picker__header-label" aria-live="polite">
            {{ viewYear }}年{{ viewMonth }}月
          </div>
          <button
            type="button"
            class="ui-date-picker__nav ui-date-picker__nav--next"
            :aria-label="DATE_PICKER_NEXT_MONTH_ARIA_LABEL"
            @click="changeMonth(1)"
          >
            <svg
              class="ui-date-picker__nav-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M9.5 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="ui-date-picker__grid" role="grid" :aria-label="DATE_PICKER_GRID_ARIA_LABEL" @keydown="onGridKeydown">
          <div class="ui-date-picker__weekdays" role="row">
            <div
              v-for="weekday in DATE_PICKER_WEEKDAYS"
              :key="weekday.long"
              class="ui-date-picker__weekday"
              role="columnheader"
              :aria-label="weekday.long"
            >
              {{ weekday.short }}
            </div>
          </div>
          <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="ui-date-picker__week" role="row">
            <button
              v-for="cell in week"
              :key="cell.key"
              type="button"
              role="gridcell"
              class="ui-date-picker__day"
              :class="dayClasses(cell)"
              :tabindex="cell.index === activeIndex ? 0 : -1"
              :aria-selected="dayAriaSelected(cell) ? 'true' : 'false'"
              :aria-disabled="cell.disabled ? 'true' : undefined"
              :aria-current="cell.today ? 'date' : undefined"
              :aria-label="cell.label"
              @click="selectCell(cell.index)"
            >
              {{ cell.day }}
            </button>
          </div>
        </div>
        <div v-if="props.type === 'datetime'" class="ui-date-picker__time">
          <input
            class="ui-date-picker__time-input"
            type="time"
            :value="timeValue"
            :aria-label="DATE_PICKER_TIME_ARIA_LABEL"
            @input="onTimeInput"
          >
        </div>
        <div v-if="$slots['panel-footer']" class="ui-date-picker__footer">
          <slot name="panel-footer" :view="panelView" :disabled="props.disabled" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根容器：相对定位锚点（清空按钮与弹层的定位参照） ─────── */
.ui-date-picker {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  font-family: var(--ui-font-sans);
}

/* ── 触发器：surface 底 + line 描边，语义为 dialog 弹出触发 ─────── */
.ui-date-picker__trigger {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input/Select 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: var(--ui-space-2) var(--ui-space-3);
  font-family: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-date-picker__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点环由全局 :focus-visible 约定提供（paper.css，不改写 outline），
   容器描边同步转 accent 别名 --ui-input-border-focus */
.ui-date-picker__trigger:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled / loading：sand 底 + text-3 + not-allowed/wait（原生 disabled 已移出 Tab 序） ── */
.ui-date-picker__trigger:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-date-picker--loading .ui-date-picker__trigger {
  cursor: wait;
}

/* ── 触发器文案：占位态走 text-3，长文本（范围值）省略 ─────── */
.ui-date-picker__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-date-picker__label--placeholder {
  color: var(--ui-text-3);
}

/* ── 日历图标：结构性无动效 ───────────────────────────────── */
.ui-date-picker__icon {
  flex: none;
  color: var(--ui-text-3);
}

/* ── 清空按钮：原生 button，绝对定位于触发器右端，
   mousedown.prevent 保住触发器焦点，避免 blur 先行关闭面板 ── */
.ui-date-picker__trigger:has(+ .ui-date-picker__clear) {
  padding-right: var(--ui-space-6);
}

.ui-date-picker__clear {
  position: absolute;
  top: 50%;
  right: var(--ui-space-3);
  transform: translateY(-50%); /* 结构性垂直居中：非视觉取值 */
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-3);
  cursor: pointer;
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-date-picker__clear:hover {
  color: var(--ui-text-1);
}

/* ── 面板：Teleport body + 绝对定位（top/left/minWidth 由 shared 浮层引擎按打开时
   的触发器 rect + 页面滚动偏移换算的文档坐标内联写入）；与触发器的间距走 margin-top token ── */
.ui-date-picker__panel {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-popover);
  box-sizing: border-box;
  width: calc(var(--ui-space-8) * 4); /* 256px 由 token 推导（先例 Select 弹层高度推导） */
  padding: var(--ui-space-2);
  background-color: var(--ui-surface);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  font-family: inherit;
}

/* ── 头部：上月/下月 + 年月标签（aria-live 播报翻月） ─────── */
.ui-date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  padding: var(--ui-space-1) 0 var(--ui-space-2);
}

.ui-date-picker__header-label {
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
  font-variant-numeric: var(--ui-numeric);
}

.ui-date-picker__nav {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-2);
  cursor: pointer;
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-date-picker__nav:hover {
  color: var(--ui-text-1);
  background-color: var(--ui-surface-muted);
}

.ui-date-picker__nav-icon {
  display: block;
}

/* ── 月网格：每周一行（7 列等宽），表头行 + 6 周行 ────────── */
.ui-date-picker__weekdays,
.ui-date-picker__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.ui-date-picker__weekday {
  padding: var(--ui-space-1) 0;
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-3);
  text-align: center;
}

/* ── 日期格：原生 button（roving tabindex）；键盘高亮/悬停 surface-muted，
   已选/范围起止 accent-soft + accent，之间 surface-muted，禁用/邻接月 text-3 ── */
.ui-date-picker__day {
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent; /* 结构性无填充：非色相取值 */
  margin: 0;
  padding: var(--ui-space-1) 0;
  font-family: inherit;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-1);
  text-align: center;
  cursor: pointer;
  border-radius: var(--ui-radius-xs);
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-date-picker__day--outside {
  color: var(--ui-text-3);
}

.ui-date-picker__day:hover:not([aria-disabled='true']) {
  background-color: var(--ui-surface-muted);
}

.ui-date-picker__day--today {
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-date-picker__day--selected,
.ui-date-picker__day--range-start,
.ui-date-picker__day--range-end {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-date-picker__day--in-range {
  background-color: var(--ui-surface-muted);
  border-radius: 0; /* 范围中间格方形衔接起止端：结构性形状，非视觉取值 */
}

.ui-date-picker__day[aria-disabled='true'],
.ui-date-picker__day[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 时间行（datetime 形态）：原生 input[type=time] ──────── */
.ui-date-picker__time {
  margin-top: var(--ui-space-2);
  padding-top: var(--ui-space-2);
  border-top: 1px solid var(--ui-border); /* 结构性分隔细线（同描边宽度先例） */
}

.ui-date-picker__time-input {
  box-sizing: border-box;
  width: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: var(--ui-space-1) var(--ui-space-2);
  font-family: inherit;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  font-variant-numeric: var(--ui-numeric);
}

.ui-date-picker__time-input:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── 面板底部插槽（panel-footer） ─────────────────────────── */
.ui-date-picker__footer {
  margin-top: var(--ui-space-2);
  padding-top: var(--ui-space-2);
  border-top: 1px solid var(--ui-border); /* 结构性分隔细线（同描边宽度先例） */
}
</style>
