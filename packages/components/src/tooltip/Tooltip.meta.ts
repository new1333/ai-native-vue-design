/**
 * Tooltip 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Tooltip.types.ts 保持一致；states 与 Tooltip.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tooltip',
  version: '0.2.0',
  identity: {
    name: 'Tooltip',
    package: '@ui/components',
    export: 'Tooltip',
    category: 'overlay',
    description:
      '纸面纯提示浮层：包裹单个触发元素（默认插槽、无包装 DOM），hover/focus 进入 150ms 后显示、离开/失焦/Esc 立即隐藏；浮层 Teleport 至 body，role="tooltip" 经 aria-describedby 与触发元素关联，挂载后按触发元素 rect 定位（top/bottom/left/right），打开期间滚动/resize 跟随重排（不滞留原视口位置）。',
  },
  intent: {
    what: '在触发元素附近悬浮显示一段简短的纯文字补充说明（术语解释、快捷键、截断文本的完整内容），不承载任何交互。',
    when: [
      '为图标按钮/紧凑控件补充一句可访问名称之外的说明',
      '解释专业术语、缩写或表单项的填写要求',
      '展示被截断文本（表格单元格、面包屑）的完整内容',
    ],
    whenNot: [
      '需要菜单项/导航/选择动作 → DropdownMenu：Tooltip 是纯提示，浮层无交互内容、无焦点停留、无键盘漫游',
      '需要富内容与内部交互（链接、按钮、图表）→ Popover：Tooltip 浮层 pointer-events:none，鼠标无法停留其上',
      '需要用户必须处理的模态信息 → Dialog：Tooltip 不阻断交互、不圈定焦点',
      '需要被动通知（保存成功等）→ Toast：Tooltip 由触发元素的 hover/focus 驱动，不主动弹出',
    ],
    userTask: '用户悬停或键盘聚焦某元素时，获得一句即看即走的补充说明',
  },
  api: {
    props: [
      { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: 'top', description: '浮层相对触发元素的方向；打开期间切换会按新方向重排（不做视口碰撞翻转）。' },
    ],
    slots: [
      { name: 'default', description: '唯一触发元素（应为恰一个可聚焦/可交互元素）：组件向其克隆合并 hover/focus/Esc 监听器与 aria-describedby，并透传写在 <Tooltip> 上的 attrs。' },
      { name: 'content', description: '浮层提示内容；未提供该插槽时不弹层。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: [
      'DropdownMenu（可操作菜单：菜单项、键盘漫游、焦点管理——Tooltip 无这些能力）',
      'Popover（浮层内有交互内容，需要鼠标停留与可选焦点停留）',
      'Dialog/Toast（模态或主动通知，与 hover/focus 驱动的被动提示语义不同）',
    ],
    dependsOn: [],
  },
  composition: {
    patterns: [
      'IconButton + Tooltip（图标操作补充文字说明）',
      'Table 单元格 + Tooltip（截断文本悬停看全文）',
      'Form 字段标签 + Tooltip（填写要求即看即走）',
    ],
    related: ['DropdownMenu', 'Popover', 'Dialog', 'IconButton', 'Table'],
    preferred: ['提示内容一句话以内（超过请改用 Popover 或正文说明）', '触发元素保持原生交互语义（button/a/input…）'],
  },
  states: {
    default: '关闭态不渲染浮层（仅 SSR/挂载前输出 hidden 占位）；触发元素保持自身原有外观，不添加包装 DOM。',
    hover: '悬停触发元素 150ms 后显示浮层：tooltip 底（--ui-tooltip）白字、xs 最小字号档、sm 圆角、pop 阴影，按 placement 悬于触发元素旁（--ui-space-2 间距）；移开立即隐藏。',
    focusVisible: '键盘聚焦触发元素同样延迟 150ms 显示（focusin 路径），失焦立即隐藏；焦点环由全局 :focus-visible 约定提供，组件不改动 tabindex。',
    active: '浮层 pointer-events:none，无按压态；触发元素自身的 active 态不受影响。',
    disabled: '组件级无 disabled；若触发元素自身 disabled（如 button），其不响应鼠标/焦点事件，浮层自然不会被触发。',
  },
  accessibility:
    '浮层 role="tooltip" 且 id 由 useId 生成；打开时触发元素挂 aria-describedby 指向浮层 id（关闭时移除，读屏以 describedby 关系朗读提示）。键盘可达：Tab 聚焦触发元素（focusin）即显示、失焦（focusout）即隐藏、Esc 立即关闭；触发元素不添加 tabindex、不自造交互语义。浮层自身不可聚焦（无 tabindex）、pointer-events:none，不进入 Tab 序也不抢夺焦点——这是与 DropdownMenu（菜单项可漫游、焦点停留）的本质边界。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问任何浏览器 API；renderToString 输出触发元素 + hidden 的 ui-tooltip 占位（输出稳定、含根类），不渲染浮层与提示内容、不输出 aria-describedby；Teleport、rect 测量、延迟计时与 document/window 监听全部推迟到客户端 onMounted 之后；卸载时移除监听并清理待显示计时器。',
  performance:
    '打开期间常驻 document scroll（capture，捕获任意祖先滚动容器）与 window resize 两个监听（isOpen 守卫短路，onMounted 注册、onBeforeUnmount 移除）以跟随重排；关闭态监听仍在但回调短路。仅在显示路径创建一个 150ms 计时器，隐藏/卸载立即清理；定位为单段测量（rect + 结构性 translate 居中），无需测量浮层自身尺寸。入场动效为 token 时长的 opacity 动画，prefers-reduced-motion 下随 --ui-motion-fast 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：z-index 走 --ui-z-tooltip、背景 --ui-tooltip、文字 --ui-color-white、字号 --ui-text-xs（最小档）、圆角 --ui-radius-sm、阴影 --ui-shadow-pop、间距/最大宽度（间距标尺推导）/动效全 token 化；浮层定位的视口坐标来自触发元素 rect 测量数据，与触发元素的间距在 calc 内引用 --ui-space-2。组件包不引入全局 CSS。',
  examples: [
    "<Tooltip placement='top'>\n  <button type='button'>保存</button>\n  <template #content>保存当前草稿（Ctrl+S）</template>\n</Tooltip>",
    "<Tooltip placement='bottom'>\n  <a href='/docs'>API 文档</a>\n  <template #content>打开完整接口参考</template>\n</Tooltip>",
    "<Tooltip>\n  <IconButton :icon='TrashIcon' aria-label='删除' />\n  <template #content>移除该行，不可撤销</template>\n</Tooltip>",
  ],
  agent: {
    keywords: ['tooltip', '提示', '悬浮提示', 'hint', '气泡', 'bubble', 'overlay', '浮层', 'aria-describedby', '纯提示', 'hover 提示', 'focus 提示'],
    selectionHints: [
      '纯文字提示 → Tooltip；浮层内有交互 → Popover；菜单动作列表 → DropdownMenu',
      '需要点击/选择行为时绝不套 Tooltip（其浮层 pointer-events:none、无焦点停留）',
      '内容超过一句话或含链接/按钮 → 改用 Popover',
    ],
    commonTasks: ['为图标按钮补充文字说明', '截断文本悬停看全文', '术语/表单项的即看即走解释'],
    generationNotes: [
      '默认插槽必须是恰一个触发元素；组件通过 cloneVNode 向其合并事件与 aria-describedby，不产生包装 DOM',
      '写在 <Tooltip> 上的 attrs（class/data-*）会透传到触发元素；触发元素已有的事件监听器与组件内部监听器链式共存',
      '显示延迟 150ms、隐藏立即（含 Esc）；无 content 插槽时不弹层',
      'placement 只做四方向定位，不做视口碰撞翻转；滚动/resize 已内置跟随重排（打开期间保持锚定触发元素），需要翻转请在上层方案解决',
      '无自定义事件与 expose：显隐是内部状态，交互契约走 aria-describedby 与 DOM',
    ],
  },
}
