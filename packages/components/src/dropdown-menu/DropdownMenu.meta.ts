/**
 * DropdownMenu 的组件契约元数据（ComponentDefinition）。
 * api 字段与 DropdownMenu.types.ts 保持一致；states 与 DropdownMenu.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-dropdown-menu',
  version: '0.2.0',
  identity: {
    name: 'DropdownMenu',
    package: '@ui/components',
    export: 'DropdownMenu',
    category: 'overlay',
    description:
      '纸面下拉菜单：触发器（默认插槽为单个元素时该元素直接作为触发元素并合并 id/aria-haspopup/aria-expanded/aria-controls 与 click/keydown；文本/多根/空回退内建原生 button）+ items 数据驱动的 menu 浮层，Teleport 至 body、锚定触发元素定位，WAI-ARIA menu 模式键盘契约（roving focus）与外点/Esc 关闭、焦点还原触发元素。',
  },
  intent: {
    what: '把一列动作（编辑/复制/删除等）收纳在触发器下方的浮层菜单中，点开选择其一后立即执行并关闭。',
    when: [
      '一个入口需要收纳 3~8 个同族动作（行操作、卡片更多操作）',
      '空间紧张、不适合平铺 ButtonGroup 的次要动作集',
      '动作中混有危险项（删除）需要 danger 色区分',
    ],
    whenNot: [
      '在表单中选值（需要回显所选值）用 Select：DropdownMenu 是动作菜单，不承载选中态',
      '两级以上的层级导航用 Nav/Tree：本组件为单层动作列表',
      '需要用户必须处理的模态任务用 Dialog：菜单不阻断底层交互',
      '纯悬浮说明用 Popover/Tooltip：菜单项是可执行动作而非内容',
    ],
    userTask: '用户展开一个动作列表并选择其中一项立即执行',
  },
  api: {
    props: [
      { name: 'items', type: 'DropdownMenuItem[]', required: true, description: '菜单项数据，按序渲染为 menuitem：{ key, label, icon?, danger?, disabled? }。icon 为内联 SVG 组件（统一约束 16px）。' },
      { name: 'align', type: "'start' | 'end'", default: 'start', description: '菜单面板与触发器的水平对齐：start 左缘对齐、end 右缘对齐（纯 CSS 实现，无需测量面板宽度）。' },
    ],
    slots: [
      {
        name: 'default',
        description:
          '触发器：单个元素/组件 vnode 直接作为触发元素（组件合并 id、aria-haspopup/aria-expanded/aria-controls 与 click/keydown 监听，元素自身即触发器，不再包裹 button——元素须可聚焦，如 Button / 原生 button；组件触发元素须把 attrs 透传到根元素）；文本/多根/空插槽回退为内建原生 button 触发器。应始终有可读 label（如「操作」「更多」）。',
      },
    ],
    events: [
      { name: 'select', payload: 'string', description: '选中菜单项（点击或菜单内 Enter），载荷为该项 key；disabled 项不触发。选中后菜单自动关闭且焦点还原触发器。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除触发器焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Select（表单选值，回显选中态）', 'Dialog（模态任务）', 'Nav/Tree（层级导航）'],
  },
  composition: {
    patterns: ['表格行/卡片「更多操作」收纳', '危险动作以 danger 项区分并置于末位', '与 Button/IconButton 组合：触发器文案描述这组动作的归属'],
    related: ['Button', 'Dialog', 'Select'],
    preferred: ['动作项保持同族（同层级粒度）', 'danger 项不超过一个且放末位', '触发器 label 描述动作组而非单点动作'],
  },
  states: {
    default: '关闭态仅渲染触发器（无浮层）；打开态：surface 底、sm 圆角、pop 阴影的面板自触发器下方弹出（start/end 对齐），项观感对齐 select/ 选项（text-md、ghost 底）。',
    hover: '项 hover 转 surface-muted 底；danger 项 hover 转 danger-soft 底并保持 danger 文本色；触发器 hover 同步弱化描边。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent）；菜单内 roving focus 当前项获得 surface-muted 底（DOM :focus 即高亮）与 tabindex=0。',
    active: '项点击即选中并关闭（无持续按压态）；触发器无按压态。',
    disabled: '项 disabled：原生 disabled（移出 Tab 序、roving 跳过）、text-3 弱化、hover 让位、不可选中。',
  },
  accessibility:
    'WAI-ARIA menu button 模式：触发元素带 aria-haspopup="menu" 与 aria-expanded（打开时另以 aria-controls 关联菜单 id）——默认插槽为单个元素/组件时该元素即触发元素（组件合并 id 与上述 aria 与 click/keydown，不产生嵌套 button；插槽元素已声明 id 时沿用之），文本/多根/空插槽回退为内建原生 button 触发器；面板 role="menu" 且 aria-labelledby 指向触发元素 id；项为原生 button role="menuitem"。键盘：触发元素 ↓/↑ 打开并聚焦首/末启用项，Enter/Space 开合；菜单内 ↓/↑ 环绕移动（跳过 disabled）、Home/End 首尾、Enter 选中、Esc/Tab 关闭；roving tabindex（当前项 0、其余 -1，disabled 恒 -1）。一切键盘关闭与选中路径焦点还原触发元素；外点（document click capture）关闭不抢焦点。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；浮层仅客户端渲染（mounted 门控 + Teleport，isOpen 初始 false），renderToString 只输出触发元素（含 ui-dropdown-menu 根类与 aria-haspopup/aria-expanded；文本插槽输出内建触发器 button，元素插槽输出该元素并带合并后的 aria），无浮层内容泄出；document/window 监听只在 onMounted 注册、onBeforeUnmount 移除。',
  performance:
    'onMounted 常驻绑定 document click/scroll（capture）与 window resize 三个监听（open 守卫短路），onBeforeUnmount 统一移除；roving focus 仅在按键时查询锚盒内 menuitem；定位为一次 getBoundingClientRect + inline style 写入；入场动效为 token 时长的 opacity/transform，prefers-reduced-motion 下随 --ui-motion-* 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：层级 --ui-z-dropdown、阴影 --ui-shadow-pop、圆角 --ui-radius-sm/--ui-radius-xs、危险色 --ui-danger/--ui-danger-soft、颜色/字号/间距/动效全 token 化；描边宽度 1px 为结构性细线（已提出 --ui-border-width token 需求）；组件包不引入全局 CSS。',
  examples: [
    "<DropdownMenu\n  :items=\"[\n    { key: 'edit', label: '编辑', icon: EditIcon },\n    { key: 'copy', label: '复制' },\n    { key: 'delete', label: '删除', danger: true },\n  ]\"\n  @select=\"onSelect\"\n>\n  操作\n</DropdownMenu>",
    "<DropdownMenu align=\"end\" :items=\"items\" @select=\"key => run(key)\">\n  <!-- 单个元素插槽：Button 自身即触发元素（合并 id/aria-haspopup/expanded/controls 与 click/keydown，无嵌套 button） -->\n  <Button variant=\"secondary\">更多</Button>\n</DropdownMenu>",
    "<DropdownMenu\n  :items=\"[\n    { key: 'rename', label: '重命名' },\n    { key: 'archive', label: '归档', disabled: true },\n    { key: 'delete', label: '删除', danger: true },\n  ]\"\n  @select=\"onSelect\"\n/>",
  ],
  agent: {
    keywords: ['dropdown', 'dropdown menu', '下拉菜单', '菜单', 'menu', 'menu button', '动作菜单', 'action menu', '更多操作', 'overflow menu', 'roving focus', 'Teleport', 'overlay', '浮层'],
    selectionHints: [
      '执行动作且无需回显选中态 → DropdownMenu；表单选值 → Select；模态任务 → Dialog',
      '动作数量 3~8 为宜；更多应重组信息架构而非滚动菜单',
      '需要 danger 视觉强调破坏性动作时用 item.danger',
    ],
    commonTasks: ['表格行「更多操作」', '卡片角落动作收纳', '账户/设置菜单（退出登录用 danger 项）'],
    generationNotes: [
      'items 数据驱动：key 必填且应稳定（select 载荷即 key）；icon 传内联 SVG 组件（viewBox 0 0 24 24、stroke-width 1.5、currentColor），组件统一约束为 16px',
      '开合状态为组件内部状态：触发元素点击/Enter/Space/↓/↑ 打开，Esc/Tab/外点/选中后关闭，无需外部 v-model',
      '默认插槽应提供可读 label；传单个可聚焦元素（如 Button / 原生 button）时该元素直接作为触发元素（组件合并 id、aria-haspopup/expanded/controls 与 click/keydown；元素自身已声明 id 时沿用），不产生嵌套 button；组件触发元素须把 attrs 透传到根元素；文本/多根/空插槽回退为内建原生 button 触发器',
      '选中即关闭并还原焦点到触发元素；不要用它承载需要停留多步的任务流（用 Dialog）',
    ],
  },
}
