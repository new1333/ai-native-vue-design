/**
 * CardHeader 的组件契约元数据（ComponentDefinition）。
 * api 字段与 CardHeader.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-card-header',
  version: '0.1.0',
  identity: {
    name: 'CardHeader',
    package: '@ui/components',
    export: 'CardHeader',
    category: 'general',
    description: '卡片头部区块：标题层级的排版默认值（text-lg / semibold / heading 行高），插槽驱动，无自有交互。',
  },
  intent: {
    what: 'Card 的头部区块容器：为标题/元信息/操作区提供一致的排版默认值。',
    when: ['Card 内放标题、副标题、右侧操作按钮组'],
    whenNot: ['无标题的纯正文卡片（直接用 CardBody）', '页面级标题排版（用 Typography/原生标题元素）'],
    userTask: '用户需要一眼识别卡片内容的主题',
  },
  api: {
    props: [],
    slots: [{ name: 'default', description: '头部内容：通常放原生 h1-h6 标题元素（语义层级由使用方决定）与可选操作区。' }],
    events: [],
    exposes: [],
  },
  constraints: { dependsOn: ['ui-card'] },
  composition: {
    patterns: ['CardHeader 内放 h3 + Badge', 'CardHeader 左标题右操作（使用方自行 flex 布局）'],
    related: ['Card', 'CardBody', 'CardFooter'],
    preferred: ['标题语义用原生 h1-h6 放入插槽，组件不代选层级'],
  },
  states: {
    default: 'text-lg / semibold / heading 行高 / text-1 颜色；不设边框与分隔线，区块间距由 Card 的 gap 提供。',
    hover: '无交互态：静态区块不响应 hover。',
    focusVisible: '无聚焦语义：不可聚焦、不参与 Tab 序。',
    active: '无按压反馈。',
    disabled: '不适用：无禁用语义。',
  },
  accessibility: '泛型 div 容器，无 role、不产生 landmark/banner 语义；标题的可读名称与层级由插槽内的原生标题元素承担。',
  ssr: 'renderToString 无异常：无浏览器 API 访问，插槽内容随 SSR 输出。',
  performance: '纯静态容器：无监听器、无测量、无定时器。',
  styling: '只消费 --ui-* token：字号 --ui-text-lg、字重 --ui-font-weight-semibold、行高 --ui-leading-heading、颜色 --ui-text-1；自身不设边距（间距由 Card gap 统一）。',
  examples: ["<CardHeader>\n  <h3>部署概览</h3>\n</CardHeader>"],
  agent: {
    keywords: ['card header', '卡片头', '标题区', '区块'],
    selectionHints: ['Card 有标题时用它包住标题行，排版默认值与 Card 家族一致'],
    commonTasks: ['卡片标题 + 操作按钮行'],
    generationNotes: ['在插槽内放原生 h1-h6 承担标题语义；不要塞大段正文（正文用 CardBody）'],
  },
}
