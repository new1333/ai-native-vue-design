<script setup lang="ts">
/**
 * DropdownMenu —— 下拉菜单：触发器（默认插槽）+ items 数据驱动的 menu 浮层。
 *
 * - 触发器为原生 button（aria-haspopup="menu" + aria-expanded）；点击或 Enter/Space/↓/↑ 打开。
 * - 浮层 Teleport 至 body：fixed 锚盒钉在触发器 rect 上，面板在锚盒下方绝对定位，
 *   align=start 左对齐 / align=end 右对齐；打开期间跟随滚动与 resize。
 * - 键盘（WAI-ARIA menu button 模式）：菜单内 ↓/↑ 环绕移动、Home/End 首尾、
 *   Enter 选中、Esc/Tab 关闭；roving focus 跳过 disabled 项。
 * - 外点关闭（document click capture，onMounted 常驻绑定 + open 守卫，策略同 select/）；
 *   键盘/选中路径关闭后焦点还原触发器。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport），renderToString 只输出触发器
 *   （无浏览器 API 访问）。
 */
import { onMounted, ref, useId } from 'vue'
import { DROPDOWN_MENU_ALIGN_DEFAULT, DROPDOWN_MENU_HASPOPUP } from './DropdownMenu.constants'
import { useDropdownMenu } from './useDropdownMenu'
import type {
  DropdownMenuEmits,
  DropdownMenuExpose,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownMenuSlots,
} from './DropdownMenu.types'

// 根为「wrapper + Teleport」fragment，attrs 不自动继承（透传到触发器，同 select/）
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  align: DROPDOWN_MENU_ALIGN_DEFAULT,
})
const emit = defineEmits<DropdownMenuEmits>()
defineSlots<DropdownMenuSlots>()

const triggerId = useId()
const menuId = useId()

const triggerRef = ref<HTMLButtonElement | null>(null)
const flyoutRef = ref<HTMLDivElement | null>(null)

/** 浮层仅客户端渲染（SSR 输出中不出现菜单，同 select/）。 */
const mounted = ref(false)

const { isOpen, activeIndex, openMenu, closeMenu, selectItem, onTriggerKeydown, onMenuKeydown } =
  useDropdownMenu({
    trigger: () => triggerRef.value,
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

onMounted(() => {
  mounted.value = true
})

function focus(options?: FocusOptions): void {
  triggerRef.value?.focus(options)
}

function blur(): void {
  triggerRef.value?.blur()
}

defineExpose<DropdownMenuExpose>({ focus, blur })
</script>

<template>
  <div class="ui-dropdown-menu">
    <button
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
          :aria-labelledby="triggerId"
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

/* ── 触发器：secondary 观感的原生 button ────────────────── */
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

/* ── 浮层锚盒：fixed 钉在触发器 rect（inline 定位由 useDropdownMenu 写入） ── */
.ui-dropdown-menu__flyout {
  position: fixed;
  z-index: var(--ui-z-dropdown);
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

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-dropdown-menu-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * -1));
  }
}
</style>
