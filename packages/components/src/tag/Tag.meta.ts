/**
 * Tag 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Tag.types.ts 保持一致；states 与 Tag.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tag',
  version: '0.1.0',
  identity: {
    name: 'Tag',
    package: '@ui/components',
    export: 'Tag',
    category: 'general',
    description: '纸面分类/属性标签：描边小标签标注对象的分类或属性（neutral/success/warning/danger/info 五档柔底 + 同系文字色），可选前置图标位、可关闭（原生 close 按钮）、可禁用。',
  },
  intent: {
    what: '以描边小标签标注对象的分类或属性（如「前端」「VIP」「紧急」），可带图标、可关闭、可禁用的静态标注块。',
    when: [
      '详情页、表格行、列表项的分类/属性标注（部门、渠道、等级）',
      '搜索/筛选条件回显为一组可移除的标签（closable + @close）',
      '输入内容后的确认标注（如邮件收件人、已选成员）',
      '标签集合里标出「已失效/不可操作」的成员（disabled）',
    ],
    whenNot: [
      '未读数、消息数等计数角标场景（Badge 的计数定位，Tag 不做数字溢出）',
      '需要读屏播报的状态/警示信息（用 Badge 表状态、Alert 表警示）',
      '可点击跳转或筛选的动作入口（那是 Button/链接的职责，Tag 主体非交互）',
    ],
    userTask: '用户需要识别对象属于哪个分类、带什么属性，并能按需移除某个标签',
  },
  api: {
    props: [
      { name: 'variant', type: "'neutral' | 'success' | 'warning' | 'danger' | 'info'", default: 'neutral', description: '语义档位：柔底 --ui-*-soft + 同系文字/图标色 --ui-*；neutral 取 surface-muted/text-2。' },
      { name: 'closable', type: 'boolean', default: 'false', description: '可移除：渲染原生关闭按钮（aria-label="关闭"）；点击仅 emit close，是否真正移除由使用方决定。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：根元素 aria-disabled="true"，关闭按钮置 disabled 且不触发 close；整体视觉降为 muted。' },
    ],
    slots: [
      { name: 'default', description: '标签文本（建议 2–8 字的分类/属性词）。' },
      { name: 'icon', description: '前置图标位；组件无内建图标，由使用方传内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），装饰性图标自行 aria-hidden。' },
    ],
    events: [
      { name: 'close', description: '点击关闭按钮后触发（disabled 时不触发）；组件不自行移除，由使用方据此从数据源删除该标签。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: ['计数角标（Badge 定位）', '可点击跳转/筛选入口（Button）'],
  },
  composition: {
    patterns: ['筛选条件回显（v-for Tag + closable + @close 移除）', '详情页属性行（variant + icon）', '已选成员/收件人列表（closable）'],
    related: ['Badge', 'Alert', 'Button', 'Text'],
    preferred: ['标签文本保持 2–8 字，过长说明改用 Text', '同屏语义色克制：有色标签成组使用、点缀使用', '可移除集合务必由使用方持有数据源，close 只上报不删数据'],
  },
  states: {
    default: '描边标签：--ui-*-soft 柔底 + 同系文字/图标色、1px --ui-border 描边、--ui-radius-sm 圆角、12px/500 文字、--ui-space-1×--ui-space-2 内距。',
    hover: '主体（分类标注）非交互、不响应 hover；关闭按钮 hover 文字色加深为 --ui-text-1。',
    focusVisible: '主体不可聚焦（无 tabindex、非交互元素）不产生焦点环；关闭按钮可聚焦，焦点环交给全局 :focus-visible 约定（paper.css）。',
    active: '主体无按压态；关闭按钮走原生激活（Enter/Space → click → emit close）。',
    disabled: 'disabled=true：根元素 aria-disabled="true"，关闭按钮置 disabled（不触发 close）；整体降为 surface-muted 底 + text-3 文字。',
  },
  accessibility:
    '主体为纯文本语义的 span（不加 role、不可聚焦），分类/属性语义由文本承载；closable 时渲染原生 button[type=button] + aria-label="关闭"，Enter/Space 原生激活，自然进入 Tab 序；X 图标 aria-hidden 装饰；disabled 时根元素 aria-disabled="true" 且关闭按钮原生 disabled。icon 插槽内容为装饰性，使用方应自行 aria-hidden。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；variant 修饰类、aria-disabled、关闭按钮与图标位均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 classes computed 与 onClose 派生，渲染成本可忽略。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：柔底 --ui-*-soft、文字/图标 --ui-* 同系、描边 --ui-border、字号 --ui-text-xs、字重 --ui-font-weight-medium、间距 --ui-space-*、圆角 --ui-radius-sm（关闭钮 --ui-radius-xs）、动效 --ui-motion-fast/--ui-ease-out；描边宽度 1px 为结构性细线（--ui-border-width token 缺值已在任务结果提出）。无全局 CSS 引入。',
  examples: [
    '<Tag>前端</Tag>',
    '<Tag variant="success" icon="#icon-check">已认证</Tag>',
    '<Tag variant="info" closable @close="remove(id)">VIP</Tag>',
    '<Tag variant="danger" disabled>已停用</Tag>',
  ],
  agent: {
    keywords: ['tag', '标签', 'chip', '分类', '属性', '标注', 'closable', '可关闭', 'disabled', 'variant', 'icon'],
    selectionHints: [
      '分类/属性标注且可能要移除 → Tag；状态播报 → Badge；计数角标 → 不要用 Tag',
      '筛选条件回显、已选成员列表 → Tag closable + @close 由使用方删数据',
      '标注不可操作的成员 → Tag disabled',
    ],
    commonTasks: ['详情页属性行', '筛选条件标签组', '已选项回显'],
    generationNotes: [
      'close 只上报不自行移除，使用方须在 @close 中维护数据源',
      'icon 插槽无内建图标；传入的装饰性 svg 需自行 aria-hidden',
      'Tag 无计数溢出能力（无 max），计数场景不要误用',
    ],
  },
}
