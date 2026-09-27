/**
 * Timeline 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Timeline.types.ts 保持一致；states 与 Timeline.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-timeline',
  version: '0.1.0',
  identity: {
    name: 'Timeline',
    package: '@ui/components',
    export: 'Timeline',
    category: 'data',
    description:
      '纸面时间线：节点 + 连线的事件列表（ol/list 语义），left 单侧与 alternate 中轴交替两档布局，末尾可追加 pending 脉冲幽灵节点表达"进行中"，item/dot/footer 插槽按需覆盖。',
  },
  intent: {
    what:
      '按发生顺序展示一组事件：每项一个节点 + 标题/说明/时间，节点间以纵向连线串联；pending 幽灵节点标记事件流仍在推进。',
    when: [
      '操作日志、审批流转、物流/订单状态等按时间排序的事件列表',
      '版本更新记录、发布历史等按时间逆序或正序罗列的内容流',
      '事件尚未结束、需要"进行中"占位节点的持续记录场景（pending）',
      '窄栏下需要中轴两侧交替排布以节省纵向空间（mode="alternate"）',
    ],
    whenNot: [
      '离散步骤的流程导航（当前步可切换）用 Steps：Timeline 纯展示、节点不可交互',
      '连续任务的整体完成度用 Progress：Timeline 表达离散事件序列',
      '单条结果的成败反馈用 Alert / Toast：Timeline 面向多条事件的顺序叙述',
      '需要按事件字段筛选、排序、分页的海量数据用 Table：Timeline 无数据管理能力',
    ],
    userTask: '用户需要按时间顺序回看一组事件，并判断事件流推进到了哪一步',
  },
  api: {
    props: [
      {
        name: 'items',
        type: 'TimelineItem[]',
        required: true,
        description:
          '事件项列表，按数组顺序自上而下渲染；每项 { key?, title, description?, time? }，key 为稳定 v-for 键（缺省回落下标），title 主文案必填，description/time 可选弱化展示。',
      },
      {
        name: 'mode',
        type: "'left' | 'alternate'",
        default: "'left'",
        description:
          "布局档位：'left' 连线靠左、内容居右；'alternate' 中轴两侧按渲染下标奇偶交替（偶数下标内容居右、奇数下标居左且右对齐朝向中轴，pending 节点按下标 items.length 参与交替）。",
      },
      {
        name: 'pending',
        type: 'boolean',
        default: 'false',
        description:
          "进行中（幽灵）节点：true 时在列表末尾追加一个 accent 脉冲点节点并显示内置文案「进行中」（TIMELINE_PENDING_TEXT），表示事件流仍在推进；脉冲动效在 prefers-reduced-motion 下降级为静态实心点。",
      },
    ],
    slots: [
      {
        name: 'item',
        scope: '{ item: TimelineItem; index: number }',
        description: '整项内容：覆盖 title/description/time 的默认渲染。',
      },
      {
        name: 'dot',
        scope: '{ item?: TimelineItem; index: number; pending: boolean }',
        description:
          '节点圆点：覆盖默认圆点（普通项与 pending 节点都会经过此插槽；pending 节点上 item 为 undefined、pending 为 true、index 取 items.length）。',
      },
      {
        name: 'footer',
        description: '时间线末尾附加区（如「加载更多」「查看全部」），渲染于列表之下；left 档与内容列左缘对齐。',
      },
    ],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      "操作日志：<Timeline :items=\"logs\" />（logs: [{ title, description, time }]）",
      "中轴交替：<Timeline :items=\"milestones\" mode=\"alternate\" />",
      "持续推进：<Timeline :items=\"logs\" pending /> + #footer 放「加载更多」按钮",
      "自定义节点：#dot 放状态色圆点/内联 SVG 图标（viewBox 0 0 24 24、stroke-width 1.5、currentColor）",
    ],
    related: ['Progress', 'Table', 'Alert', 'EmptyState', 'Skeleton'],
    preferred: [
      'items 顺序即渲染顺序，传入前先按业务排好时间序；组件不做排序',
      '每项提供稳定 key（如事件 id），避免以下标为键导致复用错位',
      '事件流未结束时置 pending，让读屏与视觉都能感知"还有后续"',
      '纯展示组件，操作入口（重试/详情）放 #footer 或 #item 插槽内由使用方承载',
    ],
  },
  states: {
    default:
      '普通节点为 ink-400 实心圆点（--ui-color-ink-400，直径 --ui-space-2），连线 --ui-color-line；标题 text-1/medium、说明 text-2、时间 text-3 + tabular-nums。',
    hover: '不适用：纯展示列表，无 hover 反馈（项内容中的使用方控件自行响应 hover）。',
    focusVisible: '不适用：组件自身不可聚焦、不进入 Tab 序；#footer/#item 内使用方可聚焦控件按全局 :focus-visible 焦点环。',
    active: '不适用：无交互。',
    disabled: '不适用：无 disabled 语义；节点不承载启用/禁用状态。',
    loading:
      'pending（幽灵）节点即"进行中"语义：accent 实心点（--ui-color-pine-600）+ 外扩脉冲环（transform/opacity 白名单动效，≈2s 循环，加载态豁免）；prefers-reduced-motion 降级为静态实心点。',
  },
  accessibility:
    '列表语义：ol 显式 role="list" + li 显式 role="listitem"，抵消 list-style: none 与非 list-item display 在部分读屏器下丢失的列表语义。pending 节点渲染可见默认文案「进行中」，保证节点有可读内容；脉冲环为 ::after 伪元素，天然不进入读屏树。组件纯展示：无 tabindex、无可聚焦后代、无键盘路径（操作入口由 #footer/#item 内的使用方控件承载，原生键盘行为生效）。',
  ssr:
    'renderToString 无异常：组件不访问任何浏览器 API（无 effect/监听/测量），列表结构、role、items 内容、mode/pending 修饰类与 footer/item/dot 插槽内容均在服务端输出；脉冲环为纯 CSS 动画，服务端只输出静态点。',
  performance:
    '无 JS 运行时状态（仅 computed 根类与奇偶侧类派生）；渲染开销与 items 线性相关；唯一动效为 pending 节点 ::after 的 transform/opacity 关键帧（加载语义豁免），prefers-reduced-motion 下显式 @media 停用；连线为纯 CSS 伪元素，无逐项测量。',
  styling:
    "视觉只消费 --ui-* token：节点与连线色按任务要求取 --ui-color-* 原始色板——普通节点 --ui-color-ink-400、pending 节点/脉冲环 --ui-color-pine-600、连线 --ui-color-line；文字走语义 token（--ui-text-1/2/3）、字号 --ui-text-xs/sm/md、行高 --ui-leading-small/body、字重 --ui-font-weight-medium、数字 --ui-numeric。尺寸由 token 推导：圆点直径 --ui-space-2、圆半径 = 尺寸一半（Avatar 圆形同策略）、节点盒与标题首行等高（--ui-text-md × --ui-leading-small）、项间距 --ui-space-5、连线 1px 为结构性细线宽度（无 --ui-border-width token，先例 Table 外框，已提出 token 需求）。布局契约：项间距用 padding-bottom 而非 gap/margin，连线由每项 ::before 纵贯全高拼成（首项自圆心起、末项隐藏），column-gap 仅水平不破坏纵向连续。",
  examples: [
    '<Timeline :items="[{ title: \'已提交\', time: \'09:12\' }, { title: \'已审核\', description: \'张三审核通过\', time: \'10:30\' }]" />',
    '<Timeline :items="milestones" mode="alternate" />',
    '<Timeline :items="logs" pending>\n  <template #footer>\n    <Button size="sm" @click="loadMore">加载更多</Button>\n  </template>\n</Timeline>',
    '<Timeline :items="logs">\n  <template #dot="{ pending }">\n    <span :class="pending ? \'dot--current\' : \'dot\'" />\n  </template>\n</Timeline>',
  ],
  agent: {
    keywords: [
      'timeline', '时间线', '时间轴', '事件流', '节点', '连线', '日志', '操作记录',
      '审批流程', '物流跟踪', '更新日志', 'pending', '进行中', '幽灵节点', 'alternate', '交替',
    ],
    selectionHints: [
      '按时间顺序展示事件列表 → Timeline；需要交互切换步骤 → Steps',
      '事件流仍在推进 → pending（末尾脉冲节点）；已完结 → 不传 pending',
      '纵向空间紧张或希望强调中轴 → mode="alternate"；常规阅读 → 默认 left',
      '自定义节点状态色/图标 → #dot 插槽；自定义整项排版 → #item 插槽',
    ],
    commonTasks: [
      '操作日志 / 审批流转记录展示',
      '物流、工单、订单状态流转跟踪',
      '版本发布历史 / 更新日志罗列',
    ],
    generationNotes: [
      'items 必填且组件不做排序：传入前先按时间排好序，数组顺序即渲染顺序',
      'pending 是布尔 prop：只在列表末尾追加一个"进行中"幽灵节点，不改变已有项',
      'alternate 按渲染下标奇偶交替内容侧，pending 节点以下标 items.length 参与交替',
      '纯展示：无 emits/exposes；#dot 对普通项与 pending 节点都生效（scope.pending 区分）',
      '内建中文文案仅「进行中」一处（TIMELINE_PENDING_TEXT 常量），可在 #dot/#item 之外用 CSS 覆盖或整项走 #item',
    ],
  },
}
