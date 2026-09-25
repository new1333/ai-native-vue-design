<script setup lang="ts">
/**
 * Select —— 单选下拉组件：触发器（combobox 语义）+ Teleport 弹层（listbox 语义）
* + Paper 视觉（token-only）。
 *
 * - 状态机在 useSelect.ts（纯逻辑，无 DOM）；本组件只承接 DOM 副作用：
 *   弹层定位（打开时按触发器 rect 计算）、document 点击外部关闭、焦点管理。
 * - 焦点模型遵循 WAI-ARIA combobox + listbox popup（aria-activedescendant）：
 *   焦点始终停留在触发器上，选项不进 Tab 序，弹层 mousedown preventDefault。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport）；document 监听只在
 *   onMounted 注册、onBeforeUnmount 移除。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import {
  SELECT_CLEAR_ARIA_LABEL,
  SELECT_EMPTY_TEXT_DEFAULT,
  SELECT_PLACEHOLDER_DEFAULT,
} from './Select.constants'
import { useSelect } from './useSelect'
import type { SelectEmits, SelectExpose, SelectProps } from './Select.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: null,
  options: () => [],
  placeholder: SELECT_PLACEHOLDER_DEFAULT,
  emptyText: SELECT_EMPTY_TEXT_DEFAULT,
  disabled: false,
  clearable: false,
})
const emit = defineEmits<SelectEmits>()

/** 弹层与选项的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const listboxId = `ui-select-listbox-${useId()}`

const { open, activeIndex, selectedOption, toggleList, closeList, select, handleKeydown } = useSelect(
  {
    options: () => props.options,
    modelValue: () => props.modelValue,
    disabled: () => props.disabled,
    onSelect: (value) => emit('update:modelValue', value),
  },
)

const rootClasses = computed(() => [
  'ui-select',
  { 'ui-select--open': open.value, 'ui-select--disabled': props.disabled },
])

/** 触发器文案：已选 label，否则 placeholder（走占位样式）。 */
const displayLabel = computed(() => selectedOption.value?.label ?? props.placeholder)
const showPlaceholder = computed(() => selectedOption.value === null)

/** 清空按钮渲染条件：可清空 + 有已选值 + 非禁用（与折叠箭标互换显示）。 */
const canClear = computed(() => props.clearable && props.modelValue !== null && !props.disabled)

/** aria-activedescendant：仅打开且有高亮时指向选项 id，否则不出现在 DOM。 */
const activeDescendantId = computed(() =>
  open.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
)

function optionId(index: number): string {
  return `${listboxId}-option-${index}`
}

const rootEl = ref<HTMLDivElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const listboxEl = ref<HTMLDivElement | null>(null)

/** 浮层仅客户端：SSR 输出中不出现弹层。 */
const mounted = ref(false)

/** 弹层内联定位：打开时按触发器 rect + 页面滚动偏移计算（文档坐标 top/left + minWidth）。 */
const popupStyle = ref<Record<string, string>>({})

function updatePosition(): void {
  const trigger = triggerEl.value
  if (!trigger) return
  // getBoundingClientRect() 为视口坐标；弹层 Teleport 到 body 下绝对定位，包含块是
  // 初始包含块（文档原点），须加 window.scrollX/scrollY 换算为文档坐标——否则页面
  // 滚动后打开时面板漂到文档顶部。打开期间弹层与文档同滚，无需滚动监听跟随。
  // 仅在 open 变 true 后的 nextTick（客户端交互路径）触达 window，SSR 不经过此处。
  const rect = trigger.getBoundingClientRect()
  popupStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    minWidth: `${rect.width}px`,
  }
}

watch(open, (isOpen) => {
  if (isOpen) void nextTick(updatePosition)
})

function onTriggerBlur(): void {
  // Tab 离开触发器即关闭弹层（选项点击路径已被弹层 mousedown.prevent 保住焦点）。
  if (open.value) closeList()
}

function onOptionClick(index: number): void {
  select(index)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', null)
  emit('clear')
  triggerEl.value?.focus()
}

