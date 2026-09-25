<script setup lang="ts">
/**
 * ButtonGroup —— 按钮连排容器：组内共享 size（provide/inject），
 * 并处理连排首尾圆角（中间按钮方角、首尾保留外沿圆角）。
 */
import { computed, provide } from 'vue'
import { BUTTON_GROUP_SIZE_KEY } from './Button.constants'
import type { ButtonGroupProps, ButtonGroupSlots } from './ButtonGroup.types'

const props = defineProps<ButtonGroupProps>()
defineSlots<ButtonGroupSlots>()

provide(
  BUTTON_GROUP_SIZE_KEY,
  computed(() => props.size),
)
</script>

<template>
  <div class="ui-button-group" role="group">
    <slot />
  </div>
</template>

<style scoped>
.ui-button-group {
  display: inline-flex;
  align-items: stretch;
}

/* 连排：中间方角，首尾保留外沿圆角（0 为中性零值，无 token） */
.ui-button-group > :deep(.ui-button) {
  border-radius: 0;
}

.ui-button-group > :deep(.ui-button:first-child) {
  border-top-left-radius: var(--ui-button-radius);
  border-bottom-left-radius: var(--ui-button-radius);
}

.ui-button-group > :deep(.ui-button:last-child) {
  border-top-right-radius: var(--ui-button-radius);
  border-bottom-right-radius: var(--ui-button-radius);
}
</style>
