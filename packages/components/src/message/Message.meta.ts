/**
 * Message 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Message.types.ts 保持一致；states 与 Message.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-message',
  version: '0.1.0',
  identity: {
    name: 'Message',
    package: '@ui/components',
    export: 'Message',
    category: 'data',
    description:
      '纸面 AI 会话消息气泡：user/assistant/system 三角色单条消息单元，头像（复用 Avatar）+ 发送者/时间戳 meta 行 + 状态徽标 + 气泡正文，支持流式光标与操作区插槽；区别于全局 Toast 的会话内静态气泡。',
  },
  intent: {
    what:
      '渲染 AI 会话中的一条消息：按 role 决定对齐与配皮（user 右对齐 accent-soft、assistant 左对齐 surface+描边、system 居中弱化），meta 行展示发送者/时间戳/状态徽标，气泡正文承载消息内容。',
    when: [
      'AI 会话 / 聊天窗口中逐条渲染对话消息（配合 v-for 遍历消息数组）',
      '需要区分 user / assistant / system 三种角色的对齐与视觉身份',
      'AI 回复仍在生成：streaming 表达流式输出（光标 + aria-busy）',
      '需要展示消息状态回执：发送中 / 已发送 / 发送失败（status）',
      '长会话需要虚拟滚动：Message 与 VirtualList 组合承载会话流',
    ],
    whenNot: [
      '全局轻通知 / 操作结果反馈用 Toast：Message 是会话流内的静态单元，不弹层、不自动消失',
      '会话窗口 / 消息列表容器本身不做：由使用方容器或 VirtualList 承载多条 Message',
      '消息内容的 Markdown / 代码高亮渲染不做：内容由使用方渲染进 default 插槽',
      '重试 / 复制 / 点赞等内建操作不做：通过 #actions 插槽放使用方控件（IconButton / Button）',
      '输入框用输入家族组件（Input / Textarea）：Message 只负责消息的展示侧',
    ],
    userTask: '用户需要阅读 AI 会话中的一条消息，分辨谁在说话、什么时候说的、消息处于什么状态',
  },
  api: {
    props: [
      {
        name: 'role',
        type: "'user' | 'assistant' | 'system'",
        default: "'assistant'",
        description:
          "会话角色：'user' 右对齐 + accent-soft 气泡；'assistant' 左对齐 + surface 底 + 描边气泡；'system' 居中弱化、无气泡配皮且不渲染内建回退头像列（显式 avatar 或 #avatar 插槽才出现头像）。role 只影响布局与配皮，不改变内容语义。",
      },
      {
        name: 'name',
        type: 'string',
        description:
          '发送者显示名称：meta 行内展示，并作为头像回退首字母推导来源与头像可读名称；缺省时头像回退用角色称谓（用户/助手/系统）。',
      },
      {
        name: 'avatar',
        type: 'string',
        description:
          '头像图片地址：传入即渲染内置 Avatar（复用 avatar/ 组件，加载失败回退首字母）；user/assistant 缺省时回退角色首字母头像，system 缺省不渲染头像列。',
      },
      {
        name: 'timestamp',
        type: 'string',
        description:
          '时间戳文案：使用方格式化好的字符串（如 "14:32"、"昨天 20:15"），meta 行内以 tabular-nums 弱化展示；组件不做时间格式化与相对时间换算。',
      },
      {
        name: 'streaming',
        type: 'boolean',
        default: 'false',
        description:
          '流式生成中：内容尾部渲染流式光标（纯 CSS opacity 闪烁、aria-hidden，prefers-reduced-motion 降级为静态），根元素置 aria-busy="true"；同一会话建议只有最后一条 assistant 消息处于 streaming。',
      },
      {
        name: 'status',
        type: "'sending' | 'sent' | 'error'",
        description:
          "消息状态徽标：meta 行内渲染内置文案（发送中 / 已发送 / 发送失败）与对应图标（脉冲点 / 对勾 / 感叹号）；'error' 额外把 assistant 气泡描边染为 danger 色。不传则不渲染徽标；主要服务 user 侧发送回执与失败标记，assistant 生成侧用 streaming。",
      },
    ],
    slots: [
      {
        name: 'default',
        scope: '{ message: MessageContext }',
        description:
          '消息正文：气泡内容（纯文本或使用方渲染的 Markdown 等）；流式光标渲染于插槽内容之后、同一内容容器内。scope.message 为当前消息完整上下文。',
      },
      {
        name: 'avatar',
        scope: '{ message: MessageContext }',
        description:
          '头像：覆盖内置 Avatar（任意角色生效；system 角色的内建回退头像本就不渲染，此插槽是 system 出现头像的唯一方式）。',
      },
      {
        name: 'actions',
        scope: '{ message: MessageContext }',
        description:
          '操作区：渲染于气泡之下（重试 / 复制 / 反馈等使用方控件）；未提供时不渲染该区。scope.message 含 status，可据此条件渲染（如 error 时给重试按钮）。',
      },
    ],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      "会话流：容器内 v-for 渲染 <Message v-for=\"m in messages\" :key=\"m.id\" :role=\"m.role\" :name=\"m.name\" :avatar=\"m.avatar\" :timestamp=\"m.time\" />",
      "流式回复：最后一条 assistant 消息 <Message role=\"assistant\" streaming>，内容随生成追加",
      "失败重试：<Message role=\"user\" status=\"error\"> + #actions 放「重新发送」按钮",
      "系统通知：<Message role=\"system\" timestamp=\"14:02\">会话已由管理员结束</Message>",
      "长会话虚拟滚动：VirtualList 的每项内放 Message（复用头像与高度策略由使用方管理）",
    ],
    related: ['Avatar', 'VirtualList', 'Toast', 'IconButton', 'Button'],
    preferred: [
      '消息数组渲染用稳定 key（消息 id），不要以下标为键',
      '同一会话同时只有最后一条 assistant 消息置 streaming，避免多条光标',
      'timestamp 传入使用方格式化好的字符串；组件不感知时区与相对时间',
      '自定义操作一律放 #actions（原生 button/IconButton），不要在气泡根上绑点击',
      '内容限宽由会话容器控制（如 max-width），气泡自身宽度自适应内容',
    ],
  },
  states: {
    default:
      "user：右对齐、--ui-accent-soft 气泡底；assistant：左对齐、--ui-surface 气泡底 + 1px --ui-border 描边 + --ui-radius-md 圆角；system：居中、透明气泡、--ui-text-2 弱化文本。meta 行：name text-1/medium/sm，时间 text-3/xs/tabular-nums，气泡内边距 --ui-space-2/3，正文 text-md + leading-body。",
    hover: '无交互态：气泡为静态展示单元，不响应 hover；#actions 内使用方控件自行响应 hover。',
    focusVisible:
      '组件自身不可聚焦、不进入 Tab 序；#actions 插槽内的原生控件按全局 :focus-visible 焦点环（2px accent + 2px offset）。',
    active: '无按压反馈：静态气泡不承载 active 态。',
    disabled: '不适用：Message 无禁用语义；#actions 内控件的禁用由各控件自身表达。',
    loading:
      "两个加载语义：streaming（生成中）内容尾部渲染 --ui-accent 流式光标（opacity 闪烁 ≈1.08s 循环，reduced-motion 降级静态）并置 aria-busy；status=\"sending\"（发送中）meta 行渲染 text-3 脉冲点（transform/opacity 白名单动效 ≈2s 循环，reduced-motion 降级静态点）。",
    error:
      "status=\"error\"：徽标染 --ui-danger（感叹号图标 + 「发送失败」），assistant 气泡描边同步染 danger；user 气泡无描边、system 无气泡，二者的错误语义由徽标色承担。",
  },
  accessibility:
    '单条消息为泛型容器（div，无 role、不进入 Tab 序）：发送者名称/时间戳/状态文案均为可见文本，读屏按文档流自然读取；头像复用 Avatar 的可读名称约定（回退态 role="img" + aria-label，alt 取 name 或角色称谓）；流式光标与状态图标/脉冲点均为 aria-hidden 装饰，状态语义由可见文案承担；streaming 时根元素 aria-busy="true" 标记区域更新中；#actions 内使用方控件保持原生键盘可达（Tab / Enter / Space）。',
  ssr:
    'renderToString 无异常：组件纯展示，setup 与模块顶层不访问任何浏览器 API，无监听器、无测量；role 修饰类、meta 行、状态徽标文案、streaming 光标节点与 default/avatar/actions 插槽内容均在服务端输出；光标闪烁与脉冲为纯 CSS 动画，服务端只输出静态节点。',
  performance:
    '无内部运行时状态（仅 computed 派生根类/作用域对象）；渲染开销与会话条数线性相关，长会话建议配合 VirtualList；唯一动效为流式光标 opacity 闪烁与 sending 脉冲点（均为加载语义豁免的无限循环，prefers-reduced-motion 显式停用）。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：气泡底 --ui-surface（assistant）/ --ui-accent-soft（user）/ 透明（system）、描边 --ui-border（error 时 --ui-danger）、圆角 --ui-radius-md、内边距 --ui-space-2/3；文字 --ui-text-1/2/3、字号 --ui-text-xs/sm/md、行高 --ui-leading-small/body、字重 --ui-font-weight-medium、数字 --ui-numeric；光标与脉冲色取 --ui-accent / --ui-text-3；动效时长由 --ui-motion-default 推导。无全局 CSS 引入；1px 描边为结构性细线宽度（无 --ui-border-width token，Card/Timeline 先例）。',
  examples: [
    "<Message role=\"user\" name=\"我\" avatar=\"/u.png\" timestamp=\"14:30\" status=\"sent\">\n  帮我把上周的周报汇总成三条要点。\n</Message>",
    "<Message role=\"assistant\" name=\"纸面助手\" timestamp=\"14:31\" streaming>\n  好的，正在为你生成……\n</Message>",
    "<Message role=\"user\" name=\"我\" status=\"error\">\n  上一条发送失败\n  <template #actions>\n    <IconButton aria-label=\"重新发送\" @click=\"resend\">…</IconButton>\n  </template>\n</Message>",
    "<Message role=\"system\" timestamp=\"14:02\">会话已由管理员结束</Message>",
    "<Message role=\"assistant\" name=\"纸面助手\">\n  <template #avatar>\n    <MyBrandAvatar />\n  </template>\n  自定义头像与内容渲染（如 Markdown）。\n</Message>",
  ],
  agent: {
    keywords: [
      'message', '消息', '气泡', 'bubble', 'chat', '聊天', '会话', '对话', 'conversation',
      'role', 'user', 'assistant', 'system', 'streaming', '流式', '生成中', 'avatar', '头像',
      'timestamp', '时间戳', 'status', '发送失败', '重试', 'AI 会话', '对话流',
    ],
    selectionHints: [
      'AI 会话 / 聊天记录里的一条消息气泡 → Message；页面级全局轻通知 → Toast',
      '角色决定布局：用户消息 role="user"（右对齐）、AI 回复 role="assistant"（左对齐）、系统通知 role="system"（居中弱化）',
      'AI 正在生成回复 → streaming（流式光标 + aria-busy）；发送回执 / 失败标记 → status',
      '操作（重试 / 复制 / 反馈）→ #actions 插槽；自定义头像 → #avatar 插槽；内容自定义渲染（Markdown 等）→ default 插槽（scope.message 取上下文）',
      '长会话滚动优化 → Message 与 VirtualList 组合（每项一条 Message）',
    ],
    commonTasks: [
      'AI 助手对话界面的消息流渲染',
      '客服 / 会话窗口中的双方消息与系统通知',
      '流式输出中的最后一条回复展示',
      '发送失败消息的重试入口',
    ],
    generationNotes: [
      'role 是布局与配皮开关，不改变内容语义；三档对齐：user 右 / assistant 左 / system 居中',
      'streaming 与 status 相互独立：生成中一般只传 streaming；status 主要服务 user 侧回执与失败标记',
      'status 内置文案（发送中/已发送/发送失败）与图标固定，需要自定义状态表达走 #actions 或内容侧',
      '头像复用 Avatar：src 失败回退首字母（name 优先，缺省用角色称谓）；system 角色内建头像列不渲染，头像只能来自显式 avatar 或 #avatar',
      'timestamp 为使用方格式化好的字符串；组件不做时间格式化 / 相对时间 / 折叠分组',
      '会话列表容器、自动滚动到底、未读计数等会话级能力不做，由使用方组合 VirtualList 实现',
    ],
  },
}
