<script setup lang="ts">
/**
 * FormField —— 表单字段容器：label 关联 / required 标记 / help 与错误文案。
 *
 * - 控件 id 基于 Vue useId + 固定前缀生成（SSR 稳定且各字段唯一），
 *   label[for] 与 controlAttrs.id 关联。
 * - 默认插槽作用域 { id, invalid, controlAttrs }：controlAttrs 可直接
 *   v-bind 到控件（Input / Textarea / Select / 自定义），完成
 *   aria-invalid / aria-describedby / aria-required 落位。
 * - 错误来源：error prop 优先，其次经 FORM_CONTEXT_KEY 注入的 Form 校验错误；
 *   无 Form 时独立展示 error prop。
 * - 错误文案 danger 色；出现错误时 help 让位（aria-describedby 指向当前可见描述）。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, inject, useId } from 'vue'
import { FORM_CONTEXT_KEY } from './Form.constants'
import { FORM_FIELD_REQUIRED_MARK } from './FormField.constants'
import type {
  FormControlAttrs,
  FormFieldProps,
  FormFieldSlotScope,
  FormFieldSlots,
} from './FormField.types'

const props = withDefaults(defineProps<FormFieldProps>(), {
  label: undefined,
  required: false,
  error: undefined,
  help: undefined,
})
defineSlots<FormFieldSlots>()

// Form 上下文：注入不到（独立使用）时仅展示自身 error prop。
const form = inject(FORM_CONTEXT_KEY, undefined)

/** 控件 id：固定前缀 + useId（SSR 稳定，同一应用内各字段唯一）。 */
const controlId = `ui-form-field-${useId()}`
const errorId = `${controlId}-error`
const helpId = `${controlId}-help`

/** 生效错误文案：error prop 优先，其次 Form 注入的校验错误；空串视为无错误。 */
const errorText = computed(
  () => props.error || form?.errors.value[props.name] || '',
)
const invalid = computed(() => errorText.value !== '')

/** aria-describedby 指向：错误文案优先，无错误时指向 help（均无则不出现）。 */
const describedBy = computed<string | undefined>(() => {
  if (invalid.value) return errorId
  if (props.help) return helpId
  return undefined
})

/** 可直接 v-bind 到控件上的属性集合（插槽作用域透出）。 */
const controlAttrs = computed<FormControlAttrs>(() => ({
  id: controlId,
  ...(invalid.value ? { 'aria-invalid': 'true' as const } : {}),
  ...(describedBy.value !== undefined ? { 'aria-describedby': describedBy.value } : {}),
  ...(props.required ? { 'aria-required': 'true' as const } : {}),
}))

const slotScope = computed<FormFieldSlotScope>(() => ({
  id: controlId,
  invalid: invalid.value,
  controlAttrs: controlAttrs.value,
}))

const classes = computed(() => [
  'ui-form-field',
  { 'ui-form-field--error': invalid.value },
])
</script>

<template>
  <div :class="classes">
    <label v-if="label" class="ui-form-field__label" :for="controlId">
      {{ label }}<span
        v-if="required"
        class="ui-form-field__required"
        aria-hidden="true"
      >{{ FORM_FIELD_REQUIRED_MARK }}</span>
    </label>
    <div class="ui-form-field__control">
      <slot v-bind="slotScope" />
    </div>
    <p v-if="invalid" :id="errorId" class="ui-form-field__error">
      <slot name="error" :error="errorText">{{ errorText }}</slot>
    </p>
    <p v-else-if="help" :id="helpId" class="ui-form-field__help">{{ help }}</p>
  </div>
</template>

<style scoped>
/* ── 字段容器：纵向排布；控件与描述文案间 4px ────────────── */
.ui-form-field {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ui-space-1);
}

/* ── label：与控件 id 关联（label[for]），label→控件合计 8px ── */
.ui-form-field__label {
  margin-bottom: var(--ui-space-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
}

/* ── required 标记：纯视觉（aria-hidden），danger 色 ─────── */
.ui-form-field__required {
  margin-left: var(--ui-space-1);
  color: var(--ui-danger);
}

/* ── 控件槽位：块级占位（控件自身决定宽度表现） ──────────── */
.ui-form-field__control {
  display: block;
}

/* ── 错误 / 帮助文案：错误 danger 色、帮助 text-3；出现错误时 help 让位 ── */
.ui-form-field__error,
.ui-form-field__help {
  margin: 0;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.ui-form-field__error {
  color: var(--ui-danger);
}

.ui-form-field__help {
  color: var(--ui-text-3);
}
</style>
