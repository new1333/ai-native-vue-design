<script setup lang="ts">
/**
 * AutoComplete —— 带建议列表的可输入选择器：可编辑输入框（combobox 语义）
 * + Teleport 弹层（listbox 语义）+ Paper 视觉（token-only）。
 *
 * - 状态机（建议过滤/开合/高亮/键盘/防抖）在 useAutoComplete.ts（纯逻辑，无 DOM）；
 *   本组件只承接 DOM 副作用：弹层定位（打开时按输入框 rect 计算）、高亮项滚动入
 *   弹层视口（aria-activedescendant 模式焦点不随高亮移动，浏览器不会自动滚动非焦点
 *   元素，须手动 scrollIntoView）、document 点击外部关闭、焦点管理、卸载时取消
 *   未决防抖 search。
 * - 值模型：modelValue 即输入框文本（值+文本合一）；选中建议后文本同步为该建议
 *   label，机器值经 select 事件负载传递。
 * - 焦点模型遵循 WAI-ARIA combobox + listbox popup（aria-activedescendant）：
 *   焦点始终停留在输入框上，建议不进 Tab 序，弹层 mousedown preventDefault；
 *   Tab/Home/End/Space 保留文本编辑原义，不劫持。
 * - SSR：弹层仅客户端渲染（mounted 门控 + Teleport）；document 监听只在
 *   onMounted 注册、onBeforeUnmount 移除。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import {
  AUTOCOMPLETE_CLEAR_ARIA_LABEL,
  AUTOCOMPLETE_DEBOUNCE_DEFAULT,
  AUTOCOMPLETE_EMPTY_TEXT_DEFAULT,
  AUTOCOMPLETE_LOADING_TEXT_DEFAULT,
  AUTOCOMPLETE_PLACEHOLDER_DEFAULT,
} from './AutoComplete.constants'
import { useAutoComplete } from './useAutoComplete'
import type {
  AutoCompleteEmits,
  AutoCompleteExpose,
  AutoCompleteProps,
  AutoCompleteSlots,
} from './AutoComplete.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AutoCompleteProps>(), {
  modelValue: '',
  options: () => [],
  filter: true,
  placeholder: AUTOCOMPLETE_PLACEHOLDER_DEFAULT,
  emptyText: AUTOCOMPLETE_EMPTY_TEXT_DEFAULT,
  disabled: false,
  clearable: false,
  loading: false,
  debounce: AUTOCOMPLETE_DEBOUNCE_DEFAULT,
})
const emit = defineEmits<AutoCompleteEmits>()
defineSlots<AutoCompleteSlots>()

const slots = useSlots()

/** 弹层与建议的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const listboxId = `ui-autocomplete-listbox-${useId()}`

const {
  open,
  activeIndex,
  suggestions,
  openList,
  closeList,
  select,
  handleInput,
  handleKeywordChange,
  handleKeydown,
  cancelPendingSearch,
} = useAutoComplete({
  modelValue: () => props.modelValue,
  options: () => props.options,
  disabled: () => props.disabled,
  filter: () => props.filter,
  debounce: () => props.debounce,
  onUpdate: (value) => emit('update:modelValue', value),
  onSearch: (keyword) => emit('search', keyword),
  onSelect: (option) => {
    emit('update:modelValue', option.label)
    emit('select', option)
  },
})

const rootClasses = computed(() => [
  'ui-autocomplete',
  { 'ui-autocomplete--open': open.value, 'ui-autocomplete--disabled': props.disabled },
])

/** aria-activedescendant：仅打开且有高亮时指向建议 id，否则不出现在 DOM。 */
const activeDescendantId = computed(() =>
  open.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
)

function optionId(index: number): string {
  return `${listboxId}-option-${index}`
}

/** 清空按钮渲染条件：可清空 + 文本非空 + 非禁用。 */
const canClear = computed(() => props.clearable && props.modelValue !== '' && !props.disabled)

const rootEl = ref<HTMLDivElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const listboxEl = ref<HTMLDivElement | null>(null)

/** 弹层仅客户端：SSR 输出中不出现弹层。 */
const mounted = ref(false)

/** 弹层内联定位：打开时按输入框 rect + 页面滚动偏移计算（文档坐标 top/left + minWidth）。 */
const popupStyle = ref<Record<string, string>>({})

