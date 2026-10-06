<script setup lang="ts">
/**
 * TabsTrigger —— 单个页签（role=tab，原生 button）：
 * id 由根 uid + value 确定性派生（稳定）；aria-selected / aria-controls /
 * roving tabindex 由共享上下文驱动；点击与 Enter/Space 激活（同 useButton 策略，
 * keydown 统一 preventDefault 后单次触发选中）。
 */
import { computed, inject, onBeforeUnmount, ref, useId } from 'vue'
import { TABS_ACTIVATION_KEYS, TABS_INJECTION_KEY, TABS_VARIANT_DEFAULT } from './Tabs.constants'
import type { TabsTriggerProps, TabsTriggerSlots } from './Tabs.types'

const props = defineProps<TabsTriggerProps>()
defineSlots<TabsTriggerSlots>()

const controller = inject(TABS_INJECTION_KEY, null)
if (controller == null) {
  console.warn('[ui-tabs] TabsTrigger 应位于 <Tabs> 内使用，否则选中态与 tab 语义不生效')
}

const instanceKey = useId()
const rootEl = ref<HTMLButtonElement | null>(null)

const selected = computed(() => controller?.activeValue.value === props.value)

// roving tabindex：仅激活 trigger（无激活值时首个非 disabled）留在 Tab 序，其余 -1。
const tabindex = computed(() =>
  controller != null && controller.focusableTriggerKey.value === instanceKey ? undefined : -1,
)

const classes = computed(() => [
  'ui-tabs-trigger',
  `ui-tabs-trigger--${controller?.variant.value ?? TABS_VARIANT_DEFAULT}`,
  {
    'ui-tabs-trigger--active': selected.value,
    'ui-tabs-trigger--disabled': props.disabled === true,
  },
])

if (controller != null) {
  const unregister = controller.registerTrigger({
    key: instanceKey,
    value: () => props.value,
    disabled: () => props.disabled === true,
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

function onKeydown(event: KeyboardEvent): void {
  if (!TABS_ACTIVATION_KEYS.includes(event.key)) return
  // keydown 统一 preventDefault（拦截原生二次激活与 Space 滚动），
  // 由组件唯一触发选中，保证各环境单次激活。
  event.preventDefault()
  activate()
}
</script>

<template>
  <button
    :id="controller?.triggerIdFor(props.value)"
    ref="rootEl"
    type="button"
    role="tab"
    :class="classes"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-controls="controller?.contentIdFor(props.value)"
    :tabindex="tabindex"
    :disabled="props.disabled"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>

<style scoped>
/* ── 基底：结构 + token 化通用视觉 ─────────────────────── */
/* 无填充/无描边为结构性重置（非色相取值，同 Button ghost 先例），档位视觉在其上叠加 */
.ui-tabs-trigger {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: var(--ui-space-2) var(--ui-space-3);
  border: none;
  background-color: transparent;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-regular);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    box-shadow var(--ui-motion-default) var(--ui-ease-out);
}

.ui-tabs-trigger:hover:not(:disabled) {
  color: var(--ui-text-1);
}

/* ── line 档：下划线指示 accent、选中字重提升 ─────────────── */
/* 指示条厚度走 --ui-indicator-thickness token（paper.css）；负号在 calc 内取反 */
.ui-tabs-trigger--line {
  box-shadow: inset 0 calc(var(--ui-indicator-thickness) * -1) 0 0 transparent;
}

.ui-tabs-trigger--line.ui-tabs-trigger--active {
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
  box-shadow: inset 0 calc(var(--ui-indicator-thickness) * -1) 0 0 var(--ui-accent);
}

/* pill 档：预留（本期仅实现 line；传入 pill 不产生下划线指示） */

/* ── 状态：disabled ──────────────────────────────────────── */
.ui-tabs-trigger:disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}
</style>
