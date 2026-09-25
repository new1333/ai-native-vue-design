// form/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Form } from './Form.vue'
export { default as FormField } from './FormField.vue'

export * from './Form.types'
export * from './FormField.types'
export * from './Form.constants'
export * from './FormField.constants'

export { meta as formMeta } from './Form.meta'
export { meta as formFieldMeta } from './FormField.meta'

import type Form from './Form.vue'
import type FormField from './FormField.vue'

/** Form 组件实例类型（含 validate / resetValidation 暴露）。 */
export type FormInstance = InstanceType<typeof Form>

/** FormField 组件实例类型。 */
export type FormFieldInstance = InstanceType<typeof FormField>
