/**
 * Cascader 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Cascader.types.ts 保持一致；states 与 Cascader.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-cascader',
  version: '0.1.0',
  identity: {
    name: 'Cascader',
    package: '@ui/components',
    export: 'Cascader',
    category: 'inputs',
    description: '纸面级联选择：combobox 触发器 + Teleport 分栏弹层（逐列 listbox，↑↓←→ 面板导航），受控 v-model 为值路径（单选一条 / 多选一组），支持 hover 展开、changeOnSelect 与多选勾选。',
  },
  intent: {
    what: '从有层级关系的选项树中逐级选出一条（或多条）值路径：受控 v-model（路径数组）、键盘/指针双路径、可配置展开触发与任意层级提交；选项树为 {label, value, disabled?, children?} 嵌套结构。',
    when: [
      '选项有明确层级归属：省/市/区、部门组织树、类目多级目录',
      '需要把「从根到叶」的完整路径作为表单值（modelValue 为路径数组）',
      '希望选项逐级呈现而非一次性平铺（候选项多且有从属关系）',
      '需要 hover 展开快速浏览（expandTrigger="hover"）或允许停在中间层级（changeOnSelect）',
      '需要一次选出多条叶子路径（multiple，叶子勾选）',
    ],
    whenNot: [
      '选项无层级关系用 Select：Cascader 强调逐级从属',
      '需要搜索过滤、懒加载子级、父子联动勾选（勾父全选子）的复杂场景：当前版本不提供，树形完整能力交给 Tree/TreeSelect',
      '单值且层级可拍平的场景优先 Select，Cascader 的路径值对使用方有结构成本',
    ],
    userTask: '用户沿层级逐级定位并选定（或勾选多条）目标项，全程可用键盘（↑↓←→/Home/End/Enter/Esc）完成',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'CascaderModelValue（CascaderPath | CascaderPath[] | null，路径元素为 string | number）', default: 'null', description: 'v-model 绑定值；受控。单选为一条从根到目标的值路径（如 [\'cn-zj\', \'cn-zj-hz\']），多选为路径数组，null 表示未选；不可解析的路径回落占位态。' },
      { name: 'options', type: 'CascaderOption[]（{label: string; value: CascaderValue; disabled?: boolean; children?: CascaderOption[]}）', default: '[]', description: '级联选项树；children 缺省或空数组视为叶子（可提交的终点），同一父节点下 value 应唯一，disabled 项不可被高亮/悬停展开/选中。' },
      { name: 'placeholder', type: 'string', default: "'请选择'", description: '占位文本（无已选值时显示在触发器内）；不替代 label。' },
      { name: 'emptyText', type: 'string', default: "'暂无选项'", description: '空态文案：options 为空数组时弹层内显示（可用作加载中兜底）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘/悬停。' },
      { name: 'open', type: 'boolean', description: 'v-model:open 受控开合：传入（v-model:open / :open / @update:open 任一）即完全受控——open 跟随外部值，内部交互（点击触发器/提交/Esc/外点/blur）只派发 update:open；未传则非受控内部自管理（非受控同样上抛 update:open 全周期）。' },
      { name: 'multiple', type: 'boolean', default: 'false', description: '多选：叶子节点渲染原生 checkbox（tabindex=-1），modelValue 为路径数组；勾选后弹层保持打开以便连续勾选；父节点仅用于展开，不支持勾选聚合。' },
      { name: 'expandTrigger', type: "'click' | 'hover'", default: "'click'", description: '次级面板展开触发方式：click 点击展开（默认）；hover 悬停父级即展开（键盘与提交路径不受影响）。' },
      { name: 'changeOnSelect', type: 'boolean', default: 'false', description: '选中任意层级：开启后单选模式下父节点点击/Enter 也提交其路径（提交后仍展开下级）；关闭时父节点仅展开，仅叶子提交。' },
    ],
    slots: [
      { name: 'trigger', scope: '{ paths: CascaderPath[]; labels: string[][]; multiple: boolean }', description: '自定义触发器已选内容（替代默认路径 label 文案）；paths/labels 为可解析的已选路径与对应 label 链。' },
      { name: 'option', scope: '{ option: CascaderOption; level: number; path: CascaderPath }', description: '自定义选项内容（替代默认 label 文案）；行容器的 role/键盘/选中样式仍由组件承担。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'CascaderPath | CascaderPath[]', description: 'v-model 更新：单选提交一条路径（叶子，或 changeOnSelect 下的父节点），多选提交勾选路径数组（取消勾选时移除）。' },
      { name: 'update:open', payload: 'boolean', description: 'v-model:open 更新：受控与非受控均上抛（受控时组件只派发、不自行开合）。' },
      { name: 'change', payload: 'CascaderPath | CascaderPath[]', description: '提交选中/勾选后触发，载荷与 update:modelValue 一致。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦触发器按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（触发器 blur 会关闭已打开的弹层）。' },
    ],
  },
  constraints: {
    conflicts: ['Select（无层级单选）', 'Input（自由文本输入）'],
    dependsOn: ['使用方应用入口引入 @ui/tokens/paper.css（--ui-* token 来源）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label / 描述 / 错误文案关联（aria-describedby 经 attrs 直达 combobox 触发器）',
      'expandTrigger="hover" + changeOnSelect 组合实现「快速浏览且允许任意层级」的目录选择',
      'multiple + 受控 modelValue 实现多条叶子路径的批量勾选',
      'options 由异步数据源驱动，空数组时以 emptyText 兜底（加载中）',
    ],
    related: ['FormField', 'Form', 'Select', 'Tree', 'TreeSelect'],
    preferred: ['label 由 FormField 提供，勿以 placeholder 替代 label', '同一父节点下 option.value 保持唯一', '需要中间层级可提交时显式开启 changeOnSelect'],
  },
  states: {
    default: '触发器 surface 底 + line 描边 + ink 文字；未选时显示 placeholder（text-3）+ 折叠箭标；已选显示路径 label 拼接（单选「 / 」、多选「、」）。',
    hover: '触发器描边加深为 --ui-border-strong；disabled 不响应 hover；expandTrigger="hover" 时悬停含子级选项即展开下级面板。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；触发器描边同步转 --ui-input-border-focus（accent）。',
    active: '打开后触发器箭标翻转 180°；弹层 surface 底 + line 描边 + shadow-pop，分栏 listbox 列间 line 细线分隔；键盘高亮项 surface-muted 底，已选项（含已选链贯穿的祖先列）accent-soft 底 + accent 文字 + medium 字重。',
    disabled: '触发器 sand 底 + line 描边 + text-3 文字 + not-allowed 光标；原生 disabled 使其移出 Tab 序，弹层不可打开；节点级 disabled 渲染 aria-disabled="true" + text-3，不可被高亮/悬停展开/选中/勾选。',
    loading: '未内建 loading 态：options 为空数组时打开弹层显示 emptyText 兜底文案（可用作加载中）。',
    error: '未内建错误态；由使用方以 attrs（aria-describedby）配合 FormField 呈现。',
  },
  accessibility:
    '触发器为原生 <button type="button" role="combobox">，携带 aria-haspopup="listbox"、aria-expanded（恒有）与 aria-activedescendant（打开且有高亮时指向选项 id，否则不出现）；aria-controls 仅在弹层打开时输出（指向弹层容器 id），关闭态不挂——弹层由 v-if 整体承载、关闭即从 DOM 移除，恒挂会留下悬空 idref（与 Popover/Popconfirm/HoverCard 的 dialog 家族约定一致）。弹层容器内每一列为 role="listbox"（aria-label：根级「一级候选」，子级「<父级 label>的子选项」），选项 role="option" + aria-selected（已选叶子与其祖先链均贯穿命中）+ aria-disabled。焦点模型：焦点始终停留在触发器，选项不进 Tab 序；键盘 ↓/↑ 当前面板内移动高亮（跳过禁用项）、→ 进入子级面板、← 返回上级、Home/End 首尾、Enter/Space 打开或提交、Esc 关闭；受理键一律 preventDefault。Tab 离开（触发器 blur）与点击外部均关闭弹层；弹层 mousedown.prevent 保住触发器焦点。多选叶子渲染原生 <input type="checkbox">（tabindex=-1 不进 Tab 序、disabled 节点原生 disabled），状态与 aria-selected 同步。disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；弹层由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 role/aria-expanded 与 placeholder/已选路径文案；初始关闭态不输出 aria-controls，避免悬空 idref），不出现 listbox/option/checkbox。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；弹层定位（getBoundingClientRect）只在打开后的 nextTick 内执行。useId 保证多实例 id 唯一且 SSR/客户端一致。',
  performance:
    '打开时一次 nextTick 定位（getBoundingClientRect + 内联样式写入）；挂载期间常驻一个 document scroll（capture）与一个 window resize 监听（浮层引擎，回调以 isOpen 守卫短路，关闭态零工作），打开期间视口变化按锚点最新 rect 重排；无定时器、无 ResizeObserver。面板/已选路径/触发器文案均为受控 computed 派生（选项树规模线性遍历）；动效只有 border-color/background-color/color/transform 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。长列表面板以 max-height（token 推导）+ overflow-y: auto 兜底，弹层超宽以 max-height/max-width + overflow-x: auto 兜底，未做虚拟滚动。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器复用输入框别名（--ui-input-bg / --ui-input-radius / --ui-input-border-focus）；弹层 surface 底 + --ui-border 描边 + --ui-radius-sm + --ui-shadow-pop + --ui-z-popover（Teleport 到 body 的非模态弹层档，高于 modal）；面板 min-width/max-height、弹层 max-width 均以 --ui-space-8 推导；高亮项 --ui-surface-muted、已选项 --ui-accent-soft/--ui-accent、禁用项 --ui-text-3、checkbox accent-color 走 --ui-accent；间距/字号走 --ui-space-*/--ui-text-*。无全局 CSS 引入；attrs/class 透传落在触发器 button 上可做定向覆盖。',
  examples: [
    "<Cascader v-model='region' :options=\"[{ label: '浙江省', value: 'cn-zj', children: [{ label: '杭州市', value: 'cn-zj-hz' }] }]\" />",
    "<Cascader v-model='paths' :options='categoryTree' multiple placeholder='选择类目' />",
    "<Cascader v-model='node' :options='tree' expand-trigger='hover' change-on-select placeholder='可停任意层级' />",
    "<Cascader :model-value='null' :options='[]' empty-text='加载中…' disabled />",
  ],
  agent: {
    keywords: ['cascader', '级联', '级联选择', '多级', '层级选择', '省市区', '类目', '路径', 'path', 'multiple', '多选', 'changeOnSelect', 'expandTrigger', 'hover 展开', 'combobox', 'listbox', '面板导航', '键盘导航', 'disabled', '禁用'],
    selectionHints: [
      '有层级从属的选项 → Cascader；无层级单选 → Select',
      'modelValue 是「从根到目标」的值路径数组，不是单个 value',
      '只要叶子值时保持 changeOnSelect=false；允许停在中间层级再开启',
      '多条叶子路径批量勾选用 multiple（父节点不支持勾选聚合）',
    ],
    commonTasks: [
      '省/市/区 地址选择',
      '多级类目/部门组织路径选择',
      '多条叶子路径的批量勾选',
    ],
    generationNotes: [
      'v-model 单选为 CascaderPath（如 ["cn-zj","cn-zj-hz"]）、多选为 CascaderPath[]；不可解析的路径回落占位态',
      '键盘路径：↓/↑ 当前面板移动（跳过禁用项）、→ 进子级、← 返回上级、Home/End 首尾、Enter/Space 打开或提交、Esc/Tab/点击外部 关闭',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达触发器 button',
      '弹层 Teleport 到 body 且仅客户端渲染；定位在打开时按触发器 rect 计算，不做翻转/跟随滚动（需要时由使用方扩展）',
    ],
  },
}
