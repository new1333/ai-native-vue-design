/**
 * Artifact 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Artifact.types.ts 保持一致；states 与 Artifact.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-artifact',
  version: '0.1.0',
  identity: {
    name: 'Artifact',
    package: '@ui/components',
    export: 'Artifact',
    category: 'overlay',
    description:
      '纸面 AI 产物画布：Teleport 至 body 的模态浮层，聚焦展示 AI 生成的代码/文档产物并提供复制、关闭等操作；焦点圈定/还原与滚动锁复用 Dialog 同款实现，内容渲染（Markdown→HTML、代码高亮）由使用方完成后放入插槽。',
  },
  intent: {
    what: '在模态画布中承载一段 AI 生成的产物（代码、文档），提供标题、类型/语言徽标、IconButton 操作栏与完整关闭路径；本身不解析内容，只负责展示容器与操作。',
    when: [
      'AI 对话产出一段可复用代码，需要脱离对话流聚焦查看与复制',
      '生成的长文档/方案需要独立画布阅读，底部可挂「插入/下载」等动作',
      '需要统一的产物容器：类型徽标、IconButton 操作栏、Esc/遮罩/按钮三条关闭路径',
    ],
    whenNot: [
      '不做 Markdown/代码渲染与语法高亮：内容由使用方渲染后放入 default 插槽，本组件只承载展示与操作',
      '页面内嵌的非模态预览（不阻断底层交互）不适用：本组件是 Dialog 同族的模态浮层',
      '被动通知或短确认/表单任务用 Toast/Dialog：画布面向较长的生成产物',
    ],
    userTask: '用户需要聚焦查看并复制/保存 AI 生成的代码或文档产物',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: '受控可见性（v-model）：true 时 Teleport 浮层渲染至 body。' },
      { name: 'title', type: 'string', description: '标题文本；header 插槽存在时不渲染，面板可访问名称由使用方经 attrs（aria-label）提供。' },
      { name: 'type', type: "'code' | 'markdown'", default: 'code', description: '产物类型：驱动类型徽标、复制按钮可访问名与 ui-artifact--code/markdown 修饰类。' },
      { name: 'language', type: 'string', description: '代码语言（如 TypeScript）：存在时作为头部徽标文本，缺省回落到类型名（代码/文档）。' },
      { name: 'closeOnScrim', type: 'boolean', default: 'true', description: '点击遮罩是否请求关闭；防误触场景可置 false。' },
    ],
    slots: [
      { name: 'default', description: '产物内容主体（代码块/文档内容）；复制动作读取本区域的渲染文本（textContent）。' },
      { name: 'header', description: '整体替换默认头部（标题、类型徽标与操作栏）；使用后内置复制/关闭与 aria-labelledby 不再出具，面板命名经 attrs（aria-label）提供。' },
      { name: 'footer', description: '底部动作区（如「插入到文档」「下载」）；仅在提供时渲染，缺省无底部。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：一切关闭路径（遮罩/Esc/关闭按钮）发出 false。' },
      { name: 'close', payload: "'scrim' | 'esc' | 'action'", description: '请求关闭并附带来源；与 update:modelValue false 同步发出。' },
      { name: 'copy', payload: 'ArtifactCopyPayload { text: string; type: ArtifactType; language?: string }', description: '复制动作触发：text 为正文渲染文本（textContent，非源 Markdown）；组件已尽力写入系统剪贴板（能力缺失时静默，由使用方兜底）。' },
    ],
    exposes: [
      { name: 'focus', type: '() => void', description: '将焦点移入画布面板（首个可聚焦元素，否则面板自身）；仅客户端有意义。' },
    ],
  },
  constraints: {
    conflicts: ['Dialog（短确认/表单任务，无产物容器语义）', 'Toast（被动通知）', 'Drawer（侧滑工作区）'],
    dependsOn: ['IconButton（头部操作栏）', 'useDialog（焦点圈定/还原与滚动锁，复用 Dialog 实现）'],
  },
  composition: {
    patterns: ['代码产物（default 放高亮后的代码块 + language 徽标）', '文档产物（type=markdown + 渲染后的文档内容 + footer「插入/下载」）', 'header 插槽定制操作栏（重新生成、切换版本等，配 aria-label 命名面板）'],
    related: ['Dialog', 'IconButton', 'Button', 'PromptInput'],
    preferred: ['内容由使用方渲染后再传入（Markdown→HTML、代码高亮均不在本组件内）', 'footer 只放一个 primary 主动作', '长内容依赖正文区内部滚动，头部/底部保持可见'],
  },
  states: {
    default: '关闭态不渲染浮层（仅 SSR/挂载前输出 hidden 占位）；打开态：scrim 遮罩 + surface 白底画布面板、lg 圆角、modal 阴影，头部（标题+类型/语言徽标+IconButton 操作栏）与内部滚动的正文区构成，正文区横向溢出同样可滚动。',
    hover: '遮罩无 hover 反馈（非交互元素）；操作栏 IconButton 沿用自身 ghost 档 hover（砂底浮现、文字加深）。',
    focusVisible: '打开时焦点移入面板首个可聚焦元素（默认头部下为「复制」按钮），焦点环由全局 :focus-visible 约定提供（2px --ui-accent）；面板自身 tabindex="-1" 仅作程序化聚焦锚点。',
    active: '按压反馈由操作栏 IconButton 承载（ghost 档 active 缩放 ≤2%），浮层层无按压态。',
    disabled: '组件级无 disabled/loading；header 插槽场景下使用方自行组合 IconButton 的 disabled/loading 语义（disabled 元素自动移出焦点圈定候选集）。',
  },
  accessibility:
    'role="dialog" + aria-modal="true"，默认头部存在 title 时以 useId 生成的 id 经 aria-labelledby 关联；header 插槽整体替换头部时不自动出具，面板可访问名称经 attrs（如 <Artifact aria-label="…">，attrs 落在面板上）提供。键盘契约：打开时焦点移入（首个可聚焦元素，否则面板），Tab/Shift+Tab 在面板内循环圈定（焦点逃逸即拉回），Esc 请求关闭；关闭后焦点还原到打开前的元素。操作栏为原生 button 的 IconButton 组合，复制/关闭均带 aria-label；复制成功以瞬时 aria-label「已复制到剪贴板」+ 图标切换表达（复位延时见 constants）。遮罩为纯 div（无 role、不聚焦、无 tabindex）。body 打开期间挂 ui-dialog-scroll-lock class 并行内锁定 overflow（复用 Dialog 的滚动锁钩子，与 Dialog 嵌套时按计数协同）。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；挂载前不渲染浮层，renderToString 仅输出 hidden 的 ui-artifact 占位（输出稳定、含根类），Teleport 与焦点/滚动锁副作用全部推迟到客户端 onMounted 之后；剪贴板写入只发生在用户点击处理器内，卸载时清理已复制复位定时器并还原焦点。',
  performance:
    '无监听器/测量；焦点圈定仅在 keydown 时查询面板内可聚焦元素；已复制态由单个定时器复位并在卸载时清理。入场动效为 token 时长的 opacity/transform 动画，prefers-reduced-motion 下随 --ui-motion-* 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：z-index 走 --ui-z-modal、阴影 --ui-shadow-modal、圆角 --ui-radius-lg（徽标 --ui-radius-xs）、遮罩 --ui-scrim、颜色/字号/间距/动效全 token 化；画布宽度由 --ui-space-* 标尺推导（≈768px = space-8×12），组件包不引入全局 CSS。结构性细线 1px 无 --ui-border-width token（同 IconButton 处理，已提出需求）；代码等宽字体缺 --ui-font-mono token，代码内容字体交由使用方设置（可通过 ui-artifact--code 修饰类定制）。',
  examples: [
    "<Artifact v-model='open' title='排序工具函数' type='code' language='TypeScript'>\n  <pre><code>export function sortBy(items: Item[]) { … }</code></pre>\n</Artifact>",
    "<Artifact v-model='open' title='发布方案' type='markdown'>\n  <article>渲染后的 Markdown…</article>\n  <template #footer>\n    <Button @click='open = false'>取消</Button>\n    <Button variant='primary' @click='insert'>插入到文档</Button>\n  </template>\n</Artifact>",
    "<Artifact v-model='open' aria-label='重构建议' :close-on-scrim='false'>\n  <template #header>\n    <div class='my-toolbar'>自定义操作栏（重新生成/关闭 IconButton）</div>\n  </template>\n  内容…\n</Artifact>",
  ],
  agent: {
    keywords: ['artifact', '画布', '产物', 'AI 生成', '代码预览', '文档预览', '复制', 'copy', 'canvas', 'preview', 'overlay', '模态', '生成内容'],
    selectionHints: [
      'AI 生成的代码/长文档需要聚焦展示与复制 → Artifact；短确认/表单 → Dialog；被动通知 → Toast',
      '内容渲染（Markdown→HTML、代码高亮）由使用方完成后放入 default 插槽，本组件不解析内容',
      '需要自定义操作栏（重新生成/下载等）用 #header 插槽整体替换，并以 aria-label 补齐面板可访问名称',
      '源文本复制需求（复制 Markdown 源码而非渲染文本）在使用方 copy 处理器中替换 payload 处理',
    ],
    commonTasks: ['代码产物聚焦查看与复制', '生成文档的独立阅读与「插入/下载」动作', 'AI 对话产物容器统一化'],
    generationNotes: [
      'v-model 控制显隐；关闭只是发出 update:modelValue false，最终状态由使用方决定',
      'copy 事件的 text 是正文渲染文本（textContent），不是源 Markdown',
      'type/language 只影响徽标、可访问名与 ui-artifact--* 修饰类，不做语法高亮',
      'focus/焦点还原仅客户端有意义；SSR 输出为 hidden 占位',
    ],
  },
}
