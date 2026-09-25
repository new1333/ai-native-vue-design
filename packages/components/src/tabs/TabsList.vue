<script setup lang="ts">
/**
 * TabsList —— role=tablist 容器：承载键盘导航契约
 * （←→↑↓ 循环移动、Home/End 直达首末，移动即激活；见 useTabs）。
 */
import { computed, inject } from 'vue'
import { TABS_INJECTION_KEY, TABS_VARIANT_DEFAULT } from './Tabs.constants'
import { createTabsKeydownHandler } from './useTabs'
import type { TabsListSlots } from './Tabs.types'

defineSlots<TabsListSlots>()

const controller = inject(TABS_INJECTION_KEY, null)
if (controller == null) {
  console.warn('[ui-tabs] TabsList 应位于 <Tabs> 内使用，否则键盘导航与状态共享不生效')
}

const onKeydown = controller == null ? undefined : createTabsKeydownHandler(controller)

const classes = computed(() => [
  'ui-tabs-list',
  `ui-tabs-list--${controller?.variant.value ?? TABS_VARIANT_DEFAULT}`,
])
</script>

<template>
  <div :class="classes" role="tablist" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style scoped>
/* tablist 行：flex 排列；trigger 拉伸对齐基线（下划线指示贴住列表底线）。 */
.ui-tabs-list {
  display: flex;
  align-items: stretch;
  gap: var(--ui-space-4);
}

/* line 档：底部基线。1px 为结构性细线（无 --ui-border-width token，需求已在结果中提出）。 */
.ui-tabs-list--line {
  border-bottom: 1px solid var(--ui-border);
}
</style>
