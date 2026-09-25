/**
 * FormField 的组件契约元数据（ComponentDefinition）。
 * api 字段与 FormField.types.ts 保持一致；states 与 FormField.vue 实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-form-field',
  version: '0.1.0',
  identity: {
    name: 'FormField',
    package: '@ui/components',
    export: 'FormField',
    category: 'inputs',
    description: '纸面表单字段容器：label[for] 关联控件（useId 生成 SSR 稳定 id）、required 标记、help 与 danger 色错误文案，经插槽作用域 controlAttrs 把 aria-invalid/aria-describedby/aria-required 落位到控件；可独立使用（无 Form 时仅展示 error prop）。',
  },
  intent: {
    what: '为一个表单控件补齐字段级语义：可读 label、必填标记、帮助文案与校验错误文案，并完成控件与文案的无障碍关联。',
    when: [
      '表单字段需要 label / required / help / 错误文案的统一排版与 aria 关联',
      'Form 内接收校验错误并联动控件 aria-invalid（provide/inject，按 name 匹配）',
      '无 Form 的独立场景（搜索条、单字段设置项）用 error prop 自行展示错误',
    ],
    whenNot: [
      '只要控件不要字段语义时直接用控件本身，勿套空 FormField',
      '复杂布局的字段组（栅格对齐、多列）由使用方自行组合，FormField 只做单字段纵向结构',
    ],
    userTask: '用户需要知道字段含义、是否必填、如何填写，以及填错时错在哪里',
  },
  api: {
    props: [
      { name: 'name', type: 'string', required: true, description: '字段名：对应 Form 的 model 键与 rules 键，用于读取注入的校验错误。' },
      { name: 'label', type: 'string', description: '标签文本：渲染为 label[for=控件 id]；不传则不渲染 label。' },
      { name: 'required', type: 'boolean', default: 'false', description: '必填标记：label 后红色 *（aria-hidden 纯视觉），controlAttrs 附带 aria-required="true"。' },
      { name: 'error', type: 'string', description: '错误文案：优先于 Form 注入的校验错误，空串视为无错误；无 Form 时独立展示。' },
      { name: 'help', type: 'string', description: '帮助文案：无错误时展示于控件下方（aria-describedby 指向）；出现错误时让位。' },
    ],
    slots: [
      { name: 'default', scope: '{ id: string, invalid: boolean, controlAttrs: FormControlAttrs }', description: '表单控件；将 controlAttrs 直接 v-bind 到控件（或用 id/invalid 自行绑定），完成 label 关联与 aria 落位。' },
      { name: 'error', scope: '{ error: string }', description: '错误文案内容；覆盖 error prop 的文本渲染（作用于错误文案元素内）。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['placeholder 不承担 label 职责（不要以占位文本替代 label）'],
    dependsOn: ['使用方在应用入口引入 @ui/tokens/paper.css 提供 --ui-* token'],
  },
  composition: {
    patterns: [
      "Form > FormField(name) > 控件 v-bind controlAttrs：校验错误自动流入并联动 aria",
      'FormField + Input：controlAttrs 经 Input 的 attrs 透传直达原生 input',
      'help 常驻提示 + error 覆盖展示（出现错误时 help 让位）',
    ],
    related: ['Form', 'Input', 'Textarea', 'Select'],
    preferred: ['控件必须接收插槽作用域的 controlAttrs（或至少 id），否则 label 关联与 aria 落位失效', '错误文案说明修正方法，不只写"格式错误"'],
  },
  states: {
    default: '静止态：label（text-1，medium 字重）+ 控件 + help（text-3）纵向排布。',
    hover: '容器自身无 hover 表现（交互态由内部控件承担）。',
    focusVisible: '容器自身不承载焦点；焦点环由内部控件的全局 :focus-visible 约定提供（paper.css）。',
    active: '容器自身无按压表现。',
    disabled: '容器自身无 disabled；控件禁用由其自身 disabled 承担。',
    error: 'error prop 或注入错误非空：错误文案 danger 色展示于控件下方并替代 help，控件经 controlAttrs 获得 aria-invalid="true" 与 aria-describedby（指向错误文案 id）。',
  },
  accessibility:
    'label[for] 与控件 id 严格关联（id = 固定前缀 + Vue useId，SSR 稳定且各字段唯一）。错误时 controlAttrs 提供 aria-invalid="true"，aria-describedby 指向错误文案元素 id；无错误有 help 时指向 help 元素 id。required 提供 aria-required="true" 并渲染 aria-hidden 的红色 * 视觉标记。文案元素为 <p>（不使用 role="alert"，避免多字段同时失败时的重复打断朗读；状态变化经 aria-invalid 与描述关联传达）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；控件 id 由 Vue useId 生成（SSR/hydration 一致），label[for]、错误/帮助文案 id 与 controlAttrs 均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生错误文案与 controlAttrs。容器无动效。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：label --ui-text-sm/--ui-text-1/--ui-font-weight-medium、错误文案 --ui-danger、帮助文案 --ui-text-3、间距 --ui-space-1。无全局 CSS 引入；容器不设底色/描边。',
  examples: [
    "<FormField name='email' label='邮箱' required help='用于登录与找回密码'>\n  <template #default='{ controlAttrs }'>\n    <Input v-bind='controlAttrs' v-model='form.email' />\n  </template>\n</FormField>",
    "<FormField name='invite' label='邀请码' error='邀请码已失效'>\n  <template #default='{ id, invalid }'>\n    <Input :id='id' :status='invalid ? \"error\" : \"default\"' v-model='code' />\n  </template>\n</FormField>",
    "<FormField name='note' label='备注'>\n  <template #default='{ controlAttrs }'>\n    <Input v-bind='controlAttrs' v-model='note' />\n  </template>\n  <template #error='{ error }'>⚠ {{ error }}</template>\n</FormField>",
  ],
  agent: {
    keywords: ['form field', '表单字段', 'label', '标签', 'required', '必填', 'help', '帮助文案', '提示', 'error', '错误文案', 'aria-invalid', 'aria-describedby', 'aria-required', 'useId', 'id 关联'],
    selectionHints: [
      '字段需要 label/提示/错误文案 → FormField 包住控件',
      '控件务必 v-bind 作用域 controlAttrs（至少绑定 id）',
      '独立使用（无 Form）时用 error prop 自行控制错误展示',
    ],
    commonTasks: [
      '带 label 与校验错误的文本字段',
      '必填标记 + 帮助文案的字段',
      '自定义错误文案渲染（#error 插槽）',
    ],
    generationNotes: [
      'name 必填且要与 Form 的 model/rules 键一致，错误才能注入',
      '错误优先级：error prop > Form 校验错误；空串视为无错误',
      '出现错误时 help 让位，aria-describedby 始终指向当前可见文案',
      'aria-invalid/aria-describedby/aria-required 经 controlAttrs 落位控件，FormField 自身不渲染控件',
    ],
  },
}
