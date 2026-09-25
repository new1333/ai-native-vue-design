/**
 * ButtonGroup 的组件契约元数据（ComponentDefinition）。
 * api 字段与 ButtonGroup.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-button-group',
  version: '0.1.0',
  identity: {
    name: 'ButtonGroup',
    package: '@ui/components',
    export: 'ButtonGroup',
    category: 'general',
    description: '按钮连排容器：组内共享 size，处理连排首尾圆角（中间方角），并给出 role="group" 分组语义。',
  },
  intent: {
    what: '把若干相关 Button 连排成一组：视觉上无缝相接、尺寸统一、语义上归为一个 group。',
    when: [
      '同一操作的多个并列分支（复制/编辑/删除）',
      '工具栏、表格行尾动作列',
      '需要统一尺寸的一排动作按钮',
    ],
    whenNot: [
      '语义为单选/多选时（分段选择应使用专用选择类组件，ButtonGroup 不承载选中态）',
      '主操作 + 次操作的对话框动作区（视觉重量不同，直接并排两个 Button 即可，无需连排）',
      '仅一个按钮时无需包裹（连排圆角处理对其无意义）',
    ],
    userTask: '用户在若干并列动作中触发其一',
  },
  api: {
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", description: '组内共享尺寸；组内 Button 显式声明 size 时以自身为准。' },
    ],
    slots: [
      { name: 'default', description: '组内容，通常为若干 Button（直接 DOM 子元素才能享受首尾圆角处理）。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    conflicts: ['分段选择/单选组件（选中态语义）'],
    dependsOn: ['ui-button'],
  },
  composition: {
    patterns: ['工具栏动作组', '表格行操作列', '向导步骤的上一步/下一步'],
    related: ['Button', 'IconButton'],
    preferred: ['组内 Button 不单独声明 size，统一交给 ButtonGroup'],
  },
  states: {
    default: 'inline-flex 连排、stretch 等高；子按钮首尾保留外沿圆角（--ui-button-radius），中间方角。',
    hover: '子按钮各自的 hover 表现不变；连排边界不产生额外反馈。',
    focusVisible: '子按钮逐个以全局 :focus-visible 焦点环聚焦，Tab 顺序即 DOM 顺序。',
    active: '子按钮各自的 active 按压表现不变。',
    disabled: '容器不拦截子按钮；禁用由各 Button 的 disabled 决定。',
  },
  accessibility:
    '容器 role="group"，可用 aria-label（透传 attrs）命名分组；子按钮为原生 button，键盘路径与独立 Button 完全一致。',
  ssr: 'renderToString 无异常；无浏览器 API 访问，size 共享走 provide/inject，SSR 期间即可解析。',
  performance: '纯容器：无监听、无测量，仅 provide 一个 computed。',
  styling:
    '连排圆角消费 --ui-button-radius；其余视觉完全由子 Button 自身 token 决定；容器不设间距（连排贴合）。',
  examples: [
    "<ButtonGroup>\n  <Button>复制</Button>\n  <Button>编辑</Button>\n  <Button variant='danger'>删除</Button>\n</ButtonGroup>",
    "<ButtonGroup size='sm' aria-label='行操作'>\n  <Button>查看</Button>\n  <Button>编辑</Button>\n</ButtonGroup>",
  ],
  agent: {
    keywords: ['button group', '按钮组', '连排', '工具栏', 'toolbar actions', '动作组'],
    selectionHints: [
      '并列同级动作 → ButtonGroup；有选中态 → 选择类组件；对话框动作区 → 直接并排 Button',
    ],
    commonTasks: ['表格行操作列', '工具栏动作组'],
    generationNotes: [
      '子 Button 必须是直接子元素（首尾圆角依赖 DOM 相邻关系）',
      '组内不再单独给 Button 传 size，统一用 ButtonGroup 的 size',
    ],
  },
}
