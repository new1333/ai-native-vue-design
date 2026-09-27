/**
 * TreeSelect 的组件契约元数据（ComponentDefinition）。
 * api 字段与 TreeSelect.types.ts 保持一致；states 与 TreeSelect.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tree-select',
  version: '0.1.0',
  identity: {
    name: 'TreeSelect',
    package: '@ui/components',
    export: 'TreeSelect',
    category: 'inputs',
    description: '纸面树形下拉：combobox 触发器 + Teleport 弹层树面板（aria-activedescendant 焦点模型），受控 v-model，单选 / 多选（multiple）/ 级联复选（checkable）三种选中语义，可清空与空态兜底。',
  },
  intent: {
    what: '从树形层级候选项中选值：单选（值为 value | null）、多选（值为数组）、级联复选（父子勾选联动）；触发器显示已选 label（多选以「、」连接），树面板支持展开/折叠与键盘导航。',
    when: [
      '候选项有层级归属（组织架构、部门/人员、地区/网点、分类/条目）',
      '单选某个叶子或层级节点（如归属部门）',
      '多选多个节点（multiple）或按子树批量勾选（checkable，父勾选展开到子树、半选可见）',
      '需要键盘完成全程：↓/↑ 移动高亮、→ 展开/进子级、← 折叠/回父级、Home/End、Enter/Space、Esc',
      '选项为空/加载中时需要兜底文案（emptyText / empty 插槽）',
    ],
    whenNot: [
      '候选无层级关系用 Select：TreeSelect 的树面板对平铺列表是过度复杂度',
      '自由文本输入用 Input：TreeSelect 只能从给定选项中选择',
      '需要搜索/过滤树节点的复杂场景：当前版本不提供过滤',
      '异步按需加载子节点（懒加载）：当前版本 options 一次性给定',
      '开/关语义用 Switch；单个开关集合用 Checkbox/Radio',
    ],
    userTask: '用户需要在一棵树里定位并选中（或勾选/清空）一个或多个节点，并能用键盘展开、移动、确认',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'TreeSelectModelValue（单选 TreeSelectNodeValue | null；multiple/checkable 为 TreeSelectNodeValue[]）', default: 'null', description: 'v-model 绑定值；受控，以 === 匹配节点 value。单选清空后为 null，多选/复选清空后为 []。' },
      { name: 'options', type: 'TreeSelectOption[]（{label; value; disabled?; children?}，嵌套）', default: '[]', description: '树形选项全集；value 应在全树内唯一，children 为非空数组即为可展开节点，disabled 节点自身与子树均不可选且键盘导航跳过。' },
      { name: 'multiple', type: 'boolean', default: 'false', description: '多选：点击节点切换选中/取消，弹层保持打开；值为数组，触发器以「、」连接已选 label。' },
      { name: 'checkable', type: 'boolean', default: 'false', description: '级联复选：节点渲染复选框（图形 aria-hidden，状态由 aria-checked 承载），父勾选展开到全部可选后代、父仅在全部可选后代勾选时记为勾选、部分勾选为半选（aria-checked="mixed"）；值为数组（含全选的父节点值，先序排列）。' },
      { name: 'placeholder', type: 'string', default: "'请选择'", description: '占位文本（无已选值时显示在触发器内）；不替代 label。' },
      { name: 'emptyText', type: 'string', default: "'暂无选项'", description: '空态文案：options 为空数组时树面板内显示（可用 empty 插槽覆盖）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘 + 不渲染清空按钮。' },
      { name: 'clearable', type: 'boolean', default: 'false', description: '可清空：有已选值且非禁用时渲染清空按钮（aria-label="清空"，与折叠箭标互换显示）。' },
    ],
    slots: [
      { name: 'trigger', scope: '{ displayLabel: string; labels: string[]; placeholder: string; open: boolean; disabled: boolean }', description: '触发器文案区自定义（折叠箭标/清空按钮仍由组件渲染；焦点与 combobox 语义不受影响）。' },
      { name: 'option', scope: '{ option: TreeSelectOption; level: number; expandable: boolean; expanded: boolean; selected: boolean; checked: boolean; indeterminate: boolean; disabled: boolean }', description: '节点文案区自定义（缩进、展开箭标、复选框仍由组件渲染；treeitem role/aria 不受影响）。' },
      { name: 'empty', description: 'options 为空数组时树面板内的空态内容（默认渲染 emptyText）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'TreeSelectModelValue', description: 'v-model 更新：单选为节点 value 或 null（清空）；多选/复选为 value 数组（清空为 []）。' },
      { name: 'change', payload: 'TreeSelectModelValue', description: '选中/勾选变化后触发，与 update:modelValue 同载荷；点击清空按钮只触发 clear 不触发 change。' },
      { name: 'clear', description: '点击清空按钮后触发（值已随 update:modelValue 置 null/[]，随后焦点交还触发器）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（触发器 blur 会关闭已打开的面板）。' },
    ],
  },
  constraints: {
    conflicts: ['Input（自由文本输入）', 'Switch（开/关语义）', 'Select（平铺无层级候选）'],
    dependsOn: [
      'tree（树形展示语义；当前版本的树面板在本组件目录内自实现扁平化渲染，未跨目录引用 Tree 组件）',
      '使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）',
    ],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达 combobox 触发器）',
      'multiple + 受控 modelValue 数组实现多节点回填（触发器以「、」连接已选 label）',
      'checkable 按子树批量勾选：传入父值即级联展开到可选后代，输出为先序全勾选值集',
      'options 由异步数据源驱动，空数组时以 emptyText / empty 插槽兜底（加载中）',
    ],
    related: ['Select', 'FormField', 'Form', 'Checkbox', 'Tree'],
    preferred: [
      'label 由 FormField 提供，勿以 placeholder 替代 label',
      '节点 value 在全树内保持唯一；需要展示父级路径时在 option 插槽内自行拼接',
      '按子树批量选择用 checkable，松散多选用 multiple',
    ],
  },
  states: {
    default: '触发器 surface 底 + line 描边 + ink 文字；未选时显示 placeholder（text-3）+ 折叠箭标；面板初始全部折叠。',
    hover: '触发器描边加深为 --ui-border-strong；节点行 hover 为 surface-muted 底；disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；触发器描边同步转 --ui-input-border-focus（accent）。',
    active: '打开后触发器箭标翻转 180°、可展开节点的展开箭标右转 90°；面板 surface 底 + line 描边 + shadow-pop，键盘高亮节点 surface-muted 底，单选已选/复选勾选节点 accent-soft 底 + accent 文字 + medium 字重，复选框勾选/半选为 accent 底 + on-accent 图标。',
    disabled: '触发器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，不渲染清空按钮，面板不可打开；disabled 节点自身与子树不可选，键盘导航跳过。',
    loading: '无内建 loading prop：options 异步加载中以空数组呈现，树面板显示 emptyText（默认「暂无选项」）或 empty 插槽内容，加载完成后正常渲染。',
    error: '未内建错误态；由使用方以 attrs（aria-describedby）配合 FormField 呈现。',
  },
  accessibility:
    '触发器为原生 <button type="button" role="combobox">，携带 aria-haspopup="tree"、aria-expanded、aria-controls（指向面板 id）与 aria-activedescendant（打开且有高亮时指向可见节点 id，否则不出现）。面板 role="tree"，可见节点扁平渲染为 role="treeitem" + aria-level（1 起）+ aria-expanded（仅可展开节点）+ aria-disabled；非复选用 aria-selected，复选用 aria-checked（true/false/mixed）。焦点模型：焦点始终停留在触发器，节点不进 Tab 序；键盘 ↓/↑ 移动高亮（跳过禁用节点）、→ 展开或进入首个子节点、← 折叠或回到父节点、Home/End 首尾、Enter/Space 打开或激活、Esc 关闭；受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活）。Tab 离开（触发器 blur）与点击外部均关闭面板；弹层与清空按钮 mousedown.prevent 保住触发器焦点。清空按钮为原生 <button type="button">、aria-label="清空"、图标 aria-hidden，点击后焦点交还触发器；disabled 用原生 disabled 而非 aria-disabled；复选框图形 aria-hidden（状态由 aria-checked 承载）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；树面板由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 role/aria-expanded/aria-controls 与 placeholder/已选 label），不出现 role="tree"/treeitem。面板 id 由 useId 生成（SSR/客户端一致）。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；面板定位（getBoundingClientRect）只在打开后的 nextTick 内执行。',
  performance:
    '常态零监听：仅打开期间存在一个 watch 定位（打开后一次 nextTick 计算 rect）；无定时器、无 ResizeObserver。可见节点由 options × 展开集合派生 computed（未展开子树不渲染）；级联勾选经「输入归一化 → 全勾选输出」两次纯函数 computed 派生。动效只有 border-color/background-color/color/transform 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。长树以 max-height（token 推导）+ overflow-y: auto 兜底，未做虚拟滚动。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus）；面板 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-dropdown；高亮节点 --ui-surface-muted、已选/勾选节点 --ui-accent-soft/--ui-accent、禁用节点 --ui-text-3；复选框勾选底 --ui-accent + 图标 --ui-on-accent；层级缩进宽度 = calc(var(--ui-space-3) × 级差)（级差为经节点 aria-level 派生的结构性计数）。无全局 CSS 引入；attrs/class 透传落在触发器 button 上可做定向覆盖。',
  examples: [
    "<TreeSelect v-model='dept' :options=\"[{ label: '研发部', value: 'rd', children: [{ label: '前端组', value: 'fe' }] }]\" />",
    "<TreeSelect v-model='members' :options='orgTree' multiple placeholder='选择成员（可多选）' />",
    "<TreeSelect v-model='perms' :options='permTree' checkable clearable @clear='onClear' />",
    "<TreeSelect :model-value='null' :options='[]' empty-text='选项加载中…' />",
    "<TreeSelect v-model='region' :options='regionTree' aria-describedby='region-error' />",
  ],
  agent: {
    keywords: ['treeselect', 'tree-select', '树形下拉', '树选择', '树形选择', '级联', '层级', '组织架构', '部门', '分类', '多选', '复选', '勾选', 'checkable', 'multiple', '展开', '折叠', '半选', 'indeterminate', 'combobox', 'tree', 'treeitem', '表单'],
    selectionHints: [
      '候选有层级 → TreeSelect；平铺列表 → Select；自由文本 → Input',
      '按子树批量勾选（权限、地区全选）用 checkable；松散多选多个节点用 multiple',
      '个别节点不可选时用 option.disabled（子树一并失效），而非整体 disabled',
      '需要按需加载子节点/搜索过滤时当前版本不支持，需自行在 options 层处理',
    ],
    commonTasks: [
      '组织架构/部门归属单选',
      '权限树、地区树级联勾选（checkable + clearable）',
      '多成员、多分类多选回填（multiple + 受控数组）',
      '异步加载选项 + 空态/加载中文案兜底',
    ],
    generationNotes: [
      'v-model 语义随模式变化：单选 TreeSelectNodeValue | null（清空 null）；multiple/checkable 为数组（清空 []）',
      'checkable 输出为先序全勾选值集（含全选父节点值）；传入父值会级联展开到全部可选后代',
      '键盘路径：↓/↑ 移动高亮（跳过禁用）、→ 展开/进子级、← 折叠/回父级、Home/End 首尾、Enter/Space 打开或激活、Esc/Tab/点击外部 关闭；单选激活即关闭，multiple/checkable 激活后面板保持打开',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达触发器 button',
      '面板 Teleport 到 body 且仅客户端渲染；定位在打开时按触发器 rect 计算，不做翻转/跟随滚动（需要时由使用方扩展）',
    ],
  },
}
