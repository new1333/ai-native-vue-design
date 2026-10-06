<script setup lang="ts">
/**
 * DropdownMenu —— 下拉菜单：触发器（默认插槽）+ items 数据驱动的 menu 浮层。
 *
 * - 触发器模型（不再嵌套 button）：默认插槽为「单个元素/组件 vnode」时，该元素
 *   直接作为触发元素——经 cloneVNode 合并 id、aria-haspopup="menu"、aria-expanded、
 *   aria-controls 与 click/keydown 监听（策略同 tooltip/）；插槽为文本/多根/空时
 *   回退为内建原生 button 触发器（ui-dropdown-menu__trigger）。
 * - 点击或 Enter/Space/↓/↑ 打开。浮层 Teleport 至 body：fixed 锚盒钉在触发元素
 *   rect 上，面板在锚盒下方绝对定位，align=start 左对齐 / align=end 右对齐；
 *   打开期间跟随滚动与 resize。
 * - 键盘（WAI-ARIA menu button 模式）：菜单内 ↓/↑ 环绕移动、Home/End 首尾、
 *   Enter 选中、Esc/Tab 关闭；roving focus 跳过 disabled 项。
 * - 外点关闭（document click capture，onMounted 常驻绑定 + open 守卫，策略同 select/）；
 *   键盘/选中路径关闭后焦点还原触发元素。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport），renderToString 只输出触发元素
 *   （无浏览器 API 访问）。
 */
import { cloneVNode, onMounted, ref, useAttrs, useId, useSlots } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import {
  DROPDOWN_MENU_ALIGN_DEFAULT,
  DROPDOWN_MENU_EMPTY_TEXT_DEFAULT,
  DROPDOWN_MENU_HASPOPUP,
} from './DropdownMenu.constants'
import { useDropdownMenu } from './useDropdownMenu'
import type {
  DropdownMenuEmits,
  DropdownMenuExpose,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownMenuSlots,
} from './DropdownMenu.types'

// 根为「触发元素 + Teleport」fragment，attrs 不自动继承（手动并入触发元素，同 select/tooltip/）
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  align: DROPDOWN_MENU_ALIGN_DEFAULT,
})
const emit = defineEmits<DropdownMenuEmits>()
defineSlots<DropdownMenuSlots>()

const attrs = useAttrs()
const slots = useSlots()

const triggerId = useId()
const menuId = useId()

/** 触发元素：原生元素或组件实例（组件触发元素经 $el 解包，同 tooltip/）。 */
const triggerRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const flyoutRef = ref<HTMLDivElement | null>(null)

/** 触发元素 getter：组件实例解包为其根元素（多根/文本根组件返回 null）。 */
function triggerElement(): HTMLElement | null {
  const current = triggerRef.value
  if (current instanceof HTMLElement) return current
  const inner = (current as ComponentPublicInstance | null)?.$el
  return inner instanceof HTMLElement ? inner : null
}

/** 浮层仅客户端渲染（SSR 输出中不出现菜单，同 select/）。 */
const mounted = ref(false)

const { isOpen, activeIndex, openMenu, closeMenu, selectItem, onTriggerKeydown, onMenuKeydown } =
  useDropdownMenu({
    trigger: triggerElement,
    flyout: () => flyoutRef.value,
    items: () => props.items,
    onSelect: item => emit('select', item.key),
  })

function onTriggerClick(): void {
  if (isOpen.value) closeMenu()
  else openMenu('first')
}

function onItemClick(item: DropdownMenuItem): void {
  selectItem(item)
}

/* ── 触发器插槽：单个元素/组件 → 直接作为触发元素；文本/多根/空 → 内建触发器 ── */

/** 默认插槽 vnodes（未使用插槽或空数组时为 null）。 */
function slotVNodes(): VNode[] | null {
  const nodes = slots.default?.()
  return nodes && nodes.length > 0 ? nodes : null
}

