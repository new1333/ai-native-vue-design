<script setup lang="ts">
/**
 * ToggleItem —— 分段项：原生 <button type="button">，role / 选中 / 禁用 / roving tabindex
 * 均由 ToggleGroup 注入上下文驱动。
 *
 * - 语义随组模式而变：single → role="radio" + aria-checked（radiogroup 分组）；
 *   multiple → role="button" + aria-pressed（group 分组的切换按钮）。
 * - 键盘：Space / Enter 走原生 button 激活路径（不拦截 keydown）；
 *   方向键 / Home / End 由组件按 WAI-ARIA roving tabindex 约定处理（焦点移动，跳过禁用项）。
 * - 注册发生在 setup 期（同步、SSR 亦生效）：注册序即默认 DOM 序，
 *   组据此决定首个 Tab 落点与方向键目标；注销在 onBeforeUnmount。
 * - 元素引用（el）经闭包延迟取值，SSR 期为 null；focus() 只在客户端事件路径被调用。
 * - 脱离组独立使用：注入不到上下文时退化为普通按钮（无 role / 无选中联动），不推荐，不抛错。
 * - 视觉：分段轨道内的 thumb / 描边按钮两形态，全部消费 var(--ui-*) token（paper.css）。
 */
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { TOGGLE_GROUP_CONTEXT_KEY } from './ToggleGroup.constants'
import type { ToggleFocusOffset, ToggleItemExpose, ToggleItemProps, ToggleItemSlots } from './ToggleGroup.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ToggleItemProps>(), {
  label: undefined,
  disabled: false,
})
defineSlots<ToggleItemSlots>()

const group = inject(TOGGLE_GROUP_CONTEXT_KEY, undefined)
const buttonEl = ref<HTMLButtonElement | null>(null)

const isDisabled = computed(() => props.disabled || (group?.disabled.value ?? false))
/** 选中态完全由组受控值派生（脱离组时恒未选中）。 */
const checked = computed(() => group?.isSelected(props.value) ?? false)

/** 注册序 id：setup 期同步注册（SSR 亦生效）；脱离组时为 undefined。 */
const myId = group?.registerItem({
  el: () => buttonEl.value,
  disabled: () => isDisabled.value,
})

onBeforeUnmount(() => {
  if (group && myId !== undefined) group.unregisterItem(myId)
})

/** 当前项被禁用且恰为 roving-active 时交还 fallback，保证组仍可 Tab 进入。 */
watch(isDisabled, (now) => {
  if (now && group && myId !== undefined) group.resignActive(myId)
})

/** 语义角色随组模式：single 为 radio，multiple 为切换 button；脱离组无 role。 */
const role = computed(() => {
  if (!group) return undefined
  return group.type.value === 'multiple' ? 'button' : 'radio'
})

const ariaChecked = computed(() =>
  group !== undefined && group.type.value !== 'multiple' ? (checked.value ? 'true' : 'false') : undefined,
)
const ariaPressed = computed(() =>
  group !== undefined && group.type.value === 'multiple' ? (checked.value ? 'true' : 'false') : undefined,
)

/** roving tabindex：activeId 未定时回退首个可用项；脱离组不书写 tabindex。 */
const tabindex = computed<'0' | '-1' | undefined>(() => {
  if (!group || myId === undefined) return undefined
  const active = group.activeId.value
  if (active !== undefined) return active === myId ? '0' : '-1'
  return group.firstEnabledId.value === myId ? '0' : '-1'
})

const classes = computed(() => [
  'ui-toggle-item',
  `ui-toggle-item--${group?.variant.value ?? 'segmented'}`,
  {
    'ui-toggle-item--checked': checked.value,
    'ui-toggle-item--disabled': isDisabled.value,
  },
])

function onClick(): void {
  // 原生 disabled 已拦截用户路径；这里兜底直接派发的合成事件（同家族 guard 思路）。
  if (isDisabled.value) return
  group?.select(props.value)
}

/** 焦点同步：真实焦点落在哪一项，roving-active 就跟随到哪一项。 */
function onFocus(): void {
  if (group && myId !== undefined) group.setActive(myId)
}

function onKeydown(event: KeyboardEvent): void {
  if (!group || myId === undefined) return
  const offset: ToggleFocusOffset | undefined =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : event.key === 'Home'
          ? 'first'
          : event.key === 'End'
            ? 'last'
            : undefined
  if (offset === undefined) return // Space / Enter 交给原生 button 激活路径，不拦截
  event.preventDefault()
  group.moveFocus(myId, offset)
}

function focus(options?: FocusOptions): void {
  buttonEl.value?.focus(options)
}

function blur(): void {
  buttonEl.value?.blur()
}

defineExpose<ToggleItemExpose>({ focus, blur })
</script>

<template>
  <button
    ref="buttonEl"
    type="button"
    :class="classes"
    :role="role"
    :aria-checked="ariaChecked"
    :aria-pressed="ariaPressed"
    :tabindex="tabindex"
    :disabled="isDisabled"
    v-bind="$attrs"
    @click="onClick"
    @focus="onFocus"
    @keydown="onKeydown"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
/* ── 项（原生 button）：两形态共用的基线 ─────────────────────────────── */
.ui-toggle-item {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none; /* 结构性重置：非视觉取值 */
  margin: 0;
  padding: var(--ui-space-1) var(--ui-space-3);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-2);
  background-color: transparent; /* 结构性重置：非视觉取值 */
  cursor: pointer;
  user-select: none;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out),
    box-shadow var(--ui-motion-fast) var(--ui-ease-out);
}

/* ── segmented 形态：轨道（组根）内的滑动 thumb，选中即「纸面浮起」 ── */
.ui-toggle-item--segmented {
  border-radius: var(--ui-radius-sm);
}

.ui-toggle-item--segmented.ui-toggle-item--checked {
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  box-shadow: var(--ui-shadow-rest);
}

.ui-toggle-item--segmented:hover:not(.ui-toggle-item--checked):not(.ui-toggle-item--disabled) {
  color: var(--ui-text-1);
}

/* ── outline 形态：独立描边按钮组，选中转 accent-soft 实底 ─────────── */
.ui-toggle-item--outline {
  border-width: 1px; /* 结构性细线（无 --ui-border-width token，随 Button/Input/Checkbox/Radio 先例提出需求） */
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.ui-toggle-item--outline:hover:not(.ui-toggle-item--checked):not(.ui-toggle-item--disabled) {
  border-color: var(--ui-border-strong);
  color: var(--ui-text-1);
}

.ui-toggle-item--outline.ui-toggle-item--checked {
  border-color: var(--ui-accent);
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
}

/* ── disabled：灰化 + not-allowed（原生 disabled 已移出 Tab 序） ────── */
.ui-toggle-item--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-toggle-item--outline.ui-toggle-item--disabled {
  border-color: var(--ui-border);
  background-color: var(--ui-surface-muted);
}
</style>
