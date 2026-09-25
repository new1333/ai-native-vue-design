/**
 * Divider 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Divider.types.ts 保持一致；states 与 Divider.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-divider',
  version: '0.1.0',
  identity: {
    name: 'Divider',
    package: '@ui/components',
    export: 'Divider',
    category: 'general',
    description: '纸面分隔线：水平（默认语义 hr，可选居中标签）/垂直方向，细线走 --ui-border、间距走 --ui-space-*。',
  },
  intent: {
    what: '在内容区块之间建立视觉与语义分隔的水平/垂直细线，可选居中标签。',
    when: [
      '表单分组、卡片内区块、页面章节之间需要分隔',
      '带文字的分隔（如"或"、分组名）用 label 插槽（水平）',
      '工具栏/并排内容之间的竖线用 direction="vertical"',
    ],
    whenNot: [
      '仅需要留白不需要线时用布局间距（--ui-space-*），不要滥用分隔线',
      '列表项之间的分隔用列表自身的分隔样式，不要逐行插 Divider',
      '承载交互（折叠分区）用 Accordion 类组件，Divider 纯展示',
    ],
    userTask: '用户需要把相邻内容在视觉与语义上分成两块',
  },
  api: {
    props: [
      { name: 'direction', type: "'horizontal' | 'vertical'", default: 'horizontal', description: '分隔方向；水平且无标签时渲染语义 <hr>，带标签或垂直时渲染 div[role="separator"]。' },
    ],
    slots: [
      { name: 'label', description: '分隔线标签（仅水平生效）：居中展示、两侧细线；提供后根元素由 <hr> 变为 div[role="separator"]。' },
    ],
    events: [],
    exposes: [],
  },
  constraints: {},
  composition: {
    patterns: ['表单分组之间（与 --ui-space-5 间距节奏一致）', 'Heading + Divider + Text 的区块结构', '工具栏内 direction="vertical" 竖线分组'],
    related: ['Heading', 'Text', 'Card', 'Form'],
    preferred: ['相邻区块优先靠布局间距分隔，确需线条再使用', '带标签分隔线的标签用 2–4 个字的短词'],
  },
  states: {
    default: '静态细线：--ui-border 色、结构性 1px；水平上下 --ui-space-5 间距，垂直左右 --ui-space-2；标签 text-2/13px/500。',
    hover: '无交互，不响应 hover，无 hover 样式。',
    focusVisible: '不可聚焦（无 tabindex、非交互元素），不产生焦点环。',
    active: '无按压态，不响应 ：active。',
    disabled: '无禁用态。',
  },
  accessibility:
    '语义 separator：水平无标签为 <hr>（隐式 role=separator）；带标签与垂直形态显式 role="separator"，垂直另置 aria-orientation="vertical"（ARIA 默认水平）。纯展示不可聚焦，无键盘路径；两侧装饰细线 aria-hidden。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；方向分支（hr / 带标签 div / 垂直 div）在服务端即解析，role 与 aria-orientation 随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；形态与 class 按渲染求值（无缓存副作用），渲染成本可忽略。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：线色 --ui-border、间距 --ui-space-5/--ui-space-2/--ui-space-3、标签字号 --ui-text-sm、字重 --ui-font-weight-medium；描边宽度 1px 为结构性细线（无 --ui-border-width token，需求已提出）。无全局 CSS 引入。',
  examples: [
    '<Divider />',
    '<Divider direction="vertical" />',
    '<Divider><template #label>或</template></Divider>',
    '<Divider><template #label>高级设置</template></Divider>',
  ],
  agent: {
    keywords: ['divider', '分隔线', '分割线', 'hr', 'separator', '竖线', '分组', '标签分隔'],
    selectionHints: [
      '区块分隔 → Divider（水平默认 hr）；工具栏竖线 → direction="vertical"',
      '需要文字说明的分隔 → label 插槽，标签保持简短',
      '只要留白不要线 → 用布局间距，不用 Divider',
    ],
    commonTasks: ['表单分组分隔', '卡片内章节分隔', '工具栏竖线'],
    generationNotes: [
      '水平带 label 后根元素是 div[role=separator]，不再是 hr，样式覆盖时注意',
      '垂直用法假定置于 flex 行内（align-self: stretch 拉伸高度）',
      '分隔线间距已内置（--ui-space-*），无需额外 margin',
    ],
  },
}
