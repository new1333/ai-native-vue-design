/**
 * upload/ —— 逻辑常量收口（状态全集、默认文案、aria 标签、uid 前缀）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { UploadStatus } from './Upload.types'

/** 上传状态全集（与 Upload.types.ts 的 UploadStatus 一一对应）。 */
export const UPLOAD_STATUSES = ['uploading', 'success', 'error'] as const satisfies readonly UploadStatus[]

/** 组件生成的列表项 uid 前缀：形如 `ui-upload-file-1`。 */
export const UPLOAD_UID_PREFIX = 'ui-upload-file'

/** 触发器默认文案（点击模式）。 */
export const UPLOAD_TRIGGER_LABEL = '选择文件'

/** 触发器默认文案（拖拽模式）。 */
export const UPLOAD_TRIGGER_DRAG_LABEL = '点击或拖拽文件到此处'

/** 状态展示文案（列表项真实文本，屏幕阅读器可读）。 */
export const UPLOAD_STATUS_LABELS: Record<UploadStatus, string> = {
  uploading: '上传中',
  success: '上传成功',
  error: '上传失败',
}

/** 移除按钮 aria-label 前缀：完整为 `移除 {name}`。 */
export const UPLOAD_REMOVE_ARIA_PREFIX = '移除'

/** 重试按钮 aria-label 前缀：完整为 `重试 {name}`。 */
export const UPLOAD_RETRY_ARIA_PREFIX = '重试'

/** 进度条 aria-label 后缀：完整为 `{name} 上传进度`。 */
export const UPLOAD_PROGRESS_ARIA_SUFFIX = '上传进度'
