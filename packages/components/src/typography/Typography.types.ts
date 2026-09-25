/**
 * typography/ —— Text 与 Heading 共享的公共类型。
 * 组件各自的 Props / Slots 见 Text.types.ts 与 Heading.types.ts；
 * 与 Text.meta.ts / Heading.meta.ts 的 api 字段保持一致。
 */

/** 字号档位，映射 --ui-text-* token（12/13/15/17/20/24/30px）。 */
export type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/** 字重档位，映射 --ui-font-weight-* token（400/500/600）。 */
export type TypographyWeight = 400 | 500 | 600

/**
 * 文字颜色语义档位：
 * - 'text-1' 主文字（--ui-text-1）
 * - 'text-2' 次级文字（--ui-text-2）
 * - 'text-3' 弱文字/帮助/脚注（--ui-text-3）
 * - 'muted'  'text-2' 的简写别名（同 --ui-text-2）
 */
export type TypographyColor = 'text-1' | 'text-2' | 'text-3' | 'muted'

/** Text 允许渲染的元素标签，默认 'span'。 */
export type TextAs = 'span' | 'p' | 'div'

/** Heading 允许渲染的标题层级，默认 'h2'。 */
export type HeadingAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
