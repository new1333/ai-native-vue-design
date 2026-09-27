/**
 * CommandPalette 的组件契约元数据（ComponentDefinition）。
 * api 字段与 CommandPalette.types.ts 保持一致；states 与 CommandPalette.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-command-palette',
  version: '0.1.0',
  identity: {
    name: 'CommandPalette',
    package: '@ui/components',
    export: 'CommandPalette',
    category: 'navigation',
    description:
      '纸面命令面板：Cmd/Ctrl+K 唤起的键盘优先命令入口。dialog 模式模态浮层 + 搜索输入（combobox）+ 分组命令列表（listbox）：对命令 label 做子串过滤、分组展示，焦点恒驻搜索框，↓/↑ 环绕漫游（跳过禁用）、Home/End 首尾、Enter 执行；模态机制（焦点圈定/还原、滚动锁、Esc）复用 dialog 公共 composable useDialog。',
  },
  intent: {
    what: '把应用内可执行的命令/跳转收纳为一个 Cmd/Ctrl+K 唤起的搜索式面板，用户按关键词过滤后用键盘执行其中一条。',
    when: [
      '需要全局快捷键（Cmd/Ctrl+K）唤起的命令/搜索入口',
      '命令数量多、需要按分组浏览或按关键词过滤（分组数据驱动）',
      'AI 应用中把可执行动作/跳转集中为键盘优先的入口（设计文档 §14.1）',
    ],
    whenNot: [
      '表单选值（需要回显所选值）用 Select：本组件是动作入口不是表单控件',
      '少量锚定触发元素的上下文动作用 DropdownMenu：无需全屏模态',
      '需要停留多步的模态任务流用 Dialog：命令面板选中即执行即关闭',
      '不做异步命令加载/远程搜索（groups 由使用方同步给定）、不做模糊评分/别名匹配（仅 label 子串过滤）',
    ],
    userTask: '用户以 Cmd/Ctrl+K 唤起命令面板，按关键词过滤并以 ↓/↑+Enter 执行一条命令',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: '受控开合（v-model）：true 渲染命令面板浮层。热键开合、Esc/遮罩关闭、选中命令后关闭都会 emit update:modelValue，由使用方落账。' },
      { name: 'groups', type: 'CommandPaletteGroup[]', required: true, description: '分组命令数据：{ key, label?, items: [{ key, label, icon?, hint?, danger?, disabled? }] }。命令 label 是搜索过滤目标；组内命令全部未命中时整组隐藏；命令 key 要求全局唯一（select 载荷即 key）。' },
      { name: 'hotkey', type: 'boolean', default: 'true', description: '是否注册全局 Cmd/Ctrl+K 开合快捷键（仅客户端注册，随 prop 动态重接线：true 注册、false 移除，挂载后切换即时生效；onBeforeUnmount 无条件移除；按下时 preventDefault 并切换开合）。' },
      { name: 'placeholder', type: 'string', default: "'搜索命令…'", description: '搜索输入框占位文本。' },
    ],
    slots: [
      { name: 'header', description: '面板顶部标题区（渲染于搜索框上方），并为 role="dialog" 提供可访问名称（aria-labelledby 指向它）；缺省时面板以 aria-label「命令面板」命名。' },
      { name: 'item', scope: '{ command: CommandPaletteCommand; active: boolean }', description: '单条命令项的自定义渲染：command 为命令数据、active 为是否当前激活项（aria-activedescendant 指向项）；缺省渲染图标（16px）+ label + 右侧 hint。' },
      { name: 'empty', description: '无匹配结果区（过滤后无可见命令时渲染于列表下方）；缺省文案「无匹配命令」。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：Cmd/Ctrl+K 开合、Esc/遮罩关闭、选中命令后关闭都会发出（选中命令时 select 与 update:modelValue false 相继发出）。' },
      { name: 'select', payload: 'string', description: '选中一条命令（点击或激活项上 Enter；disabled 命令不触发），载荷为该项 key。选中后组件自动请求关闭。' },
    ],
    exposes: [
      { name: 'focus', type: '() => void', description: '聚焦搜索输入框（仅在面板打开时有意义；关闭态无输入框可聚焦）。' },
      { name: 'blur', type: '() => void', description: '移除搜索输入框焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Select（表单选值，回显选中态）', 'DropdownMenu（锚定触发元素的轻量动作菜单）', 'Dialog（多步模态任务流）'],
    dependsOn: ['dialog/useDialog（复用模态机制：焦点圈定/还原、body 滚动锁、Esc 请求关闭）'],
  },
  composition: {
    patterns: ['应用级 Cmd/Ctrl+K 命令入口（全局快捷键唤起）', '分组命令 + 搜索过滤的快捷动作中心', '与 Topbar/页面头部组合：导航区的搜索/命令按钮以 hotkey 或受控 v-model 打开面板'],
    related: ['Dialog', 'DropdownMenu', 'Input'],
    preferred: ['命令 key 全局唯一且稳定（select 载荷即 key）', '分组 2~5 组、组内命令 3~8 条为宜；组标题用名词（如「导航」「操作」）', '危险命令以 danger 标记并置于组末', 'hint 放快捷键或补充说明等短文本'],
  },
  states: {
    default: '关闭态仅输出 hidden 占位（不渲染浮层）；打开态：scrim 遮罩 + 顶部对齐的 surface 面板（lg 圆角、modal 阴影），自上而下为 header（可选）、搜索行（放大镜图标 + combobox 输入）、分组 listbox（组标题 text-xs text-3，命令项 ghost 底 + xs 圆角）；无匹配时列表下方渲染 empty 文案。',
    hover: '命令项 hover（mouseenter 同时把它设为激活项）转 surface-muted 底；danger 命令 hover 转 danger-soft 底并保持 danger 文本色；禁用命令 hover 让位。',
    focusVisible: '焦点恒驻搜索输入框（combobox 模式）：搜索行 focus-within 时下分隔线转 accent；激活项以 surface-muted 高亮（aria-selected/aria-activedescendant 同步）。',
    active: '选中命令即发出 select 并请求关闭（无持续按压态）；Esc/遮罩路径仅请求关闭不发出 select。',
    disabled: '禁用命令 text-3 弱化、cursor not-allowed、aria-disabled="true"；键盘漫游跳过，点击/Enter 均不触发 select。',
  },
  accessibility:
    'WAI-ARIA dialog + combobox/listbox 组合：面板 role="dialog" aria-modal="true"，有 header 插槽时以 aria-labelledby 指向头部，否则 aria-label="命令面板"；搜索输入 role="combobox"（aria-expanded="true"、aria-autocomplete="list"、aria-controls 指向 role="listbox"、aria-activedescendant 指向当前激活 option），输入框自身不带固定 aria-label——id / aria-label / aria-labelledby / aria-describedby 等原生属性经 attrs 直达搜索输入框（inheritAttrs:false + v-bind="$attrs"），由使用方提供可访问名称或与外部说明关联；listbox 内分组 role="group"（有 label 时 aria-labelledby 指向组标题，组标题不是 option），命令为 role="option"（非 DOM 可聚焦元素——焦点恒驻输入框，aria-activedescendant 模式），激活项 aria-selected="true"、禁用项 aria-disabled="true"。键盘：Cmd/Ctrl+K 开合（仅客户端）；↓/↑ 环绕漫游（跳过 disabled）、Home/End 首尾、Enter 选中激活项、Esc 关闭；Tab 被圈定在面板内（唯一可聚焦元素为输入框）。打开时焦点移入搜索框，关闭后焦点还原打开前元素。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；浮层仅客户端渲染（mounted 门控 + Teleport，modelValue 初始 true 也不在服务端渲染），renderToString 只输出 hidden 占位（ui-command-palette 根类），命令数据与面板结构不泄出；Cmd/Ctrl+K 的 window keydown 监听仅客户端存在：onMounted 按初始 hotkey 注册、hotkey 变化时由 watch 重接线（SSR 渲染期间 prop 不变、回调不触发）、onBeforeUnmount 无条件移除；模态副作用（滚动锁/焦点）均为客户端生命周期行为。',
  performance:
    '过滤为纯 computed（O(命令数) 子串匹配，keyword 为空时短路）；onMounted 仅注册一个 window keydown（hotkey=false 时不注册，挂载后随 hotkey 切换重接线增删）；模态机制复用 useDialog（滚动锁跨实例计数、打开/关闭各一次副作用）；激活项为索引状态 + aria-activedescendant，无逐项 DOM 焦点移动；入场动效为 token 时长的 opacity/transform，prefers-reduced-motion 下随 --ui-motion-* 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：层级 --ui-z-modal、遮罩 --ui-scrim、阴影 --ui-shadow-modal、圆角 --ui-radius-lg/--ui-radius-xs、危险色 --ui-danger/--ui-danger-soft、颜色/字号/间距/动效全 token 化；面板宽度由间距标尺推导（无面板宽度 token，已提出需求）；描边 1px 为结构性细线（已提出 --ui-border-width 需求）；hint 弱化文本用 sans 字号档（等宽字体缺 --ui-font-mono，已提出需求）；组件包不引入全局 CSS。',
  examples: [
    "<template>\n  <button type=\"button\" @click=\"open = true\">命令面板（⌘K）</button>\n  <CommandPalette\n    v-model=\"open\"\n    :groups=\"[\n      { key: 'nav', label: '导航', items: [\n        { key: 'home', label: '回到首页', hint: 'G H' },\n        { key: 'docs', label: '打开文档' },\n      ] },\n      { key: 'action', label: '操作', items: [\n        { key: 'copy-link', label: '复制链接', hint: '⌘C' },\n        { key: 'delete', label: '删除项目', danger: true },\n      ] },\n    ]\"\n    @select=\"key => run(key)\"\n  />\n</template>",
    "<!-- 自定义命令项与无结果文案 -->\n<CommandPalette v-model=\"open\" :groups=\"groups\" @select=\"onSelect\">\n  <template #header>快速操作</template>\n  <template #item=\"{ command, active }\">\n    <span :class=\"{ active }\">{{ command.label }}</span>\n  </template>\n  <template #empty>没有找到命令，换个关键词试试</template>\n</CommandPalette>",
    "<!-- 关闭全局热键，完全受控开合 -->\n<CommandPalette v-model=\"open\" :groups=\"groups\" :hotkey=\"false\" placeholder=\"输入命令或搜索…\" @select=\"onSelect\" />",
  ],
  agent: {
    keywords: ['command palette', '命令面板', 'cmd+k', 'command+k', 'ctrl+k', '快捷键面板', '命令菜单', '全局命令入口', 'palette', 'keyboard first', '搜索执行', 'quick open'],
    selectionHints: [
      '全局 Cmd/Ctrl+K 唤起 + 搜索过滤 + 键盘执行 → CommandPalette；锚定触发元素的少量动作用 DropdownMenu；表单选值用 Select',
      '命令数据已就绪且可同步给出时直接用；远程搜索/异步加载不在本组件能力内（使用方自行更新 groups）',
      '需要把可执行动作集中为一个键盘优先入口（AI 应用 §14.1）时优先选它',
    ],
    commonTasks: ['应用级「⌘K 快速操作」入口', '文档/工作台的页面与动作搜索', 'AI 应用中把可用技能/命令列成可执行面板'],
    generationNotes: [
      'groups 数据驱动：命令 key 全局唯一且稳定（select 载荷即 key）；icon 传内联 SVG 组件（viewBox 0 0 24 24、stroke-width 1.5、currentColor，统一 16px）；hint 放快捷键等短文本',
      '开合为受控 v-model（modelValue）：hotkey 默认注册 Cmd/Ctrl+K（仅客户端）；Esc/遮罩/选中后组件 emit update:modelValue=false，使用方须落账（v-model 自动）',
      '键盘契约：焦点恒驻搜索框，↓/↑ 环绕漫游（跳过 disabled）、Home/End 首尾、Enter 选中；输入过滤时激活项自动回到首个启用命令',
      'item 插槽可完全接管命令项渲染（scope: command/active）；empty 插槽自定义无结果文案；header 插槽同时为面板提供可访问名称',
      'id / aria-label / aria-labelledby / aria-describedby 等原生属性经 attrs 直达搜索输入框：需要给搜索框命名或关联外部说明（如 FormField 提示）时直接写在组件标签上，不落浮层根',
      '不要把需要停留多步的任务流塞进命令面板（选中即关闭）；异步结果请由使用方更新 groups 而非等待组件内加载态',
    ],
  },
}
