/**
 * Heading 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Heading.types.ts 保持一致；states 与 Heading.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-heading',
  version: '0.1.0',
  identity: {
    name: 'Heading',
    package: '@ui/components',
    export: 'Heading',
    category: 'typography',
    description: '纸面标题：h1–h6 层级（默认 h2）+ 字阶/字重/颜色语义档，默认左对齐，层级语义由原生标题标签承担。',
  },
  intent: {
    what: '承载页面/区块/卡片标题的排版组件，渲染原生 h1–h6 并统一消费 --ui-text-* 字阶与字重。',
    when: [
      '页面主标题（h1，每页至多一个）与区块标题（默认 h2）',
      '卡片、弹窗、分组的层级标题',
      '需要与全站字阶一致的大号数字/展示文案（配 numeric）',
    ],
    whenNot: [
      '正文与说明用 Text：Heading 默认 600 字重与标题行高，不适合长文案',
      '仅视觉放大、无层级含义的装饰文字用 Text size 更大档，避免污染文档大纲',
      '状态标注用 Badge',
    ],
    userTask: '用户需要以正确的层级语义与统一排版呈现一个标题',
  },
  api: {
    props: [
      { name: 'as', type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'", default: 'h2', description: '标题层级标签；h1 每页至多一个，常规区块标题用默认 h2。' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'", default: 'xl', description: '字号档位，映射 --ui-text-xs..3xl（默认 20px），行高随档位按标题口径取 --ui-leading-*。' },
      { name: 'weight', type: '400 | 500 | 600', default: '600', description: '字重，映射 --ui-font-weight-regular/medium/semibold（默认 semibold）。' },
      { name: 'color', type: "'text-1' | 'text-2' | 'text-3' | 'muted'", default: 'text-1', description: '文字颜色语义档；muted 为 text-2 的简写。' },
      { name: 'numeric', type: 'boolean', default: 'false', description: '数字场景工具档：font-variant-numeric 采用 --ui-numeric（tabular-nums）。' },
    ],
    slots: [
      { name: 'default', description: '标题文本。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['Text（正文语义）', 'Badge（状态标注）'],
  },
  composition: {
    patterns: ['Heading + Text 组成标题/正文块', 'Heading + Divider 分隔区块', 'Dialog/Card 内按层级递减 h2→h3→h4'],
    related: ['Text', 'Divider', 'Badge', 'Card'],
    preferred: ['页面主标题 h1 每页至多一个', '层级按文档大纲递进，不要跳级', '标题间距交给布局层 --ui-space-*'],
  },
  states: {
    default: '静态标题：左对齐、xl/text-1/600（--ui-text-xl / --ui-font-weight-semibold）。',
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 ：active。',
    disabled: '无禁用态；需要弱化标题用 color="text-3"。',
  },
  accessibility:
    '语义完全由 as 指定的原生 h1–h6 标签承担（隐式 heading role + level），不加 role/aria-level，不设 tabindex；默认左对齐符合排版规约。应保持页面标题层级连续、不跳级。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；as 渲染的标题标签、字号/字重/颜色修饰类随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅一个 computed 派生 class，渲染成本可忽略。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：字号 --ui-text-*、行高 --ui-leading-*、字重 --ui-font-weight-*、颜色 --ui-text-1/2/3、数字 --ui-numeric；margin:0 与 text-align:left 为结构性排版基线（非视觉取值）。无全局 CSS 引入。',
  examples: [
    '<Heading>区块标题（h2 / xl / 600）</Heading>',
    '<Heading as="h1" size="2xl">页面主标题（每页至多一个）</Heading>',
    '<Heading as="h3" size="lg" :weight="500">卡片小标题</Heading>',
    '<Heading as="h4" size="md" color="muted">分组弱标题</Heading>',
  ],
  agent: {
    keywords: ['heading', '标题', 'h1', 'h2', 'h3', 'title', 'typography', '排版', '层级'],
    selectionHints: [
      '标题/层级语义 → Heading；正文/说明 → Text',
      '层级按文档大纲 h1→h2→h3 递进，不跳级；视觉大小用 size 独立调节',
      '弱化标题用 color="muted"/text-3，不要换灰色值',
    ],
    commonTasks: ['页面主标题', '卡片/区块标题', '弹窗标题'],
    generationNotes: [
      'as 默认 h2；主标题显式 as="h1" 且每页一个',
      '不要用 Heading 承载正文长文案',
      '标题间距交给布局层，Heading 自身 margin 为 0',
    ],
  },
}
