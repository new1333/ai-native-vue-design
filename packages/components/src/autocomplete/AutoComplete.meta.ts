/**
 * AutoComplete 的组件契约元数据（ComponentDefinition）。
 * api 字段与 AutoComplete.types.ts 保持一致；states 与 AutoComplete.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-autocomplete',
  version: '0.1.0',
  identity: {
    name: 'AutoComplete',
    package: '@ui/components',
    export: 'AutoComplete',
    category: 'inputs',
    description: '纸面自动完成：可编辑输入框（combobox）+ Teleport 建议弹层（listbox，aria-activedescendant 焦点模型），输入过滤 + 本地/远程建议源，受控 v-model（string 文本）、防抖 search、清空按钮与空态/加载态。',
  },
  intent: {
    what: '边输入边给建议、可从建议中选定（也可自由输入不选）：受控 v-model（输入文本，值+文本合一）、本地/自定义/远程过滤、键盘全程可达、可清空、空态与加载兜底。',
    when: [
      '候选集大或不可枚举，需要输入关键词缩小范围（城市、用户、标签等）',
      '建议来自远程接口：search 事件（自带 debounce 防抖）+ filter=false + 使用方更新 options + loading 态',
      '本地候选集的包含匹配/自定义匹配过滤（filter 缺省或传函数）',
      '用户输入应当被保留（自由文本合法），建议只是加速输入',
      '建议中有个别项不可选（option.disabled），需要键盘导航（↓/↑/Enter/Esc）',
    ],
    whenNot: [
      '候选集小且固定、必须二选一 → 用 Select（AutoComplete 允许自由输入，不强制从建议中选）',
      '纯文本输入、不需要建议 → 用 Input',
      '多选/标签（tag）输入：当前版本不提供，只支持单文本值',
      '不内建错误/校验态：由使用方以 attrs（aria-invalid/aria-describedby）配合 FormField 呈现',
      '不做建议分组、不做虚拟滚动（长列表以 max-height 滚动兜底）、弹层不做翻转/跟随滚动定位',
    ],
    userTask: '用户输入关键词获得建议，用键盘或指针从建议中选定（或保留自由输入），并可一键清空',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string', default: "''", description: 'v-model 绑定值：输入框文本（值+文本合一，受控）。选中建议后为该建议 label；自由输入为输入文本；清空后为空字符串。' },
      { name: 'options', type: 'AutoCompleteOption[]（{label: string; value?: string | number; disabled?: boolean}）', default: '[]', description: '建议全集；value 缺省视为与 label 相同，disabled 项不可被高亮/选中。远程模式下由使用方随 search 结果更新。' },
      { name: 'filter', type: 'boolean | ((option, keyword) => boolean)', default: 'true', description: '过滤策略：true（缺省）=本地包含匹配（label 含关键词，不区分大小写）；false=关闭本地过滤（远程模式，options 即已过滤结果）；函数=自定义本地过滤（入参为归一化建议与关键词原文）。' },
      { name: 'debounce', type: 'number', default: '200', description: 'search 事件防抖毫秒数，合并连续击键只发最后一次；0 表示立即发出。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：面板空结果时显示加载行（role=status），listbox 置 aria-busy="true"；有建议时仍渲染建议。' },
      { name: 'placeholder', type: 'string', default: "'请输入'", description: '占位文本；不替代 label。' },
      { name: 'emptyText', type: 'string', default: "'暂无匹配'", description: '空态文案：建议为空且非加载时面板内显示（empty 插槽可覆盖）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：输入框原生 disabled（移出 Tab 序）+ 拦截键盘/点击路径 + 不渲染清空按钮。' },
      { name: 'clearable', type: 'boolean', default: 'false', description: '可清空：文本非空且非禁用时渲染清空按钮（aria-label="清空"）。' },
    ],
    slots: [
      { name: 'option', scope: '{ option: AutoCompleteSelectedOption; index: number; active: boolean }', description: '自定义建议项内容（默认渲染 option.label）；option 为归一化建议（value 缺省已回退为 label），active 表示是否键盘高亮。' },
      { name: 'prefix', description: '输入框前缀内容（通常是搜索图标）。' },
      { name: 'suffix', description: '输入框后缀内容（渲染于清空按钮之后，通常是单位或说明）。' },
      { name: 'empty', description: '自定义空态内容（建议为空且非加载时），默认渲染 emptyText。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string', description: 'v-model 更新：键入、选中建议（载荷为 option.label）与清空（载荷为 \'\'）时发出。' },
      { name: 'search', payload: 'string', description: '关键词变化（键入/清空路径）经 debounce 防抖后发出，载荷为当前文本原文；远程搜索挂这里。选中建议会取消未决 search。' },
      { name: 'select', payload: 'AutoCompleteSelectedOption', description: '选中建议后触发，载荷为归一化建议；文本已随 update:modelValue 同步为 option.label。' },
      { name: 'clear', description: '点击清空按钮后触发（文本已随 update:modelValue 置 \'\'，随后走空关键词路径：面板打开 + search(\'\')，焦点交还输入框）。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦原生 input（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（blur 会关闭已打开的建议面板）。' },
    ],
  },
  constraints: {
    conflicts: ['Select（强制二选一，不允许自由文本）', 'Input（无建议列表的纯输入）'],
    dependsOn: ['使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）'],
  },
  composition: {
    patterns: [
      '远程搜索：@search（自带 debounce）里置 loading=true → 请求 → 更新 options 与 loading=false，filter=false 关闭本地过滤',
      'FormField 包裹获得 label / 描述 / 错误文案关联（id / aria-describedby 经 attrs 直达原生 input）',
      'clearable + 受控 modelValue 实现可回退的输入',
      'option 作用域插槽自定义建议渲染（label + 机器值徽标等），empty 插槽自定义空态',
    ],
    related: ['Input', 'Select', 'FormField', 'Form'],
    preferred: [
      'label 由 FormField 提供，勿以 placeholder 替代 label',
      '远程模式务必 filter=false，否则本地过滤会把远程结果再筛一遍',
      '机器值与文本不一致时用 select 事件负载的 option.value，勿解析文本反推',
    ],
  },
  states: {
    default: '输入框 surface 底 + line 描边 + ink 文字；空文本时 placeholder（text-3）。建议面板关闭。',
    hover: '容器描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '焦点指示由容器承担：focus-within 时容器描边转 --ui-input-border-focus（accent），内层 input 的全局 :focus-visible 焦点环结构性关闭（同 Input 先例，避免双重边框）。',
    active: '面板打开：surface 底 + line 描边 + shadow-pop，键盘高亮项 surface-muted 底，文本命中项（aria-selected）accent-soft 底 + accent 文字 + medium 字重，禁用建议 text-3 + not-allowed。',
    disabled: '容器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 移出 Tab 序，不渲染清空按钮，键盘与点击路径全拦截。',
    loading: 'loading=true 且建议为空时面板显示「加载中…」行（role=status）；listbox 置 aria-busy="true"；有建议时仍渲染建议。',
    error: '未内建错误态；由使用方以 attrs（aria-invalid / aria-describedby）配合 FormField 呈现。',
  },
  accessibility:
    'WAI-ARIA combobox + listbox 模式（输入框变体）：原生 <input type="text" role="combobox">，携带 aria-autocomplete="list"、aria-haspopup="listbox"、aria-expanded、aria-controls（指向弹层 id）与 aria-activedescendant（打开且有高亮时指向建议 id，否则不出现），autocomplete="off" 关闭浏览器自动填充。弹层 role="listbox"，建议 role="option" + aria-selected（文本命中即置位）+ aria-disabled。焦点模型：焦点始终停留在输入框，建议不进 Tab 序；键盘 ↓/↑ 打开或移动高亮（跳过禁用项、两端夹住）、Enter 选中高亮项（无高亮则关闭面板）、Esc 关闭；受理键一律 preventDefault（↓/↑ 防光标跳动、Enter 防表单误提交）。Tab/Home/End/Space 不劫持，保留文本编辑原义（Tab 离开经 blur 关闭面板）。高亮项随开合落位、↓/↑ 移动与异步建议替换（含钳回）滚动入弹层可视区（scrollIntoView block:nearest 最小滚动——aria-activedescendant 模式焦点不移动，浏览器不会自动滚动非焦点元素）。点击外部与 blur 均关闭；弹层与清空按钮 mousedown.prevent 保住输入框焦点。清空按钮为原生 <button type="button">、aria-label="清空"、图标 aria-hidden，点击后焦点交还输入框；disabled 用原生 disabled 而非 aria-disabled。加载行 role="status" 供读屏播报。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；弹层由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有输入框（含 role/aria-expanded/aria-controls/aria-autocomplete 与 value/placeholder）与清空按钮，不出现 listbox/option/空态/加载行。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；防抖定时器只在键入/清空事件路径创建、onBeforeUnmount 取消；弹层定位（getBoundingClientRect）只在打开后的 nextTick 内执行。',
  performance:
    '常态零监听：仅打开期间存在一个 watch 定位（打开后一次 nextTick 计算 rect）、一个 suggestions 高亮钳制 watch，以及高亮滚动入视口 watch（flush post，仅打开且有高亮时实际触达 DOM）；防抖定时器同一时刻至多一个（连续击键合并），卸载与选中路径即取消。渲染为受控 computed 派生（建议过滤/高亮/清空可见性）；动效只有 border-color/background-color/color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。长列表以 max-height（token 推导）+ overflow-y: auto 兜底，未做虚拟滚动。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：输入框容器复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus），prefix/suffix 走 --ui-text-2、图标 16/20/24；弹层 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-dropdown；高亮项 --ui-surface-muted、命中项 --ui-accent-soft/--ui-accent、禁用项 --ui-text-3；间距/字号走 --ui-space-*/--ui-text-*。无全局 CSS 引入；id / aria-describedby 等原生属性经 attrs 直达原生 input 可做定向关联与覆盖（static 属性 autocomplete="off" 等在 $attrs 之前，可被使用方覆盖）。',
  examples: [
    "<AutoComplete v-model='city' :options=\"[{ label: '北京', value: 'beijing' }, { label: '南京', value: 'nanjing' }]\" placeholder='输入城市' />",
    "<AutoComplete v-model='user' :options='remoteOptions' :filter='false' :debounce='300' :loading='loading' @search='onSearch' @select='onSelect' clearable />",
    "<AutoComplete v-model='tag' :options='tags' :filter='(option, keyword) => option.label.startsWith(keyword)' />",
    "<AutoComplete v-model='name' :options='[]' loading disabled aria-describedby='name-error' />",
  ],
  agent: {
    keywords: ['autocomplete', '自动完成', '自动补全', '输入联想', '联想输入', '建议', 'suggestion', 'combobox', 'listbox', '搜索框', 'search', '过滤', 'filter', '防抖', 'debounce', 'aria-autocomplete', '远程搜索', 'clearable', '清空', 'disabled', '禁用', 'loading', '加载', 'v-model', '表单'],
    selectionHints: [
      '需要边输入边出建议且允许自由输入 → AutoComplete；必须从固定候选中二选一 → Select；纯输入无建议 → Input',
      '远程建议：@search + :filter="false" + :loading，在 search 回调里更新 :options',
      '机器值与展示文本不同时，从 @select 的 option.value 取值，不要解析输入文本',
    ],
    commonTasks: [
      '城市/用户/标签等搜索联想（本地或远程）',
      '带防抖的远程搜索（debounce + search + loading）',
      '可清空的表单联想字段（clearable）',
    ],
    generationNotes: [
      'v-model 是输入文本（string，值+文本合一）：选中建议后文本为 option.label；机器值从 @select 负载的 option.value 获取',
      '键盘路径：↓/↑ 打开或移动高亮（跳过禁用项）、Enter 选中或关闭、Esc 关闭；Tab/Home/End/Space 不劫持（保留文本编辑原义）；高亮项自动滚动入弹层可视区',
      'search 事件经 debounce（默认 200ms）防抖后发出；清空按钮走空关键词路径（面板打开 + search(\'\')）',
      'id / aria-describedby / aria-invalid 等原生属性经 attrs 直达原生 input',
      '弹层 Teleport 到 body 且仅客户端渲染；定位在打开时按输入框 rect 计算，不做翻转/跟随滚动',
    ],
  },
}
