<script setup lang="ts">
/**
 * MenuItem —— 导航菜单叶子项（原生 button）：
 * 激活项以 aria-current="page" 标记（nav 语义）；roving tabindex 由共享上下文驱动
 * （激活项优先留在 Tab 序）；点击与 Enter/Space 激活（同 useTabs 策略，keydown
 * 统一 preventDefault 后单次触发），←→↑↓/Home/End 移动 roving 焦点，Esc 收起最近一层子菜单。
 */
import { computed, inject, onBeforeUnmount, ref, useId } from 'vue'
import {
  MENU_ARIA_CURRENT,
  MENU_INJECTION_KEY,
  MENU_LEVEL_INJECTION_KEY,
} from './Menu.constants'
import { createMenuItemKeydownHandler } from './useMenu'
import type { MenuLevelContext } from './useMenu'
import type { MenuItemProps, MenuItemSlots } from './Menu.types'

const props = defineProps<MenuItemProps>()
const slots = defineSlots<MenuItemSlots>()

const controller = inject(MENU_INJECTION_KEY, null)
if (controller == null) {
  console.warn('[ui-menu] MenuItem 应位于 <Menu> 内使用，否则激活态与键盘导航不生效')
}

const level = inject<MenuLevelContext | null>(MENU_LEVEL_INJECTION_KEY, null)

const instanceKey = useId()
const rootEl = ref<HTMLButtonElement | null>(null)

const active = computed(() => controller?.activeValue.value === props.value)

// roving tabindex：激活项（无激活值时首个可见可用项）留在 Tab 序，其余 -1。
const tabindex = computed(() =>
  controller != null && controller.focusableKey.value === instanceKey ? undefined : -1,
)

const classes = computed(() => [
  'ui-menu-item',
  {
    'ui-menu-item--active': active.value,
    'ui-menu-item--disabled': props.disabled === true,
  },
])

if (controller != null) {
  const unregister = controller.registerItem({
    key: instanceKey,
    value: () => props.value,
    isGroup: false,
    disabled: () => props.disabled === true,
    visible: () => level?.visible.value ?? true,
    focus: () => rootEl.value?.focus(),
  })
  onBeforeUnmount(unregister)
}

function activate(): void {
  if (props.disabled) return
  controller?.select(props.value)
}

function onClick(): void {
  activate()
}

const onKeydown =
  controller == null
    ? undefined
    : createMenuItemKeydownHandler(controller, {
        key: instanceKey,
        activate,
        level,
      })
</script>

<template>
  <li :class="classes">
    <button
      ref="rootEl"
      type="button"
      class="ui-menu-item__button"
      :aria-current="active ? MENU_ARIA_CURRENT : undefined"
      :tabindex="tabindex"
      :disabled="props.disabled"
      @click="onClick"
      @keydown="onKeydown"
    >
      <span v-if="slots.icon != null" class="ui-menu-item__icon"><slot name="icon" /></span>
      <span class="ui-menu-item__label"><slot /></span>
    </button>
  </li>
</template>

<style scoped>
/* ── 基底：结构与 token 化通用视觉（SubMenu 触发器同形，各自 scoped 维护）── */
.ui-menu-item__button {
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

.ui-menu-item__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  margin-right: var(--ui-space-2);
}

.ui-menu-item__label {
  flex: 1 1 auto;
}

.ui-menu-item__button:hover:not(:disabled) {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-1);
}

/* ── 状态：激活项（aria-current）─────────────────────────── */
.ui-menu-item--active > .ui-menu-item__button {
  background-color: var(--ui-accent-soft);
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
}

/* ── 状态：disabled ──────────────────────────────────────── */
.ui-menu-item__button:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── collapsed 档（仅纵向）：图标栏收起，label 视觉隐藏但仍可读 ── */
/* 1px 裁剪为结构性几何（sr-only 惯例），非色彩/字号/间距取值。 */
.ui-menu--collapsed .ui-menu-item__button {
  justify-content: center;
  padding: var(--ui-space-2) 0;
}

.ui-menu--collapsed .ui-menu-item__icon {
  margin-right: 0;
}

.ui-menu--collapsed .ui-menu-item__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