/** 点击外部关闭：目标在根容器或弹层内则交由内部处理器，否则关闭。 */
function onDocumentClick(event: MouseEvent): void {
  if (!open.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (rootEl.value?.contains(target) || listboxEl.value?.contains(target)) return
  closeList()
}

onMounted(() => {
  mounted.value = true
  document.addEventListener('click', onDocumentClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
})

function focus(options?: FocusOptions): void {
  triggerEl.value?.focus(options)
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose<SelectExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <button
      ref="triggerEl"
      type="button"
      class="ui-select__trigger"
      :class="{ 'ui-select__trigger--clearable': canClear }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendantId"
      :disabled="disabled"
      v-bind="$attrs"
      @click="toggleList"
      @keydown="handleKeydown"
      @blur="onTriggerBlur"
    >
      <span class="ui-select__label" :class="{ 'ui-select__label--placeholder': showPlaceholder }">
        {{ displayLabel }}
      </span>
      <svg
        v-if="!canClear"
        class="ui-select__chevron"
        :class="{ 'ui-select__chevron--open': open }"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button
      v-if="canClear"
      type="button"
      class="ui-select__clear"
      :aria-label="SELECT_CLEAR_ARIA_LABEL"
      @mousedown.prevent
      @click="onClear"
    >
      <svg
        class="ui-select__clear-icon"
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
        ref="listboxEl"
        :id="listboxId"
        class="ui-select__listbox"
        role="listbox"
        :style="popupStyle"
        @mousedown.prevent
      >
        <div
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.value"
          class="ui-select__option"
          :class="{ 'ui-select__option--active': index === activeIndex }"
          role="option"
          :aria-selected="option.value === modelValue ? 'true' : 'false'"
          :aria-disabled="option.disabled === true ? 'true' : undefined"
          @click="onOptionClick(index)"
        >
          {{ option.label }}
        </div>
        <div v-if="options.length === 0" class="ui-select__empty">
          {{ emptyText }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根容器：相对定位锚点（清空按钮与弹层的定位参照） ─────── */
.ui-select {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  font-family: var(--ui-font-sans);
}

/* ── 触发器：surface 底 + line 描边，语义为 combobox ─────── */
.ui-select__trigger {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input 先例在任务结果中提出需求） */
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

.ui-select__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点环由全局 :focus-visible 约定提供（paper.css，不改写 outline），
   容器描边同步转 accent 别名 --ui-input-border-focus */
.ui-select__trigger:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：sand 底 + text-3 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-select__trigger:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 触发器文案：占位态走 text-3，长文本省略 ─────────────── */
.ui-select__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-select__label--placeholder {
  color: var(--ui-text-3);
}

/* ── 折叠箭标：open 时翻转（结构性 transform，时长走 token） ── */
.ui-select__chevron {
  flex: none;
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-select__chevron--open {
  transform: rotate(180deg);
}

/* ── 清空按钮：原生 button，绝对定位于触发器右端（与箭标互换显示），
   mousedown.prevent 保住触发器焦点，避免 blur 先行关闭弹层 ── */
.ui-select__trigger--clearable {
  padding-right: var(--ui-space-6);
}

.ui-select__clear {
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

.ui-select__clear:hover {
  color: var(--ui-text-1);
}

/* ── 弹层：Teleport body + 绝对定位（top/left/minWidth 由打开时的触发器
   rect + 页面滚动偏移换算的文档坐标内联写入）；与触发器的间距走 margin-top token ── */
.ui-select__listbox {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-dropdown);
  box-sizing: border-box;
  max-height: calc(var(--ui-space-8) * 4); /* 长列表滚动（token 推导，先例 Button 旋转时长） */
  overflow-y: auto;
  padding: var(--ui-space-1);
  background-color: var(--ui-surface);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  font-family: inherit;
}

/* ── 选项：keyboard 高亮 → surface-muted；已选 → accent-soft + accent；
   disabled → text-3 + not-allowed（置于最后优先覆盖） ── */
.ui-select__option {
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-xs);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-select__option:hover {
  background-color: var(--ui-surface-muted);
}

.ui-select__option--active {
  background-color: var(--ui-surface-muted);
}

.ui-select__option[aria-selected='true'] {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-select__option[aria-disabled='true'],
.ui-select__option[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 空态：text-3 居中一行 ───────────────────────────────── */
.ui-select__empty {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}
</style>
