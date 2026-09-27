/**
 * artifact/ —— Artifact 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Artifact.meta.ts 的 api 字段保持一致。
 *
 * attrs 透传契约：浮层根是「占位 div / Teleport」条件分支（fragment），
 * attrs 不自动继承，而是显式落到面板元素上——使用方可经
 * `<Artifact aria-label="…">` 为面板补齐可访问名称（header 插槽替换默认
 * 头部时，这是出具面板名称的路径）。
 */
import type { VNode } from 'vue'

/** 产物类型：代码 / 文档。 */
export type ArtifactType = 'code' | 'markdown'

/** 关闭来源：遮罩点击 / Esc 键 / 头部操作栏「关闭」按钮。 */
export type ArtifactCloseReason = 'scrim' | 'esc' | 'action'

/** copy 事件载荷：复制的渲染文本 + 产物上下文。 */
export interface ArtifactCopyPayload {
  /** 复制的文本：正文容器的渲染文本（textContent），不是源 Markdown。 */
  text: string
  /** 产物类型。 */
  type: ArtifactType
  /** 代码语言（未传时缺省）。 */
  language?: string
}

/** Artifact 的 Props。 */
export interface ArtifactProps {
  /** 受控可见性（v-model）：true 渲染画布浮层。 */
  modelValue?: boolean
  /** 标题文本；header 插槽存在时不渲染（可访问名称由使用方经 attrs 提供）。 */
  title?: string
  /** 产物类型，默认 'code'；驱动类型徽标、复制按钮可访问名与 ui-artifact--* 修饰类。 */
  type?: ArtifactType
  /** 代码语言（如 'TypeScript'）；存在时作为头部徽标文本，缺省回落到类型名。 */
  language?: string
  /** 点击遮罩是否请求关闭，默认 true。 */
  closeOnScrim?: boolean
}

/** Artifact 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ArtifactEmits {
  /** v-model 更新：一切关闭路径先发出 false，由使用方决定实际状态。 */
  'update:modelValue': [value: boolean]
  /** 请求关闭（update:modelValue false 的同时附带来源）。 */
  close: [reason: ArtifactCloseReason]
  /** 复制动作：载荷含正文渲染文本与产物上下文；组件自身已尽力写入剪贴板。 */
  copy: [payload: ArtifactCopyPayload]
}

/** Artifact 的 Slots。 */
export interface ArtifactSlots {
  /** 产物内容主体（代码块/文档内容）；复制动作读取本区域的渲染文本。 */
  default?: () => VNode[]
  /** 整体替换默认头部（标题、类型徽标与操作栏）；使用后内置复制/关闭与 aria-labelledby 不再出具，面板命名经 attrs（aria-label）提供。 */
  header?: () => VNode[]
  /** 底部动作区（如「插入到文档」「下载」）；仅在提供时渲染，缺省无底部。 */
  footer?: () => VNode[]
}

/** Artifact 对外暴露的实例方法。 */
export interface ArtifactExpose {
  /** 将焦点移入画布面板（首个可聚焦元素，否则面板自身）；仅客户端有意义。 */
  focus: () => void
}
