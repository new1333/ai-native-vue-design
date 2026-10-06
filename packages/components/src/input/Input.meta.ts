/**
 * Input 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Input.types.ts 保持一致；states 与 Input.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-input',
  version: '0.1.0',
  identity: {
    name: 'Input',
    package: '@ui/components',
    export: 'Input',
    category: 'inputs',
    description: '纸面单行输入：原生 input 封装（text/password），带 prefix/suffix 插槽、可清空按钮与错误态（aria-invalid），attrs 全量透传到原生输入框。',
  },
  intent: {
    what: '单行文本/密码的输入与编辑：受控 v-model(string)、前后缀内容、一键清空、校验错误态，原生属性经 attrs 直达输入框。',
    when: [
      '表单中的单行文本字段（标题、名称、搜索词、用户名等）',
      '密码输入（type="password"）',
      '需要前缀图标 / 后缀单位或图标的紧凑输入',
      '需要一键清空的长文本快速重输（clearable）',
      'FormField 内做校验反馈展示（status="error" + aria-describedby）',
    ],
    whenNot: [
      '多行长文本用 Textarea：Input 不支持多行与换行',
      '从候选项中选择用 Select / Combobox：自由输入不提供选项约束',
      '数值步进、日期选择等专用输入用对应组件：Input 不做键盘步进与弹出面板',
      '开/关或勾选语义用 Switch / Checkbox：Input 只承载自由文本',
      '富文本/格式化编辑器：Input 仅纯文本',
    ],
    userTask: '用户需要输入、编辑或清空一行文本，并感知其校验状态',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string', default: "''", description: 'v-model 绑定值；受控，清空按钮点击后以空串更新。' },
      { name: 'type', type: "'text' | 'password'", default: "'text'", description: '原生输入类型子集；password 用于密码场景。' },
      { name: 'placeholder', type: 'string', description: '占位文本；不替代 label（label 由使用方或 FormField 提供）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 灰化 + 不渲染清空按钮。' },
      { name: 'readonly', type: 'boolean', default: 'false', description: '只读：原生 readonly 属性（可聚焦可选中、不可编辑）+ 不渲染清空按钮。' },
      { name: 'maxlength', type: 'number', description: '最大输入长度：透传原生 maxlength，由浏览器原生截断。' },
      { name: 'status', type: "'default' | 'error'", default: "'default'", description: "校验状态：'error' 时容器描边转 danger 并推导 aria-invalid=\"true\"。" },
      { name: 'clearable', type: 'boolean', default: 'false', description: '可清空：有值且非禁用/只读时渲染清空按钮（aria-label="清空"，点击后焦点交还输入框）。' },
    ],
    slots: [
      { name: 'prefix', description: '输入框前内容（通常是内联 SVG 图标：viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件约束为 20）。' },
      { name: 'suffix', description: '输入框后内容（渲染于清空按钮之后，通常是单位或图标，约束同 prefix）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string', description: 'v-model 更新：原生 input 事件路径，载荷为输入框最新值。' },
      { name: 'clear', description: '点击清空按钮后触发（值已随 update:modelValue 置空）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 input（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Textarea（多行文本）', 'Select（选项选择）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达 input）',
      'prefix 搜索图标 + clearable 快速检索框',
      'type="password" + #suffix 显隐切换按钮（由使用方实现）',
    ],
    related: ['FormField', 'Form', 'Textarea', 'Select'],
    preferred: ['label 由 FormField 提供，勿以 placeholder 替代 label', '错误态配 status="error" 并以 aria-describedby 指向错误文案'],
  },
  states: {
    default: 'surface 底 + line 描边 + ink 文字；placeholder 为 text-3。',
    hover: '描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '焦点指示由容器描边统一承担：描边转 --ui-input-border-focus（accent）；内层原生 input 关闭全局 :focus-visible 焦点环，避免双重边框。error 态保持 danger 优先。',
    active: '输入控件无按压反馈；清空按钮为原生 button，hover 图标色 text-3 → text-1。',
    disabled: 'sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，不渲染清空按钮。',
    error: 'danger 描边（hover/focus 均保持 danger 优先于 accent），原生 input 置 aria-invalid="true"。',
  },
  accessibility:
    '原生 <input>（隐式 role=textbox），Tab 自然进入、直接键入；不书写 role/tabindex，不设置 aria-label（label 由 label[for] 或 FormField 提供，placeholder 不承担 label 职责）。status="error" 推导 aria-invalid="true"；aria-describedby 等原生属性经 attrs 直达 input 供 FormField 接入。清空按钮为原生 <button type="button">（Enter/Space 平台原生激活），aria-label="清空"，图标 svg aria-hidden="true"；mousedown preventDefault 保住输入框焦点（按住不丢焦点），点击清空后焦点交还输入框。disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅出现在客户端事件回调与暴露方法内。placeholder / maxlength / disabled / readonly / type / aria-invalid / 清空按钮 / attrs（id 等）均随 SSR 输出且落位原生 input。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生容器 class 与清空按钮可见性。动效只有 border-color / background-color / color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底 --ui-input-bg、圆角 --ui-input-radius、focus 描边 --ui-input-border-focus、error 描边 --ui-danger、间距 --ui-space-*、字号 --ui-text-md、占位/次级文字 --ui-text-2/--ui-text-3、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；attrs/class 透传落在原生 input 上可做定向覆盖。',
  examples: [
    "<Input v-model='title' placeholder='文档标题' />",
    "<Input v-model='pwd' type='password' placeholder='密码' clearable />",
    "<Input v-model='email' status='error' aria-describedby='email-error' />",
    "<Input v-model='keyword' clearable>\n  <template #prefix><svg viewBox='0 0 24 24'><!-- … --></svg></template>\n  <template #suffix>项</template>\n</Input>",
    "<Input :model-value='name' :maxlength='30' disabled />",
  ],
  agent: {
    keywords: ['input', '输入框', '文本框', 'text', 'password', '密码', 'placeholder', '占位', 'clearable', '清空', '清空按钮', 'maxlength', '字数限制', 'disabled', '禁用', 'readonly', '只读', 'error', '错误态', 'aria-invalid', 'prefix', 'suffix', '前缀', '后缀', 'v-model', '表单输入'],
    selectionHints: [
      '单行自由文本 → Input；多行 → Textarea；选项选择 → Select',
      '需要 label 与校验文案时用 FormField 包裹，勿用 placeholder 替代 label',
      '校验失败传 status="error" 并配 aria-describedby 指向错误文案',
    ],
    commonTasks: [
      '表单文本字段 + 校验错误态',
      '带搜索图标与清空的检索框',
      '密码输入 + 后缀显隐切换',
    ],
    generationNotes: [
      'v-model 为 string；点击清空会发出 update:modelValue("") 与 clear，并把焦点交还输入框',
      'id / name / autocomplete / aria-describedby / aria-label 等原生属性经 attrs 直达原生 input',
      '图标走 #prefix/#suffix 内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor）',
      'disabled/readonly 下不渲染清空按钮；maxlength 依赖浏览器原生截断',
    ],
  },
}