/**
 * 插槽恰好渲染「单个元素/组件 vnode」时返回它（该元素将直接作为触发元素）；
 * 文本/注释/片段 vnode 与多根插槽不可承接触发职责，返回 null 走内建触发器。
 */
function slotTriggerNode(): VNode | null {
  const nodes = slotVNodes()
  if (!nodes || nodes.length !== 1) return null
  const node = nodes[0]
  if (
    typeof node.type === 'string' ||
    typeof node.type === 'object' ||
    typeof node.type === 'function'
  ) {
    return node
  }
  return null
}

function hasSlotTrigger(): boolean {
  return slotTriggerNode() !== null
}

/** 插槽触发元素自身声明的 id（组件触发元素须把 attrs 透传到根元素，id 才可达）。 */
function declaredTriggerId(node: VNode | null): string | null {
  const declared = node?.props?.id
  return typeof declared === 'string' && declared.length > 0 ? declared : null
}

/** panel aria-labelledby：指向触发元素实际 id（插槽声明 id 或组件内定 id）。 */
function triggerLabelledById(): string {
  return declaredTriggerId(slotTriggerNode()) ?? triggerId
}

/**
 * 渲染触发元素：克隆默认插槽的首个（且唯一）元素/组件 vnode，合并交互监听与
 * aria-haspopup/expanded/controls（打开时 aria-controls 关联菜单 id）；
 * 同时透传使用方写在 <DropdownMenu> 上的 attrs（class / data-* / 既有监听器链式合并）。
 * 每次渲染重新求值（非 computed），确保 attrs / 插槽内容不因缓存而滞后（同 tooltip/）。
 */
function renderTrigger(): VNode | null {
  const node = slotTriggerNode()
  if (!node) return null
  const extra: Record<string, unknown> = {
    ...attrs,
    'aria-haspopup': DROPDOWN_MENU_HASPOPUP,
    'aria-expanded': isOpen.value ? 'true' : 'false',
    'aria-controls': isOpen.value ? menuId : undefined,
    onClick: onTriggerClick,
    onKeydown: onTriggerKeydown,
  }
  // 原生 button 触发元素未显式声明 type 时补 button（防表单内误提交）；
  // 组件触发元素的 type 契约由其自身负责（如 Button 默认渲染 type="button"）。
  if (node.type === 'button' && node.props?.type === undefined) extra.type = 'button'
  if (declaredTriggerId(node) === null) extra.id = triggerId
  // 定向断言为 cloneVNode 的 extraProps 形参类型（非 as any 绕过，同 tooltip/）
  return cloneVNode(node, extra as Parameters<typeof cloneVNode>[1], true)
}

onMounted(() => {
  mounted.value = true
})

function focus(options?: FocusOptions): void {
  triggerElement()?.focus(options)
}

function blur(): void {
  triggerElement()?.blur()
}

defineExpose<DropdownMenuExpose>({ focus, blur })
</script>

<template>
  <div class="ui-dropdown-menu">
    <!-- 插槽为单个元素/组件：该元素即触发元素（克隆合并 id/aria/事件，不再包一层 button） -->
    <component v-if="hasSlotTrigger()" :is="renderTrigger()" ref="triggerRef" />
    <!-- 插槽为文本/多根/空：回退内建原生 button 触发器（既有观感与契约不变） -->
    <button
      v-else
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="ui-dropdown-menu__trigger"
      :aria-haspopup="DROPDOWN_MENU_HASPOPUP"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="isOpen ? menuId : undefined"
      v-bind="$attrs"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot />
    </button>
    <Teleport v-if="mounted && isOpen" to="body">
      <div v-if="isOpen" ref="flyoutRef" class="ui-dropdown-menu__flyout">
        <div
          :id="menuId"
          class="ui-dropdown-menu__panel"
          :class="`ui-dropdown-menu__panel--${align}`"
          role="menu"
          :aria-labelledby="triggerLabelledById()"
          @keydown="onMenuKeydown"
        >
          <button
            v-for="(item, index) in items"
            :key="item.key"
            type="button"
            class="ui-dropdown-menu__item"
            :class="{ 'ui-dropdown-menu__item--danger': item.danger }"
            role="menuitem"
            :disabled="item.disabled"
            :tabindex="index === activeIndex && !item.disabled ? '0' : '-1'"
            @click="onItemClick(item)"
          >
            <span v-if="item.icon" class="ui-dropdown-menu__item-icon" aria-hidden="true">
              <component :is="item.icon" />
            </span>
            <span class="ui-dropdown-menu__item-label">{{ item.label }}</span>
          </button>
          <div v-if="items.length === 0" class="ui-dropdown-menu__empty">
            <slot name="empty">{{ DROPDOWN_MENU_EMPTY_TEXT_DEFAULT }}</slot>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根：行内锚定（浮层不占位） ─────────────────────────── */
