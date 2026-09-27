<script setup lang="ts">
/**
 * CommandPalette —— Cmd/Ctrl+K 命令面板：dialog 模式模态浮层 + 搜索输入（combobox）
 * + 分组命令列表（listbox），搜索过滤 + 键盘执行的命令入口。
 *
 * - 受控开合 v-model（modelValue）：hotkey（默认 true）在客户端注册全局 Cmd/Ctrl+K
 *   开合监听（随 prop 动态重接线，onBeforeUnmount 无条件移除，SSR 无副作用）；
 *   Esc / 遮罩点击 / 选中命令后关闭，一律 emit update:modelValue=false 由使用方落账。
 * - 搜索过滤：对命令 label 做不区分大小写子串匹配（useCommandPalette）；组内全部
 *   未命中时整组隐藏；无可见命令时渲染 empty 插槽（回退默认文案）。
 * - 键盘（WAI-ARIA combobox + listbox 模式）：焦点恒驻搜索输入框，aria-activedescendant
 *   指向当前激活 option；↓/↑ 环绕移动（跳过 disabled）、Home/End 首尾、Enter 选中。
 * - 模态机制复用 dialog 公共 composable useDialog：焦点圈定与还原、body 滚动锁、
 *   Esc 请求关闭（打开时焦点移入搜索输入框，关闭后还原打开前元素）。
 * - SSR：浮层仅客户端渲染（mounted 门控 + Teleport），renderToString 只输出 hidden
 *   占位（ui-command-palette 根类），不访问任何浏览器 API。
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import { useDialog } from '../dialog'
import {
  COMMAND_PALETTE_DIALOG_LABEL,
  COMMAND_PALETTE_EMPTY_TEXT,
  COMMAND_PALETTE_HOTKEY_KEY,
  COMMAND_PALETTE_LISTBOX_LABEL,
  COMMAND_PALETTE_PLACEHOLDER_DEFAULT,
} from './CommandPalette.constants'
import { useCommandPalette } from './useCommandPalette'
import type {
  CommandPaletteCommand,
  CommandPaletteEmits,
  CommandPaletteExpose,
  CommandPaletteProps,
  CommandPaletteSlots,
} from './CommandPalette.types'

// 根为「hidden 占位 / Teleport」条件分支（fragment），attrs 不自动继承（同 dialog/）：
// 使用方 attrs（aria-label / aria-labelledby / aria-describedby / id 等）手动落到搜索
// 输入框（v-bind="$attrs"），为 combobox 输入提供可访问名称与外部说明的关联通道
// （同 cascader/autocomplete 家族：attrs 落在触发器/输入框上供 FormField 接入）。
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  modelValue: false,
  hotkey: true,
  placeholder: COMMAND_PALETTE_PLACEHOLDER_DEFAULT,
})
const emit = defineEmits<CommandPaletteEmits>()
defineSlots<CommandPaletteSlots>()

const slots = useSlots()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染（同 dialog/）。 */
const isMounted = ref(false)
const panelEl = ref<HTMLDivElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const headerId = useId()
const listId = useId()

/** 搜索关键词（过滤目标为命令 label）。关闭即清空，重开是干净面板。 */
const query = ref('')

const hasHeader = computed(() => Boolean(slots.header))

/** option 元素 id（aria-activedescendant 指向；扁平下标 = 过滤视图全局下标）。 */
function optionId(index: number): string {
  return `${listId}-o-${index}`
}

/** 分组标题元素 id（role="group" 的 aria-labelledby 指向）。 */
function groupLabelId(groupIndex: number): string {
  return `${listId}-g-${groupIndex}`
}

const {
  view,
  options,
  activeIndex,
  resetToFirstEnabled,
  setActive,
  selectCommand,
  onInputKeydown,
} = useCommandPalette({
  groups: () => props.groups,
  query,
  // 选中（Enter/点击唯一路径）：发出 select 后请求关闭。
  onSelect: command => {
    emit('select', command.key)
    emit('update:modelValue', false)
  },
})

/** aria-activedescendant：指向当前激活 option（无激活项时缺省）。 */
const activeDescendantId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
)

/* ── 模态机制（复用 dialog 公共 composable）：焦点圈定/还原、滚动锁、Esc 关闭 ── */

const { activate, deactivate, onKeydown: onOverlayKeydown } = useDialog({
  panel: () => panelEl.value,
  onEscape: () => emit('update:modelValue', false),
})

function onScrimClick(): void {
  emit('update:modelValue', false)
}

function onOptionClick(command: CommandPaletteCommand): void {
  selectCommand(command)
}

