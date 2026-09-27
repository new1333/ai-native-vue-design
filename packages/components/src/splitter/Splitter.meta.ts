/**
 * Splitter 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Splitter.types.ts 保持一致；states 与 Splitter.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-splitter',
  version: '0.1.0',
  identity: {
    name: 'Splitter',
    package: '@ui/components',
    export: 'Splitter',
    category: 'general',
    description:
      '可拖拽分割面板：默认插槽内放若干 SplitterPane 组成多 pane 布局，面板间分隔条支持指针拖拽与键盘调整（role=separator），面板尺寸为百分比数组（可选 v-model 受控），支持 min/max 约束与 collapsible 折叠。',
  },
  intent: {
    what:
      '把一块区域分割为多个可由用户拖拽调整大小的面板：Splitter 根 + 若干 SplitterPane 子组件，面板间渲染可聚焦的分隔条（拖拽 + ←→/↑↓/Home/End/Enter 键盘路径），尺寸以百分比数组建模。',
    when: [
      'AI 应用「对话 + 产物」双栏/多栏布局：用户需要自行调节两侧宽度',
      '代码/日志 + 详情预览的上下分割（direction="vertical"）',
      '面板需要 min/max 尺寸约束或可折叠为 0（collapsible）时',
      '布局比例需要被应用读写（v-model 受控，可持久化用户偏好）',
    ],
    whenNot: [
      '用户不需要调整的静态分栏直接用 flex/grid：Splitter 带分隔条、键盘与焦点语义，是交互布局件',
      '弹出式侧栏 / 抽屉用 Drawer：Splitter 占据文档流且不做浮层',
      '需要按视口断点自动折叠的响应式布局：Splitter 不做媒体查询断点（collapsible 仅响应用户拖拽/键盘）',
      '嵌套 Splitter 未做专门适配（外层面板内容盒可放下另一个 Splitter，但焦点序与语义自行负责）',
    ],
    userTask: '用户拖拽（或用键盘微调）分隔条，把屏幕空间在自己关注的面板之间重新分配',
  },
  api: {
    props: [
      {
        name: 'modelValue',
        type: 'number[]',
        default: 'undefined（按面板数均分）',
        description:
          '各面板尺寸（百分比数组，总和 100），v-model 可选受控；缺省 / 长度与面板数不符 / 含非法值时按面板数均分。仅用户交互时触发 update:modelValue；受控更新需整体替换数组。',
      },
      {
        name: 'direction',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description:
          "分割方向：horizontal 左右分栏（分隔条为竖线、aria-orientation=vertical、←/→ 调整）；vertical 上下分栏（分隔条为横线、↑/↓ 调整）。",
      },
      {
        name: 'panes',
        type: 'SplitterPaneOption[]',
        default: 'undefined',
        description:
          '按面板顺序声明约束 { min?, max?, collapsible?, label? }（百分比 0-100）；min 缺省 0、max 缺省 100、collapsible 缺省 false，未声明的面板用缺省约束。约束须在此声明：拖拽/键盘回调（渲染期外）需要读取，SplitterPane 不承载同名 props。',
      },
    ],
    slots: [
      {
        name: 'default',
        description:
          '面板序列：应为若干 SplitterPane 直接子组件（内容子组件，决定面板数量与内容，建议提供稳定 key）；其余子节点不参与布局。',
      },
    ],
    events: [
      {
        name: 'update:modelValue',
        payload: 'sizes: number[]',
        description: '尺寸变更（拖拽每个 pointermove / 键盘每步），载荷为归一后的百分比数组。',
      },
      {
        name: 'resize',
        payload: 'sizes: number[]',
        description: '与 update:modelValue 同时机同载荷，供不使用 v-model 的监听方读取尺寸。',
      },
      {
        name: 'collapse',
        payload: '{ index: number; collapsed: boolean }',
        description:
          '某面板发生折叠转变（尺寸 0 ↔ 非 0）；仅组件内交互（拖拽吸附 / Enter）触发，外部受控赋值不触发。',
      },
    ],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      'Splitter > SplitterPane(对话流) + SplitterPane(产物预览)：AI 应用双栏工作区',
      'Splitter direction="vertical"：编辑器 + 终端上下分栏',
      'panes 约束 + collapsible：侧栏可拖到吸附阈值折叠、Enter 折叠/恢复',
      'Splitter v-model + localStorage：持久化用户拖出的布局比例（使用方自行读写存储）',
    ],
    related: ['SplitterPane', 'Card', 'Button', 'Tabs'],
    preferred: [
      '面板内容放 SplitterPane 内（内容盒自带滚动）；不要用普通元素冒充面板——不参与布局',
      '约束（min/max/collapsible/label）统一在 panes 数组按面板顺序声明，SplitterPane 只承载内容',
      '给 SplitterPane 提供稳定 key；动态增删面板时受控数组长度须同步面板数',
      '拖拽会连续触发 update:modelValue/resize，受控方如需落盘请自行节流',
    ],
  },
  states: {
    default:
      '分隔条为居中 1px 结构线（--ui-border）+ --ui-space-2 命中区（水平分栏宽 8px / 垂直分栏高 8px），cursor 为 col-resize/row-resize；面板区域由 flex-basis 百分比驱动。',
    hover: '分隔条结构线加深为 --ui-border-strong，提示可拖拽；命中区不变。',
    focusVisible: '分隔条可聚焦（tabindex=0），全局 :focus-visible 焦点环（2px --ui-accent outline + 2px offset）。',
    active:
      '拖拽中（pointerdown 至 pointerup）：被拖分隔条结构线为 --ui-accent，根元素置 ui-splitter--dragging（关闭 flex-basis 过渡、user-select: none）保证跟手；键盘 Enter 折叠/恢复无拖拽态。',
    disabled: '不适用：Splitter 无禁用语义（未提供 disabled prop）。',
    loading: '不适用：Splitter 为布局交互件，无异步加载状态。',
  },
  accessibility:
    '分隔条为 role="separator" 的可聚焦元素（tabindex=0，WAI-ARIA window splitter 模式）：aria-orientation 与分割方向互补（horizontal 分栏 → vertical），aria-valuenow/valuemin/valuemax/valuetext 表达主面板尺寸位置（valuetext 为 `n%`），aria-controls 指向主面板、aria-label 取 panes[i].label（缺省内置文案「调整面板尺寸」）。键盘：方向键按方向移动分隔条（每次 1%）、Home/End 调到主面板最小/最大允许位置、Enter 折叠/恢复主面板（仅 collapsible 面板），全部 preventDefault 防止页面滚动。面板区域为泛型 div（无 role 劫持），折叠面板以 display:none 隐藏但保留在 DOM。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问浏览器 API；ResizeObserver 只在 onMounted 建立、onBeforeUnmount 断开；拖拽 window 监听只在客户端 pointerdown 中挂载。面板 id 由 useId 生成（SSR/客户端一致），尺寸、约束（aria-value*）与折叠修饰类随 SSR 输出。',
  performance:
    '布局为纯 flex + flex-basis 百分比，无 JS 测量参与布局；拖拽期间每次 pointermove 求解相邻两面板约束并 emit（受控方需自行节流）；ResizeObserver 仅缓存容器主轴尺寸供 px→% 换算，容器尺寸变化不触发重布局计算。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：结构线 --ui-border / hover --ui-border-strong / 拖拽 --ui-accent，命中区 --ui-space-2，过渡 var(--ui-motion-fast) + var(--ui-ease-out)（拖拽中关闭），文字 --ui-text-1 + --ui-font-sans。无全局 CSS 引入；根元素 ui-splitter 占满父容器（width/height 100%），面板内容盒 100% 填充并 overflow:auto。1px 结构线与 100% 结构尺寸为结构性取值（无 --ui-border-width token，随 Button/Input/Divider 先例）。',
  examples: [
    "<Splitter v-model='sizes'>\n  <SplitterPane>对话流</SplitterPane>\n  <SplitterPane>产物预览</SplitterPane>\n</Splitter>\n<!-- sizes: [60, 40] -->",
    "<Splitter\n  :panes=\"[{ min: 20, max: 70, collapsible: true, label: '侧栏' }]\"\n>\n  <SplitterPane key='side'>侧栏</SplitterPane>\n  <SplitterPane key='main'>主区</SplitterPane>\n</Splitter>",
    "<Splitter direction='vertical' :panes=\"[{ min: 15 }]\">\n  <SplitterPane>编辑器</SplitterPane>\n  <SplitterPane>终端</SplitterPane>\n</Splitter>",
  ],
  agent: {
    keywords: [
      'splitter',
      '分割面板',
      '分栏',
      '分隔条',
      '拖拽',
      'resizable',
      '面板',
      'pane',
      '双栏',
      '布局',
      'separator',
    ],
    selectionHints: [
      '需要用户拖拽调整面板大小的布局 → Splitter；静态分栏 → flex/grid',
      '对话 + 产物 / 编辑器 + 预览等双栏工作区 → Splitter + 两个 SplitterPane',
      '需要约束或折叠 → panes 数组或 SplitterPane props 声明 min/max/collapsible',
      '需要记录/恢复布局比例 → v-model 受控 sizes 数组',
    ],
    commonTasks: ['AI 应用双栏工作区', '侧栏可折叠的主从布局', '上下分栏的编辑器界面'],
    generationNotes: [
      'SplitterPane 必须是 Splitter 的直接子组件且建议给稳定 key；普通元素子节点不参与布局',
      '面板约束写在 panes 数组（按面板顺序对位），SplitterPane 是纯内容子组件、不声明 min/max 等 props',
      'modelValue 是与面板数等长的百分比数组（总和 100）；非法/长度不符会回退均分，动态增删面板时同步数组',
      'Splitter 根占满父容器（width/height 100%），使用方需给容器确定高度（如 height: calc(var(--ui-space-8) * 3)）',
      'collapsible 面板的折叠路径：拖拽越过 min 一半的吸附阈值，或分隔条上按 Enter；恢复用 Enter（回到折叠前位置）或向回拖拽',
      '键盘路径：分隔条聚焦后 ←→（horizontal）/ ↑↓（vertical）每次 1%，Home/End 调到主面板最小/最大位置',
      '拖拽会连续 emit update:modelValue/resize；需要落盘/上报时在使用方节流',
    ],
  },
}
