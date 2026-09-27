/**
 * Image 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Image.types.ts 保持一致；states 与 Image.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-image',
  version: '0.1.0',
  identity: {
    name: 'Image',
    package: '@ui/components',
    export: 'Image',
    category: 'data',
    description: '纸面图片：懒加载（IntersectionObserver）、加载占位/失败回退（fallback + error 插槽）与大图预览（dialog 浮层，Esc 关闭 + 焦点回归），状态机 loading/loaded/error。',
  },
  intent: {
    what: '内容图片展示：lazy 进入视口才请求；加载中显示占位（placeholder 插槽）、失败自动回落 fallback 或显示失败视图（error 插槽）；preview 开启后点击图片在全屏浮层放大查看。',
    when: [
      '正文/卡片/详情页中的内容图片，需要占位避免加载期布局塌陷',
      '长列表/首屏外的图片懒加载（lazy，IntersectionObserver 进入视口才请求）',
      '图片可能加载失败且需要兜底（fallback 回落图或自定义 error 视图）',
      '需要放大查看细节（preview：Esc/遮罩/关闭按钮关闭，焦点回归触发器）',
    ],
    whenNot: [
      '纯加载占位（无图可展示）用 Skeleton：Image 的 loading 态只是图片自身请求的过渡',
      '头像等固定形状裁剪用 Avatar：Image 不做形状裁剪，fit 仅在成框时控制填充方式',
      '不需要放大、回退、懒加载的极简图片场景可直接用原生 img（alt 必给）',
      '预览浮层不做多图画廊切换、不锁定页面滚动；图片编辑（裁剪/滤镜）不在职责内',
    ],
    userTask: '用户需要查看页面中的图片内容：加载期间看到占位、失败时看到回退，并能放大查看细节后返回原位',
  },
  api: {
    props: [
      { name: 'src', type: 'string', required: true, description: '图片地址（必填）。src 变化时状态机重置为 loading 重新加载；空字符串视为失败（error 态）。' },
      { name: 'alt', type: 'string', default: "''", description: '替代文本，缺省为空字符串（装饰性图片，读屏跳过）；内容图必须显式传入。同时用作预览浮层与触发器的可读名。' },
      { name: 'fit', type: "'contain' | 'cover' | 'fill' | 'none' | 'scale-down'", default: "'fill'", description: '填充档位（img 的 object-fit）；根框未被约束宽高时与原生 img 行为一致，成框（约束宽高）后控制裁剪方式。' },
      { name: 'lazy', type: 'boolean', default: 'false', description: '懒加载：进入视口（IntersectionObserver，仅 mounted 创建、首次相交即断开）前不渲染 img、不发请求；环境不支持 IO 时降级为立即加载。取初始值。' },
      { name: 'preview', type: 'boolean', default: 'false', description: '大图预览：图片包裹于原生 button 触发器（加载完成前 disabled），点击打开全屏浮层（Esc / 遮罩 / 关闭按钮关闭，Tab 圈定，焦点回归触发器）。' },
      { name: 'fallback', type: 'string', description: '加载失败回退图：主源失败自动尝试 fallback；fallback 自身失败进入 error 终态。与 src 相同时视同无回退。' },
    ],
    slots: [
      { name: 'placeholder', description: '加载中占位（含 lazy 未进入视口阶段），默认渲染 muted 面 + aria-hidden 图片图标；可放 Skeleton 等自定义占位。' },
      { name: 'error', description: '失败视图，默认渲染 danger 软面 + 破图图标 + 「加载失败」文案；可放自定义失败引导（如重试按钮）。' },
    ],
    events: [
      { name: 'load', payload: 'Event', description: '实际展示的图片（含 fallback 回落成功）加载完成时触发，payload 为原生 load 事件。' },
      { name: 'error', payload: 'Event', description: '任一次实际加载尝试失败时触发（主源失败、fallback 自身失败各触发一次），payload 为原生 error 事件。' },
    ],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      '内容图 + 预览：<Image :src="url" alt="产品图" fit="cover" preview />',
      '懒加载列表：长页面中的图片加 lazy，首屏外不请求',
      '失败兜底：<Image :src="url" :fallback="localPlaceholder" />，或 error 插槽放重试按钮',
      '加载占位组合：placeholder 插槽内放 <Skeleton variant="rect" /> 对齐版面',
    ],
    related: ['Skeleton', 'Avatar', 'Dialog', 'EmptyState'],
    preferred: [
      '内容图必须显式传 alt；纯装饰图保持 alt 缺省（空字符串）',
      '成框展示（约束宽高）时用 fit 控制裁剪；未约束时保持自然尺寸',
      '预览触发器是原生 button，键盘 Tab + Enter / Space 原生可达',
      '需要骨架风格占位时优先组合 Skeleton（placeholder 插槽），不要复刻 shimmer',
    ],
  },
  states: {
    default: 'loaded 后图片按 fit 填充根框、opacity 淡入（--ui-motion-default）；根框未约束时随图自然收缩。',
    hover: '无位移/阴影变化（Paper 静态纸面）；preview 开启时触发器光标为 zoom-in 提示可预览，预览关闭按钮 hover 提面（--ui-surface-muted）。',
    focusVisible: '预览触发器 / 关闭按钮为原生 button，经全局 :focus-visible 获得 2px accent 焦点环（paper.css 约定）；预览面板 tabindex="-1" 仅程序化聚焦不进 Tab 序。',
    active: '不适用：无按压态；预览由 click 一次性触发。',
    disabled: '组件无 disabled prop；preview 触发器在图片加载完成前为原生 disabled（不进 Tab 序、不可点击、光标回落默认），加载完成后启用；src 变化时已打开的预览浮层自动关闭并还原焦点。',
    loading: 'muted 面（--ui-surface-muted）+ aria-hidden 图片图标，占位插槽可覆盖；lazy 未进入视口同为 loading，且不渲染 img、不发请求。',
    error: 'danger 软面（--ui-danger-soft）+ 破图图标 + 「加载失败」文案，error 插槽可覆盖；配置 fallback 时先回落（回落期间保持 loading）。',
  },
  accessibility:
    'img 携带 alt（缺省空字符串 = 装饰性语义）；preview 开启后图片包裹于原生 button（加载完成前 disabled，aria-haspopup="dialog"，可读名「预览图片：{alt}」或「预览大图」，Enter/Space 原生激活）。预览浮层 role="dialog" aria-modal="true"，可读名取 alt 或「图片预览」；打开时焦点移入面板（tabindex="-1" 程序化聚焦），Esc 关闭、Tab 在浮层内圈定、关闭后焦点回归触发器。占位/失败视图为真实可见文本（默认图标 aria-hidden），error 文案可被读屏读取。',
  ssr:
    'renderToString 无异常：状态机初始为 loading，服务端输出根类 ui-image--loading、占位视图、img（src/alt/object-fit 内联样式）；lazy 时 img 不渲染（门闩未放行）；preview 浮层未打开不输出（Teleport 内 v-if 不触达），仅输出触发器 button。IntersectionObserver 与 document 只出现在 mounted/用户事件路径，node 环境不触达。',
  performance:
    'lazy 未经 IntersectionObserver 观察（仅 mounted 创建、首次相交断开，无滚动监听）；状态机为 ref/computed 派生；动效仅 loaded 淡入与关闭按钮 hover（opacity/background-color，走 --ui-motion-*，reduced-motion 下 token 归零自动停用）；预览浮层按需 Teleport 渲染，关闭即卸载。',
  styling:
    '视觉只消费 --ui-* token：占位面 --ui-surface-muted/--ui-text-3、失败面 --ui-danger-soft/--ui-danger、浮层遮罩 --ui-scrim、层级 --ui-z-modal、圆角 --ui-radius-md、间距 --ui-space-*、动效 --ui-motion-*/--ui-ease-out。未加载完成时根框最小占位用 --ui-space-7。两处结构性取值无对应 token、沿用仓库既有先例未新增：① img/浮层内 0 定位（inset/top/right 结构性重置，Timeline 先例）；② 图标 20px 为 CONVENTIONS 允许的图标尺寸档。',
  examples: [
    "<Image :src='url' alt='产品照片' fit='cover' />",
    "<Image :src='url' alt='截图' lazy preview />",
    "<Image :src='url' :fallback='local' alt='封面' />",
    "<Image :src='url' alt='头像原图'>\n  <template #error>\n    <button type='button' @click='reload'>重新加载</button>\n  </template>\n</Image>",
  ],
  agent: {
    keywords: ['image', '图片', 'img', '懒加载', 'lazy', '占位', 'placeholder', 'fallback', '回退', '加载失败', '预览', '大图', 'lightbox', 'preview', 'zoom', 'object-fit', '图片查看器'],
    selectionHints: [
      '内容图片 → Image；无图的加载占位 → Skeleton；头像裁剪 → Avatar',
      '长页面/列表图片加 lazy；需要点开放大加 preview；可能 404 的外链图加 fallback',
      'alt 是内容图的可读名与预览浮层标题：内容图必传，装饰图留空',
      '加载/失败视图不满意默认样式时用 placeholder / error 插槽覆盖',
    ],
    commonTasks: [
      '详情页/卡片的内容图片展示与预览',
      '长列表图片懒加载避免并发请求风暴',
      '外链图片失败的本地兜底与失败引导',
    ],
    generationNotes: [
      'src 必填；空字符串直接落 error 态；src 动态变化会重置状态机并关闭已打开的预览',
      'lazy 取初始值，挂载后切换不追溯；IO 不可用环境自动降级为立即加载',
      'load 在 fallback 回落成功时也会触发；error 在每次失败尝试都会触发（主源 + fallback 各一次）',
      'preview 浮层 Teleport 到 body、z-index 走 --ui-z-modal；不锁定页面滚动、无多图画廊',
    ],
  },
}
