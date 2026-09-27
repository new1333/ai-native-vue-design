/**
 * PromptInput 的组件契约元数据（ComponentDefinition）。
 * api 字段与 PromptInput.types.ts 保持一致；states 与 PromptInput.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-prompt-input',
  version: '0.1.0',
  identity: {
    name: 'PromptInput',
    package: '@ui/components',
    export: 'PromptInput',
    category: 'inputs',
    description: '纸面 AI 提示词输入框：多行自适应高度（maxRows 封顶）、Enter 发送 / Shift+Enter 换行（IME 组合安全）、加载中停止（cancel），内建发送/停止按钮 + prefix/suffix/actions 插槽。',
  },
  intent: {
    what: '面向 AI 产品的提示词输入：受控 v-model(string)、多行自适应、Enter 发送 / Shift+Enter 换行、加载中切停止，attrs 直达原生 textarea。',
    when: [
      'AI 对话/助手界面的消息输入框（设计文档 §14.1 Interaction 首位）',
      '需要 Enter 快速发送、Shift+Enter 换行的多行输入场景',
      '生成进行中需要把发送动作切换为停止（loading + cancel）',
      '需要附加上下文或快捷键提示（prefix / suffix / actions 插槽）',
    ],
    whenNot: [
      '普通表单多行字段用 Textarea：PromptInput 的 Enter 发送语义会改变换行习惯',
      '单行短文本用 Input',
      '不做附件上传/管理：prefix 插槽由使用方自行承载附件 UI',
      '不做对话消息流与流式输出：那是 Conversation / StreamingText / AIResponse 族的职责',
      '不做字数统计与 token 计数展示',
    ],
    userTask: '用户撰写并提交一条给 AI 的提示词，生成期间可随时停止',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string', default: "''", description: 'v-model 绑定值；受控。submit 不自动清空输入，清空由使用方经 v-model 置空。' },
      { name: 'placeholder', type: 'string', description: '占位文本；不替代 label，无障碍名称可经 attrs 的 aria-label 直达原生 textarea。' },
      { name: 'maxRows', type: 'number', default: '8', description: '自适应高度的最大行数上限：内容随之长高，封顶后输入区内部滚动。' },
      { name: 'submitOnEnter', type: 'boolean', default: 'true', description: 'Enter 是否发送：默认发送；Shift+Enter 始终换行，IME 组合输入中 Enter 始终不发送（composition 安全）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled（移出 Tab 序），内建发送/停止按钮同步禁用。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：内建发送按钮切换为停止按钮（点击发出 cancel），Enter 不再发送。' },
    ],
    slots: [
      { name: 'prefix', description: '输入区上方内容（附件、上下文标签等），仅提供内容时渲染。' },
      { name: 'suffix', description: '底部操作区左侧内容（快捷键提示等弱信息），仅提供内容时渲染。' },
      { name: 'actions', description: '底部操作区内容：渲染于内建发送/停止按钮之前（增量扩展，不替换内建按钮）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string', description: 'v-model 更新：原生 input 事件路径，载荷为输入区最新值。' },
      { name: 'submit', payload: 'string', description: '提交（Enter 发送或点击内建发送按钮），载荷为提交时的输入值。' },
      { name: 'cancel', payload: '—', description: '请求停止：加载中点击内建停止按钮时发出。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 textarea（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Textarea（普通表单多行字段）', 'Input（单行文本）'],
  },
  composition: {
    patterns: [
      'v-model + @submit 提交后由使用方清空输入（组件保持纯受控）',
      'loading 接生成状态：true 期间停止按钮替代发送，@cancel 触发中断请求',
      'prefix 放上下文标签/附件入口，suffix 放 Enter/Shift+Enter 快捷键提示，actions 增加模板、语音等扩展动作',
    ],
    related: ['Textarea', 'Input', 'Button', 'Spinner'],
    preferred: [
      '提交后由使用方经 v-model 清空输入，勿依赖组件自动清空',
      '用 suffix 插槽提供「Enter 发送 · Shift+Enter 换行」可见提示，帮助键盘与读屏用户建立预期',
      'loading 由真实生成状态驱动，停止后置回 false',
    ],
  },
  states: {
    default: 'surface 底 + line 描边 + ink 文字；placeholder 与 suffix 为 text-3 弱文字；空值时发送按钮禁用（surface-muted 底 + text-3 图标）。',
    hover: '描边加深为 --ui-border-strong；发送按钮底色转 --ui-accent-hover；disabled 不响应 hover。',
    focusVisible: '容器描边经 :focus-within 同步转 --ui-input-border-focus（accent）；内层 textarea 的全局焦点环关闭（同 Input 先例）；内建按钮保留全局 :focus-visible 焦点环（2px accent + 2px 偏移）。',
    active: '发送按钮按压保持 hover 底色；输入区高度随内容自适应（mounted 后测量写回，无动效）。',
    disabled: 'sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使 textarea 与内建按钮均移出 Tab 序。',
    loading: '内建按钮切换为停止（aria-label「停止」，方形图标），保持 accent 底且键盘可达；Enter 不再发送；容器附 ui-prompt-input--loading 修饰类。',
  },
  accessibility:
    '原生 <textarea>（隐式 role=textbox、隐式多行），不书写 role/tabindex；id / aria-label / aria-describedby 经 attrs 直达控件。Enter 发送（可提交时 preventDefault 阻止换行）、Shift+Enter 原生换行、IME 组合中 Enter 原生确认候选词（compositionstart/end 跟踪 + isComposing 双保险）；submitOnEnter=false 时完全回到原生多行行为。内建发送/停止按钮为原生 button（type=button），aria-label 在「发送/停止」间切换，图标为 aria-hidden 装饰；加载中停止按钮保持可聚焦可激活（键盘可达的停止路径）。disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；自适应测量（scrollHeight/style 写入）由 usePromptInputAutosize 推迟到 onMounted（含其注册的 post watcher），onBeforeUnmount 停止，SSR 不执行。行数上限以 max-height 的 token 推导 calc 内联样式随 SSR 输出；rows="1"、value、placeholder、disabled、loading（停止按钮 aria-label）与 attrs（id 等）均随 SSR 输出。',
  performance:
    '常态零监听：仅 mounted 后存在一个 flush:"post" 的 watcher（受控值变化时一次 scrollHeight 测量与高度写回）；无 ResizeObserver、无定时器、无全局监听。发送/停止为同一按钮的状态切换（图标与 aria-label 重渲染，无 DOM 重建）。动效只有 border-color/background-color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底 --ui-input-bg、圆角 --ui-input-radius、focus 描边 --ui-input-border-focus、间距 --ui-space-*、字号 --ui-text-xs/--ui-text-md、行高 --ui-leading-small、弱文字 --ui-text-3、按钮 --ui-accent/--ui-accent-hover/--ui-on-accent/--ui-button-radius、disabled --ui-surface-muted、动效 --ui-motion-*/--ui-ease-out。行数上限为 max-height: calc(var(--ui-text-md) * var(--ui-leading-small) * maxRows)（行数是逻辑量）。无全局 CSS 引入。结构性例外：border-width: 1px（无 --ui-border-width token，与 Input/Textarea 同一缺口，已提出需求）。',
  examples: [
    "<PromptInput v-model='prompt' placeholder='给 AI 的提示词' @submit='send' />",
    "<PromptInput v-model='prompt' :max-rows='4' :loading='streaming' @submit='send' @cancel='stop' />",
    "<PromptInput v-model='prompt' :submit-on-enter='false' />",
    "<PromptInput v-model='prompt'><template #suffix><span>Enter 发送 · Shift+Enter 换行</span></template></PromptInput>",
    "<PromptInput model-value='服务维护中' disabled />",
  ],
  agent: {
    keywords: ['prompt input', '提示词输入框', 'AI 输入框', '输入框', '发送', 'Enter 发送', 'Shift+Enter 换行', '停止生成', 'stop', 'cancel', 'loading', '生成中', '自适应高度', 'maxRows', 'auto grow', '对话输入', 'chat input', 'composer'],
    selectionHints: [
      'AI 对话输入（Enter 发送 + 停止生成）→ PromptInput；普通表单多行字段 → Textarea',
      '需要高度封顶用 maxRows；完全自适应不封顶可给大值',
      '不希望 Enter 发送（如后台编辑场景）设 submit-on-enter=false',
    ],
    commonTasks: [
      '聊天界面输入框：v-model + @submit + @cancel + :loading',
      '带快捷键提示与扩展动作的提示词编辑区：suffix + actions 插槽',
      '上传上下文附件：prefix 插槽（附件 UI 由使用方实现）',
    ],
    generationNotes: [
      'v-model 为 string；submit 载荷为提交时的输入值，组件不自动清空，使用方需自行置空',
      'Enter 发送可被 submitOnEnter 关闭；Shift+Enter 永远换行；IME 组合中 Enter 永远不发送',
      'actions 插槽是增量扩展：内建发送/停止按钮始终保留在最右侧',
      'id / aria-label / aria-describedby 等原生属性经 attrs 直达原生 textarea',
      'loading 只切换发送/停止与键盘行为，不禁用输入区（用户可继续起草下一条）',
    ],
  },
}
