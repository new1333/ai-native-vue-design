/**
 * CardBody 的组件契约元数据（ComponentDefinition）。
 * api 字段与 CardBody.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-card-body',
  version: '0.1.0',
  identity: {
    name: 'CardBody',
    package: '@ui/components',
    export: 'CardBody',
    category: 'general',
    description: '卡片主体区块：正文的排版默认值（text-md / body 行高 / text-1），插槽驱动，可承载任意内容。',
  },
  intent: {
    what: 'Card 的主体区块容器：为正文与嵌入内容提供一致的排版默认值。',
    when: ['Card 内放正文段落、表单、表格、图表等主体内容', '无标题卡片时作为唯一区块使用'],
    whenNot: ['标题行（用 CardHeader）', '动作按钮区/补充说明（用 CardFooter）'],
    userTask: '用户需要在卡片上阅读或操作主体内容',
  },
  api: {
    props: [],
    slots: [{ name: 'default', description: '主体内容：正文、表单、表格、图表等任意内容。' }],
    events: [],
    exposes: [],
  },
  constraints: { dependsOn: ['ui-card'] },
  composition: {
    patterns: ['CardBody 内放 Form', 'CardBody 内放 Table / KPI', 'CardBody 段落正文'],
    related: ['Card', 'CardHeader', 'CardFooter'],
    preferred: ['主体内容统一放 CardBody，保持三段式结构一致'],
  },
  states: {
    default: 'text-md / body 行高 / text-1 颜色；无内边距（由 Card 统一），区块间距由 Card 的 gap 提供。',
    hover: '无交互态：静态区块不响应 hover。',
    focusVisible: '无聚焦语义：不可聚焦；内部可交互元素保持各自焦点行为。',
    active: '无按压反馈。',
    disabled: '不适用：无禁用语义；内部表单控件禁用由各控件表达。',
  },
  accessibility: '泛型 div 容器，无 role、不产生 landmark 语义；内容按文档流自然可读，内部可交互元素保持原生键盘可达。',
  ssr: 'renderToString 无异常：无浏览器 API 访问，插槽内容随 SSR 输出。',
  performance: '纯静态容器：无监听器、无测量、无定时器。',
  styling: '只消费 --ui-* token：字号 --ui-text-md、行高 --ui-leading-body、颜色 --ui-text-1；自身不设边距（间距由 Card gap 统一）。',
  examples: ["<CardBody>\n  <p>最近一次部署于 2 小时前完成。</p>\n</CardBody>"],
  agent: {
    keywords: ['card body', '卡片主体', '正文', '区块'],
    selectionHints: ['Card 的主体内容一律放 CardBody，获得正文排版默认值'],
    commonTasks: ['卡片正文段落', '卡片内嵌表单/表格容器'],
    generationNotes: ['不要在 CardBody 里再包一层自造边距（间距由 Card 统一提供）'],
  },
}
