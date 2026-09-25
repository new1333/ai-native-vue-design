/**
 * Card 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Card.types.ts 保持一致；states 与 Card.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-card',
  version: '0.1.0',
  identity: {
    name: 'Card',
    package: '@ui/components',
    export: 'Card',
    category: 'general',
    description: '纸面卡片：surface 底 + radius-md + border 描边的复合容器（Card / CardHeader / CardBody / CardFooter），插槽驱动，静止面默认无阴影，可选 rest 一档静止阴影。',
  },
  intent: {
    what: '把相关内容组织到一个有边界面上的静态容器：surface 底、1px 描边、12px 圆角，头部/主体/底部区块由插槽组件组成。',
    when: [
      '仪表盘中的内容面板（统计、图表、摘要）',
      '列表页/详情页的信息分组与排版容器',
      '需要标题 + 正文 + 动作区的标准内容块',
      '静止面需要可选一档轻微阴影（shadow="rest"）做层次区分时',
    ],
    whenNot: [
      '弹出浮层 / 模态内容用 Dialog / Popover：Card 无层级行为与焦点管理',
      '页面级布局分区（侧栏、顶栏）用 Navigation 家族组件：Card 是内容容器不是框架',
      '纯文字排版流（文章正文）不需要卡片包裹时直接排版',
      '需要悬浮交互反馈（hover 抬升等）的面板：Card 为静态面，不承载交互态',
    ],
    userTask: '用户需要在一块有边界的纸面上阅读一组相关信息',
  },
  api: {
    props: [
      { name: 'shadow', type: "'none' | 'rest'", default: "'none'", description: "阴影档位：默认 'none'（静止面默认无阴影）；'rest' 应用 --ui-shadow-rest 一档静止阴影。" },
    ],
    slots: [
      { name: 'default', description: '卡片内容：通常为 CardHeader / CardBody / CardFooter 的组合（作为直接子元素享受区块间距），也可以是任意内容。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      'Card > CardHeader(标题) + CardBody(正文) + CardFooter(Button 动作区)',
      'DashboardCard：Card + KPI/图表组合',
      'Card 内嵌 Form / Table 等任意内容（插槽驱动）',
    ],
    related: ['CardHeader', 'CardBody', 'CardFooter', 'Button', 'Badge', 'Avatar'],
    preferred: [
      '标准三段式内容块优先用 CardHeader/CardBody/CardFooter 组合，而非裸写标题正文',
      '静止面保持默认 shadow="none"；仅在同一视图需要层次对比时对个别卡片用 shadow="rest"',
    ],
  },
  states: {
    default: 'surface 底 + 1px border 描边 + radius-md 圆角 + 24px 内边距；无阴影（静止面默认无阴影）；子区块间 16px 纵向间距。',
    hover: '无交互态：Card 为静态容器，不响应 hover。',
    focusVisible: '无聚焦语义：Card 不可聚焦、不参与 Tab 序，焦点环只出现在其内部的可交互子元素上。',
    active: '无按压反馈：静态容器不承载 active 态。',
    disabled: '不适用：Card 无禁用语义；内部表单控件的禁用由各控件自身表达。',
  },
  accessibility:
    'Card 为泛型容器（div，无 role、无 landmark）：不劫持语义，标题排版由 CardHeader 承担但语义层级（h1-h6）由使用方以原生标题元素放入插槽决定；内部可交互元素（button/a/input）保持原生键盘可达，Card 自身不可聚焦。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；无监听器、无测量；shadow 档位类与默认插槽内容随 SSR 输出。',
  performance:
    '纯静态容器：无监听器、无测量、无定时器、无动效；仅一个 computed 派生根 class。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底 --ui-surface、描边 --ui-border、圆角 --ui-radius-md、阴影 --ui-shadow-rest（仅 shadow="rest"）、内边距 --ui-space-5、区块间距 --ui-space-4、文字 --ui-text-1。无全局 CSS 引入；CardHeader/Body/Footer 只提供排版默认值（字号/字重/行高/颜色 token），深层定制由使用方在插槽内容上叠加。',
  examples: [
    "<Card>\n  <CardHeader>部署概览</CardHeader>\n  <CardBody>最近一次部署于 2 小时前完成。</CardBody>\n  <CardFooter>\n    <Button size='sm'>查看日志</Button>\n  </CardFooter>\n</Card>",
    "<Card shadow='rest'>层次对比中需要轻微抬升的面板</Card>",
    "<Card>\n  <CardBody>\n    <h3>周报</h3>\n    <p>本周新增 12 个组件。</p>\n  </CardBody>\n</Card>",
  ],
  agent: {
    keywords: ['card', '卡片', '面板', 'panel', '容器', 'container', 'surface', 'shadow', '阴影', 'header', 'footer', 'body'],
    selectionHints: [
      '静态内容分组/面板 → Card；弹出层 → Dialog/Popover；页面框架 → Navigation 家族',
      '标题 + 正文 + 动作 → Card 内按 CardHeader/CardBody/CardFooter 顺序组合',
      '只有正文时可以只用 Card + CardBody',
    ],
    commonTasks: ['仪表盘内容面板', '详情页信息分组', '列表卡片项'],
    generationNotes: [
      'Card 是静态容器：不要在卡片根上做 hover/点击交互，交互放在内部 Button 等元素',
      'shadow 保持默认 none，除非确需静止阴影层次（rest）',
      'CardHeader 内放原生 h1-h6 决定标题语义层级，组件不替使用方选层级',
      '三个区块组件作为 Card 的直接子元素渲染，区块间距由 Card 的 gap 提供',
    ],
  },
}
