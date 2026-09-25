/**
 * Textarea 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Textarea.types.ts 保持一致；states 与 Textarea.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-textarea',
  version: '0.1.0',
  identity: {
    name: 'Textarea',
    package: '@ui/components',
    export: 'Textarea',
    category: 'inputs',
    description: '纸面多行文本输入：原生 textarea 封装，带字数统计（右下角弱文字）、垂直拉伸与错误态（aria-invalid），attrs 全量透传到原生控件。',
  },
  intent: {
    what: '多行文本的输入与编辑：受控 v-model(string)、可见行数、垂直拉伸、字数统计与校验错误态，原生属性经 attrs 直达控件。',
    when: [
      '表单中的多行文本字段（描述、备注、正文、反馈等）',
      '需要字数限制并展示 x/y 进度（maxlength + showCount）',
      'FormField 内做校验反馈展示（status="error" + aria-describedby）',
      '需要用户调整高度的长文本输入（resize 默认 vertical）',
    ],
    whenNot: [
      '单行短文本用 Input：Textarea 的多行排版与拉伸在单行场景是负担',
      '开/关或勾选语义用 Switch / Checkbox：Textarea 只承载自由文本',
      '从候选项中选择用 Select / Combobox：自由输入不提供选项约束',
      '富文本/Markdown 编辑器：Textarea 仅纯文本',
    ],
    userTask: '用户需要输入、编辑或查看一段多行文本，并感知其长度与校验状态',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string', default: "''", description: 'v-model 绑定值；受控，原生 input 事件路径更新。' },
      { name: 'rows', type: 'number', default: '3', description: '可见行数（原生 rows 属性），决定初始高度。' },
      { name: 'resize', type: "'none' | 'vertical'", default: "'vertical'", description: "用户可拉伸方向：默认仅垂直（不破坏容器栅格）；'none' 锁定为固定尺寸。" },
      { name: 'placeholder', type: 'string', description: '占位文本；不替代 label（label 由使用方或 FormField 提供）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 灰化。' },
      { name: 'readonly', type: 'boolean', default: 'false', description: '只读：原生 readonly 属性（可聚焦可选中、不可编辑）。' },
      { name: 'maxlength', type: 'number', description: '最大输入长度：透传原生 maxlength，由浏览器原生截断；同时作为字数统计分母 y。' },
      { name: 'showCount', type: 'boolean', default: 'false', description: '显示字数统计：容器右下角弱文字，配 maxlength 为 x/y，无 maxlength 为 x。' },
      { name: 'status', type: "'default' | 'error'", default: "'default'", description: "校验状态：'error' 时容器描边转 danger 并推导 aria-invalid=\"true\"。" },
    ],
    slots: [],
    events: [
      { name: 'update:modelValue', payload: 'string', description: 'v-model 更新：原生 input 事件路径，载荷为输入区最新值。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 textarea（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Input（单行文本）', 'Select（选项选择）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达 textarea）',
      'maxlength + showCount 做受限长度的简介/反馈输入',
      'resize="none" + rows 固定高度的代码/摘要只读展示',
    ],
    related: ['FormField', 'Form', 'Input', 'Select'],
    preferred: ['label 由 FormField 提供，勿以 placeholder 替代 label', '错误态配 status="error" 并以 aria-describedby 指向错误文案'],
  },
  states: {
    default: 'surface 底 + line 描边 + ink 文字；placeholder 与字数统计为 text-3 弱文字。',
    hover: '描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；容器描边经 :focus-within 同步转 --ui-input-border-focus（accent）。error 态保持 danger 优先。',
    active: '输入控件无按压反馈；用户可按 resize 档位垂直拉伸（结构性行为，无动效）。',
    disabled: 'sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序。',
    error: 'danger 描边（hover/focus 均保持 danger 优先于 accent），原生 textarea 置 aria-invalid="true"。',
  },
  accessibility:
    '原生 <textarea>（隐式 role=textbox），Tab 自然进入、直接键入（Enter 换行为平台原生）；不书写 role/tabindex，不设置 aria-label（label 由 label[for] 或 FormField 提供，placeholder 不承担 label 职责）。status="error" 推导 aria-invalid="true"；aria-describedby 等原生属性经 attrs 直达 textarea 供 FormField 接入。字数统计为可见真实文本（弱文字），读屏可感知长度；maxlength 依赖浏览器原生截断语义。disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅出现在客户端事件回调与暴露方法内。value（渲染为 textarea 内容）、rows / placeholder / maxlength / disabled / readonly / aria-invalid / 字数统计 / attrs（id 等）均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生容器 class 与字数文案。动效只有 border-color / background-color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底 --ui-input-bg、圆角 --ui-input-radius、focus 描边 --ui-input-border-focus、error 描边 --ui-danger、间距 --ui-space-*、字号 --ui-text-xs/--ui-text-md、行高 --ui-leading-small、弱文字 --ui-text-3、数字 --ui-numeric、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；attrs/class 透传落在原生 textarea 上可做定向覆盖。结构性例外：border-width: 1px（无 --ui-border-width token，与 Button/Input 同一缺口，已提出需求）。',
  examples: [
    "<Textarea v-model='desc' :rows='4' placeholder='项目描述' />",
    "<Textarea v-model='bio' :maxlength='200' show-count />",
    "<Textarea v-model='feedback' status='error' aria-describedby='feedback-error' />",
    "<Textarea :model-value='summary' :rows='3' resize='none' readonly />",
    "<Textarea v-model='draft' disabled />",
  ],
  agent: {
    keywords: ['textarea', '多行文本', '文本域', '多行输入', 'rows', '行数', 'resize', '拉伸', 'maxlength', '字数限制', 'showCount', '字数统计', '计数', 'disabled', '禁用', 'readonly', '只读', 'error', '错误态', 'aria-invalid', 'v-model', '表单输入'],
    selectionHints: [
      '多行长文本 → Textarea；单行 → Input；选项选择 → Select',
      '需要 label 与校验文案时用 FormField 包裹，勿用 placeholder 替代 label',
      '字数限制配 maxlength + showCount，截断由浏览器原生 maxlength 完成',
    ],
    commonTasks: [
      '表单多行字段（描述/备注/反馈）+ 校验错误态',
      '限长简介输入 + x/y 字数统计',
      '只读多行摘要展示（resize="none"）',
    ],
    generationNotes: [
      'v-model 为 string；resize 默认 vertical（仅垂直拉伸）',
      'id / name / aria-describedby / aria-label 等原生属性经 attrs 直达原生 textarea',
      'showCount 无 maxlength 时仅显示当前长度 x',
      'status="error" 只负责视觉与 aria-invalid，错误文案与 aria-describedby 由使用方/FormField 提供',
    ],
  },
}
