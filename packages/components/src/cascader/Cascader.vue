<script setup lang="ts">
/**
 * Cascader —— 级联选择组件：触发器（combobox 语义）+ Teleport 分栏弹层（listbox 语义）
 * + Paper 视觉（token-only）。
 *
 * - 状态机在 useCascader.ts（纯逻辑，无 DOM）；本组件只承接 DOM 副作用：
 *   浮层接入 shared 引擎 useFloatingLayer（dropdown 策略：文档坐标定位 +
 *   document 点击外部关闭）与焦点管理。
 * - 焦点模型复用 Select 的 combobox + listbox 纪律（aria-activedescendant）：
 *   焦点始终停留在触发器上，选项不进 Tab 序，弹层 mousedown preventDefault；
 *   键盘 ↑↓←→ 面板导航：↓/↑ 当前面板内移动，→ 进入子级，← 返回上级。
 * - aria-controls 仅打开时挂载：弹层由 v-if 整体承载、关闭即从 DOM 移除，关闭态
 *   不输出悬空 idref（与 Popover/Popconfirm/HoverCard 的 dialog 家族约定一致）；
 *   aria-expanded 恒有。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport）；document 点击监听由浮层
 *   引擎在 onMounted 注册、onBeforeUnmount 移除。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, onMounted, ref, useId } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import {
  CASCADER_EMPTY_TEXT_DEFAULT,
  CASCADER_PATHS_SEPARATOR,
  CASCADER_PATH_SEPARATOR,
  CASCADER_PLACEHOLDER_DEFAULT,
  CASCADER_ROOT_PANEL_LABEL,
} from './Cascader.constants'
import { useCascader } from './useCascader'
import type {
  CascaderEmits,
  CascaderExpose,
  CascaderOption,
  CascaderOptionSlotScope,
  CascaderProps,
  CascaderSlots,
  CascaderTriggerSlotScope,
} from './Cascader.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<CascaderProps>(), {
  modelValue: null,
  options: () => [],
  placeholder: CASCADER_PLACEHOLDER_DEFAULT,
  emptyText: CASCADER_EMPTY_TEXT_DEFAULT,
  disabled: false,
  multiple: false,
  expandTrigger: 'click',
  changeOnSelect: false,
})
const emit = defineEmits<CascaderEmits>()

const slots = defineSlots<CascaderSlots>()

/** 弹层与面板的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const menuId = `ui-cascader-menu-${useId()}`

const {
  open,
  activeIndexes,
  panels,
  rootOptions,
  selectedPaths,
  displayLabels,
  toggleList,
  closeList,
  highlightAt,
  optionPath,
  isLeaf,
  isActive,
  isPathSelected,
  togglePath,
  onOptionClick,
  handleKeydown,
} = useCascader({
  options: () => props.options,
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  changeOnSelect: () => props.changeOnSelect,
  disabled: () => props.disabled,
  onSelect: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

const rootClasses = computed(() => [
  'ui-cascader',
  { 'ui-cascader--open': open.value, 'ui-cascader--disabled': props.disabled },
])

/** 触发器文案：已选路径 label 拼接，否则 placeholder（走占位样式）。 */
const displayText = computed(() => {
  const labels = displayLabels.value
  if (labels.length === 0) return props.placeholder
  return labels.map((pathLabels) => pathLabels.join(CASCADER_PATH_SEPARATOR)).join(CASCADER_PATHS_SEPARATOR)
})
const showPlaceholder = computed(() => displayLabels.value.length === 0)

/** aria-activedescendant：仅打开且有高亮时指向选项 id，否则不出现在 DOM。 */
const activeDescendantId = computed(() => {
  if (!open.value) return undefined
  const depth = activeIndexes.value.length - 1
  const index = activeIndexes.value[depth] ?? -1
  if (depth < 0 || index < 0) return undefined
  return panels.value[depth]?.[index] === undefined ? undefined : optionId(depth, index)
})

function panelId(depth: number): string {
  return `${menuId}-panel-${depth}`
}

function optionId(depth: number, index: number): string {
  return `${menuId}-option-${depth}-${index}`
}

