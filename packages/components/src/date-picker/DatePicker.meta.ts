/**
 * DatePicker 的组件契约元数据（ComponentDefinition）。
 * api 字段与 DatePicker.types.ts 保持一致；states 与 DatePicker.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-date-picker',
  version: '0.1.0',
  identity: {
    name: 'DatePicker',
    package: '@ui/components',
    export: 'DatePicker',
    category: 'inputs',
    description:
      '纸面日期选择器：dialog 弹出面板 + role=grid 月视图（roving 键盘导航），date / datetime / range（DateRangePicker）三形态，受控 v-model 按 format 序列化，支持 min/max/disabledDate 约束、时间输入与可清空。',
  },
  intent: {
    what:
      '选择日期、日期时间或日期范围：受控 v-model（按 format 序列化的字符串 / [start, end] 元组 / null）、键盘/指针双路径、min/max/disabledDate 约束、可清空、trigger 与 panel-footer 插槽。',
    when: [
      '表单中选择单个日期（type="date"）或日期加时间（type="datetime"）',
      '选择起止区间（type="range"，即 DateRangePicker 形态），起止两段式点选',
      '需要约束可选范围：min/max 边界或自定义 disabledDate（如禁用周末与过去日期）',
      '需要键盘完成全程操作（方向键 roving、Home/End 行首尾、PageUp/PageDown 翻月、Enter 选中、Esc 关闭）',
      '需要自定义触发器或面板底部动作区（trigger / panel-footer 插槽）',
    ],
    whenNot: [
      '只需选择年或月（不带日粒度）：当前版本不提供 year/month 面板视图',
      '选择具体时刻且无需日期：用时间类输入，DatePicker 的时间输入只配合日期使用',
      '从有限枚举项中选择（如固定几个结算日）：用 Select 而非 DatePicker',
      '多选互不相干的日期集合：当前版本只支持单值与连续 range，不支持多选散点',
    ],
    userTask: '用户需要在日历面板上选定（或清空）一个日期、日期时间或起止区间，并能用键盘完成全程操作',
  },
  api: {
    props: [
      {
        name: 'modelValue',
        type: 'DatePickerModelValue（string | [string, string] | null）',
        default: 'null',
        description:
          'v-model 绑定值；受控。date/datetime 形态为按 format 序列化的字符串，range 形态为 [start, end] 元组，null 表示未选（清空后以 null 更新）。解析为严格模式（拒绝 2026-13-01、2026-02-30 等非法值，回落为未选）。',
      },
      {
        name: 'type',
        type: "DatePickerType（'date' | 'datetime' | 'range'）",
        default: "'date'",
        description:
          "形态：'date' 单选日期；'datetime' 日期 + 时间输入（面板内 input[type=time]）；'range' 日期范围（DateRangePicker 形态，起止两段式点选，先于起点的第二次点击会重置起点）。",
      },
      {
        name: 'format',
        type: 'string',
        default: "date/range：'YYYY-MM-DD'；datetime：'YYYY-MM-DD HH:mm'",
        description:
          '序列化格式（token：YYYY/MM/DD/HH/mm/ss，大小写敏感，其余字符原样）。modelValue 的解析与显示、min/max 的解析均按此格式。',
      },
      {
        name: 'min',
        type: 'string',
        default: 'undefined',
        description: '可选下界（按 format 解析，含当日；解析失败时忽略）。',
      },
      {
        name: 'max',
        type: 'string',
        default: 'undefined',
        description: '可选上界（按 format 解析，含当日；解析失败时忽略）。',
      },
      {
        name: 'disabledDate',
        type: '(date: Date) => boolean',
        default: 'undefined',
        description:
          '禁用判定：返回 true 的日期不可被选中（与 min/max 取并集），渲染为 aria-disabled="true"，键盘 roving 自动跳过。',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "按形态取：'选择日期' / '选择日期时间' / '选择日期范围'",
        description: '占位文本（未选时显示在触发器内）；不替代 label。',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘 + 不渲染清空按钮。',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description:
          '加载中：触发器 aria-busy="true" + wait 光标 + 拦截开合（供受限日历/异步数据就绪前的占位；不做内建 spinner）。',
      },
      {
        name: 'clearable',
        type: 'boolean',
        default: 'false',
        description:
          '可清空：有已选值且非禁用/加载时渲染清空按钮（aria-label="清空"，与日历图标共存于触发器右端）。',
      },
    ],
    slots: [
      {
        name: 'trigger',
        scope: 'DatePickerTriggerSlotProps（value: 当前值；display: 显示文案；open: 面板开合；disabled: 禁用/加载）',
        description:
          '自定义触发器内容（替换默认文案 + 日历图标）；开合行为与 aria 属性仍由组件持有，自定义内容不参与 aria 语义时请自带可读文本。',
      },
      {
        name: 'panel-footer',
        scope: 'DatePickerPanelFooterSlotProps（view: { year, month }；disabled: 是否禁用）',
        description:
          '面板底部动作区（如「清除」「今天」按钮）；渲染在时间行之下，随面板出现，Esc/点击外部关闭随之关闭。',
      },
    ],
    events: [
      {
        name: 'update:modelValue',
        payload: 'DatePickerModelValue（string | [string, string] | null）',
        description:
          'v-model 更新：date/datetime 选中时载荷为格式化字符串（datetime 未设置时间时按 00:00 合并）；range 起止点确定后载荷为按升序归位的 [start, end]；清空时为 null。',
      },
      {
        name: 'panelChange',
        payload: 'DatePickerPanelView（{ year: number; month: number }，month 1–12）',
        description: '面板视图年月变化时触发：翻页按钮点击或键盘 PageUp/PageDown。',
      },
      {
        name: 'clear',
        description: '点击清空按钮后触发（值已随 update:modelValue 置 null，随后焦点交还触发器）。',
      },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（触发器 blur 不直接关闭面板，面板随 Tab/Esc/点击外部关闭）。' },
    ],
  },
  constraints: {
    conflicts: ['Select（枚举单选，非日历）', 'Input（自由文本输入）'],
    dependsOn: ['使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达触发器）',
      'type="range" 用于报表/筛选器的起止区间，配合 panel-footer 提示当前选择进度',
      'min/max 或 disabledDate 约束可报名期、库存日等业务边界',
      'clearable + 受控 modelValue 实现可回退的日期选择',
    ],
    related: ['FormField', 'Form', 'Input', 'Select', 'Button'],
    preferred: [
      'label 由 FormField 提供，勿以 placeholder 替代 label',
      'modelValue 始终按 format 序列化存储；跨组件传递时保持同一 format',
      '业务禁用规则用 disabledDate 表达，固定边界用 min/max，二者取并集',
    ],
  },
  states: {
    default:
      '触发器 surface 底 + line 描边 + ink 文字 + 右端日历图标（text-3）；未选时显示占位文案（text-3）；面板打开后 surface 底 + line 描边 + shadow-pop + z-dropdown，月网格表头 text-3，邻接月日期 text-3。',
    hover: '触发器描边加深为 --ui-border-strong；可选日期格底色转 --ui-surface-muted；disabled/loading 不响应 hover。',
    focusVisible:
      '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；触发器与时间输入描边同步转 --ui-input-border-focus（accent）；月网格为 roving tabindex，焦点格即当前格。',
    active:
      '面板打开触发器 aria-expanded="true"；选中日与范围起止日 accent-soft 底 + accent 文字 + medium 字重，范围之间格 surface-muted 底；今天为 accent 文字 + medium 字重（aria-current="date"）；翻月由「上个月/下个月」按钮或 PageUp/PageDown 完成，年月标签 aria-live="polite" 播报。',
    disabled:
      '触发器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，面板不可打开，不渲染清空按钮。个别日期不可选时用 disabledDate/min/max（aria-disabled + not-allowed，键盘 roving 跳过），而非整体禁用。',
    loading:
      '触发器 aria-busy="true" + wait 光标，面板不可打开；不内建 spinner，加载完成前的值显示不变；与 disabled 互不排斥（loading 优先呈现 wait 语义）。',
    error: '未内建错误态；由使用方以 attrs（aria-describedby）配合 FormField 呈现。',
  },
  accessibility:
    '触发器为原生 <button type="button">，携带 aria-haspopup="dialog"、aria-expanded、aria-controls（指向面板 id）、loading 时 aria-busy="true"；面板 role="dialog" + aria-label（按形态取「选择日期/日期时间/范围」）。月网格 role="grid"（aria-label「日历」）：表头行 role="row" + role="columnheader"（aria-label 为「星期一」…全称），日期格为原生 button + role="gridcell"，携带 aria-selected（单选已选日/范围起止日）、aria-disabled（min/max/disabledDate 命中）、aria-current="date"（今天）与完整年月日 aria-label。焦点模型：面板打开时焦点移入月网格，日期格 roving tabindex（当前格 0、其余 -1）；键盘 ←/→/↑/↓ 移动（跳过禁用格、在可选格两端夹住）、Home/End 行首尾、PageUp/PageDown 翻月（发 panelChange）、Enter/Space 选中；Esc 关闭面板并把焦点交还触发器，Tab 离开触发器时面板关闭，点击外部关闭；时间输入为原生 <input type="time" aria-label="时间">。清空按钮为原生 button、aria-label="清空"、图标 aria-hidden，点击后焦点交还触发器；disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API（new Date() 非浏览器 API，初始视图仅取年月）；面板由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 aria-haspopup/aria-expanded/aria-controls 与占位或已选文案），不出现 dialog/grid/gridcell。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；弹层定位（getBoundingClientRect）与 roving 焦点落位只在打开后的 nextTick 内执行。',
  performance:
    '常态零监听：仅打开期间存在一个 watch 定位（打开后一次 nextTick 计算 rect）；月网格 42 格由 computed 派生，禁用判定随 min/max/disabledDate 缓存；无定时器、无 ResizeObserver。动效只有 border-color/background-color/color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。不做虚拟滚动（月网格固定 42 格）、不做翻月动画。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器与时间输入复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus）；面板 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-dropdown，宽度由 --ui-space-8 推导；选中/范围起止 --ui-accent-soft/--ui-accent，之间与悬停 --ui-surface-muted，今天 --ui-accent，禁用与邻接月 --ui-text-3；间距/字号走 --ui-space-*/--ui-text-*，数字对齐 --ui-numeric。无全局 CSS 引入；attrs/class 透传落在触发器 button 上可做定向覆盖。',
  examples: [
    "<DatePicker v-model='date' />",
    "<DatePicker v-model='datetime' type='datetime' format='YYYY-MM-DD HH:mm' />",
    "<DatePicker v-model='range' type='range' />",
    "<DatePicker v-model='start' :min='\"2026-09-01\"' :max='\"2026-09-30\"' :disabled-date=\"(d) => d.getDay() === 0 || d.getDay() === 6\" clearable />",
    "<DatePicker v-model='date' disabled />",
  ],
  agent: {
    keywords: [
      'date-picker',
      '日期选择',
      '日期选择器',
      '日历',
      '时间选择',
      '日期时间',
      '日期范围',
      'range',
      'DateRangePicker',
      '起止日期',
      'calendar',
      'min',
      'max',
      'disabledDate',
      '禁用日期',
      'clearable',
      '清空',
      'v-model',
      '表单',
      'roving',
      'grid',
    ],
    selectionHints: [
      '选日期/日期时间/日期范围 → DatePicker（type 三形态）；枚举单选 → Select；自由文本 → Input',
      '固定边界用 min/max，动态规则（如禁周末、禁过去）用 disabledDate，二者自动取并集',
      '需要 label 与校验文案时用 FormField 包裹，勿用 placeholder 替代 label',
      'modelValue 是格式化字符串（range 为元组），与 format 保持一致；不要传 Date 对象',
    ],
    commonTasks: [
      '表单日期字段（报名/截止/生效日）',
      '筛选器起止区间（type="range"）',
      '预约/排期选日期时间（type="datetime"）',
      '业务受限日历（min/max/disabledDate + clearable）',
    ],
    generationNotes: [
      'v-model 值按 format 序列化：date 为 string，range 为 [string, string]，未选为 null；清空发出 update:modelValue(null) 与 clear，并把焦点交还触发器',
      '键盘路径：触发器 ↓ 打开面板；面板内 ←/→/↑/↓ roving（跳过禁用格）、Home/End 行首尾、PageUp/PageDown 翻月（发 panelChange）、Enter/Space 选中、Esc 关闭并回焦触发器；Tab 离开触发器或点击外部关闭',
      'range 两段式：第一击落起点（不关面板不发值），第二击若早于起点则重置起点，否则发出 [start, end] 并关闭',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达触发器 button；面板 Teleport 到 body 且仅客户端渲染，定位在打开时按触发器 rect 计算，不做翻转/跟随滚动',
    ],
  },
}
