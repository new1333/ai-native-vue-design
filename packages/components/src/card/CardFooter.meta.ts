/**
 * CardFooter 的组件契约元数据（ComponentDefinition）。
 * api 字段与 CardFooter.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-card-footer',
  version: '0.1.0',
  identity: {
    name: 'CardFooter',
    package: '@ui/components',
    export: 'CardFooter',
    category: 'general',
    description: '卡片底部区块：动作区/补充说明的排版默认值（text-sm / text-2），插槽驱动，无自有交互。',
  },
  intent: {
    what: 'Card 的底部区块容器：为动作按钮组或补充说明提供次级排版默认值。',
    when: ['Card 底部放确认/取消等 Button 动作区', '放时间戳、来源等次级补充说明'],
    whenNot: ['主体正文（用 CardBody）', '标题行（用 CardHeader）'],
    userTask: '用户在读完卡片内容后执行动作或查看补充信息',
  },
  api: {
    props: [],
    slots: [{ name: 'default', description: '底部内容：通常为 Button 动作组或次级说明文字。' }],
    events: [],
    exposes: [],
  },
  constraints: { dependsOn: ['ui-card'] },
  composition: {
    patterns: ['CardFooter 内放 ButtonGroup', 'CardFooter 放时间戳/来源说明'],
    related: ['Card', 'CardHeader', 'CardBody', 'Button'],
    preferred: ['动作按钮用 Button/ButtonGroup 放入，不要塞与主体同权重的长正文'],
  },
  states: {
    default: 'text-sm / body 行高 / text-2 颜色；无内边距（由 Card 统一），区块间距由 Card 的 gap 提供。',
    hover: '无交互态：静态区块不响应 hover（内部 Button 保持各自 hover 表现）。',
    focusVisible: '无聚焦语义：不可聚焦；内部按钮以全局 :focus-visible 焦点环聚焦。',
    active: '无按压反馈（内部按钮保持各自 active 表现）。',
    disabled: '不适用：无禁用语义。',
  },
  accessibility: '泛型 div 容器，无 role、不产生 landmark/contentinfo 语义；内部按钮为原生 button，键盘路径与独立 Button 一致。',
  ssr: 'renderToString 无异常：无浏览器 API 访问，插槽内容随 SSR 输出。',
  performance: '纯静态容器：无监听器、无测量、无定时器。',
  styling: '只消费 --ui-* token：字号 --ui-text-sm、行高 --ui-leading-body、颜色 --ui-text-2；自身不设边距（间距由 Card gap 统一）。',
  examples: ["<CardFooter>\n  <Button size='sm'>查看日志</Button>\n</CardFooter>"],
  agent: {
    keywords: ['card footer', '卡片底', '动作区', '区块'],
    selectionHints: ['Card 需要动作区/次级说明时用它，获得次级排版默认值'],
    commonTasks: ['卡片底部确认/取消动作'],
    generationNotes: ['动作按钮放原生 Button/ButtonGroup；不要把主体正文塞进 footer'],
  },
}
