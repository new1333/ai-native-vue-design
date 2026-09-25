/**
 * IconButton 的组件契约元数据（ComponentDefinition）。
 * api 字段与 IconButton.types.ts 保持一致；states 与 IconButton.vue 样式实现同步。
 * 与 Button 的边界：IconButton 只承载"仅图标、无文本"的动作；一旦动作可用文本
 * 表达，必须用 Button（可读文本的可及性与可发现性远优于图标按钮）。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-icon-button',
  version: '0.1.0',
  identity: {
    name: 'IconButton',
    package: '@ui/components',
    export: 'IconButton',
    category: 'general',
    description: '纸面仅图标按钮：单一图标触发的即时动作按钮，复用 Button 系交互语义（ButtonRoot/useButton），三档视觉（ghost/outline/primary）、三档尺寸（图标 16/20/24），含 loading/disabled。',
  },
  intent: {
    what: '以单个内联 SVG 图标为全部内容的动作按钮，承载一次即时动作的触发。',
    when: [
      '工具栏 / 表格行 / 卡片角落的空间受限动作（编辑、复制、删除、收起）',
      '对话框、抽屉、标签页的关闭（关闭等约定图标 + aria-label）',
      '折叠/展开、播放/暂停等图标语义强、约定俗成的动作',
      '与 Button 混排的工具条（同尺寸档图标 16/20/24 对齐 Button sm/md/lg）',
    ],
    whenNot: [
      '动作能用文本表达时一律用 Button：IconButton 无可读文本，可发现性与可读性更差，icon-only 不是默认选择',
      '站内导航或外链用 <a>/<RouterLink>：IconButton 不渲染 href，没有链接语义',
      '开/关或选中状态的持续表达用 Switch/Checkbox/Radio：IconButton 表达即时动作，不承载选中态',
      '需要图标 + 文本组合的按钮用 Button 的 #icon/#iconRight 插槽，不要用 IconButton 塞文本',
    ],
    userTask: '用户需要通过一个约定俗成的图标，触发一个即时动作',
  },
  api: {
    props: [
      { name: 'variant', type: "'ghost' | 'outline' | 'primary'", default: 'ghost', description: '视觉档位：ghost 无底安静（工具栏默认）、outline 描边常规、primary accent 实底强调。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: '尺寸档位，映射图标渲染尺寸 sm=16 / md=20 / lg=24（与 Button 三档对齐）。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：图标让位于旋转指示、置 aria-busy="true"，点击与 Enter/Space 激活一律不触发 click，保持可聚焦（同 Button）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 拦截一切激活路径。' },
    ],
    slots: [
      { name: 'default', description: '图标内容：仅内联 SVG（viewBox="0 0 24 24"、stroke-width 1.5、currentColor），渲染尺寸由组件按 size 统一约束为 16/20/24；loading 时让位于加载指示。' },
    ],
    events: [
      { name: 'click', payload: 'MouseEvent', description: '点击激活；仅在非 disabled/loading 时触发，键盘 Enter/Space 激活走同一路径。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦根按钮元素（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    requires: [
      'aria-label 或 aria-labelledby（经 attrs 透传到根 button，两者皆缺时开发环境 console.warn）',
    ],
    conflicts: [
      'Button（动作可用文本表达时用 Button，见 intent.whenNot）',
      '<a>/<RouterLink>（导航与链接语义）',
    ],
    dependsOn: [
      'button/ 的 ButtonRoot（无样式交互根，内部为 useButton：点击网关 + Enter/Space 激活 + aria-busy）',
    ],
  },
  composition: {
    patterns: [
      '工具栏动作组（多个 IconButton 平铺，间距 --ui-space-*）',
      'Dialog/Drawer 右上角关闭按钮（ghost + aria-label="关闭"）',
      '表格行内操作列（编辑/删除，danger 语义可配 Toast 二次确认）',
    ],
    related: ['Button', 'ButtonGroup', 'Dialog', 'Tooltip', 'Table'],
    preferred: [
      '始终配 aria-label；约定图标（如 ×）也写明动作（"关闭"）而非形状（"叉号"）',
      'IconButton 与文本 Button 混排时保持同 size 档，视觉重心一致',
      '图标按钮-hover 可达性弱于文本按钮，重要低频动作建议叠加 Tooltip',
    ],
  },
  states: {
    default: 'ghost 透明底 text-2 图标；outline 白底描边 text-1；primary accent 实底 on-accent 图标。',
    hover: 'ghost 转 sand 底 + text-1；outline 转 sand 底 + 深描边；primary 转 --ui-accent-hover。disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不改 tabindex。',
    active: '在 hover 基础上 transform: scale(0.98)（≤2% 缩放，150ms token 动效）；disabled 无按压反馈。',
    disabled: '统一灰化：sand 底 + line 描边 + text-3 图标 + not-allowed 光标，原生 disabled 属性使其移出 Tab 序。',
    loading: '图标让位于旋转指示（16/20/24 随 size），aria-busy="true"，点击与 Enter/Space 均不触发 click，元素保持可聚焦（同 Button）。',
  },
  accessibility:
    '原生 <button>（隐式 role=button），可访问名完全依赖 aria-label / aria-labelledby（经 attrs 透传到根 button；两者皆缺时开发环境 console.warn 提示，见 constraints.requires）。Tab 自然进入/移出，Enter/Space 激活（keydown 统一 preventDefault 后由元素 .click() 单次触发，复用 useButton 策略）。loading 时 aria-busy="true" 且不置 disabled（保持焦点与读屏可达）；disabled 用原生 disabled。加载指示 svg aria-hidden="true"。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API（aria-label 检查只读 attrs，console.warn 在服务端同样安全）；.click()/focus() 仅出现在客户端事件回调与暴露方法内；aria-busy、disabled、图标 SVG 均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生 class。加载动画为纯 CSS transform 旋转（时长由 --ui-motion-* 推导），prefers-reduced-motion 下 token 归零立即停止。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic/component 层（含 --ui-button-primary-bg/--ui-button-primary-fg 别名）、间距 --ui-space-*、圆角 --ui-button-radius、动效 --ui-motion-*/--ui-ease-out。图标渲染尺寸 16/20/24 为 Icon Token 硬约束（无对应 size token）；描边 1px、scale(0.98) 与 Button.vue 同口径的结构例外。无全局 CSS 引入；深层定制走 ButtonRoot + 自行叠加 class。',
  examples: [
    "<IconButton aria-label='关闭' @click='close'><svg viewBox='0 0 24 24'><!-- × --></svg></IconButton>",
    "<IconButton variant='outline' size='sm' aria-label='编辑' @click='edit'><svg viewBox='0 0 24 24'><!-- 铅笔 --></svg></IconButton>",
    "<IconButton variant='primary' :loading='saving' aria-label='保存' @click='save'><svg viewBox='0 0 24 24'><!-- 对勾 --></svg></IconButton>",
    "<IconButton disabled aria-label='删除'><svg viewBox='0 0 24 24'><!-- 垃圾桶 --></svg></IconButton>",
    "<!-- aria-labelledby 指向可见文本 -->\n<span id='zoom-in-hint'>放大</span>\n<IconButton aria-labelledby='zoom-in-hint'><svg viewBox='0 0 24 24'><!-- 放大镜 --></svg></IconButton>",
  ],
  agent: {
    keywords: ['icon button', '图标按钮', 'icon', '图标', '工具栏', 'toolbar', '关闭', 'close', 'aria-label', 'icon-only'],
    selectionHints: [
      '仅图标动作 → IconButton（必须补 aria-label/aria-labelledby）；有文本动作 → Button；导航 → a/RouterLink',
      '空间受限的工具栏/行操作/关闭按钮 → IconButton ghost 默认档',
      '异步图标动作配 :loading 防重复触发',
    ],
    commonTasks: [
      '对话框关闭按钮',
      '表格行操作列',
      '工具栏图标动作组 + loading',
    ],
    generationNotes: [
      '生成时必须带上 aria-label 或 aria-labelledby，否则开发环境会 console.warn',
      '默认插槽只放单个内联 SVG（viewBox="0 0 24 24"、stroke-width 1.5、currentColor），不要放文本或位图',
      'loading 用 aria-busy 表达，不要叠加 disabled（loading 保持可聚焦，同 Button）',
      '图标颜色一律 currentColor，随档位态变色，不要写死 fill/stroke 颜色',
    ],
  },
}
