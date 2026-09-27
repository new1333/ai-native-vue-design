<script setup lang="ts">
/**
 * ToggleGroup —— 分段控制器 / 按钮组容器：受控 modelValue（单值或数组），
 * 经 provide/inject 下发给组内 ToggleItem（原生 button + role 语义）。
 *
 * - 分组语义随 type 而定：single → role="radiogroup"（radio 项，aria-checked，不反选）；
 *   multiple → role="group"（切换 button 项，aria-pressed，点击即增删数组）。
 * - roving tabindex：项在 setup 期注册（同步、SSR 亦生效），组维护注册表与
 *   roving-active；Tab 只落在活动项上，方向键 / Home / End 在可用项间移动焦点。
 * - items prop：声明式渲染内部 ToggleItem；item 作用域插槽可定制每项内容
 *   （未提供时回退 option.label）。默认插槽的 ToggleItem 手动组合与 items 可并存。
 * - 选中路径：ToggleItem 点击 → context.select(value) → 发出 update:modelValue 与 change。
 * - attrs（aria-label 等）落组容器（role 元素），不拦截。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, provide, ref } from 'vue'
import { TOGGLE_GROUP_CONTEXT_KEY } from './ToggleGroup.constants'
import ToggleItem from './ToggleItem.vue'
import type {
  ToggleFocusOffset,
  ToggleGroupContext,
  ToggleGroupEmits,
  ToggleGroupExpose,
  ToggleGroupProps,
  ToggleGroupSlots,
  ToggleItemRecord,
  ToggleValue,
} from './ToggleGroup.types'

const props = withDefaults(defineProps<ToggleGroupProps>(), {
  modelValue: undefined,
  type: 'single',
  variant: 'segmented',
  items: undefined,
  disabled: false,
})
const emit = defineEmits<ToggleGroupEmits>()
defineSlots<ToggleGroupSlots>()

/* ── 受控选中集合：single 归一为 0/1 个元素，multiple 归一为数组 ────── */
const selectedValues = computed<ToggleValue[]>(() => {
  const value = props.modelValue
  if (props.type === 'multiple') return Array.isArray(value) ? value : []
  return value !== undefined && !Array.isArray(value) ? [value] : []
})

function isSelected(value: ToggleValue): boolean {
  return selectedValues.value.includes(value)
}

function select(value: ToggleValue): void {
  if (props.disabled) return
  if (props.type === 'multiple') {
    const current = Array.isArray(props.modelValue) ? props.modelValue : []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    emit('update:modelValue', next)
    emit('change', next)
    return
  }
  // single：radio 语义不反选，重复点击不重复发
  if (props.modelValue === value) return
  emit('update:modelValue', value)
  emit('change', value)
}

/* ── roving tabindex 注册表：注册发生在项 setup 期（同步、SSR 亦生效） ── */
const registry = ref<ToggleItemRecord[]>([])
const activeId = ref<number | undefined>(undefined)
let uid = 0

function registerItem(record: Omit<ToggleItemRecord, 'id'>): number {
  const id = ++uid
  registry.value = [...registry.value, { ...record, id }]
  return id
}

function unregisterItem(id: number): void {
  registry.value = registry.value.filter((record) => record.id !== id)
  if (activeId.value === id) activeId.value = undefined
}

/** 首个可用项（依赖各注册项的实时禁用闭包）；全部禁用时组不可 Tab 进入。 */
const firstEnabledId = computed(() => registry.value.find((record) => !record.disabled())?.id)

function setActive(id: number): void {
  activeId.value = id
}

function resignActive(id: number): void {
  if (activeId.value === id) activeId.value = undefined
}

function moveFocus(id: number, offset: ToggleFocusOffset): void {
  const enabled = registry.value.filter((record) => !record.disabled())
  if (enabled.length === 0) return
  let target: ToggleItemRecord | undefined
  if (offset === 'first') {
    target = enabled[0]
  } else if (offset === 'last') {
    target = enabled[enabled.length - 1]
  } else {
    const index = enabled.findIndex((record) => record.id === id)
    const base = index === -1 ? 0 : index
    target = enabled[(base + offset + enabled.length) % enabled.length]
  }
  if (!target) return
  activeId.value = target.id
  target.el()?.focus() // 仅客户端键盘路径可达；SSR 期 el 为 null 不会走到这里
}

provide(TOGGLE_GROUP_CONTEXT_KEY, {
  type: computed(() => props.type),
  variant: computed(() => props.variant),
  disabled: computed(() => props.disabled),
  selectedValues,
  isSelected,
  select,
  registerItem,
  unregisterItem,
  activeId,
  firstEnabledId,
  setActive,
  resignActive,
  moveFocus,
} satisfies ToggleGroupContext)

const classes = computed(() => [
  'ui-toggle-group',
  `ui-toggle-group--${props.variant}`,
  {
    'ui-toggle-group--multiple': props.type === 'multiple',
    'ui-toggle-group--disabled': props.disabled,
  },
])

const role = computed(() => (props.type === 'multiple' ? 'group' : 'radiogroup'))

/** 聚焦 roving-active 项（未定时首个可用项）；全部禁用时为空操作。 */
function focus(): void {
  const current = activeId.value !== undefined
    ? registry.value.find((record) => record.id === activeId.value)
    : registry.value.find((record) => record.id === firstEnabledId.value)
  current?.el()?.focus()
}

defineExpose<ToggleGroupExpose>({ focus })
</script>

<template>
  <div :class="classes" :role="role">
    <slot />
    <ToggleItem
      v-for="option in items"
      :key="option.value"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    >
      <slot name="item" :item="option" :selected="isSelected(option.value)">{{ option.label }}</slot>
    </ToggleItem>
  </div>
</template>

<style scoped>
/* ── 组容器：行内排布；分组语义由 role（radiogroup / group）提供 ────── */
.ui-toggle-group {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  max-inline-size: 100%;
  font-family: var(--ui-font-sans);
}

/* segmented：sand 轨道承载各项，内衬一档让 thumb「浮起」时有轨道感 */
.ui-toggle-group--segmented {
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface-muted);
}

/* outline：无轨道，各项间留一档间距的描边按钮组 */
.ui-toggle-group--outline {
  gap: var(--ui-space-1);
}
</style>
