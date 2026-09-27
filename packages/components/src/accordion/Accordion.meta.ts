/**
 * Accordion 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Accordion.types.ts 保持一致；states 与 Accordion.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-accordion',
  version: '0.1.0',
  identity: {
    name: 'Accordion',
    package: '@ui/components',
    export: 'Accordion',
    category: 'general',
    description: '纸面手风琴：items 驱动的分段展开收起容器，支持单开（默认）与多开（multiple）两种模式，头部原生 button + roving tabindex，键盘路径遵循 WAI-ARIA Accordion 模式。',
  },
  intent: {
    what: '把一组同构的「标题 + 详情」条目组织为分段展开收起的手风琴：默认单开（同时至多一个面板展开），multiple 时多开；条目由 items 数据驱动，标题/图标/正文均提供作用域插槽定制。',
    when: [
      'FAQ、帮助中心的问答分节展示',
      '设置页/详情页的分组信息按需展开，避免长页滚动',
      '侧栏或面板内的分段导航与说明（步骤、条款、规格）',
      '同一视图内只关注一个分节的场景（单开模式自带互斥）',
    ],
    whenNot: [
      '需要多级嵌套/树形层级的分组：Accordion 只做单层条目，嵌套分组应由使用方组合或用 Tree 类组件（本库当前未提供）',
      '内容需要常驻展示、不允许收起的分节：用 Card/分区排版，不要折叠',
      '条目头部要承载复杂交互内容（按钮组、表单控件）：Accordion 头部是单一展开开关，复杂交互内容应放进面板 default 插槽',
      '需要面板高度过渡动画（height auto 展开）的场景：本组件只做 opacity + ≤4px 位移的揭示动效，不做高度测量动画',
    ],
    userTask: '用户按需展开某个分节阅读详情，收起其余分节以保持页面安静',
  },
  api: {
    props: [
      { name: 'items', type: 'AccordionItem[]', required: true, description: '条目数据源；每项 { key, title, content?, disabled? }，key 需在 items 内唯一。' },
      { name: 'modelValue', type: 'AccordionItemKey | AccordionItemKey[] | null', description: '当前展开值：单开为 key | null，多开为 keys 数组（按 items 顺序规范化）。提供时为受控模式（只 emit 不自行改状态）；缺省为非受控（内部持有，初始全部收起）。不属于 items 的 key 不参与渲染，切换时被规范化移除。' },
      { name: 'multiple', type: 'boolean', default: 'false', description: '多开模式：允许多个面板同时展开，展开值为 keys 数组；默认单开（展开新条目时收起其余，允许全部收起）。' },
    ],
    slots: [
      { name: 'default', scope: '{ item: AccordionItem; index: number; expanded: boolean }', description: '面板正文：按条目作用域定制任意内容；缺省渲染 item.content。' },
      { name: 'title', scope: '{ item: AccordionItem; index: number; expanded: boolean }', description: '头部标题：按条目作用域定制；缺省渲染 item.title。头部是单一展开开关，不要在标题内放交互控件。' },
      { name: 'icon', scope: '{ item: AccordionItem; index: number; expanded: boolean }', description: '头部图标：按条目作用域定制；缺省渲染随展开状态翻转的内联 chevron（aria-hidden）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'AccordionItemKey | AccordionItemKey[] | null', description: '展开值变化：携带切换后的完整展开值（形态随 multiple 而定）；受控/非受控均触发。' },
      { name: 'change', payload: '{ key: AccordionItemKey; expanded: boolean; value: AccordionModelValue }', description: '条目展开状态被切换：被切换条目的 key、切换后的展开状态与完整展开值；禁用条目不触发。' },
    ],
    exposes: [],
  },
  constraints: {
    dependsOn: ['@ui/tokens/paper.css（使用方入口一次性引入）'],
  },
  composition: {
    patterns: [
      'FAQ 分节：Accordion + 作用域 #title 放序号/问题 + #default 放答案',
      '设置分组：单开模式逐节展开配置说明',
      '受控联动：v-model 绑定展开 keys，与页面其他状态（如锚点定位）同步展开',
    ],
    related: ['Card', 'Button', 'Typography'],
    preferred: [
      '条目内再放内容组件（列表、表格、Typography）而非塞进标题',
      '同屏多个手风琴段之间保持模式一致（单开/多开不混用语义）',
      '需要持久化展开状态时用 v-model 受控',
    ],
  },
  states: {
    default: '条目为 surface 面 + 1px --ui-border 描边 + radius-sm 圆角，条目间 8px 间距；头部 12/16px 内边距、text-md/medium/--ui-text-1；面板正文 --ui-text-2；展开条目描边加深一档（--ui-border-strong）、图标翻转。',
    hover: '头部底色转 --ui-surface-muted（禁用条目不响应 hover）。',
    focusVisible: '头部获得焦点时由全局 :focus-visible 约定呈现焦点环（2px --ui-accent 实线 + 2px 偏移）；组件不改写 outline；同一时刻恰有一个头部在 Tab 序（roving tabindex，默认首个可用条目）。',
    active: '无按压缩放反馈：展开/收起本身就是明确的状态反馈，不叠加 active 形变。',
    disabled: '禁用条目：头部原生 disabled（移出 roving tabindex 焦点环与 Tab 序），文字/图标转 --ui-text-3，点击与键盘激活一律无效，键盘导航自动跳过。',
  },
  accessibility:
    '遵循 WAI-ARIA Accordion 模式：每个头部为原生 <button type="button">，带 aria-expanded（true/false）与 aria-controls 指向面板 id；面板为 role="region" + aria-labelledby 回指头部 id，收起时以 hidden 属性整体移出可达性树；头部间 roving tabindex（同一时刻仅一个 tabindex=0），Enter/Space 切换展开，ArrowDown/ArrowUp 在头部间循环移动焦点（跳过禁用项），Home/End 直达首/尾可用头部，以上按键均 preventDefault；禁用条目用原生 disabled；缺省 chevron 图标 aria-hidden="true"。组件不强制标题层级（不在头部外渲染 h1-h6 包裹），如需标题语义由使用方在条目外部提供。',
  ssr:
    'renderToString 无异常：aria 关联 id 由 useId 生成（SSR/水合安全），setup 与模块顶层不访问浏览器 API；focus 等 DOM 操作只发生在客户端事件回调与键盘导航内；aria-expanded、aria-controls、role="region"、hidden（收起面板）与展开状态修饰类均随 SSR 输出，服务端即可表达初始展开状态（受控传入 modelValue）。',
  performance:
    '无测量、无定时器、无手动监听器（事件均经 Vue 模板绑定）；展开状态为一个 Set 的 computed 派生 + roving tabindex computed；动效为纯 CSS opacity/transform（时长 --ui-motion-default），prefers-reduced-motion 下随 token 归零立即呈现。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：条目面 --ui-surface、描边 --ui-border/--ui-border-strong、圆角 --ui-radius-sm、间距 --ui-space-2/3/4、字号 --ui-text-md、字重 --ui-font-weight-medium、文字 --ui-text-1/2/3、动效 --ui-motion-default + --ui-ease-out。无全局 CSS 引入；图标为内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor、16px 档）。',
  examples: [
    "<Accordion :items=\"[\n  { key: 'basic', title: '基础用法', content: '……' },\n  { key: 'adv', title: '进阶用法', content: '……' },\n]\"></Accordion>",
    "<Accordion v-model=\"openKeys\" multiple :items=\"items\"></Accordion>",
    "<Accordion :items=\"items\">\n  <template #title=\"{ item, expanded }\">{{ expanded ? '▾' : '▸' }} {{ item.title }}</template>\n  <template #default=\"{ item }\"><Detail :data=\"byKey[item.key]\"></Detail></template>\n</Accordion>",
    "<Accordion :items=\"items.filter(i => !i.locked)\"></Accordion> // 禁用项：{ key, title, disabled: true }",
  ],
  agent: {
    keywords: ['accordion', '手风琴', '折叠面板', 'collapse', '展开', '收起', '展开收起', '分段', 'FAQ', '单开', '多开', 'multiple'],
    selectionHints: [
      '分段展开收起且同一时刻关注一个分节 → Accordion（默认单开）',
      '允许多节同时展开（对照阅读）→ multiple',
      '内容常驻不折叠 → Card；浮层内分组 → Dialog/Popover 体系',
      '需要树形/嵌套分组 → 本组件不做，使用方自行组合',
    ],
    commonTasks: ['FAQ 问答分节', '设置页分组说明', '详情页规格分段展开'],
    generationNotes: [
      'items 必填且 key 需唯一；key 同时是 aria 关联 id 的一部分，建议用语义化短横线字符串',
      '受控时 v-model 绑定：单开绑 key|null，多开绑 keys 数组；只绑定不监听 update:modelValue 会导致界面不动',
      '多开展开值按 items 顺序规范化；modelValue 中不属于 items 的 key 不参与渲染，切换时被移除',
      '禁用条目用 item.disabled，不要在插槽里自行拦截点击',
      '面板内容由 #default 作用域插槽定制（可放任意组件），缺省用 item.content 纯文本',
    ],
  },
}
