<script setup lang="ts">
/**
 * Menu —— 导航菜单根容器（nav 语义）：纵向/横向站点导航（区别于动作菜单）。
 * 受控/非受控激活值（v-model:modelValue / defaultValue），经 provide 向
 * MenuItem/SubMenu 提供共享上下文（useMenuController）；支持 items 数据驱动
 * 或 MenuItem·SubMenu 组合式两种用法。一切视觉消费 var(--ui-*) token（paper.css）。
 */
import { computed, h, provide, useId } from 'vue'
import type { VNode } from 'vue'
import {
  MENU_COLLAPSED_SUPPORTED_MODE,
  MENU_INJECTION_KEY,
  MENU_LEVEL_INJECTION_KEY,
  MENU_MODE_DEFAULT,
} from './Menu.constants'
import { useMenuController } from './useMenu'
import type { MenuLevelContext } from './useMenu'
import MenuItem from './MenuItem.vue'
import SubMenu from './SubMenu.vue'
import type { MenuEmits, MenuOption, MenuProps, MenuSlots } from './Menu.types'

const props = withDefaults(defineProps<MenuProps>(), {
  mode: MENU_MODE_DEFAULT,
})
const emit = defineEmits<MenuEmits>()

const uid = useId()

const controller = useMenuController({
  uid,
  mode: () => props.mode,
  collapsed: () => props.collapsed,
  modelValue: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  emit: (value) => {
    emit('update:modelValue', value)
    emit('select', value)
  },
})

if (props.collapsed === true && props.mode !== MENU_COLLAPSED_SUPPORTED_MODE) {
  console.warn('[ui-menu] collapsed 仅在 mode="vertical" 下生效，horizontal 下已忽略')
}

provide(MENU_INJECTION_KEY, controller)

/** 根层导航层级：恒可见、无 Esc 收起句柄。 */
const rootLevel: MenuLevelContext = { visible: computed(() => true) }
provide(MENU_LEVEL_INJECTION_KEY, rootLevel)

const slots = defineSlots<MenuSlots>()

/** items 模式：MenuOption → MenuItem / SubMenu vnode（递归；组节点仅展开，不可选中）。 */
function renderOption(option: MenuOption): VNode {
  const children = option.children ?? []
  if (children.length > 0) {
    return h(
      SubMenu,
      { key: `submenu-${option.value}`, value: option.value, title: option.label, disabled: option.disabled },
      {
        icon: slots.icon != null ? () => slots.icon!({ item: option }) : undefined,
        default: () => children.map(renderOption),
      },
    )
  }
  return h(
    MenuItem,
    { key: `item-${option.value}`, value: option.value, disabled: option.disabled },
    {
      default: () =>
        slots.item != null
          ? slots.item({
              item: option,
              active: controller.activeValue.value === option.value,
              disabled: option.disabled === true,
            })
          : option.label,
      icon: slots.icon != null ? () => slots.icon!({ item: option }) : undefined,
    },
  )
}

/** items 模式的渲染出口（局部函数式组件；响应式读取 props.items 与激活值）。 */
const OptionNodes = () => props.items?.map(renderOption) ?? []

const classes = computed(() => [
  'ui-menu',
  `ui-menu--${props.mode}`,
  { 'ui-menu--collapsed': props.collapsed === true && props.mode === MENU_COLLAPSED_SUPPORTED_MODE },
])
</script>

<template>
  <nav :class="classes">
    <ul class="ui-menu-list">
      <template v-if="props.items != null">
        <OptionNodes />
      </template>
      <template v-else>
        <slot />
      </template>
    </ul>
  </nav>
</template>

<style scoped>
/* ── 根容器：nav 语义，仅结构与方向档位，无自身装饰（一切数值走 token）──── */
.ui-menu {
  display: block;
}

.ui-menu-list {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 横向档：顶栏一行排布；子菜单面板在 SubMenu 内下弹定位。 */
.ui-menu--horizontal .ui-menu-list {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-1);
}

/* ── collapsed 档（仅纵向）：图标栏收起 ───────────────────── */
.ui-menu--collapsed {
  width: var(--ui-space-7);
}

.ui-menu--collapsed .ui-menu-list {
  flex-direction: column;
}
</style>
