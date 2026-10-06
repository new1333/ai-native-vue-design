/**
 * Suggestion 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Suggestion.types.ts 保持一致；states 与 Suggestion.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-suggestion',
  version: '0.2.0',
  identity: {
    name: 'Suggestion',
    package: '@ui/components',
    export: 'Suggestion',
    category: 'inputs',
    description: 'AI 建议追问 chips：推荐提示词以原生 button chips 呈现，点击/键盘激活上抛 select，由使用方将 value 回填输入框继续追问。',
  },
  intent: {
    what: '一组推荐提示词（追问/续写建议）chips：横向换行排布，点击选中即上抛完整建议项，不自行管理输入框内容；items 为空时渲染空态（#empty 插槽或缺省文案「暂无建议」）。',
    when: [
      'AI 会话中展示推荐追问 / 引导提示词，点击回填输入框',
      '空态首屏给用户「可以从这里开始」的示例问题',
      '回答结束后给出后续可追问方向（follow-up suggestions）',
      '需要拦截全部选中路径的生成中态（loading）与禁用态（整组/单项）',
    ],
    whenNot: [
      '输入过程中的实时联想补全用 AutoComplete：Suggestion 是静态推荐 chips，不随输入过滤、不带下拉浮层',
      '需要选中后组件内部持久高亮/多选的表达用 Tag/ToggleGroup：Suggestion 上抛即止，不承载选中态',
      '导航跳转用链接类组件：Suggestion 的 chip 是原生 button（动作语义），不渲染 href',
      '纵向长列表推荐位不做：仅提供横向自动换行的单行流布局',
    ],
    userTask: '用户点击一条推荐提示词，将其回填到输入框（PromptInput）继续追问',
  },
  api: {
    props: [
      { name: 'items', type: 'SuggestionItem[]', required: true, description: '建议项数据源；item 为 { label, value, disabled? }，label 为 chip 展示文案，value 为回填输入框的载荷且 items 内需唯一（用作 key），disabled 禁用该条。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整组：全部 chips 原生 disabled（移出 Tab 序），点击与 Enter/Space 均不上抛 select。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中（建议生成期间）：根级 aria-busy="true"，拦截一切选中路径，但 chips 保持可聚焦、不置原生 disabled。' },
    ],
    slots: [
      { name: 'default', description: '前置内容：渲染在 chips 之前的标题/说明（如「推荐追问」标签）；未提供时不渲染前置区。' },
      { name: 'item', scope: '{ item: SuggestionItem; index: number }', description: '单个 chip 内容：按条目作用域定制（如加图标）；缺省渲染 item.label。' },
      { name: 'empty', description: 'items 为空时的空态内容；缺省渲染默认空态文案「暂无建议」（弱文字，观感对齐 select/autocomplete 家族空态先例）。' },
    ],
    events: [
      { name: 'select', payload: 'SuggestionItem', description: '选中一条建议（点击或键盘 Enter/Space）：载荷为被点击的建议项；由使用方将 item.value 回填输入框。disabled/loading/单项禁用时一律不触发。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: ['AutoComplete（输入过程实时联想）', 'Tag/ToggleGroup（持久选中态表达）'],
  },
  composition: {
    patterns: ['与输入框（PromptInput/TextArea）组合：select 回调内写入输入框值并聚焦', 'AI 回答结束后展示 follow-up 追问 chips', '空态首屏的示例问题引导'],
    related: ['AutoComplete', 'Input', 'TextArea'],
    preferred: ['value 直接给出可发送的完整提示词，避免使用方二次拼接', 'chips 一屏内换行流式排布，不宜过多（≤6 条）'],
  },
  states: {
    default: 'chip：surface 底 + line 描边 + text-2 文字，radius-md 圆角，text-sm 字号；前置内容 text-2 小字；items 为空时空态弱文字（text-3 + text-sm，缺省文案「暂无建议」，#empty 插槽可定制）。',
    hover: 'chip 转 surface-muted 底 + 深描边（border-strong）+ text-1 文字；disabled 项不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不改 tabindex。',
    active: '在 hover 基础上 transform: scale(0.98)（≤2% 缩放，token 动效）；disabled 无按压反馈。',
    disabled: '灰化：surface-muted 底 + line 描边 + text-3 文字 + not-allowed 光标。整组禁用（props.disabled）与单项禁用（item.disabled）均落原生 disabled 属性、移出 Tab 序。',
    loading: '建议生成期间：根级 aria-busy="true"，点击与 Enter/Space 一律不上抛 select；chips 保持可聚焦、不置原生 disabled、不加旋转指示（生成状态由使用方在前置内容或输入框侧表达）。',
  },
  accessibility:
    '根容器 role="group"（可经 attrs 提供 aria-label 命名分组），chips 为原生 <button>（隐式 role=button），Tab 逐个进入/移出，Enter/Space 激活；keydown 阶段对激活键统一 preventDefault 后上抛 select，保证各环境单次选中且 Space 不滚动页面。loading 置根级 aria-busy="true" 且不置 disabled（保持焦点与读屏可达）；整组/单项禁用均用原生 disabled 而非 aria-disabled。item 插槽内容仍由原生 button 包裹，保持可读 label。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；select/焦点逻辑仅出现在客户端事件回调内；items 渲染、disabled、aria-busy、前置内容与 item 插槽均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器、无浮层；仅 computed 派生 aria 与 chips 平铺渲染，选中闸门为纯函数。动效只有 background-color/border-color/color/transform 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic 层（surface/surface-muted/border/border-strong/text-1/2/3）、间距 --ui-space-*、圆角 --ui-radius-md、字号 --ui-text-sm、动效 --ui-motion-*/--ui-ease-out。chips 间距由 --ui-space-* gap 提供；空态为 text-3 弱文字（对齐 select/autocomplete 家族空态先例）；无全局 CSS 引入；描边宽度 1px 为结构性细线（无 --ui-border-width token，已提出需求）。',
  examples: [
    "<Suggestion :items='items' @select='(item) => (draft = item.value)' />",
    "<Suggestion :items='items' aria-label='推荐追问'>\n  <template #default>推荐追问</template>\n  <template #item='{ item }'>{{ item.label }}</template>\n</Suggestion>",
    "<Suggestion :items='items' :loading='generating' :disabled='ended' @select='apply' />",
    "<Suggestion :items='[]'>\n  <template #empty>正在生成建议…</template>\n</Suggestion>",
    "<Suggestion :items='[\n  { label: \"总结要点\", value: \"请总结本次讨论的要点\" },\n  { label: \"给出示例\", value: \"请给出一个可运行的示例\", disabled: true },\n]' @select='apply' />",
  ],
  agent: {
    keywords: ['suggestion', '建议', '追问', '推荐提示词', '推荐问题', 'chips', 'prompts', 'follow-up', '回填', 'AI 会话', '快捷提问', '引导'],
    selectionHints: [
      'AI 会话推荐追问/引导提示词 → Suggestion；输入过程实时联想 → AutoComplete',
      'select 回调内把 item.value 写入输入框（PromptInput/TextArea）并聚焦，不要在 Suggestion 内做回填',
      '生成建议期间置 :loading；会话结束后可整组 :disabled',
    ],
    commonTasks: [
      '回答结束后的 follow-up 追问 chips',
      '空态首屏示例问题引导',
      '生成中/已结束状态下禁用选中',
    ],
    generationNotes: [
      'items.value 需唯一（用作 key），并直接给出可发送的完整提示词',
      '组件不持有选中态：高亮/回填/发送全部由使用方在 @select 中处理',
      'chip 内容定制走 #item 作用域插槽；标题/说明走 #default；空态定制走 #empty（缺省文案「暂无建议」）',
      '不要用 Suggestion 承载导航链接或多选标签',
    ],
  },
}
