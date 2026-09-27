/**
 * Reasoning 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Reasoning.types.ts 保持一致；states 与 Reasoning.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-reasoning',
  version: '0.1.0',
  identity: {
    name: 'Reasoning',
    package: '@ui/components',
    export: 'Reasoning',
    category: 'feedback',
    description:
      '纸面 AI 思考过程折叠面板（设计文档 §14.2 ThinkingBlock/Reasoning）：流式自动展开、结束自动收起、头部展示耗时，头部文案与思考正文可插槽接管。',
  },
  intent: {
    what: 'AI 思考/推理过程的可折叠展示面板：streaming 驱动「流式自动展开 → 结束收起」状态机，头部为原生 disclosure 按钮（展开态 + 耗时文案），正文以弱化排版呈现思考文本。',
    when: [
      'AI 回复前展示模型思考过程（ThinkingBlock）：流式期间自动展开跟随生成，结束后收起为一行摘要',
      '历史消息中的思考记录：默认收起、点击展开查看全文，头部展示「已思考 x.xs」耗时',
      '需要自定义头部文案（header 插槽）或接外部 Markdown 渲染器渲染思考正文（content 插槽）',
      '受控编排：expanded + @toggle 把展开态接入外层会话状态（如「仅最新一条消息自动展开思考」）',
    ],
    whenNot: [
      'AI 正文的流式渲染：用 StreamingText（token 上屏与光标语义）；思考面板不做逐字上屏',
      '通用折叠列表/多面板手风琴：用 Accordion（items 驱动、单开/多开、键盘漫游），本组件只有单个面板',
      '工具调用与执行状态（ToolCall/AgentStatus 族）：思考面板只表达思考文本，不承载 Agent 运行时状态',
      '需要承载表单/动作的通用内容容器：用 Card / Dialog，本组件只提供展开收起一个交互',
    ],
    userTask: '用户需要按需查看模型是怎样思考的：流式时跟随展开，平时收起不干扰阅读正文',
  },
  api: {
    props: [
      { name: 'content', type: 'string', default: "''", description: '思考过程文本（累计全文），多行换行按 pre-wrap 保留；用 content 插槽时可缺省。' },
      { name: 'streaming', type: 'boolean', default: 'false', description: '是否思考流式进行中：false→true 自动展开；true→false 且 autoCollapse 时自动收起。头部文案随之在「思考中…」与完成态之间切换。' },
      { name: 'duration', type: 'number', default: 'undefined', description: '思考耗时（秒，展示固定一位小数）：完成态头部展示「已思考 x.xs」；不传则完成态展示「思考过程」。' },
      { name: 'autoCollapse', type: 'boolean', default: 'true', description: '流式结束（streaming true→false）时是否自动收起；false 时保持展开（如用户正在阅读中间过程）。' },
      { name: 'expanded', type: 'boolean', default: 'undefined', description: '当前展开态：提供时为受控模式（组件只 emit toggle 上报意向、展示完全随该 prop），缺省为非受控（组件内部维护；挂载即 streaming 的实例初始为展开）。' },
    ],
    slots: [
      { name: 'header', scope: '{ expanded: boolean; streaming: boolean; duration?: number }', description: '头部文案：渲染进触发按钮内部、覆盖默认文案（思考中…/已思考 x.xs/思考过程），并成为按钮可访问名；按钮语义（aria-expanded/aria-controls）与 chevron 指示仍由组件收口，不要在其中放交互元素。' },
      { name: 'content', scope: '{ content: string; streaming: boolean }', description: '思考正文：覆盖 content prop 的默认文本渲染（可接外部 Markdown 渲染器）；收起时区域 hidden，插槽内容仍保留在 DOM。' },
    ],
    events: [
      { name: 'toggle', payload: '(expanded: boolean)', description: '展开态变化（用户点击/流式自动展开/结束收起）时触发，payload 为切换后的展开态；受控模式下是唯一的展开意向通道，由使用方回写 expanded。挂载时由 streaming 初始值确定的初始展开态不派发。' },
    ],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      'ChatMessage 内组合：StreamingText 渲染正文 + Reasoning 渲染思考过程（streaming 同源驱动）',
      'Reasoning + header 插槽接自定义状态文案/Badge 表达「思考中」活动态',
      '受控编排：expanded + @toggle 接会话状态，实现「仅最新一条消息自动展开思考」',
    ],
    related: ['StreamingText', 'PromptInput', 'Accordion', 'Badge'],
    preferred: [
      '思考文本是 reasoning 原文时直接传 content；需要 Markdown/高亮渲染时用 content 插槽接外部渲染器',
      '流式会话只让最新一条处于 streaming；历史消息传 duration 收起展示「已思考 x.xs」',
    ],
  },
  states: {
    default: '收起：一行 ghost 触发按钮（text-2 文案「思考过程」/「已思考 x.xs」+ chevron），正文区域 hidden；非受控默认收起，挂载即 streaming 的实例初始为展开。',
    hover: '触发按钮背景落到 --ui-surface-muted、文字升为 --ui-text-1（--ui-motion-fast 过渡）。',
    focusVisible: '触发按钮为原生 button，焦点环遵循 paper.css 全局 :focus-visible 约定（2px accent 描边 + 2px 偏移）。',
    active: '无专门按压态：不做额外按压视觉（纸面 Profile 克制原则），交互反馈由 hover 与展开态承担。',
    disabled: '不适用：思考面板无禁用语义（无 disabled prop）；受控模式下使用方可忽略 toggle 意向实现逻辑上的「锁定」。',
    loading: 'streaming=true：头部文案「思考中…」以 --ui-accent 表达活动态、根挂 ui-reasoning--streaming，面板自动展开跟随生成；结束且 autoCollapse 时自动收起。',
  },
  accessibility:
    'WAI-ARIA Disclosure 模式：头部为原生 button（type=button，Enter/Space 激活由平台行为保证，组件不重复实现以免双触发），携带 aria-expanded + aria-controls；正文 role="region" + aria-labelledby 回指触发按钮，收起以 hidden 表达（内容保留 DOM、SSR 直出，展开不重建）。chevron 为装饰性内联 SVG（aria-hidden）。header 插槽内容渲染进按钮内部、天然成为按钮可访问名。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问浏览器 API（useId 为 Vue 同构 API）；无定时器、无测量、无副作用监听。aria-expanded/aria-controls/role="region"/hidden 与展开状态修饰类随 SSR 输出：默认收起、挂载即 streaming 或受控 expanded=true 时服务端直出展开态。',
  performance:
    '纯展示状态机：无定时器、无测量、无外部监听；一个 watch 收口流式转换，computed 派生类与文案；展开/收起走 hidden 切换，不重建正文 DOM。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：ghost 触发按钮（transparent 底 + --ui-radius-sm，hover 落 --ui-surface-muted/--ui-text-1）、文案 --ui-text-2/--ui-text-1，流式态 --ui-accent；正文 --ui-text-2 + --ui-leading-body + pre-wrap，左缘 1px 细线 --ui-border（无 --ui-border-width token，随 Button/Card 先例提出需求）；chevron 翻转 --ui-motion-default + --ui-ease-out。无全局 CSS 引入。',
  examples: [
    "<Reasoning :streaming=\"true\" :content=\"thinkingText\" />",
    "<Reasoning content=\"先分析数据分布，再选检验方法……\" :duration=\"3.2\" />",
    "<Reasoning :expanded=\"open\" :duration=\"3.2\" @toggle=\"open = $event\">\n  <template #content>\n    <MarkdownRenderer :text=\"thinkingText\" />\n  </template>\n</Reasoning>",
  ],
  agent: {
    keywords: ['reasoning', 'thinking', '思考', '思考过程', '思维链', 'cot', 'thinking block', '折叠', 'collapse', 'disclosure', 'duration', '耗时', 'ai', 'streaming'],
    selectionHints: [
      '展示模型思考过程（可折叠）→ Reasoning；AI 正文流式上屏 → StreamingText；通用折叠列表 → Accordion',
      '流式思考：content 随 token 累计更新 + streaming=true；结束后传 duration（秒）展示耗时',
      '需要把展开态接入会话状态（只展开最新一条）时用受控模式 expanded + @toggle',
    ],
    commonTasks: ['聊天消息中的思考块（ThinkingBlock）', 'Agent 执行报告里的推理过程回看', '思考正文的 Markdown 定制渲染'],
    generationNotes: [
      'duration 单位是秒（number），展示固定一位小数；不要传毫秒',
      '受控模式传入 expanded 后组件不再自行改状态，一切展开意向（含流式自动展开/结束收起）经 toggle 上报，由使用方回写',
      'autoCollapse=false 用于「结束后保持展开供用户阅读」的场景',
      'header 插槽只覆盖按钮内文案，不要在其中放交互元素（嵌套交互破坏 disclosure 语义）',
    ],
  },
}
