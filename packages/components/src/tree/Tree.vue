<script setup lang="ts">
/**
 * Tree —— 树形层级控件：展开/折叠、选中（单/多）、级联勾选。
 * role=tree/treeitem（li role=none 为透明容器），aria-expanded/selected/level/
 * posinset/setsize、roving tabindex；键盘 ↑↓ 移动（导航跳过禁用节点）、
 * ←→ 折叠/展开、Home/End 跳转、Enter 选中、Space 勾选（checkable 时）。
 * 状态机收口在 useTree；
 * 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { nextTick, onBeforeUnmount } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import {
  TREE_COLLAPSE_LABEL,
  TREE_EMPTY_TEXT_DEFAULT,
  TREE_EXPAND_LABEL,
  TREE_SKELETON_LEVELS,
} from './Tree.constants'
import { useTree } from './useTree'
import type { TreeEmits, TreeFlatNode, TreeNodeSlotScope, TreeProps, TreeSlots } from './Tree.types'

const props = withDefaults(defineProps<TreeProps>(), {
  modelValue: undefined,
  expandedKeys: undefined,
  checkedKeys: undefined,
  defaultCheckedKeys: undefined,
  checkable: false,
  multiple: false,
  loading: false,
})
const emit = defineEmits<TreeEmits>()
defineSlots<TreeSlots>()

const {
  visibleNodes,
  tabbableKey,
  isSelected,
  isChecked,
  isIndeterminate,
  setActiveKey,
  nextEnabledKey,
  edgeEnabledKey,
  firstEnabledChildKey,
  nearestEnabledAncestorKey,
  toggleExpand,
  toggleSelect,
  setChecked,
} = useTree({
  data: () => props.data,
  expandedKeys: () => props.expandedKeys,
  checkedKeys: () => props.checkedKeys,
  defaultCheckedKeys: () => props.defaultCheckedKeys,
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  onSelect: (payload) => emit('select', payload),
  onCheck: (payload) => emit('check', payload),
  onExpand: (payload) => emit('expand', payload),
  onUpdateCheckedKeys: (value) => emit('update:checkedKeys', value),
  onUpdateModelValue: (value) => emit('update:modelValue', value),
})

/** 是否渲染 tree 列表（loading 渲染骨架，非 loading 且无数据走空态）。 */
const showList = (): boolean => props.loading || visibleNodes.value.length > 0

// ── treeitem 元素登记（roving tabindex 的焦点落点）──────────────
// 模板 ref 函数只在客户端 patch 时被调用，SSR 不执行，无浏览器 API 暴露。
const itemEls = new Map<string, HTMLElement>()

function setItemRef(key: string): (el: Element | ComponentPublicInstance | null) => void {
  return (el) => {
    if (el instanceof HTMLElement) itemEls.set(key, el)
    else itemEls.delete(key)
  }
}

onBeforeUnmount(() => {
  itemEls.clear()
})

/** 移动 roving 焦点：先换 tabindex 归属，再真实聚焦对应元素。 */
async function focusKey(key: string): Promise<void> {
  setActiveKey(key)
  await nextTick()
  itemEls.get(key)?.focus()
}

/** 层级缩进：结构 = (level-1) × --ui-space-4（token 推导的布局值，非组件视觉常量）。 */
function indentStyle(level: number): { paddingInlineStart: string } {
  return { paddingInlineStart: `calc(${level - 1} * var(--ui-space-4))` }
}

/** #node 插槽作用域。 */
function nodeScope(flat: TreeFlatNode): TreeNodeSlotScope {
  return {
    node: flat.node,
    title: flat.node.title,
    icon: flat.node.icon,
    level: flat.level,
    hasChildren: flat.hasChildren,
    expanded: flat.expanded,
    selected: isSelected(flat.key),
    checked: isChecked(flat.key),
    indeterminate: isIndeterminate(flat.key),
    disabled: flat.node.disabled ?? false,
  }
}

/** 点击树节点：toggle 按钮 / checkbox 不在此列（它们有自己的语义）。 */
function onItemSelect(flat: TreeFlatNode, event: MouseEvent): void {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('button, input')) return
  toggleSelect(flat.node)
}

