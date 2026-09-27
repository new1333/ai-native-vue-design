/**
 * Menu 的组件契约元数据（ComponentDefinition）。
 * Menu 为复合组件：Menu/MenuItem/SubMenu 组合使用（或 items 数据驱动），
 * api 字段以「组件名.成员」限定命名；与 Menu.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-menu',
  version: '0.1.0',
  identity: {
    name: 'Menu',
    package: '@ui/components',
    export: 'Menu',
    category: 'navigation',
    description:
      '纸面导航菜单：纵向/横向站点导航（Menu + MenuItem + SubMenu 组合，或 items 数据驱动），aria-current 标记当前项，roving tabindex 键盘导航；区别于 dropdown-menu 的动作菜单。',
  },
  intent: {
    what: '站点/区块级的导航菜单组件，mode 控制纵向侧边栏或横向顶栏形态，激活项受控（v-model:modelValue），子级经 SubMenu 折叠展开。',
    when: [
      '侧边栏站点导航（多层级信息架构，collapsed 图标栏收起态）',
      '顶栏横向主导航（mode="horizontal"，一级项 + 下拉子菜单）',
      '文档/控制台等应用外壳的区块导航（区别于 Tabs 的局部视图切换）',
    ],
    whenNot: [
      '动作菜单（复制/删除等命令集合）用 dropdown-menu：Menu 是位置导航不是动作触发器',
      '同屏同级内容的视图切换用 Tabs：Menu 不承载面板，只有导航语义',
      '有序向导流程用 Steps：Menu 无先后语义',
    ],
    userTask: '用户需要在站点的多个页面/区块之间导航，并知道当前所在位置',
  },
  api: {
    props: [
      { name: 'Menu.mode', type: "'horizontal' | 'vertical'", default: 'vertical', description: '导航方向档位：vertical 纵向侧边栏（子菜单内联手风琴）；horizontal 横向顶栏（子菜单下弹）。' },
      { name: 'Menu.items', type: 'MenuOption[]', description: '数据驱动菜单项（value/label/disabled/children）；提供时忽略默认插槽，与组合式二选一。children 非空渲染为 SubMenu（组节点不可选中）。' },
      { name: 'Menu.modelValue', type: 'string | number', description: '受控当前激活项（v-model:modelValue）；仅叶子 MenuItem 可成为激活项。' },
      { name: 'Menu.defaultValue', type: 'string | number', description: '非受控初始激活项；缺省时无激活项（导航菜单不自动选中首项），aria-current 缺席。' },
      { name: 'Menu.collapsed', type: 'boolean', default: 'false', description: '图标栏收起态（仅 mode="vertical" 生效，horizontal 下忽略并告警）：宽度收窄为图标栏，label 视觉隐藏但仍可读，子菜单右侧飞出。收起态预期各项提供图标。' },
      { name: 'MenuItem.value', type: 'string | number', required: true, description: '项标识：与 Menu.modelValue 匹配成为激活项。' },
      { name: 'MenuItem.disabled', type: 'boolean', default: 'false', description: '禁用该项：原生 disabled（移出 Tab 序），点击与键盘激活拦截，方向键导航跳过。' },
      { name: 'SubMenu.value', type: 'string | number', required: true, description: '组标识：参与触发器/面板 id 派生；组节点不可选中。' },
      { name: 'SubMenu.title', type: 'string', description: '触发器文本；未提供 title 时必须用 #title 插槽，否则触发器无可读名（告警）。' },
      { name: 'SubMenu.disabled', type: 'boolean', default: 'false', description: '禁用该组：触发器原生 disabled，无法展开/收起。' },
    ],
    slots: [
      { name: 'Menu.default', description: '组合式用法：MenuItem / SubMenu 的组装位置；提供 items 时忽略。' },
      { name: 'Menu.item', scope: '{ item: MenuOption, active: boolean, disabled: boolean }', description: 'items 模式：覆盖叶子项内容。' },
      { name: 'Menu.icon', scope: '{ item: MenuOption }', description: 'items 模式：项图标（叶子项与组触发器共用）。' },
      { name: 'MenuItem.default', description: '项文本/内容；应始终提供可读 label。' },
      { name: 'MenuItem.icon', description: '项图标（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor）。' },
      { name: 'SubMenu.default', description: '嵌套的 MenuItem / SubMenu 子级。' },
      { name: 'SubMenu.title', description: '触发器文本（覆盖 title prop）。' },
      { name: 'SubMenu.icon', description: '触发器图标。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string | number', description: '激活项变化：用户点击或 Enter/Space 激活叶子项时发出（同值不重复发出）。v-model:modelValue 绑定。' },
      { name: 'select', payload: 'string | number', description: '用户选中叶子项时发出（与 update:modelValue 同点触发，供纯事件监听方使用）。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['MenuItem/SubMenu 必须位于 <Menu> 内（provide/inject 组装）', 'SubMenu 触发器需 title prop 或 #title 插槽提供可读名'],
    conflicts: ['dropdown-menu（动作菜单）', 'Tabs（局部视图切换）', 'Steps（有序流程）'],
    dependsOn: ['@ui/tokens：--ui-* 视觉 token（使用方引入 paper.css）'],
  },
  composition: {
    patterns: ['Menu > MenuItem ×n + SubMenu > MenuItem ×n（侧边栏多级导航）', 'Menu mode="horizontal" 作顶栏主导航', 'items 数组驱动 + #item/#icon 作用域插槽定制', 'collapsed 图标栏 + 应用外壳（配合 Tooltip 提示全名）'],
    related: ['Tabs', 'DropdownMenu', 'Card'],
    preferred: ['激活项由路由/位置状态经 v-model:modelValue 驱动，select 仅作监听', '层级建议不超过三层，深层信息架构优先重组', '收起态给每个 MenuItem/SubMenu 配图标，保证图标栏可辨识'],
  },
  states: {
    default: '项透明底 text-2 文字 regular 字重、radius-sm 圆角；无激活项时不自动选中（defaultValue 未给时 aria-current 缺席）。',
    hover: '非 disabled 项转 surface-muted 底 + text-1 文字（150ms token 动效）。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。',
    active: '激活项（aria-current="page"）：accent-soft 底 + text-1 文字 + medium 字重提升；组触发器展开时 chevron 旋转 180°（150ms token 动效）。',
    disabled: 'text-3 文字 + not-allowed 光标 + 原生 disabled（移出 Tab 序）；方向键导航跳过；disabled 组无法展开。',
  },
  accessibility:
    'nav 地标（原生 <nav>，可传 aria-label）+ 原生列表语义（ul/li），交互元素为原生 button（disclosure 导航模式增强 roving tabindex）。激活项 button 带 aria-current="page"；SubMenu 触发器带 aria-expanded 与 aria-controls（指向面板稳定 id），面板 ul 以 aria-labelledby 指回触发器；id 由根 uid + value 确定性派生，SSR 稳定。roving tabindex：可见可用项中激活项优先留在 Tab 序，否则首个；收起组内项移出导航池。键盘：←→↑↓ 在可见可用项间循环移动焦点（同时覆盖横向 ↑↓ 与纵向 ←→ 两轴）、Home/End 直达首末（preventDefault 防滚动，移动只迁移焦点不激活）；Enter/Space 激活叶子项 / 切换子菜单展开（keydown 统一 preventDefault 后单次触发）；Esc 收起最近一层展开的子菜单并回焦其触发器。',
  ssr:
    'renderToString 无异常：setup/模块顶层不访问浏览器 API；focus() 仅在客户端事件回调执行。激活值与全部 aria/id/aria-expanded 在服务端即解析输出；子菜单面板 v-show 常驻（收起态输出 display:none），客户端水合后契约一致。',
  performance:
    '无监听器、无测量、无定时器；状态为 computed 派生，项注册表为数组快照更新，注册序即 DOM 序（面板 v-show 常驻挂载）；子菜单展开/收起为纯 class/display 切换，飞出定位为纯 CSS（无 JS 定位计算）。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic 层（--ui-text-*/--ui-surface*/--ui-accent*/--ui-border）、间距 --ui-space-*、圆角 --ui-radius-sm、字号 --ui-text-md、字重 --ui-font-weight-*、动效 --ui-motion-fast/--ui-ease-out、层级 --ui-z-dropdown、阴影 --ui-shadow-pop。无全局 CSS 引入。两处结构性例外：sr-only 裁剪与分隔线惯例的 1px 几何值（无 --ui-border-width/sr-only token，需求已在结果中提出）。',
  examples: [
    "<Menu v-model:model-value=\"current\">\n  <MenuItem value=\"home\">首页</MenuItem>\n  <SubMenu value=\"library\" title=\"内容库\">\n    <MenuItem value=\"articles\">文章</MenuItem>\n    <MenuItem value=\"media\">媒体</MenuItem>\n  </SubMenu>\n  <MenuItem value=\"settings\" disabled>设置（禁用）</MenuItem>\n</Menu>",
    "<Menu mode=\"horizontal\" :items=\"navItems\" @select=\"onSelect\">\n  <template #icon=\"{ item }\">…</template>\n</Menu>",
    "<Menu collapsed>\n  <MenuItem value=\"home\">\n    <template #icon><svg …/></template>\n    首页\n  </MenuItem>\n</Menu>",
  ],
  agent: {
    keywords: ['menu', '导航菜单', 'nav', '侧边栏', 'sidebar nav', '顶栏', '顶导航', 'collapsed', 'aria-current', 'submenu', '子菜单', 'v-model:modelValue'],
    selectionHints: [
      '位置导航 → Menu；动作命令集合 → dropdown-menu；局部视图切换 → Tabs',
      '组合式（MenuItem/SubMenu 子组件）适合模板内静态结构；items 数组适合动态/递归数据',
      '激活项受控用 v-model:modelValue；仅初始值用 defaultValue（无自动选中）',
      '侧边栏需要收起态用 collapsed（vertical 专属），并给各项配图标',
    ],
    commonTasks: ['控制台/后台侧边栏多级导航', '官网顶栏横向导航', '文档站章节导航', '路由驱动的当前项高亮'],
    generationNotes: [
      'MenuItem/SubMenu 必须组装在 <Menu> 内，缺一失去导航语义',
      '组节点（SubMenu）不可选中：激活值只匹配叶子项 value',
      '方向键只移动 roving 焦点不激活；Enter/Space/点击才发出 select（手动激活模式）',
      'collapsed 仅 vertical 生效；收起态 label 视觉隐藏但保留可读名，预期各项有图标',
      '不要在 MenuItem 里嵌 <a> 期望路由跳转：组件以 select 事件上抛，路由跳转由使用方处理',
    ],
  },
}
