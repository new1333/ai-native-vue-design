/**
 * Select 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Select.types.ts 保持一致；states 与 Select.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-select',
  version: '0.1.0',
  identity: {
    name: 'Select',
    package: '@ui/components',
    export: 'Select',
    category: 'inputs',
    description: '纸面单选下拉：combobox 触发器 + Teleport 弹层 listbox（aria-activedescendant 焦点模型），受控 v-model(string|number|null)、清空按钮与空态文案。',
  },
  intent: {
    what: '从有限候选项中单选一个值：受控 v-model、键盘/指针双路径、可清空、空态兜底文案；选项为 {label, value, disabled?}[]。',
    when: [
      '表单中从枚举值里选一项（状态、分类、负责人等）',
      '候选项需要禁用个别选项（disabled）',
      '需要一键清空已选值回到占位态（clearable）',
      '选项较多需要键盘导航（↓/↑/Home/End/Enter/Esc）快速定位',
      '选项为空/加载中时需要兜底文案（emptyText）',
    ],
    whenNot: [
      '自由文本输入用 Input：Select 只能从给定选项中选择',
      '多选场景用多选组件：Select 严格单选',
      '选项需要分组/搜索过滤的复杂场景：当前版本不提供分组与过滤',
      '开/关语义用 Switch：Select 不是开关',
    ],
    userTask: '用户需要从候选列表中选定（或清空）一个值，并能用键盘完成全程操作',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'SelectValue | null（string | number | null）', default: 'null', description: 'v-model 绑定值；受控，以 === 匹配选项 value，null 表示未选（清空后以 null 更新）。' },
      { name: 'options', type: 'SelectOption[]（{label: string; value: SelectValue; disabled?: boolean}）', default: '[]', description: '选项全集；value 应唯一，disabled 项不可被高亮/选中。' },
      { name: 'placeholder', type: 'string', default: "'请选择'", description: '占位文本（无已选值时显示在触发器内）；不替代 label。' },
      { name: 'emptyText', type: 'string', default: "'暂无选项'", description: '空态文案：options 为空数组时弹层内显示。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘 + 不渲染清空按钮。' },
      { name: 'clearable', type: 'boolean', default: 'false', description: '可清空：有已选值且非禁用时渲染清空按钮（aria-label="清空"，与折叠箭标互换显示）。' },
    ],
    slots: [],
    events: [
      { name: 'update:modelValue', payload: 'SelectValue | null', description: 'v-model 更新：选项选中（载荷为选项 value）或清空（载荷为 null）。' },
      { name: 'clear', description: '点击清空按钮后触发（值已随 update:modelValue 置 null，随后焦点交还触发器）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（触发器 blur 会关闭已打开的弹层）。' },
    ],
  },
  constraints: {
    conflicts: ['Input（自由文本输入）', 'Switch（开/关语义）'],
    dependsOn: ['使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达 combobox 触发器）',
      'clearable + 受控 modelValue 实现可回退的选择',
      'options 由异步数据源驱动，空数组时以 emptyText 兜底',
    ],
    related: ['FormField', 'Form', 'Input', 'Button'],
    preferred: ['label 由 FormField 提供，勿以 placeholder 替代 label', '选项 value 在全集内保持唯一'],
  },
  states: {
    default: '触发器 surface 底 + line 描边 + ink 文字；未选时显示 placeholder（text-3）+ 折叠箭标。',
    hover: '触发器描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；触发器描边同步转 --ui-input-border-focus（accent）。',
    active: '打开后触发器箭标翻转 180°；弹层 surface 底 + line 描边 + shadow-pop，键盘高亮项 surface-muted 底，已选项 accent-soft 底 + accent 文字 + medium 字重。',
    disabled: '触发器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，不渲染清空按钮，弹层不可打开。',
    error: '未内建错误态；由使用方以 attrs（aria-describedby）配合 FormField 呈现。',
  },
  accessibility:
    '触发器为原生 <button type="button" role="combobox">，携带 aria-haspopup="listbox"、aria-expanded、aria-controls（指向弹层 id）与 aria-activedescendant（打开且有高亮时指向选项 id，否则不出现）。弹层 role="listbox"，选项 role="option" + aria-selected，禁用项 aria-disabled="true"。焦点模型：焦点始终停留在触发器，选项不进 Tab 序；键盘 ↓/↑ 移动高亮（跳过禁用项）、Home/End 首尾、Enter/Space 打开或选中、Esc 关闭；受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活）。Tab 离开（触发器 blur）与点击外部均关闭弹层；弹层与清空按钮 mousedown.prevent 保住触发器焦点。清空按钮为原生 <button type="button">、aria-label="清空"、图标 aria-hidden，点击后焦点交还触发器；disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；弹层由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 role/aria-expanded/aria-controls 与 placeholder/已选 label），不出现 listbox/option。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；弹层定位（getBoundingClientRect）只在打开后的 nextTick 内执行。',
  performance:
    '常态零监听：仅打开期间存在一个 watch 定位（打开后一次 nextTick 计算 rect）；无定时器、无 ResizeObserver。渲染为受控 computed 派生（选中项/占位/清空可见性）；动效只有 border-color/background-color/color/transform 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。长列表以 max-height（token 推导）+ overflow-y: auto 兜底，未做虚拟滚动。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus）；弹层 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-dropdown；高亮项 --ui-surface-muted、已选项 --ui-accent-soft/--ui-accent、禁用项 --ui-text-3；间距/字号走 --ui-space-*/--ui-text-*。无全局 CSS 引入；attrs/class 透传落在触发器 button 上可做定向覆盖。',
  examples: [
    "<Select v-model='status' :options=\"[{ label: '草稿', value: 'draft' }, { label: '已发布', value: 'published' }]\" />",
    "<Select v-model='owner' :options='owners' placeholder='选择负责人' clearable />",
    "<Select :model-value='null' :options='[]' empty-text='加载中…' disabled />",
    "<Select v-model='size' :options=\"[{ label: '小', value: 1 }, { label: '大', value: 2, disabled: true }]\" aria-describedby='size-error' />",
  ],
  agent: {
    keywords: ['select', '下拉', '下拉框', '下拉选择', '单选', '选择器', 'combobox', 'listbox', 'option', '选项', 'placeholder', '占位', 'empty', '空态', 'clearable', '清空', 'disabled', '禁用', 'v-model', '表单', '键盘导航', 'aria-activedescendant'],
    selectionHints: [
      '有限候选项中选一个 → Select；自由文本 → Input；开/关 → Switch',
      '需要 label 与校验文案时用 FormField 包裹，勿用 placeholder 替代 label',
      '个别选项不可选时用 option.disabled，而非整体 disabled',
    ],
    commonTasks: [
      '表单枚举字段（状态/分类/负责人）',
      '可清空的回退选择（clearable）',
      '异步加载选项 + 空态文案兜底',
    ],
    generationNotes: [
      'v-model 值类型为 string | number | null；清空发出 update:modelValue(null) 与 clear，并把焦点交还触发器',
      '键盘路径：↓/↑ 移动高亮（跳过禁用项）、Home/End 首尾、Enter/Space 打开或选中、Esc/Tab/点击外部 关闭',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达触发器 button',
      '弹层 Teleport 到 body 且仅客户端渲染；定位在打开时按触发器 rect 计算，不做翻转/跟随滚动（需要时由使用方扩展）',
    ],
  },
}