/** checkbox 原生 change：以输入框的新状态为意图做级联勾选。 */
function onCheckboxChange(flat: TreeFlatNode, event: Event): void {
  const target = event.target
  if (target instanceof HTMLInputElement) setChecked(flat.node, target.checked)
}

/**
 * 键盘交互（WAI-ARIA Tree View）：↑↓ 移动、←→ 折叠/展开或层级跳转、
 * Home/End 跳转、Enter 选中、Space 勾选（checkable 时）。
 * 导航落点一律跳过禁用节点（焦点不落在禁用 treeitem 上，与激活守卫配套，
 * 落点搜索收口在 useTree）；焦点因点击落在禁用节点上时，导航键仍可移出。
 * Enter/Space 仅在事件目标为 treeitem 本身时生效——
 * toggle 按钮 / checkbox 上的激活交给原生行为，避免双触发。
 */
async function onItemKeydown(event: KeyboardEvent, flat: TreeFlatNode, index: number): Promise<void> {
  const key = event.key
  switch (key) {
    case 'ArrowDown': {
      event.preventDefault()
      const next = nextEnabledKey(index, 1)
      if (next) await focusKey(next)
      break
    }
    case 'ArrowUp': {
      event.preventDefault()
      const prev = nextEnabledKey(index, -1)
      if (prev) await focusKey(prev)
      break
    }
    case 'Home': {
      event.preventDefault()
      const first = edgeEnabledKey('first')
      if (first) await focusKey(first)
      break
    }
    case 'End': {
      event.preventDefault()
      const last = edgeEnabledKey('last')
      if (last) await focusKey(last)
      break
    }
    case 'ArrowRight': {
      event.preventDefault()
      if (flat.hasChildren && !flat.expanded) {
        toggleExpand(flat.node)
      } else if (flat.hasChildren && flat.expanded) {
        const child = firstEnabledChildKey(index, flat.level + 1)
        if (child) await focusKey(child)
      }
      break
    }
    case 'ArrowLeft': {
      event.preventDefault()
      if (flat.hasChildren && flat.expanded) {
        toggleExpand(flat.node)
      } else {
        // 折叠中的父节点 / 叶子：焦点移到最近的可用（非禁用）可见祖先。
        const ancestor = nearestEnabledAncestorKey(flat.key)
        if (ancestor) await focusKey(ancestor)
      }
      break
    }
    case 'Enter':
    case ' ':
    case 'Spacebar': {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      if (props.checkable && key !== 'Enter') setChecked(flat.node, !isChecked(flat.key))
      else toggleSelect(flat.node)
      break
    }
    default:
      return
  }
}
</script>

<template>
  <div class="ui-tree">
    <ul
      v-if="showList()"
      class="ui-tree__list"
      role="tree"
      :aria-busy="loading ? 'true' : undefined"
    >
      <template v-if="loading">
        <li
          v-for="(level, i) in TREE_SKELETON_LEVELS"
          :key="`skeleton-${i}`"
          class="ui-tree__item ui-tree__item--skeleton"
          aria-hidden="true"
        >
          <div class="ui-tree__node ui-tree__node--skeleton" :style="indentStyle(level)">
            <span class="ui-tree__skeleton" />
          </div>
        </li>
      </template>
      <template v-else>
        <li
          v-for="(flat, index) in visibleNodes"
          :key="flat.key"
          class="ui-tree__item"
          role="none"
        >
          <div
            :ref="setItemRef(flat.key)"
            role="treeitem"
            class="ui-tree__node"
            :class="{
              'ui-tree__node--selected': isSelected(flat.key),
              'ui-tree__node--disabled': flat.node.disabled,
            }"
            :style="indentStyle(flat.level)"
            :aria-level="flat.level"
            :aria-setsize="flat.setSize"
            :aria-posinset="flat.posInSet"
            :aria-expanded="flat.hasChildren ? (flat.expanded ? 'true' : 'false') : undefined"
            :aria-selected="isSelected(flat.key) ? 'true' : 'false'"
            :aria-disabled="flat.node.disabled ? 'true' : undefined"
            :tabindex="flat.key === tabbableKey ? 0 : -1"
            @click="onItemSelect(flat, $event)"
            @focus="setActiveKey(flat.key)"
            @keydown="onItemKeydown($event, flat, index)"
          >
            <button
              v-if="flat.hasChildren"
              type="button"
              class="ui-tree__toggle"
              :class="{ 'ui-tree__toggle--expanded': flat.expanded }"
              tabindex="-1"
              :aria-label="`${flat.expanded ? TREE_COLLAPSE_LABEL : TREE_EXPAND_LABEL}「${flat.node.title}」`"
              @click="toggleExpand(flat.node)"
            >
              <svg
                class="ui-tree__toggle-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <span v-else class="ui-tree__toggle ui-tree__toggle--leaf" aria-hidden="true" />
            <input
              v-if="checkable"
              type="checkbox"
              class="ui-tree__checkbox"
              tabindex="-1"
              :checked="isChecked(flat.key)"
              :indeterminate="isIndeterminate(flat.key)"
              :disabled="flat.node.disabled"
              :aria-label="flat.node.title"
              @change="onCheckboxChange(flat, $event)"
            />
            <slot name="node" v-bind="nodeScope(flat)">
              <span class="ui-tree__title">{{ flat.node.title }}</span>
            </slot>
          </div>
        </li>
      </template>
    </ul>
    <div v-else class="ui-tree__empty">
      <slot name="empty">{{ TREE_EMPTY_TEXT_DEFAULT }}</slot>
    </div>
  </div>
