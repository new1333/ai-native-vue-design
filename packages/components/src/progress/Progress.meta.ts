/**
 * Progress 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Progress.types.ts 保持一致；states 与 Progress.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-progress',
  version: '0.1.0',
  identity: {
    name: 'Progress',
    package: '@ui/components',
    export: 'Progress',
    category: 'data',
    description: '纸面进度条：确定进度（value 0-100 + aria-valuenow）与不确定进度（indeterminate 扫描，reduced-motion 降级静态半填充），accent 填充 + muted 轨道。',
  },
  intent: {
    what: '任务/加载的进度反馈：确定态按 value 0-100 填充并可显示数值标签；不确定态以扫描动画表达"进行中但进度未知"。',
    when: [
      '上传/下载、安装、批处理等可计算进度的任务（value + showLabel）',
      '耗时未知但正在进行的过程（indeterminate）',
      '分步向导的整体完成度展示',
    ],
    whenNot: [
      '未知时长的版面等待用 Skeleton：Progress 表达进度而非占位结构',
      '可操作的控制条（音量/播放进度）需要交互语义，非只读 progressbar',
      '操作结果反馈用 Toast / Alert：Progress 表达"进行中"',
      '离散步骤的当前位置用 Steps：Progress 表达连续进度',
    ],
    userTask: '用户需要感知某个过程进行到什么程度，或确认过程仍在进行',
  },
  api: {
    props: [
      { name: 'value', type: 'number', default: '0', description: '确定进度值 0-100：越界钳制到 [0,100]、非有限数回退 0；透传为 aria-valuenow 与填充宽度；indeterminate=true 时忽略。' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: '不确定进度：忽略 value、省略 aria-valuenow（进度未知）、填充转扫描动画；prefers-reduced-motion 时降级为静态 50% 半填充。' },
      { name: 'showLabel', type: 'boolean', default: 'false', description: '显示数值标签（如 "42%"，tabular-nums）；仅确定进度渲染，indeterminate 无确定值不渲染。' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '条高档位：sm 4px、md 8px（--ui-space-1/--ui-space-2）。' },
    ],
    slots: [],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: [
      '上传场景：<Progress :value="percent" show-label size="sm" />',
      '页面级加载：<Progress indeterminate />（不可知进度）',
      '与文本组合：使用方在组件旁提供任务名说明（组件自身不带 label 文本）',
    ],
    related: ['Skeleton', 'Button', 'Table', 'EmptyState'],
    preferred: [
      '能拿到确定进度时始终用 value（读屏依赖 aria-valuenow），indeterminate 仅作兜底',
      '需要可读名称时由使用方以 aria-label/aria-labelledby 指向任务说明',
      '细行内场景用 size="sm"，页面级主进度用 size="md"',
    ],
  },
  states: {
    default: 'muted 轨道（--ui-surface-muted）+ accent 填充（--ui-accent），端头 --ui-radius-xs（2px）；条高随 size 档。',
    hover: '不适用：非交互展示元素，无 hover 反馈。',
    focusVisible: '不适用：不可聚焦，不进入 Tab 序，永不获得焦点环。',
    active: '不适用：无交互。',
    disabled: '不适用：无 disabled 语义；进度结束由使用方卸载组件或置 value=100。',
    loading: 'indeterminate 态即加载语义：50% 半填充 transform 扫描（≈2s 循环，加载态豁免）；prefers-reduced-motion 降级为静态半填充。',
  },
  accessibility:
    '根元素 role="progressbar"：aria-valuemin="0"/aria-valuemax="100" 恒在，确定态 aria-valuenow=钳制后的 value；indeterminate 按 WAI-ARIA 省略 aria-valuenow（进度未知）。showLabel 以 "42%" 文本提供视觉双通道。组件非交互、无 tabindex；可访问名由使用方经 attrs 提供（aria-label / aria-labelledby），经默认透传落到 role=progressbar 的根元素上（组件无 label 类 prop，showLabel 仅控制数值标签）。',
  ssr:
    'renderToString 无异常：组件不访问任何浏览器 API（无 effect/监听/测量），role/aria 值、修饰类、内联填充宽度与标签文本均在服务端输出；indeterminate 态 SSR 即省略 aria-valuenow。',
  performance:
    '无 JS 运行时开销（仅 computed class/style/aria 派生）；动效为 CSS transform 关键帧无限循环（仅 indeterminate，加载态豁免），prefers-reduced-motion 下显式 @media 停用；确定态无任何动画。',
  styling:
    '视觉只消费 --ui-* token：轨道 --ui-surface-muted、填充 --ui-accent、条高 --ui-space-1/--ui-space-2、端头 --ui-radius-xs（进度条端头为该 token 唯一合法用途）、标签字号 --ui-text-xs / 颜色 --ui-text-2 / 数字 --ui-numeric、间距 --ui-space-2。indeterminate 扫描时长由 --ui-motion-default calc 推导。布局：根元素块级满宽（width: 100%），轨道 flex: 1 1 auto 弹性吃满剩余宽度、数值标签 flex: none 固有宽——在 flex-start 等收缩上下文中轨道不塌缩，填充百分比始终基于真实轨道宽度。',
  examples: [
    "<Progress :value='42' show-label />",
    "<Progress indeterminate size='sm' />",
    "<div role='status' aria-label='上传中'>\n  <Progress :value='percent' show-label />\n</div>",
    "<Progress :value='75' />",
  ],
  agent: {
    keywords: ['progress', '进度条', '进度', 'progressbar', 'indeterminate', '不确定进度', '加载进度', '上传', '下载', 'aria-valuenow', 'percent', '百分比', 'loading'],
    selectionHints: [
      '可计算进度 → value + showLabel；进度未知 → indeterminate',
      '版面占位等待 → Skeleton；只读进度展示 → Progress',
      '细行内进度用 size="sm"，需要数值可读用 showLabel（aria-valuenow 同步提供）',
    ],
    commonTasks: [
      '文件上传/下载进度展示',
      '批处理/安装类任务的完成度',
      '未知耗时操作的"进行中"指示',
    ],
    generationNotes: [
      'value 自动钳制到 [0,100]，NaN/±Infinity 回退 0；aria-valuenow 与填充宽度同源',
      'indeterminate=true 时忽略 value、省略 aria-valuenow、隐藏数值标签',
      '端头 2px 来自 --ui-radius-xs；条高仅 sm/md 两档',
      '无 emits/slots/exposes；确定态无动画，扫描动画仅在 indeterminate 出现',
      '根元素块级满宽（width: 100%）：轨道弹性伸缩、标签固有宽，放入 align-items: flex-start 的列向 flex 等收缩上下文也不会塌缩',
    ],
  },
}
