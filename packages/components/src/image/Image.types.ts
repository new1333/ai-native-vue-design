/**
 * image/ —— Image 的公共类型（Props / Emits / Slots）。
 * 与 Image.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 图像填充档位：映射为 img 的 object-fit。 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

/** 图片加载状态机：loading（加载中，含 lazy 未进入视口）→ loaded / error。 */
export type ImageStatus = 'loading' | 'loaded' | 'error'

/** Image 的 Props。 */
export interface ImageProps {
  /** 图片地址（必填）。src 变化时状态机重置为 loading；空字符串视为加载失败（error 态）。 */
  src: string
  /** 替代文本；缺省为空字符串（装饰性图片语义）。内容图必须显式传入。 */
  alt?: string
  /** 填充档位（object-fit），默认 'fill'；仅在宽高被使用方约束（成框）时可见效果。 */
  fit?: ImageFit
  /** 懒加载：进入视口（IntersectionObserver，仅 mounted 创建）前不请求、不渲染 img。初始值生效。 */
  lazy?: boolean
  /** 大图预览：加载成功后点击图片打开全屏浮层（Esc / 遮罩 / 关闭按钮关闭，焦点回归触发器）。 */
  preview?: boolean
  /** 加载失败回退图地址：主源失败后自动尝试；fallback 自身失败则进入 error 态。 */
  fallback?: string
}

/** Image 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ImageEmits {
  /** 实际展示的图片（含 fallback 回落）加载成功时触发，payload 为原生 load 事件。 */
  load: [event: Event]
  /** 任一次实际加载尝试失败时触发（主源失败、fallback 自身失败均触发），payload 为原生 error 事件。 */
  error: [event: Event]
}

/**
 * Image 的 Slots（全部可选）。
 * placeholder 覆盖加载占位（默认 muted 面 + aria-hidden 图标）；error 覆盖失败视图（默认 danger 面 + 图标 + 文案）。
 */
export interface ImageSlots {
  /** 加载中占位（含 lazy 未进入视口阶段）；默认渲染 muted 面 + 图片图标。 */
  placeholder?: () => VNode[]
  /** 加载失败视图；默认渲染 danger 面 + 破图图标 + 「加载失败」文案。 */
  error?: () => VNode[]
}
