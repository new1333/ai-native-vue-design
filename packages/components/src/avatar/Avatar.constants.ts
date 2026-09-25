/**
 * avatar/ —— 逻辑常量与纯函数收口（档位全集、默认值、首字母推导；不是视觉值，
 * 视觉只走 --ui-* token）。
 */
import type { AvatarSize } from './Avatar.types'

/** 尺寸档位全集（与 Avatar.types.ts 的 AvatarSize 一一对应）。 */
export const AVATAR_SIZES = ['sm', 'md', 'lg'] as const satisfies readonly AvatarSize[]

/** 默认尺寸档位。 */
export const AVATAR_SIZE_DEFAULT = 'md' as const

/**
 * 由 name 推导回退首字母：取首个与末个空白分隔词的首字符，合并后大写；
 * 单词（含中文等无空格名称）只取首字符；无有效字符时返回空串。
 * 示例：'Zhang San' → 'ZS'，'纸面' → '纸'，'   ' → ''。
 */
export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0)
  const first = parts[0]?.charAt(0) ?? ''
  if (parts.length <= 1) {
    return first.toUpperCase()
  }
  const last = parts[parts.length - 1]?.charAt(0) ?? ''
  return (first + last).toUpperCase()
}
