/**
 * Spinner 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Spinner.types.ts 保持一致；states 与 Spinner.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-spinner',
  version: '0.1.0',
  identity: {
    name: 'Spinner',
    package: '@ui/components',
    export: 'Spinner',
    category: 'feedback',
    description:
      '纸面加载指示器：紧凑型 loading 状态（role=status + sr-only 可访问名），spin 旋转环 / dots 三点脉冲两变体；不表达量值进度。',
  },
  intent: {
    what: '加载中指示：以紧凑图形（旋转环/脉冲点）表达"进行中但无量值"的等待，label 必配作为读屏可访问名。',
    when: [
      '按钮点击后的短时等待、区块局部加载等无量值场景',
      '嵌入文本行/按钮旁的紧凑 loading 指示（inline-flex，随内容收缩）',
      '路由/面板切换的过渡等待指示',
      '与文本组合表达任务名："正在导出…" + Spinner',
    ],
    whenNot: [
      '可计算进度的任务（0-100 + aria-valuenow）用 Progress：Spinner 不表达量值',
      '版面结构占位用 Skeleton：Spinner 表达"等待"而非占位形状',
      '操作结果反馈用 Toast / Alert：Spinner 表达"进行中"而非结果',
      '整页大块加载优先 Skeleton 组合：Spinner 只做紧凑点状指示，不撑满版面',
    ],
    userTask: '用户需要确认系统正在处理其请求，但无需知道具体进度百分比',
  },
  api: {
    props: [
      {
        name: 'label',
        type: 'string',
        required: true,
        description:
          '可访问名（必配）：加载状态文本，以 sr-only 渲染在 role="status" 内供读屏播报；图形本体 aria-hidden。需要更丰富的状态句时用 #label 插槽覆盖。',
      },
      {
        name: 'variant',
        type: "'spin' | 'dots'",
        default: "'spin'",
        description:
          '视觉变体：spin 为 SVG 旋转环（muted 轨道 + accent 1/4 弧，720ms/圈）；dots 为三点 opacity 脉冲（1.08s 周期、错相 1/3）。',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description:
          '尺寸档位：spin 外径 16/24/32（--ui-space-4/5/6）；dots 圆点 4/8/12、间距随档缩放。',
      },
    ],
    slots: [
      {
        name: 'label',
        description: '可访问名内容：覆盖 label 文本（仍以 sr-only 渲染在 role="status" 内）。',
      },
    ],
    events: [],
    exposes: [],
  },
  constraints: {
    requires: ['label 必配：未提供可访问名时读屏无法播报加载状态'],
    dependsOn: ['@ui/tokens/paper.css（--ui-* token 由使用方入口引入）'],
  },
  composition: {
    patterns: [
      "按钮触发的短时等待：<Spinner v-if='loading' size='sm' label='正在刷新' />",
      "文本行内组合：<span>正在导出 <Spinner size='sm' label='导出中' /></span>",
      "无量值的不确定等待：<Spinner variant='dots' label='正在保存' />",
    ],
    related: ['Progress', 'Skeleton', 'Button', 'Toast'],
    preferred: [
      'label 必填且写具体任务名（"正在导出报告"优于"加载中"），读屏播报才有信息量',
      '无量值等待一律用 Spinner，不要拿 Progress indeterminate 当通用 loading 用',
      '行内嵌入用 size="sm"，独立区块/空状态旁用默认 md 或 lg',
      '加载结束后用 v-if 卸载组件，避免 role=status 区域残留',
    ],
  },
  states: {
    default:
      'spin：muted 轨道（--ui-surface-muted）+ accent 1/4 弧段（根 --ui-accent），720ms/圈（--ui-motion-default × 4）；dots：accent 圆点，1.08s opacity 脉冲（× 6）。',
    hover: '不适用：非交互展示元素，无 hover 反馈。',
    focusVisible: '不适用：不可聚焦，不进入 Tab 序，永不获得焦点环。',
    active: '不适用：无交互。',
    disabled: '不适用：无 disabled 语义；加载结束由使用方 v-if 卸载或切换状态。',
    loading:
      '组件本体即加载语义：spin 为 transform 旋转（720ms/圈）、dots 为 opacity 脉冲（1.08s 周期、三点错相 1/3），均为加载态无限循环豁免；prefers-reduced-motion 时 token 归零 + 显式 @media 停用，降级为静态图形（spin 停在 1/4 弧、dots 恒满 opacity）。',
  },
  accessibility:
    '根元素 role="status"（polite live region）：label 必配并以 sr-only 文本渲染其中，读屏播报加载状态；图形本体（svg / dots）aria-hidden="true"。组件非交互、无 tabindex、不进 Tab 序（无键盘路径，交互语义刻意不存在）。量值进度语义（progressbar/aria-valuenow）刻意不使用——那是 Progress 的职责。',
  ssr:
    'renderToString 无异常：组件不访问任何浏览器 API（无 effect/监听/测量），role、修饰类、SVG 结构与 sr-only 可访问名文本均在服务端输出；动画只存在于 CSS，不影响 SSR HTML。',
  performance:
    '无 JS 运行时开销（仅 computed class 派生）；动效为 CSS 关键帧无限循环（加载态豁免）：spin 为 transform 旋转、dots 为 opacity 脉冲 + token 推导负延迟错相；prefers-reduced-motion 下显式 @media 停用。图形为内联 SVG/纯色圆点，无图片资源。',
  styling:
    '视觉只消费 --ui-* token：弧段/圆点 currentColor（根 --ui-accent）、spin 轨道 --ui-surface-muted、spin 外径 --ui-space-4/5/6、dots 圆点 --ui-space-1/2/3、点距 --ui-space-1/2、动效时长 --ui-motion-default calc 推导（spin ×4、dots ×6、错相 ×2/×4）。布局：根 inline-flex 随内容收缩，适配行内嵌入。sr-only 名采用 4px 盒（--ui-space-1）+ overflow hidden + clip-path inset(50%) 的结构性裁剪。dots 的 50% 全圆沿用 Skeleton circle 先例（结构性相对半径；--ui-radius-full token 需求已在任务结果中提出）。SVG 几何数值（viewBox 0 0 24 24、stroke-width 1.5、pathLength 100、dasharray 25/75）为结构性图形参数，遵循图标内联 SVG 约定。',
  examples: [
    "<Spinner label='正在加载' />",
    "<Spinner variant='dots' size='sm' label='正在保存' />",
    "<Spinner v-if='loading' label='正在导出报告' />",
    "<Spinner label='正在同步'>\n  <template #label>正在同步，剩余 {{ remaining }} 项</template>\n</Spinner>",
  ],
  agent: {
    keywords: [
      'spinner',
      '加载',
      '加载中',
      'loading',
      '加载指示器',
      '旋转',
      '转圈',
      '脉冲点',
      '等待',
      'status',
      'role=status',
      'loading indicator',
    ],
    selectionHints: [
      '无量值的"进行中"等待 → Spinner；有 0-100 数值 → Progress',
      '版面占位 → Skeleton；结果反馈 → Toast/Alert',
      '紧凑行内指示用 size="sm"，独立区块用 md/lg；需要更活泼的视觉用 variant="dots"',
      'label 必配：生成时必须提供具体任务名文本（或 #label 插槽），否则读屏无输出',
    ],
    commonTasks: [
      '按钮点击后短时等待的局部指示',
      '异步任务进行中的行内状态标记',
      '与文本组合表达"任务名 + 进行中"',
    ],
    generationNotes: [
      'label 为必配 props：sr-only 渲染在 role=status 内，#label 插槽可覆盖',
      '无 emits/exposes；加载结束由使用方 v-if 卸载',
      '两种变体的动效都由 --ui-motion-default calc 推导，reduced-motion 下自动静态化',
      'size 三档：spin 外径 16/24/32；dots 圆点 4/8/12、点距 4/4/8',
      '不要给 Spinner 传进度数值——它没有量值语义，需要量值用 Progress',
    ],
  },
}