// 打开/关闭副作用（清空过滤、激活项复位、滚动锁、焦点移入/还原）跟随受控状态；
// 初始即打开（onMounted）与受控打开（watch）共用同一 openPanel 路径。
function openPanel(): void {
  query.value = ''
  resetToFirstEnabled()
  activate()
}

watch(
  () => props.modelValue,
  open => {
    if (open) openPanel()
    else deactivate()
  },
  { flush: 'post' },
)

/* ── 全局热键：Cmd/Ctrl+K 开合（仅客户端注册，SSR 不产生副作用） ─────────── */

function onHotkeyKeydown(event: KeyboardEvent): void {
  if (!(event.metaKey || event.ctrlKey)) return
  if (event.key.toLowerCase() !== COMMAND_PALETTE_HOTKEY_KEY) return
  event.preventDefault()
  emit('update:modelValue', !props.modelValue)
}

onMounted(() => {
  isMounted.value = true
  if (props.hotkey) window.addEventListener('keydown', onHotkeyKeydown)
  // 初始即打开：等 Teleport 重渲染落地后激活（activate 内部再等一次 nextTick）。
  if (props.modelValue) openPanel()
})

// hotkey 为响应式 prop：变化时重接线（false→true 补注册、true→false 即时移除），
// 不以挂载/卸载时刻的快照值为条件；SSR 渲染期间 prop 不变，回调不会触发（无 window 访问）。
watch(
  () => props.hotkey,
  hotkey => {
    if (hotkey) window.addEventListener('keydown', onHotkeyKeydown)
    else window.removeEventListener('keydown', onHotkeyKeydown)
  },
)

onBeforeUnmount(() => {
  // 无条件移除（未注册时为 no-op）：卸载清理不读 props.hotkey 的卸载时刻快照，
  // hotkey 挂载后 true→false 的路径也不会泄漏全局监听（继续吞掉 Cmd/Ctrl+K）。
  window.removeEventListener('keydown', onHotkeyKeydown)
  // 卸载兜底：打开状态下卸载也要解除滚动锁并还原焦点。
  deactivate()
})

function focus(): void {
  inputEl.value?.focus()
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose<CommandPaletteExpose>({ focus, blur })
</script>

<template>
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-command-palette 根类），不渲染浮层 -->
  <div v-if="!isMounted" class="ui-command-palette" hidden></div>
  <Teleport v-else to="body">
    <div v-if="modelValue" class="ui-command-palette" @keydown="onOverlayKeydown">
      <div class="ui-command-palette__scrim" @click="onScrimClick"></div>
      <div
        ref="panelEl"
        class="ui-command-palette__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="hasHeader ? headerId : undefined"
        :aria-label="hasHeader ? undefined : COMMAND_PALETTE_DIALOG_LABEL"
        tabindex="-1"
      >
        <div v-if="hasHeader" :id="headerId" class="ui-command-palette__header">
          <slot name="header" />
        </div>
        <div class="ui-command-palette__search">
          <svg
            class="ui-command-palette__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            class="ui-command-palette__input"
            role="combobox"
            autocomplete="off"
            :placeholder="placeholder"
            aria-expanded="true"
            aria-autocomplete="list"
            :aria-controls="listId"
            :aria-activedescendant="activeDescendantId"
            v-bind="$attrs"
            @keydown="onInputKeydown"
          />
        </div>
        <div
          :id="listId"
          class="ui-command-palette__list"
          role="listbox"
          :aria-label="COMMAND_PALETTE_LISTBOX_LABEL"
        >
          <div
            v-for="(group, gi) in view"
            :key="group.key"
            class="ui-command-palette__group"
            role="group"
            :aria-labelledby="group.label ? groupLabelId(gi) : undefined"
          >
            <div v-if="group.label" :id="groupLabelId(gi)" class="ui-command-palette__group-label">
              {{ group.label }}
            </div>
            <div
              v-for="entry in group.items"
              :key="entry.command.key"
              :id="optionId(entry.index)"
              class="ui-command-palette__option"
              :class="{
                'ui-command-palette__option--active': entry.index === activeIndex,
                'ui-command-palette__option--danger': entry.command.danger,
                'ui-command-palette__option--disabled': entry.command.disabled,
              }"
              role="option"
              :aria-selected="entry.index === activeIndex ? 'true' : 'false'"
              :aria-disabled="entry.command.disabled ? 'true' : undefined"
              @click="onOptionClick(entry.command)"
              @mouseenter="setActive(entry.index)"
            >
              <slot name="item" :command="entry.command" :active="entry.index === activeIndex">
                <span v-if="entry.command.icon" class="ui-command-palette__option-icon" aria-hidden="true">
                  <component :is="entry.command.icon" />
                </span>
                <span class="ui-command-palette__option-label">{{ entry.command.label }}</span>
                <span v-if="entry.command.hint" class="ui-command-palette__option-hint">
                  {{ entry.command.hint }}
                </span>
              </slot>
            </div>
          </div>
        </div>
        <div v-if="options.length === 0" class="ui-command-palette__empty">
          <slot name="empty">{{ COMMAND_PALETTE_EMPTY_TEXT }}</slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 浮层根：满屏定位 + 顶部对齐（z-index 走 modal 层级 token，同 dialog/） ── */
