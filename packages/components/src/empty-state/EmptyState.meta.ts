/**
 * EmptyState 的组件契约元数据（ComponentDefinition）。
 * api 字段与 EmptyState.types.ts 保持一致；states 与 EmptyState.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-empty-state',
  version: '0.1.0',
  identity: {
    name: 'EmptyState',
    package: '@ui/components',
    export: 'EmptyState',
    category: 'data',
    description: '纸面空态占位：居中的图标 + 标题 + 说明 + 下一步操作，文字克制（text-2/text-3），间距与视觉全走 --ui-* token。',
  },
  intent: {
    what: '数据为空 / 无结果 / 尚未开始时的页面级占位：解释空态成因并给出下一步操作入口。',
    when: [
      '列表、表格、搜索结果为空',
      '用户尚未创建任何内容（首次进入）',
      '筛选/检索无命中',
      '模块未开通或暂无数据的占位说明',
    ],
    whenNot: [
      '加载中占位用 Skeleton：EmptyState 表达"确定没有"而非"还没到"',
      '加载失败且可重试的错误态用 Error 类组件或 Alert：空态不是错误',
      '单条状态提示（如保存失败）用 Alert：EmptyState 是区块/页面级占位',
      '模态内的空选择列表若需操作面板，考虑 Dialog + EmptyState 组合而非复用为容器',
    ],
    userTask: '用户需要明白"这里为什么是空的"以及"接下来能做什么"',
  },
  api: {
    props: [
      { name: 'title', type: 'string', description: '空态标题（一句话，text-2/17px/medium）；缺省时仅渲染图标与可选描述。' },
      { name: 'description', type: 'string', description: '补充说明（text-3/13px），解释空态成因或引导下一步；限宽 ≈672px 阅读栏。' },
    ],
    slots: [
      { name: 'icon', description: '图标覆盖；缺省渲染内建克制线稿图标（内联 SVG，viewBox 0 0 24 24、stroke-width 1.5、currentColor、24px，text-3 弱化）。' },
      { name: 'action', description: '下一步操作区（通常放一个 Button），渲染于描述之下，随容器居中。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['Skeleton（加载中占位）', 'Alert（状态信息提示）'],
  },
  composition: {
    patterns: [
      'Table/列表空数据：<EmptyState title="暂无数据" description="…"><Button>新建</Button></EmptyState>',
      '搜索无结果：icon 插槽换搜索图标 + action 放"清除筛选"按钮',
      '首次使用引导：description 写引导文案 + action 放主行动按钮',
    ],
    related: ['Table', 'Button', 'Alert', 'Skeleton'],
    preferred: [
      '一个空态只给一个主行动按钮（强调色白名单：单屏强调元素 ≤3）',
      '标题写"是什么空"，描述写"为什么/能做什么"',
      '勿在 action 之外再塞第二个操作入口',
    ],
  },
  states: {
    default: '居中静默占位：text-3 线稿图标（24px）、text-2 标题（17px/medium）、text-3 说明（13px，限宽 ≈672px）；上下留白 --ui-space-7、区块间距 --ui-space-4/1/5。',
    hover: '容器与文案无 hover 反馈；action 插槽内的使用方按钮按其自身组件的 hover 契约表现。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；空态自身无可焦元素，焦点路径只发生在 action 插槽的使用方控件上。',
    active: '容器无按压反馈。',
    disabled: '不适用：EmptyState 为静态占位组件，无 disabled/loading/error 语义。',
  },
  accessibility:
    '静态内容区：根为普通 div，不设 role/tabindex/aria-live（空态出现由页面结构表达，不抢读屏注意力）。内建图标与 aria-hidden="true" 的装饰性 svg 不进入可读内容；标题与说明为根内普通文本。键盘路径只在 action 插槽的使用方控件上（推荐原生 Button：Tab 可达、Enter/Space 原生激活，全局 :focus-visible 提供焦点环）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；无 onMounted 副作用。根类、内建图标 svg、标题/说明、action 插槽内容均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器、无动效；纯静态结构 + 条件渲染，无运行时成本。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：文字 --ui-text-2/--ui-text-3、字号 --ui-text-lg/--ui-text-sm、间距 --ui-space-*（7/5/4/1）、说明限宽由 --ui-space-8 推导（≈672px）。无全局 CSS 引入；根类 ui-empty-state 可供使用方定向覆盖。',
  examples: [
    "<EmptyState title='暂无数据' description='创建第一条记录后，这里会展示你的数据。'>\n  <template #action><Button variant='primary'>新建记录</Button></template>\n</EmptyState>",
    "<EmptyState title='没有找到匹配结果'>\n  <template #action><Button variant='ghost'>清除筛选</Button></template>\n</EmptyState>",
    "<EmptyState>\n  <template #icon><svg viewBox='0 0 24 24'><!-- … --></svg></template>\n  <template #action><Button>连接数据源</Button></template>\n</EmptyState>",
  ],
  agent: {
    keywords: ['empty', 'empty state', '空态', '空状态', '暂无数据', '无结果', '占位', 'placeholder', '首次使用', '引导', 'no data'],
    selectionHints: [
      '"确定没有数据" → EmptyState；"数据还在路上" → Skeleton；"出错了" → Alert/Error',
      '下一步操作放 #action 插槽（一个主按钮），标题/描述用 props',
      '需要业务图标时用 #icon 插槽传内联 SVG，缺省图标为克制线稿',
    ],
    commonTasks: [
      '表格/列表空数据占位 + 新建按钮',
      '搜索无结果 + 清除筛选',
      '首次进入引导',
    ],
    generationNotes: [
      'title/description 均可选，缺哪个就不渲染对应行',
      '空态自身无可焦元素：键盘交互只经由 #action 内的使用方控件',
      '空态居中是设计文档允许的居中场景，不要在外层再包一层强制居中样式',
      '图标缺省线稿（inbox），替换时保持 viewBox 0 0 24 24、stroke-width 1.5、currentColor',
    ],
  },
}
