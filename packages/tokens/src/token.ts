/**
 * @ui/tokens —— token 基础类型与定义工具。
 *
 * 每个 token 由两部分组成：
 * - `name`：对应的 CSS 自定义属性名（`--ui-*` 命名空间）；
 * - `value`：解析值——primitive 层为原子裸值（token 的家），
 *   semantic / component 层一律为 `var(--ui-*)` 引用。
 */

/** 单个设计 token；泛型保留字面量类型，便于对变量名做精确约束。 */
export interface Token<TName extends string = string, TValue extends string = string> {
  readonly name: TName
  readonly value: TValue
}

/** 同类 token 的只读集合。 */
export type TokenGroup = Readonly<Record<string, Token>>

/** 定义一个 token（保留 name / value 的字面量类型）。 */
export const token = <TName extends string, TValue extends string>(
  name: TName,
  value: TValue,
): Token<TName, TValue> => ({ name, value })
