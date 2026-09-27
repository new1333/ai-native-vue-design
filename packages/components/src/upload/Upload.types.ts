/**
 * upload/ —— Upload 的公共类型（Props / Emits / Slots / UploadFile 模型）。
 * 与 Upload.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 单个文件条目的上传状态。 */
export type UploadStatus = 'uploading' | 'success' | 'error'

/** 受控文件列表项（v-model 的元素类型）。 */
export interface UploadFile {
  /** 唯一标识：组件选择的路径按 `ui-upload-file-N` 生成；使用方预置列表时需自行保证唯一。 */
  uid: string
  /** 文件名（展示用）。 */
  name: string
  /** 文件大小（字节）；缺省时列表不展示尺寸。 */
  size?: number
  /** 上传状态：上传中 / 成功 / 失败。 */
  status: UploadStatus
  /** 上传进度 0-100；仅 uploading 态渲染进度条（复用 progress 视觉配方）。 */
  percent: number
  /** 原始 File 对象：组件选择路径必带；失败重试依赖它重跑 beforeUpload。 */
  raw?: File
  /** 失败原因文案（status='error' 时展示在条目下方）。 */
  error?: string
}

/**
 * beforeUpload —— 上传闸门 / 上传任务（三态语义）：
 * - 返回 false（或 Promise resolve false）：该文件不入列（resolve false 时会移除
 *   已占位的 uploading 项，不算失败）；
 * - 返回 true / void：无异步任务，直接以 success 入列；
 * - 返回 Promise：该 Promise 即上传任务本身——文件先以 uploading/0 入列，
 *   resolve（非 false）落定成功（percent→100），reject 落定失败（可重试）。
 * 同步抛出按失败处理：以 error 入列并发出 error 事件。
 */
export type UploadBeforeUpload = (
  file: File,
  files: File[],
) => boolean | void | Promise<boolean | void>

/** Upload 的 Props。 */
export interface UploadProps {
  /** v-model 绑定的受控文件列表（UploadFile[]）；一切变化由组件全量发出、使用方回写。 */
  modelValue?: UploadFile[]
  /** 原生 accept 透传（点击选择）；拖拽路径用同一规则过滤（.ext / type/* / type/sub）。 */
  accept?: string
  /** 多选：点击选择允许多文件、拖拽多文件全部入列；false 时只取第一个。 */
  multiple?: boolean
  /** 拖拽模式：触发器变为虚线拖放区并接管 drop。 */
  drag?: boolean
  /** 数量上限：一次选择的文件会使列表超出上限时整批拒绝并发出 exceed。 */
  maxCount?: number
  /** 禁用：触发器与列表内按钮原生 disabled，选择/拖拽/移除/重试全部拦截。 */
  disabled?: boolean
  /** 上传闸门 / 上传任务（见 UploadBeforeUpload）。 */
  beforeUpload?: UploadBeforeUpload
}

/** Upload 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface UploadEmits {
  /** v-model 更新：列表任何变化（新增/状态落定/移除）都全量发出。 */
  'update:modelValue': [files: UploadFile[]]
  /** 列表变化通知（与 update:modelValue 同载荷、同批次发出）。 */
  change: [files: UploadFile[]]
  /** 列表项被移除后发出（通知性质，不可取消）。 */
  remove: [file: UploadFile]
  /** 一次选择的文件会使列表超出 maxCount 时，整批拒绝后发出。 */
  exceed: [files: File[], fileList: UploadFile[]]
  /** 上传任务 reject（或 beforeUpload 同步抛出）时发出。 */
  error: [error: unknown, file: UploadFile]
}

/** list 插槽作用域。 */
export interface UploadListScope {
  /** 当前列表（受控值）。 */
  files: UploadFile[]
}

/** Upload 的 Slots。 */
export interface UploadSlots {
  /** 自定义触发器内容（默认：上传图标 + 文案）；仍渲染在原生 button 内。 */
  trigger?: () => VNode[]
  /** 自定义文件列表（默认 ul/li 渲染；作用域暴露 files）。 */
  list?: (scope: UploadListScope) => VNode[]
  /** 列表为空时的占位内容（默认不渲染）。 */
  empty?: () => VNode[]
}
