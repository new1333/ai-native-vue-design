<script setup lang="ts">
/**
 * Tabs —— 页签容器：受控/非受控激活值（v-model:value / defaultValue）+ variant 档位，
 * 经 provide 向 TabsList/TabsTrigger/TabsContent 提供共享上下文（useTabsController）。
 * 一切视觉消费 var(--ui-*) token（paper.css）。
 */
import { provide, useId } from 'vue'
import { TABS_INJECTION_KEY, TABS_VARIANT_DEFAULT } from './Tabs.constants'
import { useTabsController } from './useTabs'
import type { TabsEmits, TabsProps, TabsSlots } from './Tabs.types'

const props = withDefaults(defineProps<TabsProps>(), {
  variant: TABS_VARIANT_DEFAULT,
})
const emit = defineEmits<TabsEmits>()
defineSlots<TabsSlots>()

const uid = useId()

const controller = useTabsController({
  uid,
  value: () => props.value,
  defaultValue: () => props.defaultValue,
  variant: () => props.variant,
  emit: (value) => emit('update:value', value),
})

provide(TABS_INJECTION_KEY, controller)
</script>

<template>
  <div :class="['ui-tabs', `ui-tabs--${props.variant}`]">
    <slot />
  </div>
</template>

<style scoped>
/* 根容器：仅结构与纵向节奏，无自身装饰（一切数值走 token）。 */
.ui-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}
</style>
