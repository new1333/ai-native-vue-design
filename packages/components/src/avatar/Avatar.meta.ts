/**
 * Avatar 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Avatar.types.ts 保持一致；states 与 Avatar.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-avatar',
  version: '0.1.0',
  identity: {
    name: 'Avatar',
    package: '@ui/components',
    export: 'Avatar',
    category: 'general',
    description: '纸面头像：src 图片 + 加载失败/缺省回退首字母（initials 优先，否则由 name 推导），全圆三档尺寸（24/32/40），alt 必填保证可读名称。',
  },
  intent: {
    what: '以图片或首字母呈现一个人/团队/实体的身份标识：全圆小尺寸、必有可读名称（alt）、图片失败自动回退首字母。',
    when: [
      '导航栏/评论/表格行的用户身份标识',
      '协作成员列表、消息发送者标识',
      '团队/组织等实体的图形标识（配图标图片）',
      '无图片时以首字母占位（initials 或由 name 推导）',
    ],
    whenNot: [
      '可点击跳转到个人页的入口应外层包 a/RouterLink：Avatar 自身非交互',
      '状态在线/离线标记需要叠加 Badge：Avatar 不承载状态语义',
      '品牌 logo 等矩形展示图直接用 img：Avatar 强制全圆裁剪',
      '替代用户名文本：Avatar 是图形补充，名字仍需文本呈现',
    ],
    userTask: '用户需要快速识别一条内容归属的人或实体',
  },
  api: {
    props: [
      { name: 'src', type: 'string', description: '图片地址：有效且未加载失败时渲染 <img>；缺省、空串或 onerror 后回退首字母。' },
      { name: 'alt', type: 'string', required: true, description: '替代文本（必填）：随 <img alt> 输出；回退态作为根元素 role="img" 的 aria-label。' },
      { name: 'name', type: 'string', description: '名称：未显式给 initials 时按首个/末个空白分隔词的首字符推导回退首字母（大写）。' },
      { name: 'initials', type: 'string', description: '显式回退首字母，优先于 name 推导。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: "尺寸档位：sm 24px / md 32px / lg 40px；字号档随尺寸 12/13/15。" },
    ],
    slots: [],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: ['导航栏右侧 Avatar + 用户名', '表格行内 Avatar + 名称（size="sm"）', '成员列表 Avatar + Badge 状态点'],
    related: ['Card', 'Badge', 'Button'],
    preferred: ['alt 始终填可读名称（人名/团队名），不要填"头像"这类泛称', '有 name 时即使有 src 也传入，读屏与回退都受益'],
  },
  states: {
    default: '图片态：全圆裁剪 <img>（object-fit: cover）；回退态：--ui-surface-muted 底 + --ui-text-2 首字母（字重 medium）。',
    hover: '无交互态：Avatar 为静态标识，不响应 hover。',
    focusVisible: '无聚焦语义：不可聚焦、不参与 Tab 序；外层为链接时焦点环由外层 :focus-visible 提供。',
    active: '无按压反馈：静态标识不承载 active 态。',
    disabled: '不适用：无禁用语义。',
    error: '图片加载失败（<img> error 事件）：立即切换为首字母回退态；src 变化时复位重试新图。',
  },
  accessibility:
    '图片态由 <img alt>（必填）提供可读名称；回退态根元素 role="img" + aria-label（同 alt），首字母文本 aria-hidden="true" 不重复播报。组件自身非交互：无 tabindex、不捕获焦点。首字母是装饰性视觉，语义一律来自 alt。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；图片失败监听经模板 @error 挂载（服务端不触发、不序列化）；src/alt/尺寸类/回退首字母均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 failed 标记 + 两个 computed 派生 class 与回退文本。图片加载由浏览器原生处理，失败经原生 error 事件进入回退。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：全圆圆角由 calc(盒子/2) 组成（盒子取 --ui-space-5/--ui-space-6/--ui-space-6+--ui-space-2 映射 24/32/40）、字号 --ui-text-xs/sm/md、回退底 --ui-surface-muted、文字 --ui-text-2、字重 --ui-font-weight-medium。无全局 CSS 引入。',
  examples: [
    "<Avatar src='/u/zhang.png' alt='张三' name='张三' />",
    "<Avatar name='Zhang San' alt='张三' size='sm' />",
    "<Avatar initials='AI' alt='AI 助手' size='lg' />",
    "<a href='/profile'><Avatar :src='user.avatar' :alt='user.name' /></a>",
  ],
  agent: {
    keywords: ['avatar', '头像', '首字母', 'initials', '用户标识', 'identity', 'alt', '圆', 'round'],
    selectionHints: [
      '身份标识 → Avatar；品牌矩形 logo → img；可点击入口外包 a/RouterLink',
      '无图片或图片可能 404 → 只传 name/initials，组件自动首字母回退',
      '行内紧凑场景用 size="sm"，导航/正文用 md，展示页用 lg',
    ],
    commonTasks: ['导航栏用户头像', '评论/消息列表发送者标识', '成员列表首字母占位'],
    generationNotes: [
      'alt 必填：填人名/团队名等可读名称，勿填"头像"',
      '首字母回退规则：initials 优先，否则 name 首末词首字符大写；中文名取首字符',
      '图片加载失败自动回退；src 更新会自动重试新图，无需手动复位',
      'Avatar 非交互：需要点击跳转时外层包 a/RouterLink',
    ],
  },
}
