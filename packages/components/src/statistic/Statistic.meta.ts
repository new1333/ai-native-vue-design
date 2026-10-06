/**
 * Statistic 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Statistic.types.ts 保持一致；states 与 Statistic.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-statistic',
  version: '0.1.0',
  identity: {
    name: 'Statistic',
    package: '@ui/components',
    export: 'Statistic',
    category: 'data',
    description: '纸面数值统计：KPI 数值（precision 小数位 + 前后缀单位）+ 标题 + 涨跌趋势箭头（success/danger）+ 倒计时（墙钟差值递减、后台标签页节流不漂移、归零 finish），数字走 tabular-nums 排版。',
  },
  intent: {
    what: '关键数值的统计展示：标题 + 大号数值（precision 小数位、prefix/suffix 单位）+ 可选涨跌趋势箭头；countdown 模式把 value 当作剩余秒数、以墙钟差值逐秒收敛（后台标签页 interval 被节流也不变慢），归零发出 finish。',
    when: [
      '仪表盘 / 概览页的 KPI 卡片：数值 + 标题 + 单位前后缀',
      '需要表达同比/环比方向的指标（trend up/down 箭头）',
      '秒杀、截止、验证码等剩余时间倒计时（countdown + @finish 到点回调）',
      '读屏需要把倒计时识别为计时器语义（role="timer"）',
    ],
    whenNot: [
      '千分位分组、货币本地化等复杂格式：组件只做 toFixed(precision)，用 #default 插槽由使用方渲染',
      '过程量值进度用 Progress（progressbar 语义）：Statistic 表达结果数值而非进行到百分之几',
      '可编辑数字用 InputNumber：Statistic 只读、不可交互',
      '数据加载占位用 Skeleton：Statistic 无 loading 态',
    ],
    userTask: '用户需要快速读取关键指标数值或剩余时间，并感知其涨跌方向',
  },
  api: {
    props: [
      { name: 'value', type: 'number', default: '0', description: '统计值：toFixed(precision) 格式化，非有限数回退 0；countdown=true 时为初始剩余秒数，变更即重置倒计时。' },
      { name: 'precision', type: 'number', default: '0', description: '小数位数：收敛为 [0,100] 整数（负数按 0）；countdown 模式忽略（秒数为整数）。' },
      { name: 'prefix', type: 'string', default: "''", description: '数值前缀文本（如货币符号）；#prefix 插槽优先。' },
      { name: 'suffix', type: 'string', default: "''", description: '数值后缀文本（如单位）；#suffix 插槽优先。' },
      { name: 'title', type: 'string', default: "''", description: '标题文本；#title 插槽优先。' },
      { name: 'trend', type: "'up' | 'down'", default: '—', description: '趋势方向：渲染带可访问名（上升/下降）的方向箭头，up=success / down=danger 色；不传不渲染。' },
      { name: 'countdown', type: 'boolean', default: 'false', description: '倒计时模式：value 为初始剩余秒数，客户端以墙钟差值递减（deadline - Date.now()，后台标签页 interval 被节流时进度仍与真实时间一致），归零停表并发出 finish（初始即 0 不发出）；value 变更即重置（重算 deadline）；precision 忽略；展示 <1h 为 mm:ss、≥1h 为 HH:mm:ss。' },
    ],
    slots: [
      { name: 'title', description: '覆盖标题的默认渲染（如加图标/徽标）。' },
      { name: 'prefix', description: '覆盖前缀的默认渲染。' },
      { name: 'suffix', description: '覆盖后缀的默认渲染。' },
      { name: 'default', description: '覆盖数值展示（千分位等自定义格式）；countdown 下同样生效，可自定义剩余时间格式。' },
    ],
    events: [
      { name: 'finish', payload: '—', description: '倒计时递减触达 0 时发出一次（仅 countdown 模式；初始即 0 不发出）。' },
    ],
    exposes: [],
  },
  constraints: {
    dependsOn: ['@ui/tokens/paper.css（使用方在应用入口引入）'],
  },
  composition: {
    patterns: [
      '<Statistic title="总营收" :value="128430.5" :precision="2" prefix="¥" trend="up" />',
      '<Statistic title="活跃用户" :value="8642" suffix="人" trend="down" />',
      '<Statistic title="距离截止" :value="90" countdown suffix="后截止" @finish="onFinish" />',
      'KPI 卡片网格由使用方以 Card / 布局容器编排，组件自身只负责单个统计块',
    ],
    related: ['Progress', 'Typography', 'Heading', 'Skeleton', 'Card'],
    preferred: [
      'KPI 结果数值用 Statistic；过程进度用 Progress（progressbar 语义）',
      '单位/货币用 prefix/suffix props 或对应插槽，不放数值本体',
      '倒计时到点后的业务动作监听 finish，而非外部轮询剩余时间',
    ],
  },
  states: {
    default: '标题 text-2（--ui-text-sm），数值 text-3xl semibold text-1（--ui-numeric tabular-nums），前后缀 text-2；趋势箭头 up=--ui-success / down=--ui-danger。',
    hover: '不适用：纯展示元素，无 hover 反馈。',
    focusVisible: '不适用：不可聚焦，不进入 Tab 序，永不获得焦点环。',
    active: '不适用：无交互。',
    disabled: '不适用：无 disabled 语义；倒计时归零即为 00:00 终态，重开由使用方变更 value（受控重置）。',
    loading: '不适用：数据加载占位用 Skeleton；countdown 计时是进行中语义而非加载态。',
  },
  accessibility:
    '非交互纯展示：无 tabindex、不进入 Tab 序、无可聚焦后代。countdown=true 根元素 role="timer"（ARIA 数值计数器语义，剩余时间文本本身可读）；trend 箭头容器 role="img" + aria-label（上升/下降）提供方向语义双通道，svg aria-hidden="true"。title/prefix/suffix/value 均为可读文本节点；默认不设 aria-live，避免逐秒打断读屏（需要播报由使用方在外层以 role="status" 自行编排）。',
  ssr:
    'renderToString 无异常：计时器只在客户端 onMounted 起表、onBeforeUnmount 清理，setup 与模块顶层不访问浏览器 API（useCountdown 的 restart 亦仅由客户端生命周期与客户端 props 变更回调调用）；数值格式化文本、标题/前后缀、趋势箭头（含 role="img" aria-label）与 countdown 的 role="timer" 及初始 mm:ss/HH:mm:ss 文本均随 SSR 输出。',
  performance:
    '非 countdown 零运行时开销（仅 computed 派生展示文本）；countdown 为 1s interval + 墙钟差值（每拍以 deadline - Date.now() 重算剩余，后台标签页 interval 被节流也不漂移），归零自停（不空转），value 变更重置、onBeforeUnmount 清理；无监听器、无测量、无动画。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：标题 --ui-text-sm/--ui-text-2/--ui-leading-small、数值 --ui-text-3xl/--ui-font-weight-semibold/--ui-text-1 + --ui-numeric（tabular-nums）+ --ui-leading-heading、前后缀 --ui-text-lg/--ui-text-2、趋势 up --ui-success / down --ui-danger、间距 --ui-space-1/--ui-space-2、字族 --ui-font-sans。无全局 CSS 引入；趋势箭头为内联 SVG（viewBox 24、stroke-width 1.5、currentColor、16px Icon Token）。',
  examples: [
    "<Statistic title='总营收' :value='128430.5' :precision='2' prefix='¥' />",
    "<Statistic title='活跃用户' :value='8642' suffix='人' trend='up' />",
    "<Statistic title='距离截止' :value='90' countdown @finish='onFinish' />",
    "<Statistic :value='total'>\n  <template #title>本周新增</template>\n  <template #suffix>条</template>\n</Statistic>",
  ],
  agent: {
    keywords: ['statistic', '统计', '数值', 'KPI', '指标', 'countdown', '倒计时', '计时器', 'trend', '趋势', '涨跌', 'prefix', 'suffix', 'precision', '小数位', 'metric', 'number'],
    selectionHints: [
      '结果数值展示 → Statistic；进行到百分之几 → Progress',
      '需要小数位用 precision；千分位/本地化等复杂格式 → #default 插槽自渲染',
      '剩余秒数倒计时 → countdown + @finish；只展示静态数值不传 countdown',
      '涨跌方向 → trend="up"|"down"；方向语义由 role="img" aria-label 提供',
    ],
    commonTasks: [
      '仪表盘 KPI 卡片数值展示（标题+数值+单位）',
      '带涨跌方向的指标对比展示',
      '秒杀/截止/验证码剩余时间倒计时（到点回调）',
    ],
    generationNotes: [
      'value 非有限数回退 0；precision 收敛为 [0,100] 整数（负数按 0）；不做千分位分组',
      'countdown=true：value 为初始剩余秒数，墙钟差值递减（每拍 deadline - Date.now() 向下取整并钳 0；后台节流不变慢），归零停表并 emit finish（初始即 0 不发）；value 变更即受控重置（重算 deadline）；precision 忽略',
      '倒计时文本 <1h 为 mm:ss、≥1h 为 HH:mm:ss；#default 可覆盖全部展示格式',
      '根元素 ui-statistic（countdown 附加 ui-statistic--countdown 与 role="timer"）；trend 箭头 up/down 修饰类 + role="img" aria-label（上升/下降）',
      '纯展示不可聚焦、无 exposes；#title/#prefix/#suffix/#default 分别覆盖对应默认渲染',
    ],
  },
}
