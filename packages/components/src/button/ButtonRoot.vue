<script setup lang="ts">
/**
 * ButtonRoot —— 无样式交互根：只承载交互与 aria 契约（点击网关、键盘激活、
 * loading/disabled 语义、原生 button），不带任何视觉样式与 ui- 视觉类；
 * 视觉由上层（Button.vue 或使用方）通过 class/样式叠加。
 */
import { ref } from 'vue'
import { BUTTON_NATIVE_TYPE_DEFAULT } from './Button.constants'
import { useButton } from './useButton'
import type { ButtonRootEmits, ButtonRootExpose, ButtonRootProps, ButtonRootSlots } from './Button.types'

const props = withDefaults(defineProps<ButtonRootProps>(), {
  type: BUTTON_NATIVE_TYPE_DEFAULT,
  loading: false,
  disabled: false,
})
const emit = defineEmits<ButtonRootEmits>()
defineSlots<ButtonRootSlots>()

const rootEl = ref<HTMLButtonElement | null>(null)

const { ariaAttrs, guardClick, onKeydown } = useButton({
  loading: () => props.loading,
  disabled: () => props.disabled,
  element: () => rootEl.value,
})

function handleClick(event: MouseEvent): void {
  if (guardClick(event)) emit('click', event)
}

function focus(options?: FocusOptions): void {
  rootEl.value?.focus(options)
}

function blur(): void {
  rootEl.value?.blur()
}

defineExpose<ButtonRootExpose>({ focus, blur })
</script>

<template>
  <button
    ref="rootEl"
    :type="type"
    :disabled="disabled"
    v-bind="ariaAttrs"
    @click="handleClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