function updatePosition(): void {
  const input = inputEl.value
  if (!input) return
  // getBoundingClientRect() 为视口坐标；弹层 Teleport 到 body 下绝对定位，包含块是
  // 初始包含块（文档原点），须加 window.scrollX/scrollY 换算为文档坐标——否则页面
  // 滚动后打开时面板漂到文档顶部。打开期间弹层与文档同滚，无需滚动监听跟随。
  // 仅在 open 变 true 后的 nextTick（客户端交互路径）触达 window，SSR 不经过此处。
  const rect = input.getBoundingClientRect()
  popupStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    minWidth: `${rect.width}px`,
  }
}

watch(open, (isOpen) => {
  if (isOpen) void nextTick(updatePosition)
})

/**
 * 高亮项滚动入弹层视口：aria-activedescendant 模式焦点恒驻输入框，option 元素
 * 不获焦，浏览器不会自动滚动非焦点元素——高亮移出弹层 max-height + overflow-y:auto
 * 可视区后用户将看不到当前项（对照 Tree 的 roving focus 靠原生 focus() 滚动）。
 * scrollIntoView({ block: 'nearest' })：可视区内为 no-op，越界时最小滚动；弹层自身
 * 在文档中位置不变，外层（页面）无需随之滚动。
 */
function scrollActiveOptionIntoView(): void {
  const listbox = listboxEl.value
  if (!listbox || !open.value || activeIndex.value < 0) return
  listbox
    .querySelector('.ui-autocomplete__option--active')
    ?.scrollIntoView({ block: 'nearest' })
}

// 开合/高亮/建议变更且 DOM 更新后（flush post：Teleport 弹层与激活类已落位）执行——
// 覆盖打开落位（含 ↑ 打开落在末项）、键盘 ↓/↑ 移动、异步建议钳回、建议整体替换而
// 高亮下标数值不变四条路径（最后一条仅监听 [open, activeIndex] 会漏滚：远程结果
// 到达替换建议后激活下标仍合法，列表已换而滚动不发生，激活项可能滞留可视区外）。
watch([open, activeIndex, suggestions], scrollActiveOptionIntoView, { flush: 'post' })

function onInput(event: Event): void {
  handleInput((event.target as HTMLInputElement).value)
}

/** 点击输入框：关闭态打开建议面板（不扰动已打开时的高亮落位）。 */
function onTriggerClick(): void {
  if (!open.value) openList('first')
}

function onBlur(): void {
  // Tab 离开输入框即关闭弹层（建议点击路径已被弹层 mousedown.prevent 保住焦点）。
  if (open.value) closeList()
}

function onOptionClick(index: number): void {
  select(index)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', '')
  emit('clear')
  // 与键入空文本同路径：打开面板、重置高亮、调度 search('')（远程模式借此重拉全量）。
  handleKeywordChange('')
  inputEl.value?.focus()
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
  cancelPendingSearch()
})

