<script setup lang="ts">
/**
 * TreeSelect —— 树形下拉选择：combobox 触发器 + Teleport 弹层（tree 语义）
 * + Paper 视觉（token-only）。
 *
 * - 组合形态（设计文档 §11.6）：Select 触发器 + 树面板；状态机在 useTreeSelect.ts
 *   （纯逻辑，无 DOM），本组件只承接 DOM 副作用：Teleport 弹层渲染、焦点管理。
 *   弹层定位（dropdown 策略：文档坐标 top/left/minWidth）与点击外部关闭收口于
 *   shared 浮层引擎 useFloatingLayer；Esc 关闭在 useTreeSelect 键盘状态机内
 *   受理，引擎的 Esc 路径关闭（closeOnEscape: false）。
 * - 选中语义在组件侧收口：
 *     单选（默认）    → 激活节点即选中并关闭，值为 TreeSelectNodeValue | null；
 *     multiple        → 激活节点切换选中，弹层保持打开，值为数组；
 *     checkable       → 节点渲染复选框，父子级联（父全选才记勾选、部分为半选），值为数组。
 * - 焦点模型遵循 WAI-ARIA combobox + tree popup（aria-activedescendant）：
 *   焦点始终停留在触发器上，节点不进 Tab 序，弹层 mousedown preventDefault。
 * - SSR：弹层仅客户端渲染（mounted 门控 + Teleport）；浮层引擎的 document 监听
 *   只在其 onMounted 注册、onBeforeUnmount 移除，组件自身不直接触达浏览器 API。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, nextTick, onMounted, ref, useId } from 'vue'
import { useFloatingLayer } from '../shared/useFloatingLayer'
import {
  TREE_SELECT_CLEAR_ARIA_LABEL,
  TREE_SELECT_EMPTY_TEXT_DEFAULT,
  TREE_SELECT_LABEL_SEPARATOR,
  TREE_SELECT_PLACEHOLDER_DEFAULT,
} from './TreeSelect.constants'
import {
  collectTreeSelectSelectableValues,
  computeTreeSelectCheckedValues,
  isTreeSelectNodeChecked,
  isTreeSelectNodeEffectivelyDisabled,
  isTreeSelectNodeIndeterminate,
  normalizeTreeSelectCheckedInput,
  useTreeSelect,
} from './useTreeSelect'
import type {
  TreeSelectEmits,
  TreeSelectExpose,
  TreeSelectModelValue,
  TreeSelectNodeValue,
  TreeSelectOption,
  TreeSelectProps,
  TreeSelectVisibleNode,
} from './TreeSelect.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TreeSelectProps>(), {
  modelValue: null,
  options: () => [],
  // open 不给默认值：受控与否由「是否传入 open / onUpdate:open 键」判定
  // （收口于 shared useControllableOpen，Boolean prop 布尔转型不能凭值判空）。
  multiple: false,
  checkable: false,
  placeholder: TREE_SELECT_PLACEHOLDER_DEFAULT,
  emptyText: TREE_SELECT_EMPTY_TEXT_DEFAULT,
  disabled: false,
  clearable: false,
})
const emit = defineEmits<TreeSelectEmits>()

/** 树面板与节点的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const treeId = `ui-tree-select-tree-${useId()}`

/** 多选/复选共用数组语义（激活后弹层保持打开）。 */
const isMultiple = computed(() => props.multiple === true || props.checkable === true)

/** modelValue 的数组视图：数组透传；单值包成数组；null/undefined 为空。 */
const modelValues = computed<TreeSelectNodeValue[]>(() => {
  const value = props.modelValue
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value
  return [value]
})

/** 打开落位参考值：单选为已选值，多选/复选取首个。 */
const primaryValue = computed<TreeSelectNodeValue | null>(() => modelValues.value[0] ?? null)

