<script setup lang="ts">
/**
 * SubMenu —— 可展开子菜单组（disclosure 模式）：触发器为原生 button
 * （aria-expanded / aria-controls 指向面板稳定 id），面板为嵌套 ul
 * （aria-labelledby 指回触发器；v-show 常驻挂载以保持注册序 = DOM 序）。
 * 纵向内联手风琴展开；横向下弹、collapsed 图标栏右侧飞出（纯 CSS 定位）。
 * 组节点不可选中：点击与 Enter/Space 只展开/收起，不发出 select。
 */
import { computed, inject, onBeforeUnmount, provide, ref, useId } from 'vue'
import {
  MENU_ID_PANEL_SUFFIX,
  MENU_ID_SUBMENU_SUFFIX,
  MENU_INJECTION_KEY,
  MENU_LEVEL_INJECTION_KEY,
} from './Menu.constants'
import { createMenuItemKeydownHandler, toMenuIdPart } from './useMenu'
import type { MenuLevelContext } from './useMenu'
import type { SubMenuProps, SubMenuSlots } from './Menu.types'

const props = defineProps<SubMenuProps>()
const slots = defineSlots<SubMenuSlots>()

const controller = inject(MENU_INJECTION_KEY, null)
if (controller == null) {
  console.warn('[ui-menu] SubMenu 应位于 <Menu> 内使用，否则展开态与键盘导航不生效')
}

if (props.title == null && slots.title == null) {
  console.warn('[ui-menu] SubMenu 需要 title prop 或 #title 插槽，否则触发器无可读名')
}

const parentLevel = inject<MenuLevelContext | null>(MENU_LEVEL_INJECTION_KEY, null)

const instanceKey = useId()
const triggerEl = ref<HTMLButtonElement | null>(null)

const expanded = ref(false)
/** 触发器自身是否处于可见导航链（只看祖先组；自身展开与否不影响）。 */
const selfVisible = computed(() => parentLevel?.visible.value ?? true)
/** 子级内容是否处于可见导航链（祖先组与本组全部展开）。 */
const childVisible = computed(() => selfVisible.value && expanded.value)

/** 提供给子级的层级上下文：Esc 收起本组并回焦触发器。 */
const childLevel: MenuLevelContext = {
  visible: childVisible,
  collapseAndFocusTrigger: () => {
    expanded.value = false
    triggerEl.value?.focus()
  },
}
provide(MENU_LEVEL_INJECTION_KEY, childLevel)

/** 触发器自身的 Esc 层级：已展开先收本组，否则委托外层。 */
const triggerEscLevel: MenuLevelContext = {
  visible: computed(() => true),
  collapseAndFocusTrigger: () => {
    if (expanded.value) {
      expanded.value = false
      return
    }
    parentLevel?.collapseAndFocusTrigger?.()
  },
}

const triggerId = computed(
  () => `${controller?.uid ?? instanceKey}-${MENU_ID_SUBMENU_SUFFIX}-${toMenuIdPart(props.value)}`,
)
const panelId = computed(
  () => `${controller?.uid ?? instanceKey}-${MENU_ID_PANEL_SUFFIX}-${toMenuIdPart(props.value)}`,
)

// roving tabindex：与叶子项同一可见可用池（激活项优先，否则首个）。
const tabindex = computed(() =>
  controller != null && controller.focusableKey.value === instanceKey ? undefined : -1,
)

const classes = computed(() => [
  'ui-menu-submenu',
  {
    'ui-menu-submenu--open': expanded.value,
    'ui-menu-submenu--disabled': props.disabled === true,
  },
])

if (controller != null) {
  const unregister = controller.registerItem({
    key: instanceKey,
    value: () => props.value,
    isGroup: true,
    disabled: () => props.disabled === true,
    visible: () => selfVisible.value,
    focus: () => triggerEl.value?.focus(),
  })
  onBeforeUnmount(unregister)
}

function toggle(): void {
  if (props.disabled) return
  expanded.value = !expanded.value
}

function onClick(): void {
  toggle()
}

const onKeydown =
  controller == null
    ? undefined
    : createMenuItemKeydownHandler(controller, {
        key: instanceKey,
        activate: toggle,
        level: triggerEscLevel,
      })
</script>

<template>
  <li :class="classes">
    <button
      :id="triggerId"
      ref="triggerEl"
      type="button"
      class="ui-menu-submenu__trigger"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="panelId"
      :tabindex="tabindex"
      :disabled="props.disabled"
      @click="onClick"
      @keydown="onKeydown"
    >
      <span v-if="slots.icon != null" class="ui-menu-submenu__icon"><slot name="icon" /></span>
      <span class="ui-menu-submenu__title"><slot name="title">{{ props.title }}</slot></span>
      <svg
        class="ui-menu-submenu__chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
    <ul
      v-show="expanded"
      :id="panelId"
      class="ui-menu-submenu__panel"
      :aria-labelledby="triggerId"
    >
      <slot />
    </ul>
  </li>
</template>

<style scoped>
/* ── 触发器：与叶子项同形（各组件 scoped 自维护，避免跨组件样式耦合）──── */
.ui-menu-submenu__trigger {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: var(--ui-space-2) var(--ui-space-3);
  border: none;
  border-radius: var(--ui-radius-sm);
  background-color: transparent;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-regular);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  text-align: start;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-menu-submenu__trigger:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

.ui-menu-submenu__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  margin-right: var(--ui-space-2);
}

.ui-menu-submenu__title {
  flex: 1 1 auto;
}

.ui-menu-submenu__chevron {
  flex: none;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
  margin-left: var(--ui-space-2);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-menu-submenu--open .ui-menu-submenu__chevron {
  transform: rotate(180deg);
}

.ui-menu-submenu__trigger:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 面板：嵌套列表；纵向内联手风琴（缩进一级）──────────────── */
.ui-menu-submenu__panel {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-menu--vertical:not(.ui-menu--collapsed) .ui-menu-submenu__panel {
  padding-left: var(--ui-space-4);
}

/* ── 飞出面板：横向下弹 / collapsed 右侧飞出（纯 CSS 定位，无 JS 测量）── */
.ui-menu--horizontal .ui-menu-submenu,
.ui-menu--collapsed .ui-menu-submenu {
  position: relative;
}

.ui-menu--horizontal .ui-menu-submenu__panel,
.ui-menu--collapsed .ui-menu-submenu__panel {
  position: absolute;
  z-index: var(--ui-z-dropdown);
  min-width: var(--ui-space-8);
  padding: var(--ui-space-1);
  background-color: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  box-shadow: var(--ui-shadow-pop);
}

.ui-menu--horizontal .ui-menu-submenu__panel {
  top: 100%;
  left: 0;
}

.ui-menu--collapsed .ui-menu-submenu__panel {
  top: 0;
  left: 100%;
}

/* ── collapsed 档（仅纵向）：图标栏收起，title 视觉隐藏但仍可读 ── */
/* 1px 裁剪为结构性几何（sr-only 惯例），非色彩/字号/间距取值。 */
.ui-menu--collapsed .ui-menu-submenu__trigger {
  justify-content: center;
  padding: var(--ui-space-2) 0;
}

.ui-menu--collapsed .ui-menu-submenu__icon {
  margin-right: 0;
}

.ui-menu--collapsed .ui-menu-submenu__chevron {
  margin-left: 0;
}

.ui-menu--collapsed .ui-menu-submenu__title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
