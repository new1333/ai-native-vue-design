/**
 * Space 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Space.types.ts 保持一致；states 与 Space.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-space',
  version: '0.1.0',
  identity: {
    name: 'Space',
    package: '@ui/components',
    export: 'Space',
    category: 'general',
    description: '纸面间距容器：子元素横向/纵向弹性排列，间距档位 sm/md/lg 映射 --ui-space-*，flex gap 实现、无逐子元素包裹层。',
  },
  intent: {
    what: '为一组相邻子元素提供统一档位间距的 flex 布局容器（方向、换行、交叉轴对齐可选）。',
    when: [
      '工具栏/操作区：按钮组、图标按钮组之间的统一间距',
      '表单行内：标签 + 控件 + 说明文字的横向排列',
      '卡片/面板内：元素堆叠（direction="column"）与分区节奏（size="lg"）',
      '标签/徽标集合需要换行排列时用 wrap',
    ],
    whenNot: [
      '需要响应式栅格/列布局用栅格类组件，Space 不做断点与列宽分配',
      '需要主轴空间分配（两端对齐、居中分布等 justify-content 控制）不在 Space API 内',
      '精确到像素的自定义间距不做：仅提供 sm/md/lg 三档（映射 --ui-space-2/4/6）',
      '元素之间需要线条分隔用 Divider；语义分组（fieldset 类）用表单组件',
      '单个子元素不需要容器，多包一层 Space 反而增加嵌套',
    ],
    userTask: '用户需要把一组子元素按统一间距横向或纵向排起来，不想逐个写 margin',
  },
  api: {
    props: [
      { name: 'direction', type: "'row' | 'column'", default: 'row', description: '排列方向：row 横向（默认），column 纵向。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: '间距档位：sm→--ui-space-2（8px）、md→--ui-space-4（16px）、lg→--ui-space-6（32px）。' },
      { name: 'wrap', type: 'boolean', default: 'false', description: '是否允许换行（flex-wrap: wrap）；开启后换行处间距同样由 gap 承担。' },
      { name: 'align', type: "'start' | 'center' | 'end' | 'baseline' | 'stretch'", default: 'center', description: '交叉轴对齐（align-items）；默认 center 避免异高子元素被拉伸。' },
    ],
    slots: [
      { name: 'default', description: '需要排列的子元素；容器不加逐子元素包裹层，间距由 flex gap 承担，子元素语义与 Tab 序不受影响。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: ['操作区：<Space><Button/><Button/></Space>', '表单行内：<Space align="center">标签+控件+提示</Space>', '堆叠分区：<Space direction="column" size="lg">卡片/区块</Space>', '标签云：<Space wrap size="sm">标签集合</Space>'],
    related: ['Button', 'IconButton', 'Badge', 'Tag', 'Divider'],
    preferred: [
      '按钮组、标签组、行内字段组优先用 Space 而非逐元素 margin',
      '间距选档先对齐页面节奏：紧邻元素 sm、同组控件 md、分区之间 lg',
      '子元素高度参差（图标+多行文字）时保持默认 align="center"（或 baseline）',
    ],
  },
  states: {
    default: 'inline-flex 容器：方向 row/column、档位 gap（--ui-space-2/4/6）、可换行；子元素保留自身默认态。',
    hover: '无：Space 不响应 hover，也不改变子元素的 hover 态。',
    focusVisible: '不可聚焦（无 tabindex、非交互容器），不产生焦点环；子元素焦点行为不受影响。',
    active: '无按压态，不响应 ：active。',
    disabled: '无禁用态：容器不提供 disabled/loading 等状态，子元素各自的禁用态由子元素自己表达。',
  },
  accessibility:
    '纯布局容器：不设 role、不设 aria-*、不可聚焦（无 tabindex），读屏不感知；子元素按原文档顺序直出，语义标签、Tab 序与焦点行为均不被改写。间距仅是视觉呈现，无需向辅助技术通告。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API、无监听/测量副作用；方向、档位、换行、对齐修饰类在服务端即随 ui-space 根类输出。',
  performance:
    '无监听器、无测量、无定时器；根类由响应式 props 经 computed 求值；间距走原生 flex gap，不产生逐子元素样式与额外 DOM 节点。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：gap 档位 --ui-space-2/--ui-space-4/--ui-space-6；无颜色/字号/圆角/阴影/动效声明。容器为 inline-flex（宽度收缩至内容），display/flex-direction/align-items 的关键字值为结构性布局值，非视觉取值。无全局 CSS 引入。',
  examples: [
    '<Space><Button>保存</Button><Button>取消</Button></Space>',
    '<Space direction="column" size="lg"><!-- 区块堆叠 --></Space>',
    '<Space wrap size="sm"><!-- 标签集合 --></Space>',
    '<Space align="baseline"><span>价格</span><strong>¥128</strong></Space>',
  ],
  agent: {
    keywords: ['space', '间距', '间隔', '排列', '布局', '横排', '纵排', '堆叠', 'gap', 'flex', '换行'],
    selectionHints: [
      '统一间距排一组元素 → Space；元素间要线 → Divider',
      '操作按钮组 → 默认 row + md；元素堆叠 → direction="column"',
      '异高元素横排保持默认 align="center"，文字基线对齐场景用 align="baseline"',
      '需要栅格/两端对齐/精确像素间距 → Space 之外的能力，不要硬塞',
    ],
    commonTasks: ['按钮组间距', '表单行内排列', '卡片内容堆叠', '标签集合换行排列'],
    generationNotes: [
      '容器为 inline-flex：宽度收缩至内容；需要撑满时在使用方侧自行加宽度样式',
      '不要给 Space 的子元素手写 margin，间距统一交给 size 档位',
      '子元素之间的模板空白文本不会成为 flex item（flex 规范忽略纯空白匿名盒）',
      '换行（wrap）后的行间距同样由 gap 承担，无需额外处理',
    ],
  },
}
