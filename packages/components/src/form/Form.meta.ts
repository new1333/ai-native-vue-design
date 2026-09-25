/**
 * Form 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Form.types.ts 保持一致；states 与 Form.vue 实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-form',
  version: '0.1.0',
  identity: {
    name: 'Form',
    package: '@ui/components',
    export: 'Form',
    category: 'inputs',
    description: '纸面表单容器：原生 form 封装（novalidate），rules 声明式校验（同步/异步），全量通过才 emit submit，pending 拦截重复提交，并经 provide/inject 向 FormField 分发字段错误。',
  },
  intent: {
    what: '把一组表单字段组织为一次受控提交：提交前按 rules 全量校验，失败错误分发到各 FormField 展示，通过才发出 submit；pending 期间拦截提交防重复。',
    when: [
      '登录 / 注册 / 设置 / 创建等需要校验后提交的表单',
      '异步校验（唯一性检查等，校验函数返回 Promise）',
      '异步提交中需要以 pending 禁用提交按钮并拦截重复提交',
      '需要主动触发校验或清空校验状态（expose validate / resetValidation）',
    ],
    whenNot: [
      '嵌套字段 / 数组字段 / 字段联动 / schema 驱动等 Form Engine 能力（设计文档第二阶段）暂不支持，请勿依赖',
      '纯展示的数据详情区用 Typography/Card 组合，不要套 Form',
      '即时搜索等无需提交语义的输入组合直接用 Input，不必包 Form',
    ],
    userTask: '用户需要填写一组字段并提交，且在提交前获得逐字段的校验反馈',
  },
  api: {
    props: [
      { name: 'model', type: 'Record<string, unknown>', required: true, description: '表单数据对象：校验时 rules 按字段名从此取值传给校验函数。' },
      { name: 'rules', type: 'FormRules（字段名 → 校验函数数组）', default: '{}', description: '校验规则：函数返回 true（通过）/ 错误文案（失败）/ Promise（异步）；字段内按序取首个失败文案，字段间并行。' },
      { name: 'pending', type: 'boolean', default: 'false', description: '异步提交进行中（受控）：true 时拦截提交（不校验、不 emit submit），并并入插槽作用域 pending。' },
    ],
    slots: [
      { name: 'default', scope: '{ valid: boolean, pending: boolean, errors: Readonly<FormErrors> }', description: '表单内容（通常为若干 FormField + 提交 Button）。valid=当前无校验错误；pending=异步校验中或 pending prop；errors=字段名→文案的浅拷贝。' },
    ],
    events: [
      { name: 'submit', payload: 'SubmitEvent', description: '提交：仅当全量校验通过且非 pending 时触发；原生 submit 已 preventDefault（不会引发浏览器原生提交/刷新）。' },
    ],
    exposes: [
      { name: 'validate', type: '() => Promise<FormErrors>', description: '主动触发全量校验：更新内部 errors（同步驱动 FormField 展示）并返回错误集合，空对象即全部通过。' },
      { name: 'resetValidation', type: '() => void', description: '清空全部校验错误（不改 model 值）。' },
    ],
  },
  constraints: {
    dependsOn: ['使用方在应用入口引入 @ui/tokens/paper.css 提供 --ui-* token'],
  },
  composition: {
    patterns: [
      'Form + FormField + Input/Textarea/Select：字段错误经 provide/inject 自动流入 FormField',
      "提交按钮 <Button type='submit' :loading='pending'>：经默认插槽作用域取得 pending",
      '字段文案三件套：label + help（常驻提示）+ error（校验错误，出现时替代 help）',
    ],
    related: ['FormField', 'Input', 'Button', 'Dialog'],
    preferred: ['提交按钮用 type="submit" 以获得原生 Enter 隐式提交路径', '校验文案要可行动（说明如何修正），不要只写"格式错误"'],
  },
  states: {
    default: '无错误的静止态：errors 为空，作用域 valid=true、pending=false。',
    hover: '容器自身无 hover 表现（交互态由内部控件承担）。',
    focusVisible: '容器自身不承载焦点；焦点环由内部控件的全局 :focus-visible 约定提供（paper.css）。',
    active: '容器自身无按压表现。',
    disabled: '容器自身无 disabled；字段禁用由各控件自身 disabled 承担。',
    loading: "pending（受控 prop 或异步校验进行中）：提交一律拦截（不校验、不 emit submit），插槽作用域 pending=true 供提交按钮置 loading。",
    error: '校验失败：errors 更新（字段名→文案），作用域 valid=false；各 FormField 按注入错误展示 danger 文案并联动控件 aria-invalid。',
  },
  accessibility:
    '原生 <form novalidate>（自定义校验，关闭原生约束校验双轨）；Enter 隐式提交等键盘路径走浏览器原生行为，组件不改写 tabindex。提交语义统一收敛到原生 submit 事件（preventDefault 后校验网关）。错误反馈由 FormField 承担：label[for] 关联控件、aria-invalid/aria-describedby 落位控件、错误文案 danger 色可读。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API（无 window/document）。作用域 { valid, pending, errors } 初始值（true/false/{}）随 SSR 输出；useId 生成的控件 id 在 FormField 内 SSR 稳定。',
  performance:
    '无监听器、无测量、无定时器；仅提交/主动校验时按 rules 执行校验函数（字段间 Promise.all 并行）。容器无动效。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：字段间距 --ui-space-5（设计文档：表单字段间 24px）、字族 --ui-font-sans。容器不设底色/描边；字段级视觉由 FormField 与内部控件承担。',
  examples: [
    "<Form :model='form' :rules='rules' :pending='saving' @submit='save'>\n  <FormField name='title' label='标题' required>\n    <template #default='{ controlAttrs }'><Input v-bind='controlAttrs' v-model='form.title' /></template>\n  </FormField>\n  <template #default='{ pending }'>\n    <Button type='submit' :loading='pending'>保存</Button>\n  </template>\n</Form>",
    "const rules: FormRules = {\n  email: [(v) => (String(v).includes('@') ? true : '请输入合法邮箱')],\n  name: [async (v) => (await api.exists(String(v)) ? '名称已存在' : true)],\n}",
    "const errors = await formRef.value?.validate()\nif (Object.keys(errors).length === 0) await submit()",
  ],
  agent: {
    keywords: ['form', '表单', '提交', 'submit', '校验', '验证', 'validation', 'rules', '规则', 'pending', '提交中', '防重复提交', 'errors', '错误信息', '异步校验', 'async validation'],
    selectionHints: [
      '提交 + 校验 + 字段错误展示 → Form + FormField；无提交语义的输入组合不必包 Form',
      '异步提交期传 :pending 并把作用域 pending 接到提交按钮 loading',
      '嵌套/数组字段/字段联动属第二阶段 Form Engine，当前不要生成',
    ],
    commonTasks: [
      '登录/注册/创建表单（校验 + 异步提交 + pending 拦截）',
      '提交前异步唯一性校验',
      '主动校验（失焦/下一步按钮）与重置校验状态',
    ],
    generationNotes: [
      'rules 的校验函数入参是 model[field] 的值，返回 true 或错误文案；首个失败的文案生效',
      'submit 仅在全部通过且非 pending 时触发，原生 submit 已 preventDefault',
      '作用域 errors 是浅拷贝，勿依赖其引用做变更',
      'FormField 的控件必须 v-bind 插槽作用域 controlAttrs 才能获得 id/aria 关联',
    ],
  },
}
