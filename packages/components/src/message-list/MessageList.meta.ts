/**
 * MessageList 的组件契约元数据（ComponentDefinition）。
 * api 字段与 MessageList.types.ts 保持一致；states 与 MessageList.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-message-list',
  version: '0.1.0',
  identity: {
    name: 'MessageList',
    package: '@ui/components',
    export: 'MessageList',
    category: 'data',
    description: '纸面 AI 会话消息列表：role="log" 滚动容器 + 贴底自动滚动（离开贴底区不打扰）、scroll/nearBottom/loadMore 事件、空态复用 EmptyState；支持 messages 数据模式与默认插槽分发两种内容来源。',
  },
  intent: {
    what: '以可滚动视口承载 AI 会话消息流：内容更新后仅在贴底时自动跟随新消息，滚动位置变化以 scroll/nearBottom/loadMore 事件透出，消息渲染完全交给 default 插槽。',
    when: [
      'AI 会话/聊天界面：用户与助手消息流，新消息到达时贴底跟随',
      '需要感知「是否贴底」驱动回到底部按钮、新消息提示（nearBottom 事件）',
      '滚动到顶部加载更早历史消息（loadMore 事件）',
      '消息气泡/卡片渲染需要完全自定义（default 插槽逐条渲染或直接分发内容）',
    ],
    whenNot: [
      '千条以上长会话的窗口化渲染用 VirtualList 承担（本组件全量渲染消息条目，windowing 不在此做）',
      '需要行列结构/表头的数据展示用 Table',
      '需要输入框、发送按钮的完整对话区，用 PromptInput/组合块承载，本组件只负责消息列表',
      '非追加型、无贴底跟随诉求的静态排版列表直接 v-for 即可',
    ],
    userTask: '用户需要滚动浏览一段 AI 会话，并让最新消息保持可见',
  },
  api: {
    props: [
      { name: 'messages', type: 'T[]', default: 'undefined', description: '消息数据（数据模式）：提供时逐条渲染，每条经 default 插槽（scope { message, index }）渲染；未提供（undefined）时为分发模式，默认插槽内容原样渲染进滚动容器。显式传 [] 即数据模式空态。' },
      { name: 'autoScroll', type: 'boolean', default: 'true', description: '贴底自动滚动：仅当视口处于贴底阈值内时，内容更新后定位到底部；挂载首帧同样贴底定位。用户向上翻阅离开贴底区后不再自动滚动。' },
      { name: 'nearBottomThreshold', type: 'number', default: '48（MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT）', description: '贴底判定阈值（px）：视口底边距内容底部 ≤ 该值视为贴底，autoScroll 才会跟随。' },
      { name: 'messageKey', type: '(message: T, index: number) => string | number', default: '回落渲染下标', description: '消息稳定键（数据模式）：v-for DOM 复用依据；loadMore 前插历史时强烈建议提供业务唯一键，否则整列表按下标重建。' },
    ],
    slots: [
      { name: 'default', scope: '{ message: T, index: number }', description: '数据模式下逐条消息插槽（如 #default="{ message }" 渲染气泡）；缺省对 string/number 消息渲染其文本。分发模式（未提供 messages）下为原样分发的内容区，作用域不消费。' },
      { name: 'empty', description: '空态内容；仅在无消息可渲染时出现，缺省渲染 EmptyState（title「暂无消息」）。' },
    ],
    events: [
      { name: 'scroll', payload: 'Event（原生 scroll 事件）', description: '原生滚动透传：组件不劫持滚动（不 preventDefault、不代写 scrollTop），仅原样转发以便埋点/联动。' },
      { name: 'nearBottom', payload: 'boolean', description: '贴底状态播报：挂载首帧播报一次初始值，此后仅在进入/离开贴底区（状态翻转）时发出；true = 贴底。可驱动「回到底部」按钮/新消息提示的显隐。' },
      { name: 'loadMore', payload: '无', description: '滚动接近顶部：进入顶部触发区（scrollTop ≤ MESSAGE_LIST_LOAD_MORE_THRESHOLD=32px）时发出一次，离开后再次进入才会再发；加载中的指示与去重由使用方处理。' },
    ],
    exposes: [
      { name: 'scrollToBottom', type: '() => void', description: '立即定位到滚动容器底部（即时赋值 scrollTop，不做平滑动画）；典型用于「回到底部」按钮。' },
    ],
  },
  constraints: {
    requires: ['消费方为滚动视口给定高度（style/class），否则内容自然高度不产生滚动', '@ui/tokens/paper.css（使用方应用入口一次性引入）'],
    dependsOn: ['@ui/tokens/paper.css', 'empty-state（空态缺省渲染 EmptyState）'],
  },
  composition: {
    patterns: ['MessageList + PromptInput 组成对话区', 'MessageList + loadMore 前插历史消息（建议配 messageKey）', 'nearBottom 事件驱动「回到底部」浮标 + expose.scrollToBottom', 'empty 插槽内嵌 EmptyState + 起始建议操作'],
    related: ['VirtualList', 'EmptyState', 'PromptInput', 'Spinner'],
    preferred: [
      'messages 提供唯一稳定键（messageKey），尤其在使用 loadMore 前插历史时',
      '贴底跟随交给组件，外部只消费 nearBottom 做提示显隐，不自行测量滚动位置',
      '消息气泡视觉在 default 插槽内用 token 自行组合（区分 user/assistant 角色）',
    ],
  },
  states: {
    default: '滚动视口原生滚动；消息逐条渲染（数据模式）或插槽分发（分发模式），条目间 --ui-space-2 纵向节奏；贴底时新消息自动跟随。',
    hover: '无内置条目 hover 态：消息内容完全由 default 插槽决定，hover 交互属于插槽内容。',
    focusVisible: '滚动视口 tabindex="0" 可聚焦，焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。聚焦后方向键/PageUp/PageDown 由浏览器原生滚动视口。',
    active: '无按压态；滚动行为全部交还原生。',
    disabled: '无禁用态：会话消息列表是数据容器，无禁用语义（meta.intent.whenNot 已声明）。',
    loading: '无内置 loading 态：loadMore 触发的加载指示由使用方在消息内容中自行渲染（如临时插入的加载条目）；列表为空期间走 empty 插槽（缺省 EmptyState）。',
  },
  accessibility:
    '滚动视口为原生可滚动元素，role="log"（WAI-ARIA 聊天日志模式：region 子类，隐式 aria-live=polite，新消息礼貌播报）+ tabindex="0"（键盘用户 Tab 进入后用方向键/PageUp/PageDown 原生滚动，组件不监听、不拦截任何按键）；aria-label 等属性透传到滚动容器（建议传入如「会话消息」帮助定位地标）；消息条目为普通容器，条目语义由 default 插槽内容自带；空态缺省渲染 EmptyState（图标 + 标题文本）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；scroll 监听绑定、首帧贴底定位全部在 onMounted（attach）执行并在 onBeforeUnmount 清理（detach）；内容跟随挂在 onUpdated（客户端专属生命周期）；SSR 输出包含 role="log" 视口、消息条目与空态（scrollTop 服务端无法设置，首屏贴底定位发生在客户端挂载后）。',
  performance:
    '贴底判定为 O(1) 布局读取（scrollHeight/scrollTop/clientHeight），仅在 scroll（passive 监听）与更新后触发；nearBottom/loadMore 均为边沿语义（翻转/进入触发），不随滚动连续发射；全量渲染消息条目并用 messageKey 复用 DOM——千条以内会话可用，更长会话的窗口化由 VirtualList 承担。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：视口 overflow 原生滚动、字体 --ui-font-sans/--ui-text-sm/--ui-leading-body/--ui-text-1、条目间距 --ui-space-2、空态包裹 --ui-space-6/--ui-space-4（EmptyState 自带配色）；无全局 CSS 引入；焦点环交给全局 :focus-visible；贴底阈值（48px）/loadMore 触发距离（32px）为滚动判定逻辑常量，非视觉值。',
  examples: [
    "<MessageList\n  :messages=\"messages\"\n  :message-key=\"(m) => m.id\"\n  aria-label=\"会话消息\"\n  @near-bottom=\"onNearBottom\"\n>\n  <template #default=\"{ message }\">\n    <MessageBubble :message=\"message\" />\n  </template>\n</MessageList>",
    "<MessageList :messages=\"messages\" :auto-scroll=\"false\">\n  <template #default=\"{ message }\">{{ message.content }}</template>\n  <template #empty>还没有对话，说点什么吧</template>\n</MessageList>",
    "<MessageList @load-more=\"loadHistory\">\n  <MessageBubble v-for=\"m in local\" :key=\"m.id\" :message=\"m\" />\n</MessageList>",
    "<MessageList ref=\"list\" :messages=\"messages\" />\n<!-- list.value.scrollToBottom() 回到最新消息 -->",
  ],
  agent: {
    keywords: ['message list', '消息列表', '会话', 'conversation', 'chat', '聊天记录', '贴底', '自动滚动', 'auto scroll', 'scroll to bottom', 'log', 'load more', '加载更多', 'near bottom'],
    selectionHints: [
      'AI 会话消息流 + 贴底跟随 → MessageList；千条以上长会话窗口化 → VirtualList 承担渲染',
      '贴底状态用 @near-bottom 感知（不要自行测量滚动位置），回到底部用 expose 的 scrollToBottom',
      '滚动到顶部加载历史用 @load-more，并配 messageKey 稳定键',
      'messages 逐条渲染配 #default="{ message }"；不传 messages 则默认插槽直接分发内容',
    ],
    commonTasks: [
      'AI 对话界面的消息流容器（气泡由插槽自定义）',
      '贴底跟随 + 「回到底部」浮标',
      '滚动到顶部加载更早历史消息',
      '空会话占位（EmptyState / empty 插槽）',
    ],
    generationNotes: [
      '滚动视口高度由使用方给定（如 style="height: …"），组件不代设尺寸',
      'autoScroll 默认开启且只在贴底时跟随：用户上翻后组件不再打扰，需回到底部时调 scrollToBottom()',
      'loadMore 为边沿触发：进入顶部区域发一次，离开后再次进入才会再发，请自行做加载中去重',
      '空态缺省渲染 EmptyState；需要自定义占位（如推荐问题）用 #empty',
      '本组件不做虚拟化：超长会话请改用 VirtualList 承载渲染',
    ],
  },
}