const { open, activeIndex, expanded, visibleNodes, records, toggleExpand, closeList, toggleList, handleKeydown } =
  useTreeSelect({
    options: () => props.options,
    disabled: () => props.disabled,
    open: () => props.open,
    onOpenChange: (value) => emit('update:open', value),
    stayOpen: () => isMultiple.value,
    primaryValue: () => primaryValue.value,
    onActivate: handleActivate,
  })

const rootClasses = computed(() => [
  'ui-tree-select',
  { 'ui-tree-select--open': open.value, 'ui-tree-select--disabled': props.disabled },
])

/** ── 选中语义（组件侧收口） ─────────────────────────────── */

/** 有效禁用：自身 disabled 或任一祖先 disabled（子树随父失效）。 */
function effectivelyDisabled(option: TreeSelectOption): boolean {
  return isTreeSelectNodeEffectivelyDisabled(option, records.value)
}

function emitValue(value: TreeSelectModelValue): void {
  emit('update:modelValue', value)
  emit('change', value)
}

function handleActivate(option: TreeSelectOption): void {
  if (effectivelyDisabled(option)) return
  if (props.checkable) toggleCheck(option)
  else if (props.multiple) toggleMultiple(option)
  else emitValue(option.value)
}

/** 多选（非复选）：切换该节点在值数组中的成员资格。 */
function toggleMultiple(option: TreeSelectOption): void {
  if (effectivelyDisabled(option)) return
  const current = modelValues.value
  const next = current.includes(option.value)
    ? current.filter((value) => value !== option.value)
    : [...current, option.value]
  emitValue(next)
}

/** 级联勾选输入视图：输入值（父值自动展开到可选后代）。 */
const checkedSet = computed(() => normalizeTreeSelectCheckedInput(props.options, modelValues.value))

/** 级联勾选的展示/输出视图：全部「非禁用且勾选」节点值（先序）。 */
const checkedValues = computed(() => computeTreeSelectCheckedValues(props.options, checkedSet.value))

/** 复选：勾选/取消节点及其可选子树（半选状态点按视为勾选）。 */
function toggleCheck(option: TreeSelectOption): void {
  if (effectivelyDisabled(option)) return
  const checked = new Set(checkedSet.value)
  const targets = collectTreeSelectSelectableValues(option)
  if (isTreeSelectNodeChecked(option, checked)) targets.forEach((value) => checked.delete(value))
  else targets.forEach((value) => checked.add(value))
  emitValue(computeTreeSelectCheckedValues(props.options, checked))
}

/** ── 触发器展示 ─────────────────────────────────────────── */

/** 触发器 label 集：复选取级联输出值，其余取原值；未命中选项的值不展示。 */
const displayLabels = computed<string[]>(() => {
  const values = props.checkable ? checkedValues.value : modelValues.value
  return values.flatMap((value) => {
    const label = records.value.get(value)?.option.label
    return label === undefined ? [] : [label]
  })
})

const displayLabel = computed(() =>
  displayLabels.value.length > 0
    ? displayLabels.value.join(TREE_SELECT_LABEL_SEPARATOR)
    : props.placeholder,
)
const showPlaceholder = computed(() => displayLabels.value.length === 0)

/** 清空按钮渲染条件：可清空 + 有原始值 + 非禁用（与折叠箭标互换显示）。 */
const hasRawValue = computed(() => {
  const value = props.modelValue
  if (value === null || value === undefined) return false
  if (isMultiple.value) return Array.isArray(value) ? value.length > 0 : true
  return !Array.isArray(value)
})
const canClear = computed(() => props.clearable && hasRawValue.value && !props.disabled)

/** ── 节点状态/aria ──────────────────────────────────────── */

function isNodeExpanded(node: TreeSelectVisibleNode): boolean {
  return expanded.value.has(node.option.value)
}

function nodeSelected(node: TreeSelectVisibleNode): boolean {
  return !props.checkable && modelValues.value.includes(node.option.value)
}

function nodeChecked(node: TreeSelectVisibleNode): boolean {
  return props.checkable && isTreeSelectNodeChecked(node.option, checkedSet.value)
}

