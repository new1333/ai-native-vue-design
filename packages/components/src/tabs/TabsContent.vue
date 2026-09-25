<script setup lang="ts">
/**
 * TabsContent —— 面板（role=tabpanel）：仅激活时渲染（v-if），
 * aria-labelledby 指向配对 trigger 的稳定 id；tabindex=0 使空面板也可聚焦
 * （WAI-ARIA APG：tabpanel 无可聚焦元素时应自身可聚焦）。
 */
import { computed, inject } from 'vue'
import { TABS_INJECTION_KEY } from './Tabs.constants'
import type { TabsContentProps, TabsContentSlots } from './Tabs.types'

const props = defineProps<TabsContentProps>()
defineSlots<TabsContentSlots>()

const controller = inject(TABS_INJECTION_KEY, null)
if (controller == null) {
  console.warn('[ui-tabs] TabsContent 应位于 <Tabs> 内使用，否则不会渲染')
}

const active = computed(() => controller?.activeValue.value === props.value)
</script>

<template>
  <div
    v-if="active"
    :id="controller?.contentIdFor(props.value)"
    class="ui-tabs-content"
    role="tabpanel"
    :aria-labelledby="controller?.triggerIdFor(props.value)"
    tabindex="0"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 面板本体不加装饰：内容排版交给使用方；纵向间距由根容器 gap 提供。 */
.ui-tabs-content {
  line-height: var(--ui-leading-body);
}
</style>
