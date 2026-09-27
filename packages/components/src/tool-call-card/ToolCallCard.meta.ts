/**
 * ToolCallCard 的组件契约元数据（ComponentDefinition）。
 * api 字段与 ToolCallCard.types.ts 保持一致；states 与 ToolCallCard.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tool-call-card',
  version: '0.1.0',
  identity: {
    name: 'ToolCallCard',
    package: '@ui/components',
    export: 'ToolCallCard',
    category: 'data',
    description: 'AI 工具调用卡片：工具名 + 状态徽标（复用 Badge 语义）+ 入参 + 结果，waitingApproval 态内置人工审批（批准/拒绝）操作（设计文档 §14.3 ToolCall）。',
  },
  intent: {
    what: '把一次工具调用的「名称、状态、入参、结果」组织到一张状态卡片上：状态受控（queued/running/completed/failed/waitingApproval 五态），状态徽标即 aria-live live region，等待审批时内置批准/拒绝按钮。',
    when: [
      'Agent 对话流中逐条展示工具调用（检索、SQL、代码执行等）的过程与产出',
      '需要人工审批的高危工具调用：waitingApproval 态内置批准/拒绝操作并派发 approve/reject',
      '运行审计/调试视图：按时间列出各次调用的入参、结果与耗时（duration）',
      '以状态而非动效表达真实执行状态（设计文档 §14 state semantics 原则）',
    ],
    whenNot: [
      '流式文本增量渲染用 StreamingText：本组件不做 token 级上屏与光标',
      '设计文档 §14 的其余运行态（streaming / waiting-for-tool / cancelled 等）不在当前五态枚举内，需要时由使用方以自定义状态扩展或等待枚举扩档',
      '不做入参/结果折叠展开：内容始终平铺，超长裁剪由使用方经 #args/#result 插槽接管',
      '不内置重试/查看原始输出等附加动作：放 #footer 插槽由使用方控件承载',
      '通用内容分组容器用 Card：本组件是工具调用这一领域的语义卡片',
    ],
    userTask: '用户需要知道 AI 正在调用什么工具、进行到哪一步、传了什么参数、得到了什么结果，并在必要时批准或拒绝这次调用',
  },
  api: {
    props: [
      { name: 'name', type: 'string', required: true, description: '工具名：头部主标题（如 web_search、run_sql）。' },
      { name: 'args', type: 'unknown', description: '入参：字符串原样展示，其余值 JSON 两空格缩进展示（循环引用等序列化失败回退 String）；不传不渲染入参区。' },
      { name: 'result', type: 'unknown', description: '结果：展示规则同 args；status="failed" 时结果区文字转 danger 语义色表达错误输出；不传不渲染结果区。' },
      { name: 'status', type: "'queued' | 'running' | 'completed' | 'failed' | 'waitingApproval'", default: "'queued'", description: '工具调用状态（受控）：完全由使用方驱动流转；waitingApproval 渲染人工审批操作。' },
      { name: 'duration', type: 'number | null', default: 'null', description: '执行时长（毫秒）：<1000 显示「Nms」，否则一位小数秒（tabular-nums）；null/不传不展示。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用审批操作：waitingApproval 下批准/拒绝按钮原生 disabled 置灰；其余状态无可见效果。' },
    ],
    slots: [
      { name: 'header', scope: '{ name: string; status: ToolCallStatus; duration: number | null }', description: '整体接管头部行（内置工具名 + 时长 + 状态徽标不渲染）；接管后内置状态 live region 一并移除，状态播报由接管方自行承担。' },
      { name: 'args', scope: '{ args: unknown; formatted: string }', description: '覆盖入参区内容，区块标签「入参」仍由组件渲染。' },
      { name: 'result', scope: '{ result: unknown; formatted: string; status: ToolCallStatus }', description: '覆盖结果区内容，区块标签「结果」仍由组件渲染。' },
      { name: 'footer', scope: '{ status: ToolCallStatus }', description: '底部附加区：重试、查看原始输出等额外操作，渲染于审批区之后。' },
    ],
    events: [
      { name: 'approve', description: '点击「批准」按钮（仅 waitingApproval 渲染）时触发；后续状态流转由使用方驱动。' },
      { name: 'reject', description: '点击「拒绝」按钮（仅 waitingApproval 渲染）时触发。' },
    ],
    exposes: [],
  },
  constraints: {
    dependsOn: ['Badge（视觉语义：状态徽标复用其 soft 底 + 同系文字色 + 圆点档位，非组件引用）'],
  },
  composition: {
    patterns: [
      '会话流中逐条渲染：v-for ToolCallCard（key 用调用 id），status 由运行时事件驱动流转',
      '高危调用审批：status="waitingApproval" → 监听 approve/reject → 切回 running/completed/failed',
      'ToolCallCard(#footer 放重试 Button) 组合：失败态的补充动作',
      '自定义结果渲染：#result 接表格/代码高亮等富渲染器（scope.formatted 提供内置序列化文本）',
    ],
    related: ['Badge', 'Card', 'StreamingText', 'Spinner', 'Button'],
    preferred: [
      '状态完全受控：不要指望组件自行把 running 变 completed，由运行时事件驱动 setProps/状态容器',
      '审批操作保持内置批准/拒绝按钮，附加动作一律放 #footer，不要在 #header 里塞按钮',
      '结果为富结构（表格/图片）时用 #result 插槽接管，纯文本交给内置代码块',
    ],
  },
  states: {
    default: 'queued：surface 卡面 + 1px 描边 + radius-md；头部工具名（semibold）+ 状态徽标（neutral 档：surface-muted 底 / text-2 文字 + 装饰圆点）；入参/结果区为 muted 底代码块。',
    hover: '卡片本体无 hover 态；仅审批按钮有 hover：批准转 --ui-accent-hover 实底，拒绝转 --ui-surface-muted 底。',
    focusVisible: '焦点环由全局 :focus-visible（paper.css §3：2px accent 实线 + 2px 偏移）落在审批按钮上；卡片本体不可聚焦。',
    active: '审批按钮无额外按压档：按压保持 hover 配色，不做位移/阴影变化。',
    disabled: 'disabled=true 时 waitingApproval 的批准/拒绝按钮原生 disabled：muted 底 + text-3 文字 + border 描边（不用裸 opacity），读屏经原生禁用语义感知；卡片内容与状态徽标不受影响。',
    loading: 'running：状态徽标转 info 档（info-soft 底 / info 文字）+ 标签「运行中」；不阻塞入参/结果区渲染（结果可先给出增量），不做装饰性加载动效（§14 state semantics 原则）。',
    error: 'failed：状态徽标转 danger 档 + 标签「失败」；结果代码块文字转 --ui-danger 表达错误输出。',
  },
  accessibility:
    '状态徽标为常驻 aria-live="polite" live region：status 变化时标签文本更新即被礼貌播报（徽标圆点为装饰 aria-hidden）；#header 接管头部后 live region 一并移除，播报由接管方承担。审批操作为原生 <button type="button">（Tab 可达、Enter/Space 激活按平台约定），外包 role="group" + aria-label="人工审批"；disabled 走原生 disabled 语义。入参/结果区以可见文本标签「入参」「结果」+ <pre> 代码块按文档流可读；卡片根为泛型 div，无 role、不可聚焦。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API，无监听器/定时器/测量；状态档位类、状态标签、入参/结果序列化文本、审批按钮（含 disabled）与全部插槽内容随 SSR 输出。',
  performance:
    '纯声明式渲染：无监听器、无定时器、无测量、无动效；仅 computed 派生根 class、状态档位类、标签与序列化文本（序列化仅在 args/result 变化时重算）。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：卡面 --ui-surface、描边 --ui-border、圆角 --ui-radius-md、内边距 --ui-space-4、区块间距 --ui-space-3；状态徽标逐档对齐 Badge（--ui-*-soft 底 + --ui-* 文字，neutral 用 --ui-surface-muted/--ui-text-2）；代码块 --ui-surface-muted 底 + --ui-text-xs，字体用 --ui-font-sans（等宽字体缺 --ui-font-mono，已提出需求，token 补齐后切换等宽）；审批按钮复用 --ui-button-* 别名；时长 --ui-numeric。无全局 CSS 引入，无裸视觉值（描边宽度 1px 随 Card 结构性细线先例）。',
  examples: [
    "<ToolCallCard\n  name=\"web_search\"\n  :args=\"{ query: '纸面 设计系统', limit: 5 }\"\n  :result=\"'共 5 条结果'\"\n  status=\"completed\"\n  :duration=\"850\"\n/>",
    "<ToolCallCard\n  name=\"run_sql\"\n  :args=\"'DELETE FROM users'\"\n  status=\"waitingApproval\"\n  @approve=\"onApprove\"\n  @reject=\"onReject\"\n/>",
    "<ToolCallCard\n  name=\"run_sql\"\n  :args=\"{ sql: 'SELECT * FROM orders' }\"\n  status=\"failed\"\n  :result=\"'Error: permission denied'\"\n  :duration=\"1200\"\n>\n  <template #footer>\n    <Button size=\"sm\">重试</Button>\n  </template>\n</ToolCallCard>",
  ],
  agent: {
    keywords: ['tool call', 'toolcall', '工具调用', 'function call', 'agent', '审批', 'approval', 'approve', 'reject', '人工确认', 'human in the loop', '调用卡片'],
    selectionHints: [
      '展示 AI 工具/函数调用的名称、状态、入参、结果 → ToolCallCard',
      '需要人工批准/拒绝高危操作 → status="waitingApproval" + 监听 approve/reject',
      '纯 AI 文本流式回复用 StreamingText；通用内容面板用 Card；本组件专用于工具调用领域',
    ],
    commonTasks: ['Agent 会话中的工具调用时间线', '高危工具人工审批流', '工具执行审计/调试面板'],
    generationNotes: [
      'status 是受控 prop：生成代码时必须由使用方在 approve/reject 或运行时事件回调里自行流转状态',
      'waitingApproval 才渲染审批按钮；不要给非审批态传 disabled（无效果）',
      'args/result 为对象时自动 JSON 缩进展示，字符串原样；富渲染放 #args/#result 插槽',
      '不要移除状态徽标的 aria-live：状态播报依赖它；如用 #header 接管头部需自行补 live region',
      'duration 单位毫秒；组件内不换算时区/格式化日期',
    ],
  },
}
