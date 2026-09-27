/**
 * Popover 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Popover.types.ts 保持一致；states 与 Popover.vue 样式/交互实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-popover',
  version: '0.1.0',
  identity: {
    name: 'Popover',
    package: '@ui/components',
    export: 'Popover',
    category: 'overlay',
    description:
      '纸面锚定气泡卡片：trigger 插槽元素直接作为触发元素（克隆合并 aria-expanded/aria-controls 与事件），点击或 hover 开合承载任意内容/表单的非模态浮层（default 插槽）；浮层 Teleport 至 body，role="dialog" 经 aria-labelledby 关联触发元素，复用 tooltip 的 rect 定位（top/bottom/left/right + 可选箭头），Esc 关闭并焦点回归，scrim 点击关闭可配。',
  },
  intent: {
    what: '在触发元素旁弹出一个可承载任意内容（说明、链接、按钮、小型表单）的非模态锚定卡片，用户可与之交互后关闭，页面其余部分不被阻断。',
    when: [
      '点击触发元素就地查看/编辑一段补充内容（备注、筛选条件、确认说明）',
      '气泡内需要交互：链接、按钮、小型表单',
      '内容比一句话长、但仍锚定于触发元素且不希望模态打断',
    ],
    whenNot: [
      '纯文字一句话提示、无交互 → Tooltip：Tooltip 浮层 pointer-events:none，由 hover/focus 驱动',
      '菜单动作列表（menuitem、roving focus、Enter 选中）→ DropdownMenu',
      '必须处理的模态信息（焦点圈定、滚动锁、变暗遮罩）→ Dialog',
      '被动通知（保存成功等）→ Toast',
    ],
    userTask: '用户点击或悬停触发元素，就地展开一块可交互内容，完成后回到原位',
  },
  api: {
    props: [
      {
        name: 'modelValue',
        type: 'boolean',
        description:
          '受控显隐（v-model）：传入（含 false）即为受控，显隐完全跟随该值；不传为非受控（组件内部状态）。两种模式下一切开合路径都先发出 update:modelValue。',
      },
      {
        name: 'trigger',
        type: "'click' | 'hover'",
        default: 'click',
        description:
          '触发方式：click 点击开合；hover 进入延迟 150ms 开启、离开宽限 150ms 关闭（focusin/focusout 与鼠标同构，指针/焦点移入卡片取消关闭）。',
      },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: 'top',
        description: '浮层相对触发元素的方向；打开期间切换会按新方向重排（不做视口碰撞翻转）。',
      },
      { name: 'arrow', type: 'boolean', default: 'false', description: '是否显示指向触发元素的小箭头。' },
      {
        name: 'closeOnScrim',
        type: 'boolean',
        default: 'true',
        description:
          '打开期间是否渲染透明命中层（scrim）：点击触发元素与卡片之外区域即关闭。false 时不渲染，打开期间外部页面保持可交互，关闭仅靠再次点击/Esc/受控状态。',
      },
    ],
    slots: [
      {
        name: 'trigger',
        description:
          '触发元素：单个元素/组件 vnode 时直接作为触发元素（克隆合并 id、aria-expanded、aria-controls 与事件监听，不产生包装 DOM，元素应可聚焦如 button/a/本库 Button）；文本/多根/空插槽回退为内建原生 button 触发器。应始终有可读 label。',
      },
      {
        name: 'default',
        description: '气泡卡片内容：任意内容或表单（卡片可交互，指针/焦点停留不关闭）；未提供该插槽时不弹层。',
      },
    ],
    events: [
      {
        name: 'update:modelValue',
        payload: 'boolean',
        description:
          '显隐变更（v-model）：点击开合、Esc、scrim 关闭、hover 离开等一切路径先发出，由使用方决定实际状态（非受控下组件同步落位）。',
      },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: [
      'Tooltip（纯文字提示：浮层 pointer-events:none、无焦点停留、无 update:modelValue）',
      'DropdownMenu（items 数据驱动的 menu 模式 + roving focus；Popover 内容自由但不做菜单键盘漫游）',
      'Dialog（模态：aria-modal、焦点圈定、滚动锁、变暗遮罩——Popover 非模态且锚定触发元素）',
    ],
    dependsOn: [],
  },
  composition: {
    patterns: [
      'Button + Popover（点击展开补充操作/说明/确认）',
      'Popover + 表单（就地编辑备注、筛选条件，提交后由应用关闭）',
      'Popover（trigger=hover）+ 交互内容（指针移入卡片不关闭，可放链接/按钮）',
    ],
    related: ['Tooltip', 'DropdownMenu', 'Dialog', 'Button', 'IconButton'],
    preferred: [
      '触发元素用原生交互元素（button/a/input…）或本库 Button，保持键盘可达',
      '表单类内容提交/取消后由应用关闭（v-model 置 false）',
      'hover 模式下卡片内容保持可停留（移入卡片不关闭是内建行为）',
    ],
  },
  states: {
    default:
      '关闭态只渲染触发元素（无浮层 DOM）；触发元素 aria-expanded="false"。受控 modelValue=true 时挂载即打开（自动定位）。',
    hover:
      'hover 模式：指针进入触发元素 150ms 后开启、移出 150ms 宽限后关闭；指针移入卡片取消关闭（卡片内容可停留交互）；移回触发元素同样取消关闭。',
    focusVisible:
      'hover 模式下键盘聚焦触发元素（focusin）同样延迟开启；Tab 可进入卡片内容，焦点离开卡片/触发元素宽限关闭；焦点环由全局 :focus-visible 约定提供，组件不改动 tabindex。',
    active: '卡片内容（按钮/输入框）保持自身交互态；组件不改变内容元素的按压/激活样式，卡片自身无按压态。',
    disabled:
      '组件级无 disabled；触发元素自身 disabled（如原生 button）时其不派发 click/focus，浮层不会被触发。受控使用方也可通过禁用触发元素或忽略 update:modelValue 控制显隐。',
  },
  accessibility:
    '触发元素恒挂 aria-expanded（true/false），打开时挂 aria-controls 指向卡片 id；卡片 role="dialog"（非模态，不设 aria-modal）经 aria-labelledby 指向触发元素 id 形成双向关联。键盘：触发元素保持原生语义（Enter/Space 走原生 click 开合，不自造 role）；Esc 在触发元素或卡片内按下即关闭并把焦点还原到触发元素；hover 模式 focusin 开启/focusout 关闭与鼠标同构，焦点移入卡片不关闭。scrim 为透明命中层，不变暗页面、不圈定焦点（非模态）。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；renderToString 只输出触发元素（含 aria-expanded="false" 与 ui-popover 根类），不渲染浮层/内容/scrim、不输出 aria-controls；Teleport、rect 测量、hover 计时与 document/window 监听全部推迟到客户端，onBeforeUnmount 清理（卸载兜底复位计时器与监听）。',
  performance:
    '常驻监听只有 scroll（capture）与 resize，回调以 isOpen 守卫、仅在打开时重算 rect；hover 待开启/待关闭计时互斥（同一时刻至多一个）；定位为单段测量（触发元素 rect + 结构性 translate），无需测量卡片自身尺寸。入场动效为 token 时长的 opacity 动画，prefers-reduced-motion 下随 --ui-motion-fast 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：层级走 --ui-z-dropdown、卡片底 --ui-surface、描边 --ui-border、文字 --ui-text-1、圆角 --ui-radius-md、阴影 --ui-shadow-pop、内边距 --ui-space-4、最大宽度由间距标尺推导；浮层视口坐标来自触发元素 rect 测量，与触发元素的间距在 calc 内引用 --ui-space-2（箭头尺寸/探出量同源）。scrim 为无底色透明命中层。组件包不引入全局 CSS。',
  examples: [
    "<Popover>\n  <template #trigger>\n    <button type='button'>填写备注</button>\n  </template>\n  <form @submit.prevent='save'>…</form>\n</Popover>",
    "<Popover v-model='open' trigger='hover' placement='right' arrow>\n  <template #trigger><a href='/docs'>文档</a></template>\n  <p>气泡内可以有链接与按钮</p>\n</Popover>",
    "<Popover :close-on-scrim='false'>\n  <template #trigger><Button>筛选</Button></template>\n  <FieldGroup … />\n</Popover>",
  ],
  agent: {
    keywords: ['popover', '气泡', '气泡卡片', '弹出层', '浮层', '弹窗', 'anchored', 'overlay', '非模态', 'aria-expanded', 'aria-controls', '表单弹出', 'hover 弹出', '点击弹出'],
    selectionHints: [
      '浮层内有交互（按钮/表单/链接）→ Popover；纯文字提示 → Tooltip；菜单动作列表 → DropdownMenu；模态阻断 → Dialog',
      '需要受控显隐用 v-model（modelValue）；未传时组件自管开合状态',
      '打开期间仍需操作页面时设 closeOnScrim=false（无 scrim，外部保持可交互）',
    ],
    commonTasks: ['点击触发展开补充内容/确认框', '气泡内小型表单就地编辑', 'hover 展开可交互的富内容卡片'],
    generationNotes: [
      'trigger 插槽必须是恰一个元素/组件 vnode；组件通过 cloneVNode 向其合并 id/aria/事件，不产生包装 DOM；文本/多根插槽回退内建 button 触发器',
      '写在 <Popover> 上的 attrs（class/data-*）会透传到触发元素；触发元素已有的事件监听器与组件内部监听器链式共存',
      'modelValue 传入（含 false）即受控：组件只 emit，显隐完全由使用方决定；不传则非受控自管',
      'placement 只做四方向定位，不做视口碰撞翻转；需要翻转/跟随滚动方案请在上层解决（打开期间滚动/resize 会跟随重排）',
      '无 expose：显隐走 v-model 与 update:modelValue，交互契约走 aria 与 DOM',
    ],
  },
}
