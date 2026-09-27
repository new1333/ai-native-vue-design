/**
 * HoverCard 的组件契约元数据（ComponentDefinition）。
 * api 字段与 HoverCard.types.ts 保持一致；states 与 HoverCard.vue 样式/交互实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-hover-card',
  version: '0.1.0',
  identity: {
    name: 'HoverCard',
    package: '@ui/components',
    export: 'HoverCard',
    category: 'overlay',
    description:
      '纸面悬停预览卡：trigger 插槽元素直接作为触发元素（克隆合并 aria-expanded/aria-controls 与事件），hover + focus 双触发承载用户/条目信息摘要的非模态浮层（default 插槽）；进入 openDelay 延迟开启、移出 closeDelay 宽限关闭（移入卡片取消），浮层 Teleport 至 body，role="dialog" 经 aria-labelledby 关联触发元素，复用 tooltip 的 rect 定位（top/bottom/left/right），Esc 关闭并焦点回归。',
  },
  intent: {
    what: '在触发元素旁悬停展示一块富摘要预览卡（头像、姓名、简介、链接、条目元信息），指针可移入卡片停留阅读或点击轻交互，移出后自动收起。',
    when: [
      '用户头像/昵称/提及（@mention）悬停展示个人资料摘要与关注入口',
      '表格/列表条目悬停预览详情（商品卡、文档卡、活动摘要），避免跳页即可判断',
      '链接/引用悬停展示来源或摘要卡片（比 Tooltip 的一句话更长、含结构的富内容）',
    ],
    whenNot: [
      '纯文字一句话提示（术语解释、截断文本全文）→ Tooltip：浮层 pointer-events:none、无卡片结构、无 update:modelValue',
      '点击开合、内含表单/操作的锚定卡片 → Popover：HoverCard 由 hover/focus 驱动，无点击开合与 scrim 关闭路径',
      '菜单动作列表（menuitem、roving focus）→ DropdownMenu',
      '必须处理的模态信息 → Dialog：HoverCard 非模态、不圈定焦点',
      '被动通知（保存成功等）→ Toast：HoverCard 由触发元素的 hover/focus 驱动，不主动弹出',
    ],
    userTask: '用户悬停（或键盘聚焦）一个代表用户/条目的元素时，就地展开摘要预览卡，可停留阅读或点入，移开即收起',
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
        name: 'openDelay',
        type: 'number',
        default: '150',
        description: '打开延迟（ms）：指针进入或键盘聚焦触发元素后延迟开启（防掠过即弹）。',
      },
      {
        name: 'closeDelay',
        type: 'number',
        default: '150',
        description:
          '关闭宽限（ms）：移出触发元素/卡片后延迟关闭，期间移回触发元素或移入卡片即取消（保证卡片可停留交互）。',
      },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: 'top',
        description: '浮层相对触发元素的方向；打开期间切换会按新方向重排（不做视口碰撞翻转）。',
      },
    ],
    slots: [
      {
        name: 'trigger',
        description:
          '触发元素：单个元素/组件 vnode 时直接作为触发元素（克隆合并 id、aria-expanded、aria-controls 与 hover/focus/Esc 监听，不产生包装 DOM，元素应可聚焦如 button/a/本库 Button）；文本/多根/空插槽回退为内建原生 button 触发器。应始终有可读 label。',
      },
      {
        name: 'default',
        description: '预览卡内容：用户/条目信息摘要，可含链接、按钮等轻交互（指针/焦点停留不关闭）；未提供该插槽时不弹层。',
      },
    ],
    events: [
      {
        name: 'update:modelValue',
        payload: 'boolean',
        description:
          '显隐变更（v-model）：hover/focus 进入离开、Esc 等一切路径先发出，由使用方决定实际状态（非受控下组件同步落位）。',
      },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: [
      'Tooltip（纯文字提示：浮层 pointer-events:none、无卡片结构、无 update:modelValue）',
      'Popover（点击开合 + scrim；HoverCard 无点击路径，hover/focus 即开即收）',
      'DropdownMenu（菜单模式与键盘漫游；HoverCard 不做菜单语义）',
      'Dialog/Toast（模态阻断或主动通知，与 hover/focus 驱动的被动预览语义不同）',
    ],
    dependsOn: [],
  },
  composition: {
    patterns: [
      'Avatar/用户名 + HoverCard（个人资料摘要 + 关注/查看主页链接）',
      '表格/列表条目 + HoverCard（条目预览卡：缩略信息 + 查看详情）',
      '引用/链接 + HoverCard（来源摘要预览）',
    ],
    related: ['Tooltip', 'Popover', 'DropdownMenu', 'Avatar', 'Badge'],
    preferred: [
      '触发元素用原生交互元素（button/a/input…）或本库 Button/Avatar，保持键盘可达',
      '预览内容保持摘要粒度（几行内 + 至多一条主操作）；完整功能页请放链接跳转',
      '需要长停留阅读或表单操作时改用 Popover（点击驱动，无移出即收的节奏）',
    ],
  },
  states: {
    default:
      '关闭态只渲染触发元素（无浮层 DOM）；触发元素 aria-expanded="false"。受控 modelValue=true 时挂载即打开（自动定位）。',
    hover:
      '指针进入触发元素 openDelay（默认 150ms）后开启预览卡；移出后 closeDelay（默认 150ms）宽限内移回触发元素或移入卡片即取消关闭；移出卡片宽限后关闭。',
    focusVisible:
      '键盘聚焦触发元素（focusin）同样经 openDelay 延迟开启（与鼠标同构，不可关闭该路径）；Tab 可进入卡片内容，焦点离开卡片/触发元素宽限关闭；焦点环由全局 :focus-visible 约定提供，组件不改动 tabindex。',
    active: '卡片内交互元素（链接/按钮）保持自身交互态；组件不改变内容元素的按压/激活样式，卡片自身无按压态。',
    disabled:
      '组件级无 disabled；触发元素自身 disabled（如原生 button）时其不派发 mouse/focus 事件，浮层不会被触发。受控使用方也可通过忽略 update:modelValue 控制显隐。',
  },
  accessibility:
    'hover + focus 双触发（键盘可达）：触发元素恒挂 aria-expanded（true/false），打开时挂 aria-controls 指向卡片 id；卡片 role="dialog"（非模态，不设 aria-modal）经 aria-labelledby 指向触发元素 id 形成双向关联。键盘路径：Tab 聚焦触发元素即按 openDelay 开启；焦点可继续 Tab 进入卡片内容（焦点移入卡片不关闭）；Tab 离开（focusout）或 Esc（触发元素/卡片内）关闭并把焦点还原到触发元素。触发元素保持原生语义（不加 role、不改 tabindex）。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；renderToString 只输出根元素与触发元素（含 aria-expanded="false" 与 ui-hover-card 根类），不渲染浮层/内容、不输出 aria-controls；Teleport、rect 测量、开合计时与 document/window 监听全部推迟到客户端，onBeforeUnmount 清理（卸载兜底复位计时器与监听）。',
  performance:
    '常驻监听只有 scroll（capture）与 resize，回调以 isOpen 守卫、仅在打开时重算 rect；待开启/待关闭计时互斥（同一时刻至多一个），props 变更即时生效于下一次开合；定位为单段测量（触发元素 rect + 结构性 translate），无需测量卡片自身尺寸。入场动效为 token 时长的 opacity 动画，prefers-reduced-motion 下随 --ui-motion-fast 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：层级走 --ui-z-dropdown（锚定卡片层，低于 tooltip 层使卡片内 tooltip 仍可覆盖）、卡片底 --ui-surface、描边 --ui-border、文字 --ui-text-1、圆角 --ui-radius-md、阴影 --ui-shadow-pop、内边距 --ui-space-4、最大宽度由间距标尺推导；浮层视口坐标来自触发元素 rect 测量，与触发元素的间距在 calc 内引用 --ui-space-2。卡片 1px 描边为结构性细线（无 --ui-border-width token，已在任务结果中提出需求）。组件包不引入全局 CSS。',
  examples: [
    "<HoverCard placement='bottom'>\n  <template #trigger>\n    <button type='button' class='mention'>@林晚晴</button>\n  </template>\n  <Avatar name='林晚晴' alt='林晚晴的头像' />\n  <p>产品设计师 · 关注纸面设计系统</p>\n</HoverCard>",
    "<HoverCard v-model='open' :open-delay='200' :close-delay='300'>\n  <template #trigger><a href='/items/42'>设计规范 v2</a></template>\n  <p>更新于 3 天前 · 12 个章节</p>\n</HoverCard>",
    "<HoverCard>\n  <template #trigger><Button variant='ghost'>悬停预览条目</Button></template>\n  <article>摘要卡片：标题、元信息与查看详情链接</article>\n</HoverCard>",
  ],
  agent: {
    keywords: ['hover-card', 'HoverCard', 'hovercard', '悬停卡片', '悬停预览', '悬浮卡片', '预览卡', '用户预览', '条目预览', 'profile 卡片', 'overlay', '浮层', 'hover 弹出'],
    selectionHints: [
      '悬停展示富摘要（头像/条目卡/引用预览）→ HoverCard；一句话纯文字 → Tooltip；点击开合 + 表单 → Popover',
      'hover + focus 双触发内建（focusin 与鼠标同构），无需为键盘可达另写触发',
      '需要受控显隐用 v-model（modelValue）；未传时组件自管开合',
      '指针停留/移入预览卡不关闭是内建行为（closeDelay 宽限），无需自行实现',
    ],
    commonTasks: ['用户头像/提及悬停展示资料摘要', '列表条目悬停预览详情卡', '链接/引用悬停展示来源摘要'],
    generationNotes: [
      'trigger 插槽必须是恰一个元素/组件 vnode；组件通过 cloneVNode 向其合并 id/aria/事件，不产生包装 DOM；文本/多根插槽回退内建 button 触发器',
      '写在 <HoverCard> 上的 attrs（class/data-*）会透传到触发元素；触发元素已有的事件监听器与组件内部监听器链式共存',
      'modelValue 传入（含 false）即受控：组件只 emit，显隐完全由使用方决定；不传则非受控自管',
      'placement 只做四方向定位，不做视口碰撞翻转；打开期间滚动/resize 会跟随重排，需要翻转方案请在上层解决',
      '无 expose：显隐走 v-model 与 update:modelValue，交互契约走 aria 与 DOM',
    ],
  },
}
