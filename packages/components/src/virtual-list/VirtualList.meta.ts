/**
 * VirtualList 的组件契约元数据（ComponentDefinition）。
 * api 字段与 VirtualList.types.ts 保持一致；states 与 VirtualList.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-virtual-list',
  version: '0.1.0',
  identity: {
    name: 'VirtualList',
    package: '@ui/components',
    export: 'VirtualList',
    category: 'data',
    description: '纸面虚拟滚动列表原语：大列表/长会话只渲染可视窗口项，estimatedItemSize + 稳定键 + 已测尺寸前缀和定位窗口，不劫持原生滚动，SSR 直出首屏窗口；MessageList 等数据密集场景的底座。',
  },
  intent: {
    what: '以 windowing 方式渲染任意长列表：全量 items 只输出可视窗口（含 overscan）的 DOM 项，滚动偏移驱动窗口平移，已测尺寸按键缓存收敛前缀和。',
    when: [
      '千行级以上长列表、聊天记录/消息流等只渲染可视区即可满足的滚动内容',
      '项高度不均（文本长短不一）但可用 estimatedItemSize 估算的流式列表',
      '横向轨道（时间线、图片胶片）的窗口化滚动（horizontal）',
      '需要感知当前渲染窗口做埋点/预取（visibleRangeChange）或滚动埋点（scroll）',
    ],
    whenNot: [
      '几十行的普通列表直接 v-for 全量渲染即可，windowing 是过度设计',
      '需要行列结构、表头与单元格插槽的数据表格用 Table（万行级等 VirtualTable）',
      '分页浏览（Pagination）比连续滚动更契合的场景',
      '本组件不提供 loading/禁用/受控滚动等状态：异步数据由数据层处理，列表为空时走 empty 插槽',
    ],
    userTask: '用户需要流畅滚动浏览远超视口可承载项数的大列表',
  },
  api: {
    props: [
      { name: 'items', type: 'T[]', required: true, description: '全量数据源；组件只渲染可视窗口项（含 overscan），不改写传入数组。' },
      { name: 'estimatedItemSize', type: 'number', required: true, description: '单项估算尺寸（主轴 px，须为正数，<= 0 按 1 处理）：未测量项的尺寸与 SSR/无布局环境首屏窗口的推导基准；挂载后实测尺寸按键缓存覆盖估算。' },
      { name: 'overscan', type: 'number', default: '5', description: '视口外每侧预渲染项数；滚动缓冲，越大滚动越顺滑、DOM 越多。' },
      { name: 'horizontal', type: 'boolean', default: 'false', description: '水平模式：主轴切换为横向（scrollLeft/宽度驱动窗口，窗口项 left 定位、纵向铺满）。' },
      { name: 'getKey', type: '(item: T, index: number) => string | number', required: true, description: '稳定键（必填）：v-for DOM 复用与已测尺寸缓存的归属键；键一致即视为同一项，换数据源须保持键唯一稳定。' },
    ],
    slots: [
      { name: 'item', scope: '{ item: T, index: number }', description: '窗口内逐项内容插槽；缺省对 string/number 项渲染其文本，其余渲染为空（对象项必须用本插槽）。' },
      { name: 'empty', description: '空态内容；items 为空时渲染，缺省文案「暂无数据」，可搭配 EmptyState。' },
    ],
    events: [
      { name: 'scroll', payload: 'Event（原生 scroll 事件）', description: '原生滚动透传：组件不劫持滚动（不 preventDefault、不代写 scrollTop/scrollLeft），仅原样转发以便埋点/联动。' },
      { name: 'visibleRangeChange', payload: '{ start: number, end: number }', description: '渲染窗口变化：挂载首帧及 start/end 任一变化时发出；下标含 overscan、闭区间，空数据时 end = -1。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['消费方为滚动视口给定尺寸（height/width，style 或 class）', '@ui/tokens/paper.css（使用方应用入口一次性引入）'],
    dependsOn: ['@ui/tokens/paper.css'],
  },
  composition: {
    patterns: ['VirtualList 承载 MessageList 消息流（item 插槽渲染消息气泡）', 'VirtualList + EmptyState 空态兜底', 'visibleRangeChange 驱动预取/埋点 + scroll 透传联动'],
    related: ['Table', 'EmptyState', 'Skeleton', 'Pagination'],
    preferred: [
      'estimatedItemSize 取真实项的典型尺寸，偏差越小窗口越稳',
      'getKey 用业务唯一 id（不用数组下标），保证 DOM 复用与尺寸缓存正确',
      '项内容自带定高/自适应样式时配合 ResizeObserver 自动收敛，无需手动重测',
    ],
  },
  states: {
    default: '滚动视口原生滚动；窗口项按前缀和主轴绝对定位（定位值为数据驱动的内联样式，非视觉常量）；空数据渲染 empty 插槽（缺省「暂无数据」，text-sm/text-3 居中）。',
    hover: '无内置项 hover 态：项内容完全由 item 插槽决定，hover 交互属于插槽内容。',
    focusVisible: '滚动视口 tabindex="0" 可聚焦，焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。聚焦后方向键/PageUp/PageDown 由浏览器原生滚动视口。',
    active: '无按压态；滚动行为全部交还原生。',
    disabled: '无禁用态：列表是数据原语，无禁用语义（meta.intent.whenNot 已声明）。',
    loading: '无 loading 态：异步加载由数据层处理；列表为空期间走 empty 插槽（可自行放 Skeleton）。',
  },
  accessibility:
    '滚动视口为原生可滚动元素且 tabindex="0"（键盘用户 Tab 进入后用方向键/PageUp/PageDown 原生滚动，组件不拦截任何按键、不 preventDefault）；传入 aria-label 或 aria-labelledby（透传到滚动容器）时视口承担带名的 role="region" 地标，未传则不写 role；窗口项为普通容器，项的语义由 item 插槽内容自带；空态为普通容器文本。windowing 的可及性代价（窗口外项不在 DOM）由滚动视口可聚焦 + 原生滚动弥补。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API，scroll 监听/ResizeObserver/测量全部在 onMounted 绑定并在 onBeforeUnmount 清理；SSR 按假定视口常量（600px）直出首屏窗口（如 estimatedItemSize=32 时直出前 24 项，含 overscan），item/empty 插槽随 SSR 输出；scrollOffset SSR 期恒为 0。',
  performance:
    '只渲染可视窗口 + overscan（千项列表常驻 DOM 约为视口可容纳项数），项以 getKey 稳定键复用；窗口区间在偏移前缀和上二分求得（O(log n)），前缀和为 O(n) computed（浅状态、无逐项组件包装）；scroll 监听 passive、ResizeObserver 汇聚为键控尺寸缓存触发一次重算；不劫持原生滚动，无定时器。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：视口 overflow 原生滚动、空态 --ui-space-6 内边距/--ui-text-sm/--ui-text-3、字体 --ui-font-sans/--ui-text-1；窗口项主轴偏移与内容层总尺寸为数据驱动的内联布局值（同 Table 列宽口径，非视觉常量）；无全局 CSS 引入；焦点环交给全局 :focus-visible。',
  examples: [
    "<VirtualList\n  :items=\"messages\"\n  :estimated-item-size=\"48\"\n  :get-key=\"(m) => m.id\"\n  aria-label=\"会话消息\"\n>\n  <template #item=\"{ item }\">\n    <MessageBubble :message=\"item\" />\n  </template>\n</VirtualList>",
    "<VirtualList :items=\"rows\" :estimated-item-size=\"32\" :get-key=\"(r) => r.id\">\n  <template #item=\"{ item, index }\">{{ index }}. {{ item.name }}</template>\n  <template #empty>还没有消息</template>\n</VirtualList>",
    "<VirtualList :items=\"chips\" :estimated-item-size=\"96\" horizontal :get-key=\"(c) => c.id\">\n  <template #item=\"{ item }\"><Chip :label=\"item.label\" /></template>\n</VirtualList>",
    "<VirtualList :items=\"items\" :estimated-item-size=\"40\" :get-key=\"(x) => x.id\" @scroll=\"onScroll\" @visible-range-change=\"onRange\" />",
  ],
  agent: {
    keywords: ['virtual list', '虚拟列表', '虚拟滚动', 'windowing', '长列表', '大列表', '消息流', 'MessageList', 'chat', 'scroll', 'overscan', '横向列表', 'horizontal', '虚拟化'],
    selectionHints: [
      '千行级以上长列表/长会话 → VirtualList；几十行直接 v-for；行列结构 → Table；万行级表格语义 → VirtualTable',
      '必须传 getKey（业务唯一 id）与 estimatedItemSize（典型项尺寸）',
      '需要感知滚动用 @scroll（原生透传）与 @visible-range-change（渲染窗口）',
    ],
    commonTasks: [
      '聊天记录/消息流窗口化渲染',
      '横向时间线/胶片轨道',
      '空列表兜底 + 窗口变化联动',
    ],
    generationNotes: [
      '滚动视口尺寸由使用方给定（height/width），组件不代设尺寸',
      'estimatedItemSize 只是估算：实测尺寸挂载后按键缓存自动收敛，无需手动重测',
      '窗口外项不在 DOM，不要依赖「全部项都在文档里」的选择器',
      'aria-label 建议必传：让滚动视口成为带名的 region 地标',
    ],
  },
}
