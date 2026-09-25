/**
 * Tabs 的组件契约元数据（ComponentDefinition）。
 * Tabs 为复合组件：Tabs/TabsList/TabsTrigger/TabsContent 组装使用，api 字段
 * 以「组件名.成员」限定命名；与 Tabs.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tabs',
  version: '0.1.0',
  identity: {
    name: 'Tabs',
    package: '@ui/components',
    export: 'Tabs',
    category: 'navigation',
    description:
      '纸面页签：同一上下文内的多视图切换（Tabs + TabsList + TabsTrigger + TabsContent 组装），line 下划线指示档位，自动激活式键盘导航（roving tabindex）。',
  },
  intent: {
    what: '在同级视图/数据切片间切换的页签组件，激活值可受控（v-model:value），仅渲染激活面板。',
    when: [
      '同屏同级内容的分组切换（概览 / 成员 / 设置）',
      '列表的数据切片切换（全部 / 未读 / 已归档）',
      '详情页内的区块切换，且希望 URL 外的单值状态驱动',
    ],
    whenNot: [
      '带步骤顺序的向导流程用 Steps：Tabs 无先后语义，可任意跳转',
      '全局/页面级导航用 Sidebar/Topbar：Tabs 作用于局部内容区，不承载路由层级',
      '展开/收起的折叠内容用未来的 Collapse：Tabs 是互斥切换，不是显隐',
    ],
    userTask: '用户需要在同一区域的几个平行视图之间快速切换',
  },
  api: {
    props: [
      { name: 'Tabs.value', type: 'string | number', description: '受控当前激活值（v-model:value）；与 TabsTrigger/TabsContent 的 value 配对。' },
      { name: 'Tabs.defaultValue', type: 'string | number', description: '非受控初始激活值；缺省时自动激活首个非 disabled 的 trigger。' },
      { name: 'Tabs.variant', type: "'line' | 'pill'", default: 'line', description: '视觉档位。line：底部基线 + accent 下划线指示；pill 为预留档位（类型已声明，视觉暂未实现）。' },
      { name: 'TabsTrigger.value', type: 'string | number', required: true, description: '与 TabsContent 配对的值；同时参与派生稳定元素 id。' },
      { name: 'TabsTrigger.disabled', type: 'boolean', default: 'false', description: '禁用该 tab：原生 disabled（移出 Tab 序），点击与键盘激活拦截，方向键导航跳过。' },
      { name: 'TabsContent.value', type: 'string | number', required: true, description: '与 TabsTrigger 配对的值；仅该值激活时渲染面板。' },
    ],
    slots: [
      { name: 'Tabs.default', description: 'TabsList 与 TabsContent 的组装位置（均应为直接子节点）。' },
      { name: 'TabsList.default', description: 'TabsTrigger 序列。' },
      { name: 'TabsTrigger.default', description: '标签文本/内容；应始终提供可读 label。' },
      { name: 'TabsContent.default', description: '面板内容，仅激活时渲染（v-if）。' },
    ],
    events: [
      { name: 'update:value', payload: 'string | number', description: '激活值变化（点击 trigger、←→↑↓/Home/End 移动即激活时发出；同值不重复发出）。v-model:value 绑定。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['TabsList/TabsTrigger/TabsContent 必须位于 <Tabs> 内（provide/inject 组装）'],
    conflicts: ['Steps（有序向导流程）', 'Sidebar/Topbar（页面级导航）'],
    dependsOn: ['@ui/tokens：--ui-* 视觉 token（使用方引入 paper.css）'],
  },
  composition: {
    patterns: ['Tabs > TabsList > TabsTrigger ×n + TabsContent ×n', 'Card 头部内嵌 Tabs 切换卡片体', '表单分区（基础 / 高级 / 权限）'],
    related: ['Card', 'Input', 'Table'],
    preferred: ['标签为名词短语（视图名），避免句子', '面板重渲染昂贵时依赖"仅激活渲染"语义天然懒加载'],
  },
  states: {
    default: 'line 档：trigger 透明底 text-2 文字 regular 字重，列表底部 1px 基线（--ui-border）。',
    hover: '非 disabled trigger 文字转 text-1（150ms token 动效）；下划线指示不变。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。',
    active: '激活 trigger：text-1 文字 + medium 字重提升 + 2px accent 下划线指示（inset 阴影实现，无布局位移），面板切换 180ms 内完成。',
    disabled: 'text-3 文字 + not-allowed 光标 + 原生 disabled（移出 Tab 序）；键盘导航跳过。',
  },
  accessibility:
    'WAI-ARIA Tabs 模式（automatic activation）：TabsList 为 role=tablist；TabsTrigger 为原生 button + role=tab + aria-selected + aria-controls（指向配对面板 id）；TabsContent 为 role=tabpanel + aria-labelledby（指向配对 trigger id）+ tabindex=0（空面板可聚焦）。id 由根 uid + value 确定性派生，SSR/重渲染稳定。roving tabindex：仅激活 trigger 在 Tab 序，其余 -1。键盘：←→↑↓ 在 trigger 间循环移动并即激活（跳过 disabled，preventDefault 防滚动）、Home/End 直达首末、Enter/Space 激活当前 trigger（keydown 统一 preventDefault 后单次触发）。Tab 从激活 trigger 直接移出到面板/后续内容。',
  ssr:
    'renderToString 无异常：setup/模块顶层不访问浏览器 API；focus() 仅在客户端事件回调执行。激活值（含自动激活首个）与全部 aria/id 在服务端即解析输出，客户端水合后契约一致。',
  performance:
    '仅激活面板渲染（v-if，天然懒加载/卸载）；无监听器、无测量、无定时器；状态为 computed 派生，trigger 注册表为数组快照更新。下划线指示用 inset box-shadow，无布局位移。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic 层（--ui-text-*/--ui-border/--ui-accent）、间距 --ui-space-*、字号 --ui-text-md、字重 --ui-font-weight-*、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入。基线 1px 与指示条 2px 为结构性细线（无 --ui-border-width token，需求已提出）。',
  examples: [
    "<Tabs v-model:value=\"active\">\n  <TabsList>\n    <TabsTrigger value=\"draft\">草稿</TabsTrigger>\n    <TabsTrigger value=\"published\">已发布</TabsTrigger>\n  </TabsList>\n  <TabsContent value=\"draft\">草稿列表…</TabsContent>\n  <TabsContent value=\"published\">已发布列表…</TabsContent>\n</Tabs>",
    "<Tabs :default-value=\"'all'\">\n  <TabsList aria-label=\"收件箱筛选\">\n    <TabsTrigger value=\"all\">全部</TabsTrigger>\n    <TabsTrigger value=\"unread\" :disabled=\"unread === 0\">未读</TabsTrigger>\n  </TabsList>\n  <TabsContent value=\"all\">…</TabsContent>\n  <TabsContent value=\"unread\">…</TabsContent>\n</Tabs>",
  ],
  agent: {
    keywords: ['tabs', '页签', '标签页', 'tab', 'tablist', 'tabpanel', '切换', 'switch view', 'v-model:value'],
    selectionHints: [
      '同级视图互斥切换 → Tabs；有序流程 → Steps；页面级导航 → Sidebar/Topbar',
      '需要受控时用 v-model:value；仅初始值用 defaultValue（自动激活首个非 disabled）',
      'TabsTrigger/TabsContent 以同名 value 配对，value 必填',
    ],
    commonTasks: ['详情页区块切换', '列表状态筛选页签', '设置页分组（基础/高级）'],
    generationNotes: [
      '四个部件必须组装在 <Tabs> 内，缺一失去 tab 语义',
      'variant="pill" 为预留档位，当前视觉与 line 基底一致但无下划线；优先用默认 line',
      'TabsList 上可传 aria-label 描述页签组用途（attrs 透传）',
      '不要在 TabsTrigger 里放导航链接语义（页签是内容切换，不是路由导航）',
    ],
  },
}
