/**
 * artifact/ —— 逻辑常量收口（类型名、可访问名、行为定时器；
 * 不是视觉值，视觉只走 --ui-* token）。
 */
import type { ArtifactType } from './Artifact.types'

/** type 全集（与 Artifact.types.ts 的 ArtifactType 一一对应）。 */
export const ARTIFACT_TYPES = ['code', 'markdown'] as const

/** 默认 type。 */
export const ARTIFACT_TYPE_DEFAULT: ArtifactType = 'code'

/** type 的中文显示名（语言徽标在未提供 language 时的回落文本）。 */
export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  code: '代码',
  markdown: '文档',
}

/** 复制按钮的可访问名（按产物类型区分）。 */
export const ARTIFACT_COPY_LABELS: Record<ArtifactType, string> = {
  code: '复制代码',
  markdown: '复制文档',
}

/** 已复制瞬时态的可访问名（aria-label 短暂替换 + 图标切换，作为复制反馈）。 */
export const ARTIFACT_COPIED_LABEL = '已复制到剪贴板'

/** 关闭按钮的可访问名。 */
export const ARTIFACT_CLOSE_LABEL = '关闭'

/** 默认遮罩点击关闭。 */
export const ARTIFACT_CLOSE_ON_SCRIM_DEFAULT = true as const

/**
 * 已复制态复位延时（毫秒）。行为定时器而非动效时长——
 * 动效时长一律走 --ui-motion-* token，此值只控制反馈态持续多久。
 */
export const ARTIFACT_COPIED_RESET_DELAY_MS = 2000
