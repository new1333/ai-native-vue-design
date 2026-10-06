/**
 * ModelSelector 的组件契约元数据（ComponentDefinition）。
 * api 字段与 ModelSelector.types.ts 保持一致；states 与 ModelSelector.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-model-selector',
  version: '0.1.0',
  identity: {
    name: 'ModelSelector',
    package: '@ui/components',
    export: 'ModelSelector',
    category: 'inputs',
    description: 'AI 模型切换器（设计文档 §14.1 Interaction 点名）：会话/输入区选择当前模型，combobox 触发器 + Teleport 弹层 listbox，provider 以 badge 形态徽标呈现，受控 v-model(string|number|null)、加载态与禁用模型。',
  },
  intent: {
    what: '从可用模型清单中切换当前会话使用的 AI 模型：受控 v-model、provider 徽标（badge 形态）、键盘/指针双路径、加载态兜底文案；模型项为 {label, value, provider?, disabled?}[]。',
    when: [
      'AI 会话/输入区顶部或角落切换当前使用的模型（设计文档 §14.1 Interaction）',
      '模型需要标注提供方（provider 徽标，badge 形态）',
      '个别模型不可选（无权限/配额售罄）时用 model.disabled 置灰',
      '模型列表异步拉取时需要加载态（loading + loadingText）与空态（emptyText）兜底',
      '模型较多需要键盘导航（↓/↑/Home/End/Enter/Esc）快速定位',
    ],
    whenNot: [
      '模型列表需要搜索过滤/拼音检索的规模：当前版本不提供过滤，候选项很多时由使用方自行收敛清单',
      '需要分组展示（按提供方分节）的复杂清单：当前版本不提供分组',
      '多模型并存（主模型 + 备用模型同时生效）：ModelSelector 严格单选当前模型',
      '模型参数配置（temperature/top_p 等）与用量展示：分别属于表单控件与 TokenUsage，不在本组件',
      '普通表单枚举字段（状态/分类等）用 Select：ModelSelector 面向 AI 模型切换语义（provider 徽标/加载态）',
    ],
    userTask: '用户在会话/输入区从可用模型中选定（切换）当前对话所用的 AI 模型',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'ModelSelectorValue | null（string | number | null）', default: 'null', description: 'v-model 绑定值；受控，以 === 匹配模型项 value，null 表示未选。' },
      { name: 'models', type: 'ModelSelectorModel[]（{label: string; value: ModelSelectorValue; provider?: string; disabled?: boolean}）', default: '[]', description: '模型全集；value 需唯一（用作 key），provider 渲染为 badge 形态徽标，disabled 项不可被高亮/选中。' },
      { name: 'open', type: 'boolean', description: 'v-model:open 受控开合：传入（v-model:open / :open / @update:open 任一）即完全受控——open 跟随外部值，内部交互（点击触发器/选中/Esc/外点/blur）只派发 update:open；未传则非受控内部自管理（非受控同样上抛 update:open 全周期）。' },
      { name: 'placeholder', type: 'string', default: "'选择模型'", description: '占位文本（无已选模型时显示在触发器内）；不替代 label。' },
      { name: 'emptyText', type: 'string', default: "'暂无可用模型'", description: '空态文案：models 为空数组且非加载中时弹层内显示。' },
      { name: 'loadingText', type: 'string', default: "'模型列表加载中…'", description: '加载中文案：loading 期间打开弹层显示（替代选项渲染）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘/选中。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '模型列表加载中：弹层显示 loadingText、拦截一切选中路径（与 Suggestion 同纪律），根级 aria-busy="true"。' },
    ],
    slots: [
      { name: 'trigger', scope: '{ model: ModelSelectorModel | null; open: boolean }', description: '触发器内容：渲染在触发器 button 内部（role/键盘/aria 仍由组件承载），替换默认的「provider 徽标 + 模型名/占位 + 折叠箭标」；不要放入可聚焦元素。' },
      { name: 'option', scope: '{ model: ModelSelectorModel; index: number; selected: boolean; active: boolean }', description: '单个模型选项内容：按条目作用域定制（如加图标/推荐标记）；缺省渲染 provider 徽标（badge 形态）+ model.label。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'ModelSelectorValue（string | number）', description: 'v-model 更新：选中某个模型，载荷为其 value。' },
      { name: 'update:open', payload: 'boolean', description: 'v-model:open 更新：受控与非受控均上抛（受控时组件只派发、不自行开合）。' },
      { name: 'change', payload: 'ModelSelectorModel', description: '选中某个模型后触发（载荷为该模型对象，含 provider/disabled 字段），与 update:modelValue 同一交互路径先后发出；disabled/loading 拦截时不触发。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（触发器 blur 会关闭已打开的弹层）。' },
    ],
  },
  constraints: {
    dependsOn: ['Badge（provider 徽标，badge 形态）', '使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）'],
    conflicts: ['Select（普通表单枚举单选，无 provider/加载语义）', 'Input（自由文本输入）'],
  },
  composition: {
    patterns: [
      '置于 PromptInput/会话头部：当前模型名 + provider 徽标常驻触发器，切换即改写会话状态',
      'change 回调内同步使用方状态（如按模型能力调整输入区提示）',
      'models 由异步数据源驱动：拉取期间 :loading，空数组以 emptyText 兜底',
    ],
    related: ['PromptInput', 'Suggestion', 'Badge', 'Select'],
    preferred: ['models 的 value 用稳定 id（不要用展示名），provider 给短名（徽标空间有限）', '切换模型由使用方决定是否影响进行中的会话，组件只上抛选择结果'],
  },
  states: {
    default: '触发器 input 别名底 + line 描边 + ink 文字；未选时显示 placeholder（text-3）+ 折叠箭标；已选时 provider 徽标（Badge neutral：surface-muted 底 + text-2）+ 模型名。',
    hover: '触发器描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；触发器描边同步转 --ui-input-border-focus（accent）。',
    active: '打开后触发器箭标翻转 180°；弹层 surface 底 + line 描边 + shadow-pop，键盘高亮项 surface-muted 底，已选项 accent-soft 底 + accent 文字 + medium 字重，选项内 provider 徽标同 Badge 形态。',
    disabled: '触发器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，弹层不可打开。个别模型不可选用 model.disabled（aria-disabled="true"，键盘导航自动跳过）。',
    loading: '模型列表加载中：根级 aria-busy="true"；弹层打开显示 loadingText（替代选项渲染），选中路径一律拦截；触发器保持可开合（让用户看到加载反馈），不置原生 disabled。',
    error: '未内建错误态；模型清单拉取失败由使用方以空数组 + emptyText 或外部提示表达。',
  },
  accessibility:
    '触发器为原生 <button type="button" role="combobox">，携带 aria-haspopup="listbox"、aria-expanded、aria-controls（指向弹层 id）与 aria-activedescendant（打开且有高亮时指向选项 id，否则不出现）；loading 置根级 aria-busy="true"。弹层面板内 role="listbox" 仅承载选项（role="option" + aria-selected，禁用模型 aria-disabled="true"），loading/empty 提示行是 listbox 的兄弟节点（WAI-ARIA listbox 直接子元素仅允许 option/group，同 CommandPalette 先例），loading 行带 role="status"。焦点模型：焦点始终停留在触发器，选项不进 Tab 序；键盘 ↓/↑ 移动高亮（跳过禁用模型）、Home/End 首尾、Enter/Space 打开或选中、Esc 关闭；受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活）。Tab 离开（触发器 blur）与点击外部均关闭弹层；弹层 mousedown.prevent 保住触发器焦点。provider 徽标为纯文本 span（Badge 形态），保留可读名称不 aria-hidden。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；弹层由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 role/aria-expanded/aria-controls、provider 徽标与已选模型名/placeholder 及根级 aria-busy），不出现 listbox/option/loading 文案。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；弹层定位（getBoundingClientRect）只在打开后的 nextTick 内执行。',
  performance:
    '打开时一次 nextTick 定位（getBoundingClientRect + 内联样式写入）；挂载期间常驻一个 document scroll（capture）与一个 window resize 监听（浮层引擎，回调以 isOpen 守卫短路，关闭态零工作），打开期间视口变化按锚点最新 rect 重排；无定时器、无 ResizeObserver。渲染为受控 computed 派生（选中模型/占位/高亮/加载闸门）；动效只有 border-color/background-color/color/transform 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。长模型清单以 max-height（token 推导）+ overflow-y: auto 兜底，未做虚拟滚动与搜索过滤。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus）；弹层 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-popover（Teleport 到 body 的非模态弹层档，高于 modal）；provider 徽标复用 Badge 组件形态（neutral：--ui-surface-muted 底 + --ui-text-2、--ui-radius-xs、--ui-text-xs）；高亮项 --ui-surface-muted、已选项 --ui-accent-soft/--ui-accent、禁用模型 --ui-text-3；间距/字号走 --ui-space-*/--ui-text-*。无全局 CSS 引入；attrs/class 透传落在触发器 button 上可做定向覆盖。',
  examples: [
    "<ModelSelector v-model='current' :models=\"[{ label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' }, { label: 'Claude', value: 'claude', provider: 'Anthropic' }]\" />",
    "<ModelSelector v-model='current' :models='models' :loading='fetching' @change='(m) => switchModel(m)' />",
    "<ModelSelector v-model='current' :models='[]' empty-text='模型清单不可用' placeholder='选择模型' />",
    "<ModelSelector v-model='current' :models='[\n  { label: \"本地推理\", value: \"local\", provider: \"Local\" },\n  { label: \"旗舰模型\", value: \"flagship\", provider: \"OpenAI\", disabled: true }\n]'>\n  <template #option='{ model }'>{{ model.label }}</template>\n</ModelSelector>",
  ],
  agent: {
    keywords: ['model-selector', '模型选择', '模型切换', '模型切换器', 'AI 模型', 'provider', '提供方', '徽标', 'badge', 'LLM', '会话', '对话模型', 'combobox', 'listbox', 'loading', '加载中', 'disabled', '禁用', 'v-model'],
    selectionHints: [
      'AI 会话/输入区切换当前模型 → ModelSelector；普通表单枚举字段 → Select',
      '需要标注提供方时给 model.provider（badge 形态徽标自动渲染）；个别模型不可选用 model.disabled',
      '模型列表异步拉取期间置 :loading，切换后业务副作用放 @change',
    ],
    commonTasks: [
      '会话头部/输入区角落的当前模型切换',
      '按能力/价格切换模型并同步会话状态（@change）',
      '异步加载模型清单 + 加载/空态兜底',
    ],
    generationNotes: [
      'v-model 值类型为 string | number | null；change 载荷为完整模型对象（含 provider/disabled）',
      '键盘路径：↓/↑ 移动高亮（跳过禁用模型）、Home/End 首尾、Enter/Space 打开或选中、Esc/Tab/点击外部 关闭',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达触发器 button',
      '弹层 Teleport 到 body 且仅客户端渲染；定位在打开时按触发器 rect 计算，不做翻转/跟随滚动（需要时由使用方扩展）',
      '不做搜索过滤、分组、多模型并存与参数配置（见 intent.whenNot）',
    ],
  },
}
