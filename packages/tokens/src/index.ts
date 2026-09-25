// @ui/tokens —— 设计 token 包入口。
//
// 三层 token（primitive → semantic → component）以 TS 对象 + 完整类型导出，
// 每个 token 附带其 CSS 变量名（`--ui-*`）；CSS 侧实现见 `@ui/tokens/paper.css`，
// 由使用方在应用入口一次性引入。
import { component } from './component'
import { primitive } from './primitive'
import { semantic } from './semantic'
import type { Token } from './token'

export { token } from './token'
export type { Token, TokenGroup } from './token'
export { primitive } from './primitive'
export type { Primitive } from './primitive'
export { semantic } from './semantic'
export type { Semantic } from './semantic'
export { component } from './component'
export type { ComponentTokens } from './component'

/** 本包名。 */
export const TOKENS_PACKAGE = '@ui/tokens' as const

/** 默认视觉 Profile 名。 */
export const PROFILE = 'paper' as const

/** 三层 token 聚合对象。 */
export const tokens = { primitive, semantic, component } as const

/** 三层聚合类型。 */
export type Tokens = typeof tokens

function isToken(value: unknown): value is Token {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { name?: unknown }).name === 'string' &&
    typeof (value as { value?: unknown }).value === 'string'
  )
}

/** 递归收集一个 token 树（任意层嵌套）中的全部 token。 */
export function collectTokens(node: unknown): readonly Token[] {
  const out: Token[] = []
  const walk = (current: unknown): void => {
    if (isToken(current)) {
      out.push(current)
      return
    }
    if (typeof current === 'object' && current !== null) {
      for (const child of Object.values(current as Record<string, unknown>)) walk(child)
    }
  }
  walk(node)
  return out
}

/** 全部 token（primitive + semantic + component），扁平列表。 */
export const allTokens: readonly Token[] = collectTokens(tokens)

/** `--ui-*` 变量名 → 值 的扁平映射（与 paper.css 一一对应）。 */
export const paperCssVars: Readonly<Record<string, string>> = Object.fromEntries(
  allTokens.map(({ name, value }) => [name, value]),
)
