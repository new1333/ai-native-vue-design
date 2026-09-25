import { token } from './token'

/**
 * Component 层：组件级别名最小集（button / input）。
 *
 * 值一律引用既有 token（primitive / semantic），不引入新的视觉值；
 * 组件需要新档位时先在 primitive / semantic 层补 token，再在此处别名。
 */
const button = {
  radius: token('--ui-button-radius', 'var(--ui-radius-sm)'),
  primaryBg: token('--ui-button-primary-bg', 'var(--ui-accent)'),
  primaryFg: token('--ui-button-primary-fg', 'var(--ui-on-accent)'),
  fontWeight: token('--ui-button-font-weight', 'var(--ui-font-weight-medium)'),
}

const input = {
  radius: token('--ui-input-radius', 'var(--ui-radius-sm)'),
  bg: token('--ui-input-bg', 'var(--ui-surface)'),
  borderFocus: token('--ui-input-border-focus', 'var(--ui-accent)'),
}

export const component = { button, input } as const

export type ComponentTokens = typeof component
