/**
 * InputNumber 的组件契约元数据（ComponentDefinition）。
 * api 字段与 InputNumber.types.ts 保持一致；states 与 InputNumber.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-input-number',
  version: '0.1.0',
  identity: {
    name: 'InputNumber',
    package: '@ui/components',
    export: 'InputNumber',
    category: 'inputs',
    description: '纸面数字输入：原生 input（role=spinbutton）封装，带步进/范围/精度控制、增减按钮、↑↓/PageUp/PageDown/Home/End 键盘步进与越界钳制，prefix/suffix 插槽，attrs 全量透传到原生输入框。',
  },
  intent: {
    what: '数值的输入与步进编辑：受控 v-model(number|null)、min/max 范围钳制、step 步长、precision 小数位，按钮与键盘（↑↓/PageUp/PageDown/Home/End）双步进路径。',
    when: [
      '表单中的数量、份数、端口、重试次数等有范围约束的数值字段',
      '需要点击 +/− 按钮或键盘 ↑↓ 快速微调的数值',
      '需要限制小数位（如金额 precision=2）或范围（min/max）的输入',
      '数值允许留空（modelValue 传 null，清空输入框即提交 null）',
      'FormField 内接入校验文案（aria-describedby 经 attrs 直达 input）',
    ],
    whenNot: [
      '自由文本（标题、名称、搜索词）用 Input：InputNumber 只承载数值',
      '多行文本用 Textarea；从候选项中选择用 Select',
      '连续区间滑动选择用 Slider（本库暂未提供时勿用 InputNumber 凑数）',
      '需要异步提交/校验的加载态（loading）：本组件为纯同步受控值，不做 loading',
      '需要千分位等区域化格式化或超大数/精确小数（超出 Number 语义）：展示仅支持 precision 小数位',
    ],
    userTask: '用户需要输入一个有范围/精度约束的数值，或通过按钮与键盘步进微调它',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'number | null', default: 'null', description: 'v-model 绑定值；受控，null 表示空（清空输入框提交 null）。受控值超出 [min,max] 时展示与 aria 按钳制值呈现，下一次提交/步进时才回写钳制值。' },
      { name: 'min', type: 'number', description: '允许的最小值；undefined = 无下界（不渲染 aria-valuemin）。空值起步步进时若有 min 则从 min 起步。' },
      { name: 'max', type: 'number', description: '允许的最大值；undefined = 无上界（不渲染 aria-valuemax）。' },
      { name: 'step', type: 'number', default: '1', description: '步长；非法（非有限正数）回退 1。PageUp/PageDown 一次跨 step × 10。' },
      { name: 'precision', type: 'number', default: 'undefined', description: '小数位数（>= 0）：提交/步进后按此取整并格式化展示（如 precision=2 时 3 显示为 "3.00"）；undefined = 不干预小数位。' },
      { name: 'controls', type: 'boolean', default: 'true', description: '是否渲染「减少/增加」步进按钮（aria-label="减少"/"增加"）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 灰化 + 拦截全部步进与提交路径。' },
    ],
    slots: [
      { name: 'prefix', description: '输入框前内容（通常是内联 SVG 图标或货币符号：viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件约束为 20）。' },
      { name: 'suffix', description: '输入框后内容（渲染于步进按钮之后，通常是单位或图标，约束同 prefix）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'number | null', description: 'v-model 更新：值实际发生变化（提交/步进/跳边界经钳制与精度取整后）时发出；在边界上原地步进不发出。' },
      { name: 'change', payload: 'number | null', description: '一次提交或步进导致值变化后触发，载荷为钳制/取整后的最终值。' },
      { name: 'step', payload: "direction: 'up' | 'down', value: number", description: '一次定向步进实际生效后触发：方向 + 步进后的值（到达边界被钳制为无变化时不发出）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 input（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（失焦即提交编辑草稿）。' },
    ],
  },
  constraints: {
    conflicts: ['Input（自由文本输入）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-label、aria-describedby 经 attrs 直达 input）',
      '#prefix 货币符号（¥/$）+ precision=2 做金额输入',
      '#suffix 单位（个 / % / 秒）+ min/max 做带量纲的数量输入',
      'controls=false + 依赖键盘 ↑↓ 的极简数值输入',
    ],
    related: ['Input', 'FormField', 'Form'],
    preferred: [
      '数值字段始终给 min/max（浏览器与读屏用户都受益于 aria-valuemin/max）',
      'label 由 FormField 提供，勿以 placeholder 替代 label',
      '金额/比率类字段配 precision 固定小数位',
    ],
  },
  states: {
    default: 'surface 底 + line 描边 + ink 文字；步进按钮图标 text-3；空值显示空输入框。',
    hover: '描边加深为 --ui-border-strong；步进按钮图标 text-3 → text-1；disabled 不响应 hover。',
    focusVisible: '焦点指示由容器描边统一承担：描边转 --ui-input-border-focus（accent）；内层原生 input 关闭全局 :focus-visible 焦点环，避免双重边框。步进按钮自身聚焦时保留全局焦点环。',
    active: '输入控件无按压反馈；步进按钮为原生 button，无按压位移。',
    disabled: 'sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使 input 与按钮移出 Tab 序，步进与提交路径全部拦截。',
  },
  accessibility:
    '原生 <input type="text" inputmode="decimal"> + role="spinbutton"（WAI-ARIA Spinbutton 模式）：aria-valuemin/aria-valuemax 仅在 min/max 有定义时渲染，aria-valuenow/aria-valuetext 在有值时渲染（空值省略，值经 [min,max] 钳制）。键盘：↑/↓ 逐 step、PageUp/PageDown 跨 step×10、Home/End 跳 min/max（有界时）、Enter 提交草稿，受理键一律 preventDefault。可访问名称由使用方经 attrs 提供（aria-label/aria-labelledby，或 FormField 的 label[for]）。增减按钮为原生 <button type="button">（Enter/Space 平台原生激活），aria-label="减少"/"增加"，图标 svg aria-hidden="true"。disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：状态机 useInputNumber 为纯逻辑（无任何浏览器 API），setup 与模块顶层不访问 window/document；focus()/blur() 仅出现在客户端事件回调与暴露方法内。受控值 / 钳制值 / role="spinbutton" / aria-valuemin/max/now / 步进按钮与 aria-label / prefix/suffix / attrs（id 等）均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；数值逻辑集中在 useInputNumber 纯函数（钳制/取整/解析），仅 computed 派生容器 class、呈现文本与 aria 属性。动效只有 border-color / background-color / color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：底 --ui-input-bg、圆角 --ui-input-radius、focus 描边 --ui-input-border-focus、间距 --ui-space-*、字号 --ui-text-md、次级/占位文字 --ui-text-2/--ui-text-3、数字等宽对齐 --ui-numeric、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；attrs/class 透传落在原生 input 上可做定向覆盖。',
  examples: [
    '<InputNumber v-model=\'count\' :min=\'1\' :max=\'99\' />',
    "<InputNumber v-model='price' :precision='2' :min='0' :step='0.5'>\n  <template #prefix>¥</template>\n</InputNumber>",
    "<InputNumber v-model='percent' :min='0' :max='100' :step='5'>\n  <template #suffix>%</template>\n</InputNumber>",
    "<InputNumber v-model='count' :aria-label='\"数量\"' :controls='false' />",
    "<InputNumber v-model='count' :min='0' disabled />",
  ],
  agent: {
    keywords: ['input-number', '数字输入', '数值输入', '步进器', 'stepper', 'spinbutton', 'step', '步长', 'min', 'max', '范围', 'precision', '精度', '小数位', 'clamp', '钳制', '数量', 'count', 'quantity', 'disabled', '禁用', 'prefix', 'suffix', 'v-model', '表单输入'],
    selectionHints: [
      '数值 + 范围/步进语义 → InputNumber；自由文本 → Input；连续区间滑动 → 未来 Slider',
      '需要固定小数位（金额、比率）时传 precision；需要上下限时传 min/max',
      '不需要按钮时 controls=false，键盘 ↑↓/PageUp/Home/End 仍可用',
    ],
    commonTasks: [
      '数量/次数输入 + min/max 钳制',
      '金额输入（#prefix 货币符号 + precision=2）',
      '百分比输入（#suffix 单位 + 0-100 范围）',
    ],
    generationNotes: [
      'v-model 为 number | null：清空输入框并失焦/回车即提交 null',
      '受控值越界不抛错：展示与 aria 按钳制值呈现，提交/步进时才回写钳制值',
      '步进总是基于「当前呈现值」：编辑中的草稿未提交时点击 +/−，会以草稿为基准步进并收敛草稿',
      '空值时步进：有 min 从 min 起步，否则从 0 起步',
      'id / aria-label / aria-describedby 等原生属性经 attrs 直达原生 input；step 事件仅在步进实际改变值时发出',
    ],
  },
}