function nodeIndeterminate(node: TreeSelectVisibleNode): boolean {
  return props.checkable && isTreeSelectNodeIndeterminate(node.option, checkedSet.value)
}

function ariaExpanded(node: TreeSelectVisibleNode): 'true' | 'false' | undefined {
  if (!node.expandable) return undefined
  return isNodeExpanded(node) ? 'true' : 'false'
}

function ariaSelected(node: TreeSelectVisibleNode): 'true' | 'false' | undefined {
  if (props.checkable) return undefined
  return nodeSelected(node) ? 'true' : 'false'
}

function ariaChecked(node: TreeSelectVisibleNode): 'true' | 'false' | 'mixed' | undefined {
  if (!props.checkable) return undefined
  if (nodeChecked(node)) return 'true'
  if (nodeIndeterminate(node)) return 'mixed'
  return 'false'
}

function ariaDisabled(node: TreeSelectVisibleNode): 'true' | undefined {
  return effectivelyDisabled(node.option) ? 'true' : undefined
}

/** 层级缩进：宽度 = (level-1) × --ui-space-3，由模板内联 style 写入（对齐 Tree 的
    内联 calc 先例，不自建 --ui-* 变量占用设计 token 命名空间；乘数为结构性计数）。 */
function indentStyle(level: number): { width: string } {
  return { width: `calc(${level - 1} * var(--ui-space-3))` }
}

/** aria-activedescendant：仅打开且有高亮时指向节点 id，否则不出现在 DOM。 */
const activeDescendantId = computed(() =>
  open.value && activeIndex.value >= 0 ? nodeId(activeIndex.value) : undefined,
)

function nodeId(index: number): string {
  return `${treeId}-node-${index}`
}

/** ── DOM 副作用（仅客户端路径） ─────────────────────────── */

const rootEl = ref<HTMLDivElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const treeEl = ref<HTMLDivElement | null>(null)

/** 弹层仅客户端：SSR 输出中不出现弹层。 */
const mounted = ref(false)

// 弹层定位与点击外部关闭收口于 shared 浮层引擎：dropdown 策略（Teleport 到 body
// 下绝对定位，引擎按触发器 rect + window.scrollX/scrollY 换算文档坐标 top/left +
// minWidth，打开后在 nextTick 重排）；弹层与文档同滚，但触发器位于滚动容器内
// （非文档滚动）或视口 resize 引起重排时会脱锚——传 followViewport 由引擎按
// scroll（capture）/ resize 跟随重排（isOpen 守卫，关闭态零工作）；根容器与树
// 面板都算「内部」，点击其余处关闭。Esc 不走引擎（closeOnEscape: false）——本
// 组件 Esc 在 useTreeSelect 键盘状态机内受理。
const { floatingStyle: popupStyle, updatePosition } = useFloatingLayer({
  isOpen: () => open.value,
  anchor: () => triggerEl.value,
  strategy: 'dropdown',
  followViewport: true,
  closeOnOutsideClick: true,
  insideElements: () => [rootEl.value, treeEl.value],
  closeOnEscape: false,
  onRequestClose: closeList,
})

function onTriggerBlur(): void {
  // Tab 离开触发器即关闭面板（节点点击路径已被弹层 mousedown.prevent 保住焦点）。
  if (open.value) closeList()
}

/** 点击节点：同步高亮后走激活语义；单选（非 stayOpen）关闭面板。
    禁用节点不高亮（aria-activedescendant 不指向禁用项）、不激活。 */
function onNodeClick(node: TreeSelectVisibleNode, index: number): void {
  if (effectivelyDisabled(node.option)) return
  activeIndex.value = index
  handleActivate(node.option)
  if (!isMultiple.value) closeList()
}

/** 点击展开箭标：仅切换展开，不触发选中（阻止冒泡到节点行）。 */
function onToggleExpand(node: TreeSelectVisibleNode): void {
  toggleExpand(node.option.value)
}

function onClear(): void {
  if (!canClear.value) return
  emit('update:modelValue', isMultiple.value ? [] : null)
  emit('clear')
  triggerEl.value?.focus()
}

