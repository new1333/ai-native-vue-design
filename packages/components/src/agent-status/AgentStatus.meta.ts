/**
 * AgentStatus 的组件契约元数据（ComponentDefinition）。
 * api 字段与 AgentStatus.types.ts 保持一致；states 与 AgentStatus.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-agent-status',
  version: '0.1.0',
  identity: {
    name: 'AgentStatus',
    package: '@ui/components',
    export: 'AgentStatus',
    category: 'feedback',
    description:
      '纸面 agent 运行状态指示：以 §14 state semantics 八档呈现 agent 生命周期（queued/running/streaming/waitingForTool/toolRunning/completed/failed/cancelled），role=status live region，运行态组合 Spinner。',
  },
  intent: {
    what:
      'agent 运行状态指示条：以语义状态档（soft 底色 + 同系文字色 + 前置指示器）表达 agent 生命周期当前所处状态，状态变化经 aria-live=polite 播报。',
    when: [
      'agent 会话头部/运行列表中标注当前生命周期状态（排队/运行/流式输出/工具调用…）',
      '任务面板、运行时间线里逐 run 的状态标注',
      '需要读屏感知状态变化的场景（role=status + aria-live=polite 内建）',
    ],
    whenNot: [
      '通用对象属性标注（"Beta""已失败"等静态徽标）用 Badge：AgentStatus 只表达 agent 生命周期语义',
      '无量值的普通加载等待用 Spinner：AgentStatus 是生命周期语义条而非 loading 图形',
      '量值进度（0-100 + aria-valuenow）用 Progress',
      '操作结果一次性反馈用 Toast / Alert',
      '重试/停止等动作：AgentStatus 纯展示不承载交互，用外部 IconButton 组合（见 composition）',
    ],
    userTask: '用户需要确认 agent 当前处于生命周期的哪一步、是否需要介入（如批准工具调用）',
  },
  api: {
    props: [
      {
        name: 'status',
        type: "'queued' | 'running' | 'streaming' | 'waitingForTool' | 'toolRunning' | 'completed' | 'failed' | 'cancelled'",
        default: "'queued'",
        description:
          '生命周期状态档位（§14 state semantics）：queued 排队、running 运行、streaming 流式输出、waitingForTool 等待工具、toolRunning 工具执行、completed/failed/cancelled 终态。运行态三档组合 Spinner，failed 走 danger（destructive）token。',
      },
      {
        name: 'label',
        type: 'string',
        default: '按 status 取默认文案（AGENT_STATUS_LABELS，如 running→"运行中"）',
        description:
          '状态文本：渲染在 role="status" live region 内，状态变化即被读屏播报。状态语义必须由文本承载，不要只靠图形/颜色。',
      },
      {
        name: 'detail',
        type: 'string',
        default: '——',
        description: '补充说明（第二行，--ui-text-2 弱化呈现），如"正在执行 3/7 步""等待 get_weather 返回"。可选。',
      },
    ],
    slots: [
      {
        name: 'icon',
        description:
          '前置状态图形：覆盖默认指示器（运行态 Spinner / 其余状态小圆点）。容器整体 aria-hidden（纯装饰），状态语义始终由文本承载。',
      },
      {
        name: 'default',
        description: '状态文本：覆盖 label / 默认文案（仍在 role="status" live region 内）。',
      },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['静态属性徽标（Badge 的职责）', '承载重试/停止等交互动作（用 IconButton 组合）'],
    dependsOn: ['Spinner（运行态前置指示器，包内组合）', '@ui/tokens/paper.css（--ui-* token 由使用方入口引入）'],
  },
  composition: {
    patterns: [
      'agent 会话头部：<AgentStatus :status="run.status" :detail="run.step" />',
      '运行列表行：AgentStatus + Text（耗时）+ IconButton（停止，仅运行态可用）',
      '工具批准场景：AgentStatus status="waitingForTool" + 外部 Button（批准/拒绝）',
      '失败恢复：AgentStatus status="failed" + IconButton（重试）',
    ],
    related: ['Spinner', 'Badge', 'IconButton', 'Progress', 'Toast'],
    preferred: [
      '状态语义始终由 label/detail 文本承载，图形（Spinner/圆点）只是视觉强化',
      '运行态才渲染停止类 IconButton；终态后用重试类 IconButton，动作都在组件外部组合',
      '同屏状态色克制：强调色/状态色元素 ≤3 处',
      '状态由使用方受控传入（status 是纯 prop，无内部状态机），组件随 prop 切换即时反映',
    ],
  },
  states: {
    default:
      "queued：surface-muted 底 + text-2 文字 + 静态小圆点；终态档同构（completed→success-soft/success，failed→danger-soft/danger，cancelled→surface-muted/text-2，waitingForTool→warning-soft/warning），13px/500 文字、--ui-space-1×--ui-space-2 内距、--ui-radius-sm 圆角。",
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 :active。',
    disabled: '无禁用语义：状态由 status prop 受控，非交互组件不存在 disabled。',
    loading:
      '运行态（running/streaming/toolRunning）：前置指示器组合 Spinner（size sm，720ms/圈，加载态无限循环豁免，reduced-motion 自动静态化），底色 accent-soft、文字 accent。',
    error: 'failed：danger-soft 底 + danger 文字（destructive 语义走 --ui-danger token）+ 静态小圆点，重试动作由外部 IconButton 组合。',
  },
  accessibility:
    '根元素 role="status" + aria-live="polite"：状态文本（label/默认文案）渲染在 live region 内，status 切换时读屏播报最新状态。前置指示区（Spinner/圆点）整体 aria-hidden="true" 纯装饰——状态不只靠颜色/图形传达。非交互、无 tabindex、不进 Tab 序（无键盘路径，交互语义刻意不存在；重试/停止由外部 IconButton 承担）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API（无 effect/监听/测量/定时器），role、aria-live、状态修饰类、指示器结构（含运行态 Spinner 的 SVG）与文本均在服务端输出；动画只存在于 CSS。',
  performance:
    '无 JS 运行时开销（仅 computed class/label 派生）；运行态动效为 Spinner 的 CSS 关键帧（transform 旋转，加载态豁免，reduced-motion 下停用）。无监听器、无测量、无定时器。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：各状态档 soft 底（--ui-surface-muted/--ui-accent-soft/--ui-warning-soft/--ui-success-soft/--ui-danger-soft）+ 同系文字色（--ui-text-2/--ui-accent/--ui-warning/--ui-success/--ui-danger），对齐 Badge 视觉契约；字号 --ui-text-sm/-xs、字重 --ui-font-weight-medium、间距 --ui-space-*、圆角 --ui-radius-sm；指示盒 --ui-space-4、圆点 --ui-space-2、50% 全圆随 Badge dot 先例（结构性相对半径）。无全局 CSS 引入。',
  examples: [
    '<AgentStatus status="running" />',
    '<AgentStatus status="failed" label="工具调用失败" detail="get_weather 返回 500" />',
    '<AgentStatus :status="run.status" :detail="`第 ${run.step} / 7 步`" />',
    '<AgentStatus status="streaming">\n  <template #icon><CustomPulseIcon /></template>\n</AgentStatus>',
  ],
  agent: {
    keywords: [
      'agent',
      'agent status',
      '运行状态',
      '生命周期',
      'state semantics',
      'queued',
      'running',
      'streaming',
      'waitingForTool',
      'toolRunning',
      'completed',
      'failed',
      'cancelled',
      'live region',
      'role=status',
    ],
    selectionHints: [
      'agent 生命周期状态 → AgentStatus（§14 八档语义）；普通属性/结果徽标 → Badge',
      '运行态（running/streaming/toolRunning）自带 Spinner 指示，不必再叠一个 Spinner',
      '重试/停止/批准等动作不要塞进 AgentStatus：外部以 IconButton/Button 组合',
      '需要读屏感知状态变化 → role=status + aria-live=polite 已内建，勿再外包一层 live region',
    ],
    commonTasks: ['agent 会话头部状态标注', '运行列表逐 run 状态列', '工具调用等待/执行状态呈现'],
    generationNotes: [
      'status 为受控 prop：无 emits/exposes、无内部状态机，由使用方驱动切换',
      'label 缺省时按 status 取默认中文文案；语义必须落在文本上，#icon 只做视觉替换',
      '八档状态色：queued/cancelled 共用 neutral 表达（surface-muted/text-2），运行三档共用 accent；区分靠文本',
      'detail 为纯文本 prop（无插槽）；需要富文本补充说明时放在组件外部',
      'waitingForTool 是"等待工具"（warning 档、静态圆点），toolRunning 才是"工具执行中"（accent 档、Spinner）',
    ],
  },
}
