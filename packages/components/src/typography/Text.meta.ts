/**
 * Text 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Text.types.ts 保持一致；states 与 Text.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-text',
  version: '0.1.0',
  identity: {
    name: 'Text',
    package: '@ui/components',
    export: 'Text',
    category: 'typography',
    description: '纸面正文/行内文本：任意元素标签（span/p/div）+ 字阶/字重/颜色语义档，默认左对齐，数字可选 tabular-nums。',
  },
  intent: {
    what: '承载正文、说明、行内文本的排版组件，统一消费 --ui-text-* 字阶与 --ui-text-1/2/3 颜色语义。',
    when: [
      '正文段落、辅助说明、行内标签等常规文本排版',
      '需要与全站字阶/字重/文字色一致的任何文本节点',
      '数字、金额、指标等需要对齐场景（配 numeric）',
      '弱化文案用 color="text-3"，次级文案用 color="text-2" 或简写 muted',
    ],
    whenNot: [
      '标题层级用 Heading：h1–h6 语义与默认字重不同，不要用 Text 模拟标题',
      '状态标注用 Badge（soft 底色语义），不要用彩色文字自造',
      '需要交互（链接/按钮）的文本用原生 a/button，Text 不承载交互',
    ],
    userTask: '用户需要以统一排版呈现一段文字',
  },
  api: {
    props: [
      { name: 'as', type: "'span' | 'p' | 'div'", default: 'span', description: '渲染的元素标签；正文段落建议 p，行内用 span。' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'", default: 'md', description: '字号档位，映射 --ui-text-xs..3xl（12/13/15/17/20/24/30px），行高随档位按纸面规约取 --ui-leading-*。' },
      { name: 'weight', type: '400 | 500 | 600', default: '400', description: '字重，映射 --ui-font-weight-regular/medium/semibold。' },
      { name: 'color', type: "'text-1' | 'text-2' | 'text-3' | 'muted'", default: 'text-1', description: '文字颜色语义档；muted 为 text-2 的简写。' },
      { name: 'numeric', type: 'boolean', default: 'false', description: '数字场景工具档：font-variant-numeric 采用 --ui-numeric（tabular-nums）。' },
    ],
    slots: [
      { name: 'default', description: '文本内容。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['Heading（标题层级语义）', 'Badge（状态标注）'],
  },
  composition: {
    patterns: ['Heading + Text 组成标题/正文块', 'Card 内说明文字（color="muted"）', '表格/指标数字（numeric）'],
    related: ['Heading', 'Badge', 'Divider', 'Card'],
    preferred: ['正文默认 Text（md/text-1）', '次级说明 muted/text-2，弱提示 text-3', '间距交给布局层 --ui-space-*，Text 不自带上边距'],
  },
  states: {
    default: '静态文本：左对齐、md/text-1/400 常规档；字号行高随 size 档位（--ui-text-*/--ui-leading-*）。',
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 ：active。',
    disabled: '无禁用态；需要弱化文案用 color="text-3"。',
  },
  accessibility:
    '纯文本内容，不加 role/aria-*，不设 tabindex；语义由 as 指定的原生标签承担（span/p/div）。默认左对齐符合排版规约；numeric 仅影响 font-variant-numeric，不改变读屏内容。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；as 渲染的标签、字号/字重/颜色修饰类随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅一个 computed 派生 class，渲染成本可忽略。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：字号 --ui-text-*、行高 --ui-leading-*、字重 --ui-font-weight-*、颜色 --ui-text-1/2/3、数字 --ui-numeric；margin:0 与 text-align:left 为结构性排版基线（非视觉取值）。无全局 CSS 引入。',
  examples: [
    "<Text>默认正文（md / text-1 / 400）</Text>",
    "<Text as=\"p\" color=\"muted\">次级说明文字（等同 color=\"text-2\"）</Text>",
    "<Text size=\"xs\" color=\"text-3\">弱提示/脚注</Text>",
    "<Text numeric>1,024.00</Text>",
    "<Text as=\"div\" size=\"lg\" :weight=\"500\">中 emphasis 行</Text>",
  ],
  agent: {
    keywords: ['text', '文本', '正文', '排版', 'typography', '字号', '字重', '颜色', 'muted', 'tabular-nums', '数字对齐'],
    selectionHints: [
      '正文/说明/行内文字 → Text；标题层级 → Heading',
      '弱化文案直接 color="text-3" 或 muted，不要引入新的灰色',
      '数字/金额/指标加 numeric 保证等宽对齐',
    ],
    commonTasks: ['卡片说明文字', '表单帮助文案', '表格/KPI 数字排版'],
    generationNotes: [
      'as 默认 span；成段内容用 as="p"',
      '不要用 Text 模拟标题或状态徽标',
      '文本间距（margin）交给布局层，Text 自身 margin 为 0',
    ],
  },
}