function focus(options?: FocusOptions): void {
  inputEl.value?.focus(options)
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<AutoCompleteExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <span v-if="slots.prefix" class="ui-autocomplete__prefix">
      <slot name="prefix" />
    </span>
    <input
      ref="inputEl"
      class="ui-autocomplete__control"
      type="text"
      role="combobox"
      autocomplete="off"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      aria-haspopup="listbox"
      aria-autocomplete="list"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendantId"
      v-bind="$attrs"
      @input="onInput"
      @click="onTriggerClick"
      @keydown="handleKeydown"
      @blur="onBlur"
    >
    <button
      v-if="canClear"
      type="button"
      class="ui-autocomplete__clear"
      :aria-label="AUTOCOMPLETE_CLEAR_ARIA_LABEL"
      @mousedown.prevent
      @click="onClear"
    >
      <svg
        class="ui-autocomplete__clear-icon"
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
    <span v-if="slots.suffix" class="ui-autocomplete__suffix">
      <slot name="suffix" />
    </span>
    <Teleport v-if="mounted && open" to="body">
      <div
        ref="listboxEl"
        :id="listboxId"
        class="ui-autocomplete__listbox"
        role="listbox"
        :aria-busy="loading ? 'true' : undefined"
        :style="popupStyle"
        @mousedown.prevent
      >
        <div
          v-for="(option, index) in suggestions"
          :id="optionId(index)"
          :key="index"
          class="ui-autocomplete__option"
          :class="{ 'ui-autocomplete__option--active': index === activeIndex }"
          role="option"
          :aria-selected="option.label === modelValue ? 'true' : 'false'"
          :aria-disabled="option.disabled === true ? 'true' : undefined"
          @click="onOptionClick(index)"
        >
          <slot name="option" :option="option" :index="index" :active="index === activeIndex">
            {{ option.label }}
          </slot>
        </div>
        <div
          v-if="suggestions.length === 0 && loading"
          class="ui-autocomplete__loading"
          role="status"
        >
          {{ AUTOCOMPLETE_LOADING_TEXT_DEFAULT }}
        </div>
        <div v-else-if="suggestions.length === 0" class="ui-autocomplete__empty">
          <slot name="empty">{{ emptyText }}</slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 容器：结构 + token 化视觉（surface 底 / line 描边 / focus accent），同 Input 先例 ── */
.ui-autocomplete {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input/Select 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: 0 var(--ui-space-3);
  font-family: var(--ui-font-sans);
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-autocomplete:hover:not(.ui-autocomplete--disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点指示完全由容器承担——描边转 accent 别名 --ui-input-border-focus。
   内层原生 input 的全局 :focus-visible 焦点环须关闭（见 __control），
   否则会在容器描边内再叠一圈 outline，形成双重边框 */
.ui-autocomplete:focus-within {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：sand 底 + text-3 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-autocomplete--disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  cursor: not-allowed;
}

/* ── 原生输入框：描边由容器统一承担，自身只保留排版与颜色 ── */
.ui-autocomplete__control {
  flex: 1 1 auto;
  min-width: 0;
  border: none; /* 结构性重置：非视觉取值 */
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  padding: var(--ui-space-2) 0;
}

/* 关闭全局焦点环在内部 input 上的绘制：焦点指示由容器描边统一承担（同 Input 先例，
   结构性重置：非视觉取值） */
.ui-autocomplete__control:focus-visible {
  outline: none;
}

.ui-autocomplete__control::placeholder {
  color: var(--ui-text-3);
}

.ui-autocomplete--disabled .ui-autocomplete__control {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── prefix / suffix：图标与单位容器（svg 尺寸 16/20/24 见 CONVENTIONS §2） ── */
.ui-autocomplete__prefix,
.ui-autocomplete__suffix {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-text-2);
}

.ui-autocomplete__prefix :deep(svg),
.ui-autocomplete__suffix :deep(svg) {
  width: 20px;
  height: 20px;
}

/* ── 清空按钮：原生 button，无填充无描边（结构性重置），
   mousedown.prevent 保住输入框焦点，避免 blur 先行关闭弹层 ── */
.ui-autocomplete__clear {
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

.ui-autocomplete__clear:hover {
  color: var(--ui-text-1);
}

/* ── 弹层：Teleport body + 绝对定位（top/left/minWidth 由打开时的输入框
   rect + 页面滚动偏移换算的文档坐标内联写入）；与输入框的间距走 margin-top token，
   定位与面板视觉随 Select 先例 ── */
.ui-autocomplete__listbox {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-dropdown);
  box-sizing: border-box;
  max-height: calc(var(--ui-space-8) * 4); /* 长列表滚动（token 推导，先例 Select） */
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

/* ── 建议：keyboard 高亮 → surface-muted；文本命中项 → accent-soft + accent；
   disabled → text-3 + not-allowed（置于最后优先覆盖） ── */
.ui-autocomplete__option {
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

.ui-autocomplete__option:hover {
  background-color: var(--ui-surface-muted);
}

.ui-autocomplete__option--active {
  background-color: var(--ui-surface-muted);
}

.ui-autocomplete__option[aria-selected='true'] {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-autocomplete__option[aria-disabled='true'],
.ui-autocomplete__option[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 空态 / 加载行：text-3 居中一行（加载行 role=status 供读屏播报） ── */
.ui-autocomplete__empty,
.ui-autocomplete__loading {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}
</style>
