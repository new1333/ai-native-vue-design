/**
 * StreamingText 的组件契约元数据（ComponentDefinition）。
 * api 字段与 StreamingText.types.ts 保持一致；states 与 StreamingText.vue 实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-streaming-text',
  version: '0.1.0',
  identity: {
    name: 'StreamingText',
    package: '@ui/components',
    export: 'StreamingText',
    category: 'data',
    description:
      '纸面 AI 流式文本：增量 token 按节拍上屏、尾部渲染流式光标，流结束后立即定格全文并派发 complete（设计文档 §14.2 Response 首位）。',
  },
  intent: {
    what: 'AI 生成文本的流式渲染容器：content 承载增量全文，streaming 驱动「增量上屏 → 完成定格」状态机，表达真实生成状态而非视觉特效。',
    when: [
      'AI 回复/摘要/翻译等生成中文本的流式上屏：token 增量到达时按节拍逐段渲染',
      '流结束后的完成定格展示：移除光标、aria-busy 恢复、派发 complete',
      '需要自定义光标（cursor 插槽）或自定义渲染管线（default 插槽接外部 Markdown/高亮渲染器）的 AI 输出区域',
      'SSR 首屏直出当前 content（挂载时已有内容视为已上屏，不回放）',
    ],
    whenNot: [
      '完整 Markdown 语法解析（标题/列表/代码块/表格）：markdown 仅做「空行分段 + 段内换行保留」的安全结构化；完整渲染请在 default 插槽接入外部 Markdown 渲染器',
      '代码语法高亮：不属于本组件，请在 default 插槽接入高亮渲染器',
      '打字机装饰动画、打字音效等特效：AI UI 表达真实状态，不做视觉特效（光标为静态插入符）',
      '静态正文排版：用 Text / Heading（Typography 族）',
      '聊天消息列表与对话编排：属后续 Conversation / AIResponse 族的职责',
    ],
    userTask: '用户需要看到 AI 正在流式生成的回复逐段上屏，并在生成完成后定格为最终文本',
  },
  api: {
    props: [
      { name: 'content', type: 'string', required: true, description: '增量全文：当前已接收的完整累计文本（服务端每追加一段 token 就整体更新它）。挂载时已有内容视为已上屏；流式中长度回落视为新一轮重置，从零重新上屏。' },
      { name: 'streaming', type: 'boolean', default: 'false', description: '是否流式进行中：true 时增量按节拍上屏并渲染光标（aria-busy="true"）；false 时立即定格全文、移除光标，并在 true→false 沿派发一次 complete。' },
      { name: 'markdown', type: 'boolean', default: 'false', description: '段落结构化：按空行切分原生 p 段落、段内换行保留（安全文本节点渲染）；非完整 Markdown 语法解析。' },
    ],
    slots: [
      { name: 'default', scope: '{ text: string; streaming: boolean }', description: '接管已上屏文本的渲染（内置纯文本/段落结构不渲染，光标仍由组件收口）；text 为已上屏文本，streaming 为是否流式进行中。' },
      { name: 'cursor', description: '自定义流式光标（默认块状插入符，装饰性 aria-hidden，仅 streaming 期间渲染）。' },
    ],
    events: [
      { name: 'complete', payload: '无', description: '流结束（streaming true→false）时触发一次：组件已定格为 content 全文并移除光标；false→true 的开始不派发。' },
    ],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      'Spinner（生成中）+ StreamingText（回复流式上屏）组成 AI 回答区',
      'StreamingText(markdown) 输出多段回复，外层用 Text 补充说明',
      'default 插槽 + 外部 Markdown 渲染器：text 交给渲染管线，光标仍由组件收口',
    ],
    related: ['Text', 'Spinner', 'Card'],
    preferred: [
      'content 始终传「累计全文」，由组件负责增量节奏，使用方不要自行做逐字动画',
      '完成态判定以 @complete 为准，不要用定时器猜测流结束',
      '标题/静态说明不要塞进 StreamingText，用 Typography 族承载',
    ],
  },
  states: {
    default: '完成定格态（streaming=false）：content 全文直接定格展示、无光标；纯文本模式 pre-wrap 保留换行与空格。',
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 :active。',
    disabled: '无禁用态（纯展示）；中断/取消流由使用方将 streaming 置 false，组件定格并派发 complete。',
    loading: '流式态（streaming=true）：增量按节拍上屏（缓冲按追平节奏均摊，约 1.5s 内追平）、尾部渲染光标（cursor 插槽可替换）、aria-busy="true" 屏蔽逐 token 播报。',
  },
  accessibility:
    '根元素 aria-live="polite"：文本更新以不打断方式播报；流式期间 aria-busy="true" 屏蔽逐 token 播报，定格后恢复并播报最终态。光标为纯装饰（aria-hidden="true"）。纯展示组件：不加 role、不设 tabindex、无键盘路径，不进入 Tab 序；markdown 模式用原生 p 承载段落语义。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问浏览器 API，直出当前 content 全文（非流式即定格态，与客户端挂载初值一致避免 hydration 错位）；streaming=true 时随输出渲染光标占位与 aria-busy="true"。上屏节拍器仅客户端增量阶段由 watcher 启动，追平/定格/卸载即清理，SSR 渲染期不存在定时器。',
  performance:
    '单个 computed 派生已上屏文本；增量期间一个 setInterval 节拍器（追平即自停，缓冲按追平节奏均摊），无尺寸测量、无滚动/焦点监听；定格态与 SSR 零定时器。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：正文 --ui-text-md/--ui-leading-body/--ui-text-1、段落间距 --ui-space-3、光标 --ui-accent + --ui-radius-xs；纯文本模式 white-space: pre-wrap 为结构性排版基线；光标宽高以 em 相对字号度量（随字阶缩放的结构度量，非固定像素）。无 CSS 动画、无动效时长取值、无全局 CSS 引入。',
  examples: [
    "<StreamingText :content=\"content\" :streaming=\"streaming\" @complete=\"onComplete\" />",
    "<StreamingText :content=\"content\" streaming markdown />",
    "<StreamingText :content=\"content\" streaming><template #cursor><span class=\"dot\" /></template></StreamingText>",
    "<StreamingText :content=\"content\" streaming><template #default=\"{ text, streaming: live }\"><Text :color=\"live ? 'text-1' : 'text-2'\">{{ text }}</Text></template></StreamingText>",
  ],
  agent: {
    keywords: ['streaming', '流式', '流式文本', '打字机', '光标', 'AI 回复', '增量上屏', 'token 上屏', '生成中', '完成定格', 'AI', 'response'],
    selectionHints: [
      'AI 生成中文本的逐段上屏 → StreamingText；静态正文排版 → Text',
      '使用方只追加 content 并翻转 streaming，增量节奏与光标由组件收口',
      '需要完整 Markdown/高亮渲染 → default 插槽接外部渲染器，不要期待 markdown prop 解析全部语法',
    ],
    commonTasks: ['AI 对话回复流式渲染', '生成摘要/翻译的渐进展示', 'Agent 输出区域文本流'],
    generationNotes: [
      'content 必填且传累计全文；不要只传增量片段',
      'complete 只在 streaming true→false 沿触发一次，用于「已定格」业务收尾',
      '流式中断（取消/失败）直接置 streaming=false：组件立即定格并派发 complete',
      '光标不可聚焦、纯装饰；不要往里塞交互元素',
    ],
  },
}
