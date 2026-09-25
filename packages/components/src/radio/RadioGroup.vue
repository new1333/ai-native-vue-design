<script setup lang="ts">
/**
 * RadioGroup —— 单选组容器：受控 modelValue + 必填 name + 整组 disabled，
 * 经 provide/inject 下发给组内 Radio（原生 input[type=radio] 语义）。
 *
 * - role="radiogroup" 提供分组语义；attrs（aria-label 等）落根容器。
 * - name 必填：同组 radio 的原生互斥与方向键导航均由浏览器按 name 实现，
 *   组件不做任何 keydown 拦截（键盘行为 100% 原生）。
 * - 选中路径：Radio 原生 change → context.select(value) → 这里发出 update:modelValue。
 */
import { computed, provide } from 'vue'
import { RADIO_GROUP_CONTEXT_KEY } from './Radio.constants'
import type {
  RadioGroupContext,
  RadioGroupEmits,
  RadioGroupProps,
  RadioGroupSlots,
  RadioValue,
} from './Radio.types'

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  disabled: false,
})
const emit = defineEmits<RadioGroupEmits>()
defineSlots<RadioGroupSlots>()

provide(RADIO_GROUP_CONTEXT_KEY, {
  name: computed(() => props.name),
  modelValue: computed(() => props.modelValue),
  disabled: computed(() => props.disabled),
  select: (value: RadioValue): void => {
    emit('update:modelValue', value)
  },
} satisfies RadioGroupContext)
</script>

<template>
  <div class="ui-radio-group" role="radiogroup">
    <slot />
  </div>
</template>

<style scoped>
/* ── 组容器：纵向排布，项间距走 token；分组语义由 role="radiogroup" 提供 ── */
.ui-radio-group {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-sans);
}
</style>