.ui-dropdown-menu {
  position: relative;
  display: inline-flex;
  font-family: var(--ui-font-sans);
}

/* ── 触发器（回退路径）：插槽为文本/多根/空时的内建原生 button（secondary 观感）；
   插槽为单个元素/组件时不渲染该层，触发元素视觉由其自身负责（如 Button） ── */
.ui-dropdown-menu__trigger {
  display: inline-flex;
  align-items: center;
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-radius: var(--ui-radius-sm);
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface);
  border-color: var(--ui-border);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-default) var(--ui-ease-out),
    border-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-dropdown-menu__trigger:hover {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border-strong);
}

/* ── 浮层锚盒：fixed 钉在触发器 rect（inline 定位由 useDropdownMenu 写入）；
   层级走 body 级非模态弹层档 --ui-z-popover（高于 drawer/modal，低于 toast） ── */
.ui-dropdown-menu__flyout {
  position: fixed;
  z-index: var(--ui-z-popover);
}

/* ── 面板：surface 底 + sm 圆角 + pop 阴影，锚盒下方弹出（观感对齐 select/ 弹层） ── */
.ui-dropdown-menu__panel {
  position: absolute;
  top: 100%;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  padding: var(--ui-space-1);
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（同上，token 需求已提出） */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  animation: ui-dropdown-menu-in var(--ui-motion-fast) var(--ui-ease-out);
}

/* 对齐：start 锚盒左缘 / end 锚盒右缘（纯 CSS，无需测量面板宽度） */
.ui-dropdown-menu__panel--start {
  left: 0;
}

.ui-dropdown-menu__panel--end {
  right: 0;
}

/* ── 菜单项：原生 button（观感对齐 select/ 选项） ────────── */
/* border:none 为结构性复位（非色相取值，无对应 token） */
.ui-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border: none;
  background-color: transparent;
  border-radius: var(--ui-radius-xs);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  text-align: left;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

/* roving focus 只经键盘进入菜单项，DOM :focus 即高亮（焦点环另由全局 :focus-visible 提供） */
.ui-dropdown-menu__item:hover:not(:disabled),
.ui-dropdown-menu__item:focus:not(:disabled) {
  background-color: var(--ui-surface-muted);
}

/* 危险项：danger 色 + danger 柔底反馈 */
.ui-dropdown-menu__item--danger {
  color: var(--ui-danger);
}

.ui-dropdown-menu__item--danger:hover:not(:disabled),
.ui-dropdown-menu__item--danger:focus:not(:disabled) {
  background-color: var(--ui-danger-soft);
}

/* 禁用项：text-3 弱化、不可点、hover 让位（原生 disabled 已移出 Tab 序） */
.ui-dropdown-menu__item:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 项内结构：图标（16px 档）与文本 ────────────────────── */
.ui-dropdown-menu__item-icon,
.ui-dropdown-menu__item-label {
  display: inline-flex;
  align-items: center;
}

.ui-dropdown-menu__item-icon {
  flex: none;
}

.ui-dropdown-menu__item-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

/* ── 空态：items 为空时的弱提示（观感对齐 select/ 家族空态先例） ── */
.ui-dropdown-menu__empty {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-dropdown-menu-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * -1));
  }
}
</style>
