import { token } from './token'

/**
 * Semantic 层：语义 token，值一律为对 primitive 原子档位的 `var(--ui-*)` 引用。
 *
 * Paper Profile 的具体视觉值落在本层（设计文档 §6.1）：
 * 组件只允许消费语义/组件层变量，不直接消费原始色板。
 */
const bg = token('--ui-bg', 'var(--ui-color-paper)')

const surface = {
  default: token('--ui-surface', 'var(--ui-color-paper-raised)'),
  muted: token('--ui-surface-muted', 'var(--ui-color-sand)'),
}

const border = {
  default: token('--ui-border', 'var(--ui-color-line)'),
  strong: token('--ui-border-strong', 'var(--ui-color-line-strong)'),
}

const text = {
  primary: token('--ui-text-1', 'var(--ui-color-ink-900)'),
  secondary: token('--ui-text-2', 'var(--ui-color-ink-600)'),
  tertiary: token('--ui-text-3', 'var(--ui-color-ink-400)'),
}

const accent = {
  default: token('--ui-accent', 'var(--ui-color-pine-600)'),
  hover: token('--ui-accent-hover', 'var(--ui-color-pine-700)'),
  soft: token('--ui-accent-soft', 'var(--ui-color-pine-50)'),
  on: token('--ui-on-accent', 'var(--ui-color-white)'),
}

const state = {
  success: token('--ui-success', 'var(--ui-color-moss-600)'),
  successSoft: token('--ui-success-soft', 'var(--ui-color-moss-50)'),
  warning: token('--ui-warning', 'var(--ui-color-amber-600)'),
  warningSoft: token('--ui-warning-soft', 'var(--ui-color-amber-50)'),
  danger: token('--ui-danger', 'var(--ui-color-clay-600)'),
  dangerSoft: token('--ui-danger-soft', 'var(--ui-color-clay-50)'),
  info: token('--ui-info', 'var(--ui-color-slate-500)'),
  infoSoft: token('--ui-info-soft', 'var(--ui-color-slate-50)'),
}

const overlay = {
  tooltip: token('--ui-tooltip', 'var(--ui-color-ink-950)'),
  scrim: token('--ui-scrim', 'var(--ui-color-scrim)'),
}

export const semantic = { bg, surface, border, text, accent, state, overlay } as const

export type Semantic = typeof semantic