</template>

<style scoped>
/* ── 外框：安静纸面，无外框底色；字号/行高/字色 token ───────── */
.ui-tree {
  box-sizing: border-box;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
}

/* ── 语义 tree 基底：去列表默认样式（结构语义，非色相取值）──── */
.ui-tree__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ui-tree__item {
  margin: 0;
}

/* ── 节点行：flex 行布局；缩进由行内 style 按 level × token 计算 ── */
.ui-tree__node {
  display: flex;
  align-items: center;
  gap: var(--ui-space-1);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree__node:not(.ui-tree__node--disabled):hover {
  background-color: var(--ui-surface-muted);
}

.ui-tree__node--selected {
  background-color: var(--ui-accent-soft);
}

.ui-tree__node--selected .ui-tree__title {
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-tree__node--disabled {
  cursor: not-allowed;
}

.ui-tree__node--disabled .ui-tree__title {
  color: var(--ui-text-3);
}

.ui-tree__node--skeleton {
  cursor: default;
}

/* ── 展开/折叠开关：原生 button，重置为无填充/无描边 ─────────── */
.ui-tree__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 16px; /* 图标尺寸 16/20/24 白名单（CONVENTIONS §2） */
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ui-text-3);
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree__toggle:not(.ui-tree__toggle--leaf):hover {
  color: var(--ui-text-1);
}

.ui-tree__toggle-icon {
  display: block;
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-tree__toggle--expanded .ui-tree__toggle-icon {
  transform: rotate(90deg);
}

/* ── 勾选框：原生 input，accent-color 走 token ──────────────── */
.ui-tree__checkbox {
  flex: none;
  width: 16px; /* 图标尺寸 16/20/24 白名单（CONVENTIONS §2） */
  height: 16px;
  margin: 0;
  accent-color: var(--ui-accent);
}

.ui-tree__node--disabled .ui-tree__checkbox {
  cursor: not-allowed;
}

/* ── 标题：占满剩余宽度，可截断 ─────────────────────────────── */
.ui-tree__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 空态 ──────────────────────────────────────────────────── */
.ui-tree__empty {
  padding: var(--ui-space-6) var(--ui-space-4);
  text-align: center;
  color: var(--ui-text-3);
}

/* ── loading 骨架条：时长由 token 推导（≈900ms），reduced-motion 归零即停 */
.ui-tree__skeleton {
  display: block;
  width: 100%;
  height: 1em; /* 相对继承字号（字号来自 --ui-text-sm token）的结构性高度 */
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-surface-muted);
  animation: ui-tree-shimmer calc(var(--ui-motion-default) * 5) var(--ui-ease-out) infinite;
}

@keyframes ui-tree-shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