/** 点击外部关闭已收口于浮层引擎（closeOnOutsideClick），此处不再自持监听。 */

onMounted(() => {
  mounted.value = true
  // 受控初始即打开：引擎侧 watch 不覆盖初始值，等 Teleport 落地后按锚点 rect
  // 定位（同 popover/ 的受控初始打开路径）。
  if (open.value) void nextTick().then(updatePosition)
})

function focus(options?: FocusOptions): void {
  triggerEl.value?.focus(options)
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose<TreeSelectExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <button
      ref="triggerEl"
      type="button"
      class="ui-tree-select__trigger"
      :class="{ 'ui-tree-select__trigger--clearable': canClear }"
      role="combobox"
      aria-haspopup="tree"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="treeId"
      :aria-activedescendant="activeDescendantId"
      :disabled="disabled"
      v-bind="$attrs"
      @click="toggleList"
      @keydown="handleKeydown"
      @blur="onTriggerBlur"
    >
      <slot
        name="trigger"
        :display-label="displayLabel"
        :labels="displayLabels"
        :placeholder="placeholder"
        :open="open"
        :disabled="disabled"
      >
        <span class="ui-tree-select__label" :class="{ 'ui-tree-select__label--placeholder': showPlaceholder }">
          {{ displayLabel }}
        </span>
      </slot>
      <svg
        v-if="!canClear"
        class="ui-tree-select__chevron"
        :class="{ 'ui-tree-select__chevron--open': open }"
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
      class="ui-tree-select__clear"
      :aria-label="TREE_SELECT_CLEAR_ARIA_LABEL"
      @mousedown.prevent
      @click="onClear"
    >
      <svg
        class="ui-tree-select__clear-icon"
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
        ref="treeEl"
        :id="treeId"
        class="ui-tree-select__tree"
        role="tree"
        :style="popupStyle"
        @mousedown.prevent
      >
        <template v-if="visibleNodes.length > 0">
          <div
            v-for="(node, index) in visibleNodes"
            :id="nodeId(index)"
            :key="node.option.value"
            class="ui-tree-select__node"
            :class="{
              'ui-tree-select__node--active': index === activeIndex,
              'ui-tree-select__node--selected': nodeSelected(node),
              'ui-tree-select__node--checked': nodeChecked(node),
            }"
            role="treeitem"
            :aria-level="node.level"
            :aria-expanded="ariaExpanded(node)"
            :aria-selected="ariaSelected(node)"
            :aria-checked="ariaChecked(node)"
            :aria-disabled="ariaDisabled(node)"
            @click="onNodeClick(node, index)"
          >
            <span
              class="ui-tree-select__indent"
              :style="indentStyle(node.level)"
              aria-hidden="true"
            ></span>
            <span class="ui-tree-select__toggle" aria-hidden="true" @click.stop="onToggleExpand(node)">
              <svg
                v-if="node.expandable"
                class="ui-tree-select__toggle-icon"
                :class="{ 'ui-tree-select__toggle-icon--open': isNodeExpanded(node) }"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                focusable="false"
              >
                <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span
              v-if="checkable"
              class="ui-tree-select__checkbox"
              :class="{
                'ui-tree-select__checkbox--checked': nodeChecked(node),
                'ui-tree-select__checkbox--indeterminate': nodeIndeterminate(node),
              }"
              aria-hidden="true"
            >
              <svg
                v-if="nodeChecked(node)"
                class="ui-tree-select__checkbox-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                focusable="false"
              >
                <path d="M5 12l5 5 9-10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg
                v-else-if="nodeIndeterminate(node)"
                class="ui-tree-select__checkbox-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                focusable="false"
              >
                <path d="M6 12h12" stroke-linecap="round" />
              </svg>
            </span>
            <span class="ui-tree-select__node-label">
              <slot
                name="option"
                :option="node.option"
                :level="node.level"
                :expandable="node.expandable"
                :expanded="isNodeExpanded(node)"
                :selected="nodeSelected(node)"
                :checked="nodeChecked(node)"
                :indeterminate="nodeIndeterminate(node)"
                :disabled="effectivelyDisabled(node.option)"
              >
                {{ node.option.label }}
              </slot>
            </span>
          </div>
        </template>
        <div v-else class="ui-tree-select__empty">
          <slot name="empty">{{ emptyText }}</slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根容器：相对定位锚点（清空按钮与弹层的定位参照） ─────── */
