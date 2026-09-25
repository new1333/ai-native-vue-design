/**
 * icon-button/ —— 逻辑常量收口（档位名、提示文案；不是视觉值，视觉只走 --ui-* token）。
 */

/** variant 全集（与 IconButton.types.ts 的 IconButtonVariant 一一对应）。 */
export const ICON_BUTTON_VARIANTS = ['ghost', 'outline', 'primary'] as const

/** size 全集（与 IconButton.types.ts 的 IconButtonSize 一一对应；图标渲染尺寸 sm=16 / md=20 / lg=24）。 */
export const ICON_BUTTON_SIZES = ['sm', 'md', 'lg'] as const

/** 默认 variant：图标按钮多居工具栏/卡片内，ghost（无底安静）为默认档。 */
export const ICON_BUTTON_VARIANT_DEFAULT = 'ghost' as const

/** 默认 size：图标 20px（跟随 Button 的 md 档）。 */
export const ICON_BUTTON_SIZE_DEFAULT = 'md' as const

/** 开发环境提示文案（aria-label 与 aria-labelledby 皆缺时 console.warn）。 */
export const ICON_BUTTON_MISSING_LABEL_WARNING =
  '[ui-icon-button] 缺少可访问名称：请提供 aria-label 或 aria-labelledby' +
  '（IconButton 仅含图标、无可读文本，两者皆缺时对读屏用户完全匿名）'
