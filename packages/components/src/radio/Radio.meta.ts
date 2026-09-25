/**
 * Radio 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Radio.types.ts 保持一致；states 与 Radio.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-radio',
  version: '0.1.0',
  identity: {
    name: 'Radio',
    package: '@ui/components',
    export: 'Radio',
    category: 'inputs',
    description: '纸面单选项：原生 input[type=radio]，name/选中/整组禁用来自 RadioGroup 注入，键盘行为全原生（方向键移动、Space 选中）。',
  },
  intent: {
    what: '互斥单选组中的一个选项：value + 可读 label，选中态由所在 RadioGroup 的受控值派生。',
    when: [
      '作为 RadioGroup 的子项使用（推荐且唯一推荐用法）',
      'label 需要富文本（默认插槽：链接、辅助说明）',
      '个别选项需要单独禁用',
    ],
    whenNot: [
      '脱离 RadioGroup 独立使用：无 name 分组则原生互斥与方向键导航失效（独立开关语义请用 Switch/Checkbox）',
      '可多选用 Checkbox：Radio 选中后不可取消（只能换选）',
      '作为动作按钮用 Button：Radio 表达选中态，不触发动作',
    ],
    userTask: '用户需要在单选组中选中一项，点文本或方向键即可换选',
  },
  api: {
    props: [
      { name: 'value', type: 'string | number', default: undefined, required: true, description: '该选项对应的值（必填）；change 时经 RadioGroup 以 update:modelValue 发出。' },
      { name: 'label', type: 'string', description: '可读名称；与默认插槽等价，插槽优先。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '单项禁用（与组 disabled 取或）：原生 disabled 属性。' },
    ],
    slots: [
      { name: 'default', description: 'label 内容（优先于 label prop）；点击文本即选中（根为 label 元素）。' },
    ],
    events: [
      { name: 'change', payload: 'Event', description: '原生 change 事件（经组件转发到组的选中路径；一般无需直接监听，改用 RadioGroup 的 update:modelValue）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 radio（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    requires: ['RadioGroup（提供 name / 选中值 / select 注入）'],
    conflicts: ['Checkbox（多选语义）', 'Switch（开关语义）'],
  },
  composition: {
    patterns: [
      'RadioGroup 内平铺多个 Radio（纵向排布，渲染序即导航序）',
      '默认插槽携带辅助说明或链接的富 label',
      '单项 disabled 用于「不可选但有展示价值」的选项',
    ],
    related: ['RadioGroup', 'Checkbox', 'Switch', 'FormField'],
    preferred: ['value 必须在组内唯一；label prop 或插槽必须提供其一，否则读屏无可读名称'],
  },
  states: {
    default: '未选：surface 圆框 + line-strong 描边；选中：accent 实底 + on-accent 圆点。',
    hover: '未选且未禁用时圆框描边加深为 --ui-border-strong；选中/禁用不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），绘制在原生 radio 热区（与视觉圆框重合）；不改写 outline 与 tabindex。',
    active: '无按压位移反馈；选中视觉随受控值以 opacity 过渡切换（--ui-motion-fast）。',
    disabled: '圆框灰化（sand 底 + line 描边）、圆点转 text-3、文本 text-3 + not-allowed 光标；原生 disabled 移出 Tab 序、不参与方向键导航。',
    error: '无内建 error 态：校验反馈由外层 FormField 承担。',
  },
  accessibility:
    '原生 <input type="radio">：checked / disabled 原生表达（无 aria-checked / aria-disabled）；键盘 100% 原生——Tab 进入组、方向键在同 name 组内移动并选中、Space 选中，组件不绑定 keydown、不改写 tabindex。根为 label 元素关联控件，点击文本即选中。圆点为纯装饰（aria-hidden），不进入可读内容。',
  ssr:
    'renderToString 无异常：provide/inject 渲染期生效，选中态随组受控值输出（checked 属性）；name / disabled / label 随 SSR 输出；不访问任何浏览器 API，focus()/blur() 仅客户端暴露方法。',
  performance:
    '无监听器（仅原生 change 转发）、无测量、无定时器；仅 computed 派生选中/禁用/类名。动效只有 border-color / background-color / opacity 过渡（--ui-motion-fast token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：圆框描边 --ui-border-strong、选中底 --ui-accent、圆点 --ui-on-accent、禁用底 --ui-surface-muted、弱文字 --ui-text-3、间距 --ui-space-2、字号 --ui-text-md、动效 --ui-motion-fast/--ui-ease-out。结构性例外：border-width 1px（无 --ui-border-width token）；圆形半径取 calc(var(--ui-space-4) / 2)（无圆形半径 token，已在任务结果中提出需求）；原生控件 opacity: 0 为结构性隐藏（非视觉取值）。',
  examples: [
    "<RadioGroup v-model='plan' name='plan'>\n  <Radio value='free' label='免费版' />\n  <Radio value='pro' label='专业版' />\n</RadioGroup>",
    "<Radio value='beta'>\n  Beta 通道（<a href='/notes'>更新说明</a>）\n</Radio>",
    "<Radio value='legacy' disabled>旧版接口（已下线）</Radio>",
  ],
  agent: {
    keywords: ['radio', '单选', '单选框', '选项', 'option', 'value', 'label', 'disabled', '禁用', 'checked', '选中', '表单'],
    selectionHints: [
      '单选组的一个选项 → Radio（必须包在 RadioGroup 内）',
      '可多选 → Checkbox；即时开关 → Switch',
      'label 含链接等富文本用默认插槽；纯文本用 label prop',
    ],
    commonTasks: [
      '在 RadioGroup 中罗列互斥选项',
      '带说明文案的单选项',
      '禁用某个不可用选项',
    ],
    generationNotes: [
      'value 必填且组内唯一；类型与 RadioGroup modelValue 一致（string | number）',
      '选中/取消由组受控值驱动：不要监听 Radio 的 change 来改自己的状态',
      'id / aria-label 等原生属性经 attrs 直达原生 radio',
      '不要单独给 Radio 传 name：组会下发统一 name（同名组互斥的原生依据）',
    ],
  },
}
