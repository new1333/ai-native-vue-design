/**
 * Badge 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Badge.types.ts 保持一致；states 与 Badge.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-badge',
  version: '0.1.0',
  identity: {
    name: 'Badge',
    package: '@ui/components',
    export: 'Badge',
    category: 'general',
    description: '纸面状态徽标：neutral/success/warning/danger/info 五档 soft 底 + 同系文字色，可选前置小圆点，纯展示无交互。',
  },
  intent: {
    what: '以 soft 底色块标注对象的状态或属性（如"进行中""已失败""Beta"）的静态徽标。',
    when: [
      '表格行、详情页、列表项的状态标注',
      '版本/环境/渠道等属性标签（neutral）',
      '配 dot 表达"运行中/在线"等轻量状态',
    ],
    whenNot: [
      '计数值/未读数等数字溢出场景（后续用 Badge max 或独立 CountBadge，见 generationNotes）',
      '可点击的过滤/筛选标签（那是交互组件，Badge 不承载交互）',
      '大段说明文字用 Text，不要塞进徽标',
    ],
    userTask: '用户需要一眼识别对象的状态类别',
  },
  api: {
    props: [
      { name: 'variant', type: "'neutral' | 'success' | 'warning' | 'danger' | 'info'", default: 'neutral', description: '状态语义档位：soft 底 --ui-*-soft + 同系文字色 --ui-*；neutral 取 surface-muted/text-2。' },
      { name: 'dot', type: 'boolean', default: 'false', description: '前置小圆点（纯装饰 aria-hidden），颜色随同系文字色（currentColor）。' },
    ],
    slots: [
      { name: 'default', description: '徽标文本（建议 2–6 字的状态词）。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['可点击筛选标签（交互组件）'],
  },
  composition: {
    patterns: ['Table 状态列（variant + dot）', '详情页标题旁的状态标注', '列表项元信息行（Badge + Text muted）'],
    related: ['Text', 'Heading', 'Table', 'Card'],
    preferred: ['同屏状态色克制：强调色/状态色元素 ≤3 处', '文字颜色即语义，不要为徽标引入第四种颜色'],
  },
  states: {
    default: '静态徽标：12px/500 文字、--ui-space-1×--ui-space-2 内距、--ui-radius-xs 圆角；底色 --ui-*-soft、文字 --ui-*（同系）。',
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 ：active。',
    disabled: '无禁用态。',
  },
  accessibility:
    '纯文本语义，不加 role/aria-*、不设 tabindex；状态信息由徽标文本本身承载（不要只靠圆点传达状态）；dot 为 aria-hidden 装饰。无键盘路径（非交互元素）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；variant 修饰类与 dot 圆点随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅一个 computed 派生 class，渲染成本可忽略。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底色 --ui-*-soft、文字 --ui-* 同系、字号 --ui-text-xs、字重 --ui-font-weight-medium、间距 --ui-space-*、圆角 --ui-radius-xs；dot 尺寸为 em/50% 比例值（随字号缩放，非绝对设计维度）、颜色走 currentColor。无全局 CSS 引入。',
  examples: [
    '<Badge variant="success">已完成</Badge>',
    '<Badge variant="danger" dot>服务异常</Badge>',
    '<Badge>Beta</Badge>',
    '<Badge variant="warning">待审核</Badge>\n<Badge variant="info">同步中</Badge>',
  ],
  agent: {
    keywords: ['badge', '徽标', '标签', '状态', 'status', 'dot', '圆点', 'success', 'warning', 'danger', 'info', 'neutral'],
    selectionHints: [
      '状态标注 → Badge（soft 底语义）；正文说明 → Text',
      '"运行中/在线"等活状态配 dot；属性标签用 neutral',
      '可点击的筛选标签不要用 Badge（无交互）',
    ],
    commonTasks: ['表格状态列', '详情页状态标注', '列表属性标签'],
    generationNotes: [
      '状态不要只靠 dot 颜色传达，始终提供文本',
      'max 数字溢出（如 99+）暂未实现，不要用 Badge 承载计数',
      '文本保持 2–6 字，过长说明改用 Text',
    ],
  },
}
