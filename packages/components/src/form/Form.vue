<script setup lang="ts">
/**
 * Form —— 表单容器：原生 form 封装 + 校验网关 + 字段错误分发。
 *
 * - 校验：rules 按字段名映射校验函数数组（返回 true / 错误文案 / Promise）；
 *   字段内按序取首个失败文案，字段间并行；全量通过才 emit submit。
 * - pending（受控 prop 或异步校验进行中）一律拦截提交。
 * - 默认插槽作用域 { valid, pending, errors }。
 * - 经 FORM_CONTEXT_KEY 向 FormField 提供响应式 errors（provide/inject 契约）。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 *
 * 原生 form 置 novalidate：校验由 rules 承担，关闭原生约束校验的双轨拦截与气泡。
 * （说明性注释只写在 script 文档——模板内注释会进入渲染输出，导致多根碎片。）
 */
import { computed, provide, readonly, ref } from 'vue'
import { FORM_CONTEXT_KEY } from './Form.constants'
import type {
  FormEmits,
  FormErrors,
  FormExpose,
  FormProps,
  FormSlotScope,
  FormSlots,
} from './Form.types'

const props = withDefaults(defineProps<FormProps>(), {
  rules: () => ({}),
  pending: false,
})
const emit = defineEmits<FormEmits>()
defineSlots<FormSlots>()

const errors = ref<FormErrors>({})
const validating = ref(false)

// provide/inject 契约：FormField 按 name 读取字段级校验错误。
provide(FORM_CONTEXT_KEY, { errors: readonly(errors) })

/** 当前是否有任何校验错误。 */
const valid = computed(() => Object.keys(errors.value).length === 0)

/** 表单忙：异步校验进行中或受控 pending；此间提交一律被拦截。 */
const pending = computed(() => props.pending || validating.value)

const slotScope = computed<FormSlotScope>(() => ({
  valid: valid.value,
  pending: pending.value,
  errors: { ...errors.value },
}))

/** 执行单字段的校验函数数组：按序执行，返回首个失败文案（全部通过为 undefined）。 */
async function runFieldValidators(
  field: string,
): Promise<string | undefined> {
  for (const validator of props.rules[field] ?? []) {
    const result = await validator(props.model[field])
    if (result !== true) return result
  }
  return undefined
}

/** 全量校验：更新 errors 并返回错误集合（空对象即全部通过）。 */
async function validate(): Promise<FormErrors> {
  validating.value = true
  try {
    const next: FormErrors = {}
    await Promise.all(
      Object.keys(props.rules).map(async (field) => {
        const message = await runFieldValidators(field)
        if (message !== undefined) next[field] = message
      }),
    )
    errors.value = next
    return next
  } finally {
    validating.value = false
  }
}

/** 清空全部校验错误（不改 model 值）。 */
function resetValidation(): void {
  errors.value = {}
}

defineExpose<FormExpose>({ validate, resetValidation })

/** 原生 submit 路径：一律 preventDefault；pending 拦截；全量校验通过才 emit submit。 */
async function onSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault()
  if (pending.value) return
  const result = await validate()
  if (Object.keys(result).length === 0) emit('submit', event)
}
</script>

<template>
  <form class="ui-form" novalidate @submit="onSubmit">
    <slot v-bind="slotScope" />
  </form>
</template>

<style scoped>
/* ── 容器：纵向排布，字段间 24px（设计文档 Spacing：表单字段间 24px）── */
.ui-form {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
  font-family: var(--ui-font-sans);
}
</style>
