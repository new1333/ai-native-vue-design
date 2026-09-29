/**
 * Checkbox 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Checkbox.types.ts 保持一致；states 与 Checkbox.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-checkbox',
  version: '0.1.0',
  identity: {
    name: 'Checkbox',
    package: '@ui/components',
    export: 'Checkbox',
    category: 'inputs',
    description: '纸面勾选框：原生 input[type=checkbox] 语义 + 自绘方块视觉，支持半选（indeterminate）与禁用，label prop/插槽二选一。',
  },
  intent: {
    what: '一组可多选中的「勾选」语义：受控 v-model(boolean)、半选态、可读名称与禁用；勾选即选中，不做即时提交。',
    when: [
      '多选场景（列表批量选择、多项同意、多标签筛选）',
      '「全选 + 子项」的级联勾选（父项用 indeterminate 表达部分选中）',
      '表单中的布尔勾选项（同意协议等，随表单一起提交）',
      '需要富文本 label（默认插槽承载链接等内联内容）',
    ],
    whenNot: [
      '即时生效的开/关设置用 Switch：Checkbox 表达「勾选/选中」，不表达「立即切换某状态」',
      '多选一用 Radio / RadioGroup：Checkbox 允许全不选与多选',
      '只有文本、无勾选语义的展示用 Badge / Typography',
      '独立单个开关型动作用 Switch 或 Button：不要用无 label 的 Checkbox',
    ],
    userTask: '用户需要把若干选项标记为「已选中/未选中」，并可看到部分选中的中间态',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: 'v-model 绑定值；受控，原生 change 事件路径更新。' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: '半选态：视觉为 accent 实底短横线，并同步 DOM indeterminate property（SSR 无法表达，仅客户端 onMounted/watch 同步）；用户点击后浏览器自动清除，父层应随之复位为 false。' },
      { name: 'label', type: 'string', description: '可读名称；与默认插槽等价，插槽优先。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 灰化 + 拦截切换。' },
    ],
    slots: [
      { name: 'default', description: 'label 内容（优先于 label prop），可承载链接等内联富文本；点击文本即切换（根为 label 元素）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：原生 change 事件路径，载荷为勾选后的布尔值。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 checkbox（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Switch（即时生效的开/关语义）', 'Radio / RadioGroup（多选一）'],
  },
  composition: {
    patterns: [
      '父项 indeterminate + 子项列表做「全选/部分选中」级联',
      'label 默认插槽内放「我已阅读并同意 <a>服务条款</a>」类富文本',
      'FormField 外直接使用：Checkbox 自带可读名称，无需 FormField label',
    ],
    related: ['RadioGroup', 'Radio', 'Switch', 'FormField'],
    preferred: ['必须提供可读名称（label prop 或默认插槽），无名称时由使用方经 attrs 提供 aria-label', '级联勾选在子项变化时由使用方计算父项 modelValue 与 indeterminate'],
  },
  states: {
    default: '未选：surface 方块 + --ui-border-control 描边；选中/半选：accent 实底 + on-accent 对勾/短横线。',
    hover: '未选态方块描边加深一档为 --ui-border-control-strong；disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），绘制在原生控件热区（与视觉方块重合）；组件不改写 outline 与 tabindex。',
    active: '无按压位移反馈；点击即切换（原生 checkbox 激活路径），视觉随受控值即时翻转。',
    disabled: '方块灰化（sand 底 + line 描边）、标记转 text-3、文本 text-3 + not-allowed 光标；原生 disabled 移出 Tab 序并拦截一切切换路径。',
    error: '无内建 error 态：校验反馈由外层 FormField 的错误文案与 aria-describedby 承担。',
  },
  accessibility:
    '原生 <input type="checkbox">：checked/disabled 均为原生语义（不使用 aria-checked / aria-disabled），Tab 自然进入、Space 原生切换；根为 label 元素，点击文本即切换，无需 id/for。indeterminate 通过 DOM property 暴露给读屏（客户端 onMounted/watch 同步，SSR 输出不含该属性）。对勾/短横线标记 svg 均 aria-hidden，不进入可读内容。无可见 label 时必须经 attrs 提供 aria-label。',
  ssr:
    'renderToString 无异常：indeterminate 为 DOM property，SSR 阶段不触碰（onMounted 后同步）；label / checked（true 时输出 checked）/ disabled / attrs（id、aria-label 等）均随 SSR 输出；自绘方块与标记为纯 CSS，SSR 即完整呈现。',
  performance:
    '无监听器、无测量、无定时器；仅一个 watch 同步 indeterminate property 与 computed 派生根类。动效只有 border-color / background-color / opacity 过渡（--ui-motion-fast token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：未选方块描边 --ui-border-control（hover 加深为 --ui-border-control-strong，control 专用描边档，非文本对比 ≥3:1）、选中底 --ui-accent、标记色 --ui-on-accent、禁用底 --ui-surface-muted、弱文字 --ui-text-3、间距 --ui-space-2、圆角 --ui-radius-xs、字号 --ui-text-md、动效 --ui-motion-fast/--ui-ease-out。结构性例外：border-width: 1px（无 --ui-border-width token，与 Button/Input 同一缺口，已提出需求）；原生控件 opacity: 0 为结构性隐藏（非视觉取值），方块尺寸取 --ui-space-4（16px，图标最小档）。',
  examples: [
    "<Checkbox v-model='agreed' label='我已阅读并同意服务条款' />",
    "<Checkbox v-model='all' :indeterminate='isPart' @update:model-value='toggleAll'>全选</Checkbox>",
    "<Checkbox v-model='ids' … disabled>仅管理员可见</Checkbox>",
    "<Checkbox v-model='subscribe'>\n  订阅 <a href='/terms'>产品周报</a>\n</Checkbox>",
    "<Checkbox :model-value='false' aria-label='选择第 1 行' />",
  ],
  agent: {
    keywords: ['checkbox', '勾选', '复选框', '多选', '选中', 'indeterminate', '半选', '部分选中', '全选', 'checkAll', 'label', 'disabled', '禁用', 'v-model', '表单', '同意协议'],
    selectionHints: [
      '多选/可全不选 → Checkbox；多选一 → Radio；即时生效的开关 → Switch',
      '「全选 + 子项」：父项传 indeterminate，子项变化由使用方汇总',
      'label 含交互元素（链接/按钮）时用默认插槽；纯文本用 label prop',
    ],
    commonTasks: [
      '列表批量选择 + 全选级联',
      '表单协议勾选 + 校验（aria-describedby 由外层提供）',
      '多条件筛选的布尔开关集合',
    ],
    generationNotes: [
      'v-model 为 boolean；indeterminate 只表达视觉与读屏状态，不影响 v-model 的布尔载荷',
      '用户点击后浏览器自动清除 DOM indeterminate：父层应在 onChange 时把 indeterminate 复位为 false',
      'id / name / aria-label / aria-describedby 等原生属性经 attrs 直达原生 checkbox',
      '不要用 aria-checked（原生 checked 语义已足够）；禁用态由原生 disabled 承担',
    ],
  },
}
