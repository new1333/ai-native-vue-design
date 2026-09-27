/**
 * Breadcrumb 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Breadcrumb.types.ts 保持一致；states 与 Breadcrumb.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-breadcrumb',
  version: '0.1.0',
  identity: {
    name: 'Breadcrumb',
    package: '@ui/components',
    export: 'Breadcrumb',
    category: 'navigation',
    description:
      '纸面面包屑：层级路径展示（nav + ol/li），末项标记 aria-current="page"，items 超出 maxCount 时中间项折叠为省略号；有 href 的项渲染为原生链接（链接语义优先）。',
  },
  intent: {
    what: '把层级路径渲染为一行可回退的导航：items 数据驱动、a/button 语义项 + aria-hidden 分隔符、maxCount 中间折叠、itemClick 通报点击（可在 handler 内取消 <a> 跳转）。',
    when: [
      '多层级的页面/目录路径回退导航（首页 / 分类 / 详情）',
      '层级深、横向空间有限，需要折叠中间层（maxCount）',
      '需要向读屏暴露「当前页」语义（末项 aria-current="page"）',
      '项目需要链接语义（href）与自定义点击跟踪（itemClick）并存',
    ],
    whenNot: [
      '历史轨迹的「来时路」（后退栈）用浏览历史/Steps：Breadcrumb 表达的是层级归属，不是访问顺序',
      '同一上下文的平行视图切换用 Tabs：Breadcrumb 是树形路径，不是互斥页签',
      '离散数据页跳转用 Pagination：Breadcrumb 不是页码导航',
      '折叠项的展开下拉本期不提供：需要时用 item/separator 插槽自行扩展',
    ],
    userTask: '用户需要知道自己在层级结构的哪一层，并能一步回到上层',
  },
  api: {
    props: [
      { name: 'items', type: 'BreadcrumbItem[]', required: true, description: '数据源（有序，末项视为当前页）。项字段：key?（v-for 键，缺省回退前缀+index）、label（展示与可读名文本）、href?（有值渲染原生 <a>，无值渲染 <button type=button>）、disabled?（渲染 aria-disabled 的 span，不可聚焦不发 itemClick）。' },
      { name: 'maxCount', type: 'number', description: '最大可见槽位数（含省略号占位）：items 超出时渲染为首项 + 省略号 + 末尾 (maxCount-2) 项，末项永远保留；小于 3 收敛为 3，非整数向下取整；缺省不折叠。' },
      { name: 'separator', type: 'string', description: '文本分隔符（如 "/"）；缺省渲染内联 chevron 图标；separator 插槽优先于本属性。' },
    ],
    slots: [
      { name: 'item', scope: '{ item: BreadcrumbItem; index: number; isCurrent: boolean }', description: '自定义项渲染，替代默认的 a/button/span；交互语义（原生 a/button）由使用方保证。' },
      { name: 'separator', description: '自定义分隔符内容；容器为 aria-hidden 的 span，缺省渲染内联 chevron 图标（viewBox 0 0 24 24、stroke-width 1.5、currentColor）。' },
    ],
    events: [
      { name: 'itemClick', payload: '{ item: BreadcrumbItem; index: number; event: MouseEvent }', description: '点击非 disabled 项时在原生 click 阶段发出：<a> 项先于浏览器导航，handler 内可对 event.preventDefault() 取消跳转；<button> 项的键盘激活（Enter/Space）也经由同一 click 路径发出，不双触发。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: ['Tabs（平行视图切换）', 'Pagination（数据页跳转）', 'Steps（有序向导流程）'],
    dependsOn: ['@ui/tokens：--ui-* 视觉 token（使用方引入 paper.css）'],
  },
  composition: {
    patterns: ['详情页头部路径条（首页 / 分类 / 文档名）', '后台管理多级目录 + 页头标题组合', '与 DropdownMenu/Select 配合实现「上级跳转」折叠层'],
    related: ['Tabs', 'Pagination', 'DropdownMenu'],
    preferred: ['items 末项为当前页（不提供 href 也可以，渲染为 button）', '层级很深时给 maxCount，空间换稳定', '需要埋点时在 itemClick 统一处理，不要逐项包一层'],
  },
  states: {
    default: '链接/按钮项 text-2 文字、transparent 底、padding space-1/2；当前项 text-1 + medium 字重；分隔符与省略号 text-3（chevron 16px）。',
    hover: '非 disabled 非当前项文字转 text-1 + surface-muted 底（150ms token 动效）；当前项 hover 不变化；分隔符/省略号/disabled 不响应。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不设 tabindex。',
    active: '按压不引入缩放/位移；点击即发出 itemClick（<a> 项先于浏览器导航，可 preventDefault 取消）；键盘激活经同一 click 路径单次发出。',
    disabled: '渲染为 aria-disabled="true" 的 span：text-3 + not-allowed，移出可交互状态（不可聚焦、不发 itemClick、原生无 disabled 语义的链接不做假链接）。',
  },
  accessibility:
    'WAI-ARIA Breadcrumb 模式：根为 <nav aria-label="面包屑">（同名 attr 可被使用方覆写），内为 <ol>/<li> 列表语义；项为原生 <a href>（链接语义优先）/ <button type="button">（无 href）/ <span aria-disabled="true">（disabled）；末项标记 aria-current="page"，其余项不标记；分隔符与折叠省略号均为 aria-hidden 的非聚焦占位。键盘：Tab 依路径顺序逐项可达（原生 a/button，无 tabindex 覆写）；<button> 项 Enter/Space 在 keydown 统一 preventDefault 后派发一次真实 click（单次发出 itemClick，跨环境一致）；<a> 项不劫持键盘，Enter 走平台原生激活与导航。',
  ssr:
    'renderToString 无异常：折叠计算为纯 computed，setup 与模块顶层不访问任何浏览器 API；items/maxCount 推导的展示条目、aria-label、aria-current、aria-disabled、href、分隔符全部随 SSR 输出，客户端水合后契约一致。',
  performance:
    '无监听器、无测量、无定时器；displayEntries 为 computed 派生（O(items)），items/maxCount 响应式变化即时重算；动效仅 color/background-color 过渡（--ui-motion-fast + --ui-ease-out），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic 层（--ui-text-1/2/3、--ui-surface-muted）、间距 --ui-space-1/2、字号 --ui-text-sm、行高 --ui-leading-small、字重 --ui-font-weight-*、动效 --ui-motion-fast/--ui-ease-out；图标为内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor、16px 档）。无全局 CSS 引入；列表/按钮的结构性重置（margin/padding/border/background 清零）不承担视觉取值。',
  examples: [
    "<Breadcrumb :items=\"[\n  { key: 'home', label: '首页', href: '/' },\n  { key: 'docs', label: '文档', href: '/docs' },\n  { key: 'current', label: '面包屑' },\n]\" @item-click=\"track\" />",
    "<Breadcrumb :items=\"deepItems\" :max-count=\"4\" />（深层路径：首项 + … + 末尾两项）",
    "<Breadcrumb :items=\"items\" separator=\"/\" />（文本分隔符；或 <template #separator> 自定义）",
    "<Breadcrumb :items=\"items\"><template #item=\"{ item, isCurrent }\"><RouterLink :to=\"item.href!\" :aria-current=\"isCurrent ? 'page' : undefined\">{{ item.label }}</RouterLink></template></Breadcrumb>（配合路由器）",
  ],
  agent: {
    keywords: ['breadcrumb', '面包屑', '路径', '层级', '导航', 'navigation', 'aria-current', 'maxCount', '折叠', '省略号', '回退'],
    selectionHints: [
      '层级归属路径 → Breadcrumb；平行视图切换 → Tabs；访问顺序/流程 → Steps',
      '有 href 的项渲染为原生 <a>（链接语义优先），无 href 渲染 <button>（点击发 itemClick）',
      '层级深时传 maxCount（可见槽位数，含省略号，最小 3）；末项（当前页）永远保留',
      '取消 <a> 跳转：在 itemClick handler 内 event.preventDefault()',
    ],
    commonTasks: ['详情页路径条', '多级目录回退导航', '深层路径折叠展示'],
    generationNotes: [
      'items 为必填数据源；末项自动获得 aria-current="page"，不要手动加',
      'disabled 项渲染为 aria-disabled 的 span（链接不做假禁用），不可聚焦、不发 itemClick',
      '分隔符与省略号均为 aria-hidden 装饰，读屏只读 ol 内的真实项',
      'item 插槽接管渲染后交互语义（原生 a/button）由使用方负责',
      'nav 的 aria-label 默认「面包屑」，多面包屑并存时用同名 attr 区分',
    ],
  },
}
