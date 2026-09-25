/**
 * avatar/ —— Avatar 的公共类型（Props）。与 Avatar.meta.ts 的 api 字段保持一致。
 */

/** 尺寸档位：sm 24px / md 32px / lg 40px（字号档随尺寸映射）。 */
export type AvatarSize = 'sm' | 'md' | 'lg'

/** Avatar 的 Props。 */
export interface AvatarProps {
  /** 图片地址：提供且未加载失败时渲染 <img>；缺省、空串或加载失败时回退首字母。 */
  src?: string
  /** 图片替代文本（必填）：随 <img alt> 输出；回退首字母时作为根元素 role="img" 的 aria-label。 */
  alt: string
  /** 用户/主体名称：未显式给 initials 时按此推导首字母回退。 */
  name?: string
  /** 显式指定回退首字母，优先于由 name 推导。 */
  initials?: string
  /** 尺寸档位，默认 'md'。 */
  size?: AvatarSize
}