/** 面板可读名称：根级为「一级候选」，子级为「<父级 label>的子选项」。 */
function panelLabel(depth: number): string {
  if (depth === 0) return CASCADER_ROOT_PANEL_LABEL
  const parent = panels.value[depth - 1]?.[activeIndexes.value[depth - 1] ?? -1]
  return parent === undefined ? '子选项' : `${parent.label}的子选项`
}

/** option 插槽作用域（模板内逐行构造）。 */
function optionScope(option: CascaderOption, depth: number, index: number): CascaderOptionSlotScope {
  return { option, level: depth, path: optionPath(depth, index) }
}

const triggerScope = computed<CascaderTriggerSlotScope>(() => ({
  paths: selectedPaths.value,
  labels: displayLabels.value,
  multiple: props.multiple,
}))

const rootEl = ref<HTMLDivElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const menuEl = ref<HTMLDivElement | null>(null)

/** 浮层仅客户端：SSR 输出中不出现弹层。 */
const mounted = ref(false)

/**
 * 浮层接入 shared 引擎 useFloatingLayer（dropdown 策略）：打开时等 Teleport 落地后
 * 按触发器 rect + 页面滚动偏移换算文档坐标定位（top/left/minWidth 内联写入）；
 * document（capture）点击外部关闭，目标落在根容器或弹层内则放行。Esc 在键盘状态机
 * 内受理，不走引擎（closeOnEscape=false）。
 */
const { floatingStyle } = useFloatingLayer({
  isOpen: () => open.value,
  anchor: () => triggerEl.value,
  strategy: 'dropdown',
  closeOnOutsideClick: true,
  insideElements: () => [rootEl.value, menuEl.value],
  closeOnEscape: false,
  onRequestClose: () => closeList(),
})

function onTriggerBlur(): void {
  // Tab 离开触发器即关闭弹层（选项点击路径已被弹层 mousedown.prevent 保住焦点）。
  if (open.value) closeList()
}

/** 悬停展开：仅 expandTrigger="hover" 且节点含子级时，随悬停更新展开链（不提交）。 */
function onOptionHover(depth: number, index: number): void {
  if (props.expandTrigger !== 'hover' || !open.value) return
  const node = panels.value[depth]?.[index]
  if (node === undefined || node.disabled || isLeaf(node)) return
  highlightAt(depth, index)
}

function onCheckboxChange(depth: number, index: number): void {
  togglePath(optionPath(depth, index))
}

onMounted(() => {
  mounted.value = true
})

