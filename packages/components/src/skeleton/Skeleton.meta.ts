/**
 * Skeleton 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Skeleton.types.ts 保持一致；states 与 Skeleton.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-skeleton',
  version: '0.1.0',
  identity: {
    name: 'Skeleton',
    package: '@ui/components',
    export: 'Skeleton',
    category: 'data',
    description: '纸面骨架占位：内容加载前的 line/circle/rect 形状占位（muted 面 + opacity shimmer），纯装饰 aria-hidden，加载状态由使用方容器声明。',
  },
  intent: {
    what: '加载中的形状占位：多行文本（line，可配行数与末行短尾）、正圆（circle）、矩形（rect），以 opacity 呼吸表达"正在加载"。',
    when: [
      '列表/卡片/详情页数据请求期间的版面占位，减少布局抖动',
      '头像/媒体等已知形状的局部占位（variant="circle"/"rect"）',
      '多行文本区块占位（variant="line" + lines，末行短尾模拟段落收尾）',
    ],
    whenNot: [
      '已知进度的任务用 Progress：Skeleton 表达"未知时长的等待"，不表达进度',
      '操作反馈/结果提示用 Toast / Alert：Skeleton 不是反馈通道',
      '空数据状态用 EmptyState：Skeleton 只服务"加载中"',
      '不要用 Skeleton 承载可读文本或可交互元素（本体 aria-hidden）',
    ],
    userTask: '用户在内容加载期间需要看到版面结构已就位的视觉反馈',
  },
  api: {
    props: [
      { name: 'variant', type: "'line' | 'circle' | 'rect'", default: "'line'", description: '骨架形状：line 多行文本占位（配 lines）、circle 正圆（头像）、rect 矩形（块面/媒体）。圆角随形状：line/rect 用 radius-sm，circle 全圆。' },
      { name: 'lines', type: 'number', default: '3', description: 'variant="line" 的行数：最小 1（0/负数回退 1）、小数向下取整；末行渲染短尾（max-width 60%）。其余形状忽略。' },
      { name: 'width', type: 'string | number', description: '宽度：数字按 px，字符串原样（如 "50%"）；三种形状均生效，circle 时优先作为正圆直径。' },
      { name: 'height', type: 'string | number', description: '高度：数字按 px，字符串原样；line 时为每行行高，rect 直接生效，circle 时仅在缺 width 时作为直径。' },
    ],
    slots: [],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      '使用方容器声明加载语义：<div role="status" aria-label="加载中"><Skeleton :lines="3" /></div>',
      '列表占位：v-for 渲染多组 Skeleton（circle 头像 + line 文本行）',
      '卡片占位：Skeleton rect（媒体区）+ Skeleton line ×3（文本区）',
    ],
    related: ['Progress', 'EmptyState', 'Button', 'Table'],
    preferred: [
      '始终由使用方包裹并声明加载状态（role="status"/aria-busy），组件本体保持 aria-hidden',
      '形状/尺寸尽量贴近真实内容，减少加载完成后的布局跳动',
      '已知进度时改用 Progress，不要用 Skeleton 模拟进度',
    ],
  },
  states: {
    default: 'muted 面（--ui-surface-muted）形状占位 + opacity 呼吸 shimmer（时长由 --ui-motion-default 推导 ≈1.8s 循环；加载态无限循环豁免）。',
    hover: '不适用：纯装饰元素，无 hover 反馈。',
    focusVisible: '不适用：aria-hidden 且不可聚焦，不进入 Tab 序，永不获得焦点环。',
    active: '不适用：无交互。',
    disabled: '不适用：无 disabled 语义；停止加载时由使用方卸载本组件。',
    loading: '本体即加载占位：shimmer 常驻；prefers-reduced-motion 时停用动画，落为静态 muted 面。',
  },
  accessibility:
    '纯装饰元素：根节点恒 aria-hidden="true"，不书写 role/tabindex、不产生可读文本；读屏用户对加载状态的感知完全依赖使用方容器（如 role="status" + aria-live、aria-busy="true"）。组件不可聚焦、不进入 Tab 序。',
  ssr:
    'renderToString 无异常：组件不访问任何浏览器 API（无 effect/监听/测量/定时器），形状类名、行数、末行短尾类、内联宽高与 aria-hidden 均在服务端输出，无客户端 hydration 分支。',
  performance:
    '无 JS 运行时开销（仅 computed class/style 派生）；动效为 CSS opacity 关键帧无限循环（加载态豁免），prefers-reduced-motion 下经 token 归零 + 显式 @media 双通道停用；无监听器、无测量、无定时器。',
  styling:
    '视觉只消费 --ui-* token：占位面 --ui-surface-muted、默认尺寸/行高/行距 --ui-space-*、圆角 --ui-radius-sm（line/rect）。两处结构性相对值无对应 token、已在任务结果中提出需求：① circle 全圆使用相对半径 50%（建议新增 --ui-radius-full）；② line 末行短尾 max-width 60%（形状比例）。shimmer 时长由 --ui-motion-default calc 推导，prefers-reduced-motion 下显式 @media 停用。',
  examples: [
    "<div role='status' aria-label='加载中'>\n  <Skeleton :lines='3' />\n</div>",
    "<Skeleton variant='circle' :width='40' :height='40' />",
    "<Skeleton variant='rect' width='100%' height='120px' />",
    "<Skeleton variant='line' :lines='4' :height='16' />",
  ],
  agent: {
    keywords: ['skeleton', '骨架屏', '骨架', '占位', '加载占位', 'loading', 'placeholder', 'shimmer', '闪烁', '头像占位', 'line', 'circle', 'rect', 'aria-hidden', '加载中'],
    selectionHints: [
      '未知时长的加载等待 → Skeleton；已知进度 → Progress；空数据 → EmptyState',
      '加载状态语义由使用方容器声明（role="status"/aria-busy），Skeleton 本体仅 aria-hidden 装饰',
      '文本区块用 variant="line" + lines；头像/媒体分别用 circle / rect',
    ],
    commonTasks: [
      '页面/列表数据请求期间的版面占位',
      '卡片媒体区与文本区的组合占位',
      '头像等固定形状的局部占位',
    ],
    generationNotes: [
      'lines 仅对 variant="line" 生效；末行自动短尾（max-width 60%），单行不短尾',
      'circle 以 width 优先取正圆直径；宽高传数字按 px、字符串原样透传',
      '组件恒 aria-hidden="true"，务必由使用方声明加载状态',
      '无 emits/slots/exposes；动画为纯 CSS，reduced-motion 自动停用',
    ],
  },
}