.ui-command-palette {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* 顶部留白更大：命令面板惯例锚在视口上沿附近 */
  padding: var(--ui-space-7) var(--ui-space-5) var(--ui-space-5);
  font-family: var(--ui-font-sans);
}

/* hidden 占位（SSR/挂载前）：显式压制 display，避免被根分支样式覆盖（同 dialog/） */
.ui-command-palette[hidden] {
  display: none;
}

/* ── 遮罩：点击关闭命中区，非交互元素（不聚焦、无 role） ──────────── */
.ui-command-palette__scrim {
  position: absolute;
  inset: 0;
  background-color: var(--ui-scrim);
  animation: ui-command-palette-scrim-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 面板：surface 底 + lg 圆角 + modal 阴影，顶部对齐（宽度由间距标尺推导，
   无面板宽度 token，已在任务结果中提出需求） ── */
.ui-command-palette__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(var(--ui-space-8) * 9); /* ≈576px，与 dialog md 一致 */
  max-width: 100%;
  max-height: 100%;
  background-color: var(--ui-surface);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，已在任务结果中提出需求） */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-modal);
  overflow: hidden;
  animation: ui-command-palette-panel-in var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 头部（header 插槽）：搜索框上方的标题区 ─────────────────────── */
.ui-command-palette__header {
  padding: var(--ui-space-4) var(--ui-space-4) 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

/* ── 搜索行：放大镜图标 + combobox 输入（下边框分隔列表） ─────────── */
.ui-command-palette__search {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（同上） */
  border-bottom: 1px solid var(--ui-border);
  padding: var(--ui-space-3) var(--ui-space-4);
  transition: border-color var(--ui-motion-default) var(--ui-ease-out);
}

/* 焦点指示：combobox 输入框获得焦点时分隔线转 accent（焦点环约定之外的补充 token 指示） */
.ui-command-palette__search:focus-within {
  border-bottom-color: var(--ui-accent);
}

.ui-command-palette__search-icon {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ui-text-3);
}

.ui-command-palette__input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 0;
  background-color: transparent;
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
}

.ui-command-palette__input::placeholder {
  color: var(--ui-text-3);
}

/* ── 列表：分组 listbox（占满剩余高度滚动） ──────────────────────── */
.ui-command-palette__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--ui-space-1);
}

.ui-command-palette__group-label {
  padding: var(--ui-space-2) var(--ui-space-3) var(--ui-space-1);
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-3);
}

/* ── 命令项：非聚焦 option（焦点恒驻输入框，aria-activedescendant 模式） ── */
/* border:none 为结构性复位（非色相取值，无对应 token） */
.ui-command-palette__option {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border: none;
  border-radius: var(--ui-radius-xs);
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

/* 激活项（aria-activedescendant 指向 / 悬停同步）：muted 底高亮（观感对齐 dropdown-menu 项） */
.ui-command-palette__option--active,
.ui-command-palette__option:hover {
  background-color: var(--ui-surface-muted);
}

/* 危险命令：danger 色 + danger 柔底反馈 */
.ui-command-palette__option--danger {
  color: var(--ui-danger);
}

.ui-command-palette__option--danger.ui-command-palette__option--active,
.ui-command-palette__option--danger:hover {
  background-color: var(--ui-danger-soft);
}

/* 禁用命令：text-3 弱化、不可点（aria-disabled，漫游跳过） */
.ui-command-palette__option--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 项内结构：图标（16px 档）、文本、右侧提示 ───────────────────── */
.ui-command-palette__option-icon,
.ui-command-palette__option-label {
  display: inline-flex;
  align-items: center;
}

.ui-command-palette__option-icon {
  flex: none;
}

.ui-command-palette__option-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.ui-command-palette__option-hint {
  margin-left: auto;
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
}

/* ── 空结果：居中弱化文案 ──────────────────────────────────────── */
.ui-command-palette__empty {
  padding: var(--ui-space-5);
  color: var(--ui-text-3);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  text-align: center;
}

/* ── 入场动效：时长/缓动走 token（reduced-motion 下时长归零即静止） ── */
/* opacity/translate 为白名单内的结构性入场动效（非色相/尺寸取值，无对应 token） */
@keyframes ui-command-palette-scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes ui-command-palette-panel-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--ui-space-1) * -2));
  }
}
</style>