function focus(options?: FocusOptions): void {
  triggerEl.value?.focus(options)
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose<CascaderExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <button
      ref="triggerEl"
      type="button"
      class="ui-cascader__trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? menuId : undefined"
      :aria-activedescendant="activeDescendantId"
      :disabled="disabled"
      v-bind="$attrs"
      @click="toggleList"
      @keydown="handleKeydown"
      @blur="onTriggerBlur"
    >
      <span v-if="slots.trigger" class="ui-cascader__label">
        <slot name="trigger" v-bind="triggerScope" />
      </span>
      <span
        v-else
        class="ui-cascader__label"
        :class="{ 'ui-cascader__label--placeholder': showPlaceholder }"
      >
        {{ displayText }}
      </span>
      <svg
        class="ui-cascader__chevron"
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
    <Teleport v-if="mounted && open" to="body">
      <div ref="menuEl" :id="menuId" class="ui-cascader__menu" :style="floatingStyle" @mousedown.prevent>
        <template v-if="rootOptions.length > 0">
          <div
            v-for="(panel, depth) in panels"
            :id="panelId(depth)"
            :key="depth"
            class="ui-cascader__panel"
            role="listbox"
            :aria-label="panelLabel(depth)"
            aria-orientation="vertical"
          >
            <div
              v-for="(option, index) in panel"
              :id="optionId(depth, index)"
              :key="option.value"
              class="ui-cascader__option"
              :class="{
                'ui-cascader__option--active': isActive(depth, index),
                'ui-cascader__option--expandable': !isLeaf(option),
              }"
              role="option"
              :aria-selected="isPathSelected(optionPath(depth, index)) ? 'true' : 'false'"
              :aria-disabled="option.disabled === true ? 'true' : undefined"
              @click="onOptionClick(depth, index)"
              @mouseenter="onOptionHover(depth, index)"
            >
              <input
                v-if="multiple && isLeaf(option)"
                type="checkbox"
                class="ui-cascader__checkbox"
                tabindex="-1"
                :checked="isPathSelected(optionPath(depth, index))"
                :disabled="option.disabled === true"
                :aria-label="option.label"
                @click.stop
                @change="onCheckboxChange(depth, index)"
              />
              <span class="ui-cascader__option-label">
                <slot name="option" v-bind="optionScope(option, depth, index)">
                  {{ option.label }}
                </slot>
              </span>
              <svg
                v-if="!isLeaf(option)"
                class="ui-cascader__arrow"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </template>
        <div v-if="rootOptions.length === 0" class="ui-cascader__empty">
          {{ emptyText }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根容器：相对定位锚点（弹层的定位参照） ───────────────── */
.ui-cascader {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  font-family: var(--ui-font-sans);
}

/* ── 触发器：surface 底 + line 描边，语义为 combobox（与 Input/Select 同别名集） ── */
.ui-cascader__trigger {
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

.ui-cascader__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点环由全局 :focus-visible 约定提供（paper.css，不改写 outline），
   容器描边同步转 accent 别名 --ui-input-border-focus */
.ui-cascader__trigger:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：sand 底 + text-3 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-cascader__trigger:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 触发器文案：占位态走 text-3，长文本省略 ─────────────── */
.ui-cascader__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-cascader__label--placeholder {
  color: var(--ui-text-3);
}

/* ── 折叠箭标：open 时翻转（结构性 transform，时长走 token） ── */
.ui-cascader__chevron {
  flex: none;
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-cascader--open .ui-cascader__chevron {
  transform: rotate(180deg);
}

/* ── 弹层：Teleport body + 绝对定位（top/left/minWidth 由打开时的触发器
   rect + 页面滚动偏移换算的文档坐标内联写入）；分栏横向排布，超宽横向滚动 ── */
.ui-cascader__menu {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-dropdown);
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  max-width: calc(var(--ui-space-8) * 8); /* 超宽兜底横向滚动（token 推导） */
  overflow-x: auto;
  background-color: var(--ui-surface);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  font-family: inherit;
}

/* ── 面板（一列一个 listbox）：等高、纵向滚动、列间细线分隔 ── */
.ui-cascader__panel {
  box-sizing: border-box;
  flex: none;
  min-width: calc(var(--ui-space-8) * 2); /* 面板最小宽度 = 2 × space-8（token 推导） */
  max-height: calc(var(--ui-space-8) * 4); /* 长列表滚动（token 推导，随 Select 先例） */
  overflow-y: auto;
  padding: var(--ui-space-1);
}

.ui-cascader__panel + .ui-cascader__panel {
  border-left-width: 1px;
  border-left-style: solid;
  border-left-color: var(--ui-border);
}

/* ── 选项：keyboard 高亮 → surface-muted；已选（含已选链贯穿）→ accent-soft + accent；
   disabled → text-3 + not-allowed（置于最后优先覆盖） ── */
.ui-cascader__option {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
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

.ui-cascader__option:hover {
  background-color: var(--ui-surface-muted);
}

.ui-cascader__option--active {
  background-color: var(--ui-surface-muted);
}

.ui-cascader__option[aria-selected='true'] {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-cascader__option[aria-disabled='true'],
.ui-cascader__option[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 选项内容与右展开箭标 ────────────────────────────────── */
.ui-cascader__option-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-cascader__arrow {
  flex: none;
  color: var(--ui-text-3);
}

/* ── 多选 checkbox：原生 input（tabindex=-1 不进 Tab 序），accent-color 走 token ── */
.ui-cascader__checkbox {
  flex: none;
  margin: 0;
  accent-color: var(--ui-accent);
}

/* ── 空态：text-3 居中一行 ───────────────────────────────── */
.ui-cascader__empty {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}
</style>