.ui-tree-select {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  font-family: var(--ui-font-sans);
}

/* ── 触发器：surface 底 + line 描边，语义为 combobox ─────── */
.ui-tree-select__trigger {
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

.ui-tree-select__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点环由全局 :focus-visible 约定提供（paper.css，不改写 outline），
   容器描边同步转 accent 别名 --ui-input-border-focus */
.ui-tree-select__trigger:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：sand 底 + text-3 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-tree-select__trigger:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 触发器文案：占位态走 text-3，长文本省略 ─────────────── */
.ui-tree-select__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-tree-select__label--placeholder {
  color: var(--ui-text-3);
}

/* ── 折叠箭标：open 时翻转（结构性 transform，时长走 token） ── */
.ui-tree-select__chevron {
  flex: none;
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree-select__chevron--open {
  transform: rotate(180deg);
}

/* ── 清空按钮：原生 button，绝对定位于触发器右端（与箭标互换显示），
   mousedown.prevent 保住触发器焦点，避免 blur 先行关闭弹层 ── */
.ui-tree-select__trigger--clearable {
  padding-right: var(--ui-space-6);
}

.ui-tree-select__clear {
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

.ui-tree-select__clear:hover {
  color: var(--ui-text-1);
}

/* ── 弹层：Teleport body + 绝对定位（top/left/minWidth 由打开时的触发器
   rect + 页面滚动偏移换算的文档坐标内联写入）；与触发器的间距走 margin-top token ── */
.ui-tree-select__tree {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-popover);
  box-sizing: border-box;
  max-height: calc(var(--ui-space-8) * 4); /* 长树滚动（token 推导，随 Select 先例） */
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

/* ── 节点行：keyboard 高亮 → surface-muted；单选已选/复选勾选 → accent-soft + accent；
   disabled → text-3 + not-allowed（置于最后优先覆盖） ── */
.ui-tree-select__node {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2);
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

.ui-tree-select__node:hover {
  background-color: var(--ui-surface-muted);
}

.ui-tree-select__node--active {
  background-color: var(--ui-surface-muted);
}

.ui-tree-select__node--selected,
.ui-tree-select__node[aria-checked='true'] {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-tree-select__node[aria-disabled='true'],
.ui-tree-select__node[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 层级缩进：宽度由模板内联 style 按层级写入（每级 --ui-space-3，乘数为
   结构性计数；对齐 Tree 的内联 calc 先例，不自建 --ui-* 变量） ── */
.ui-tree-select__indent {
  flex: none;
}

/* ── 展开箭标列：可展开节点翻转，叶子节点占位对齐 ────────── */
.ui-tree-select__toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
  color: var(--ui-text-3);
}

.ui-tree-select__toggle-icon {
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree-select__toggle-icon--open {
  transform: rotate(90deg);
}

/* ── 复选框：勾选/半选 → accent 底 + on-accent 图标；状态由
   treeitem 的 aria-checked 承载，图形本身 aria-hidden ── */
.ui-tree-select__checkbox {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-5);
  height: var(--ui-space-5);
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border-strong);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface);
  color: var(--ui-on-accent);
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree-select__checkbox--checked,
.ui-tree-select__checkbox--indeterminate {
  border-color: var(--ui-accent);
  background-color: var(--ui-accent);
}

/* ── 节点文案：长文本省略 ───────────────────────────────── */
.ui-tree-select__node-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── 空态：text-3 居中一行 ───────────────────────────────── */
.ui-tree-select__empty {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}
</style>
