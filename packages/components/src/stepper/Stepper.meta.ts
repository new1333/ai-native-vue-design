/**
 * Stepper 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Stepper.types.ts 保持一致；states 与 Stepper.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-stepper',
  version: '0.1.0',
  identity: {
    name: 'Stepper',
    package: '@ui/components',
    export: 'Stepper',
    category: 'navigation',
    description:
      '纸面步骤条：流程进度与步骤切换（Steps），steps 数组配置步骤、v-model:modelValue 受控当前步，横/纵排布，状态派生 waiting/process/finish/error，clickable 开启后可回退到已完成步骤。',
  },
  intent: {
    what: '把一条有序流程暴露为步骤条：显示各步状态（未到/进行中/已完成/出错）与当前步（aria-current="step"），clickable 开启后允许回退到已完成步骤并发出当前步变化。',
    when: [
      '分步向导（注册 / 结算 / 配置流程）的进度指示与步骤回退',
      '多步表单顶部显示「进行到第几步、哪一步出错」',
      '引导式流程（onboarding）的完成进度展示',
      '需要当前步语义暴露给读屏（aria-current="step"）',
    ],
    whenNot: [
      '无先后语义的平行视图切换用 Tabs：Stepper 的步骤有序，不可任意跳转',
      '需要自由跳转到任意步（含跳过未完成步骤前跳）的导航型步骤条本期不做：clickable 仅允许回退到已完成步骤',
      '步骤内容面板的装载/卸载由使用方承担：Stepper 只表达进度与当前步，不渲染每步内容',
      '步骤内嵌 loading 加载态本期不做（状态全集为 waiting/process/finish/error）',
    ],
    userTask: '用户需要知道流程走到哪一步、哪些已完成、哪一步出错，并可以回到已完成的步骤修正',
  },
  api: {
    props: [
      { name: 'steps', type: 'StepperStep[]', required: true, description: '步骤配置序列（顺序即流程顺序）：{ title, description?, disabled? }；title 必填。' },
      { name: 'modelValue', type: 'number', default: '0', description: '当前步索引（0 起始，v-model 受控）；组件自身不持有步状态，点击只发出 update:modelValue。' },
      { name: 'status', type: "'waiting' | 'process' | 'finish' | 'error'", default: 'process', description: '当前步的状态覆盖：默认 process；置 error 时当前步按出错态呈现（已完成步仍 finish、未到步仍 waiting）。' },
      { name: 'direction', type: "'horizontal' | 'vertical'", default: 'horizontal', description: '排布方向：横向（连接线在步骤之间）或纵向（连接线沿左轨向下）。' },
      { name: 'clickable', type: 'boolean', default: 'false', description: '是否允许点击步骤切换：开启后「已完成（finish）」步骤渲染为原生 button，点击 / Enter / Space 回退到该步；当前步与未到步不可交互（只允许回退，不允许跳过未完成步骤前跳）。' },
    ],
    slots: [
      { name: 'icon', scope: '{ step: StepperStep; index: number; status: StepperStatus }', description: '自定义图标节点内容（替换默认的序号/对勾/叉）；步骤本体仍由节点圆与标题描述承担。' },
      { name: 'description', scope: '{ step: StepperStep; index: number; status: StepperStatus }', description: '自定义描述内容（替换 step.description 文本）；无描述且无插槽时不渲染描述容器。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'number', description: 'v-model 更新：点击可交互步骤（clickable 下的已完成步骤）时发出，载荷为目标步索引；与当前步相同不发出。' },
      { name: 'change', payload: 'number', description: '同 update:modelValue 的通知事件：载荷为目标步索引，便于只监听变化不做受控。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['steps 必须以数组 prop 提供（title 必填），组件不提供 Step 子组件组装式 API'],
    conflicts: ['Tabs（无先后语义的平行视图切换）', 'Pagination（平等的数据页导航）'],
    dependsOn: ['@ui/tokens：--ui-* 视觉 token（使用方引入 paper.css）'],
  },
  composition: {
    patterns: ['分步表单：Stepper 顶部指示进度 + 使用方按 modelValue 切换渲染各步表单内容', '结算/配置向导：clickable 回退已完成步骤修正后再次前进', 'onboarding 引导页纵向步骤条（direction="vertical"）'],
    related: ['Button', 'Form', 'Card', 'Alert'],
    preferred: ['受控使用 v-model（modelValue），父层持有当前步并负责各步内容的渲染与校验', '出错的步骤把 status 置为 error 提示当前步异常，修正后恢复默认 process', '步骤标题用动词短语（如「确认订单」），描述补充说明'],
  },
  states: {
    default: '未到步（waiting）：节点透明底 + 1px --ui-border-strong 描边 + text-2 序号，标题 text-2；连接线 1px --ui-border。',
    hover: '仅可交互步骤（clickable 下的已完成 button）响应：标题转 text-1（150ms token 动效）；节点状态色不变；disabled 按钮不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不设 tabindex（可交互步骤是原生 button，天然在 Tab 序）。',
    active: '当前步（process）：节点 accent 实底 + on-accent 序号 medium 字重，标题 text-1 medium 字重；点击已激活项无输出（同值不发出）。status="error" 时当前步节点转 danger/danger-soft、标题 danger。',
    disabled: 'disabled 步骤：clickable 下已完成禁用步为原生 disabled button（text-3 + not-allowed，移出可交互状态）；未完成/未开启 clickable 的禁用步为非交互 div，节点与标题置灰 text-3。',
    error: 'status="error"（或插槽自定义）时当前步节点 danger 描边 + danger-soft 底 + 叉形图标，标题 danger medium 字重；前序已完成步不受影响。',
  },
  accessibility:
    '根为 <ol role="list">（list 语义；list-style 重置后显式声明 role 防止读屏丢弃），每步为 <li>，当前步 li 携带 aria-current="step"；可交互步骤（clickable 下的已完成步骤）为原生 <button type="button">（含 disabled 步骤的原生 disabled），无 tabindex 覆写，Tab 逐按钮可达，Enter / Space 激活（keydown 统一 preventDefault 后单次触发）；非交互步骤为非聚焦 div，不伪装按钮。图标节点内的对勾/叉为 aria-hidden 装饰 svg（viewBox 0 0 24 24、stroke-width 1.5、currentColor），步骤可读名来自标题文本与序号。',
  ssr:
    'renderToString 无异常：useStepper 为纯 computed 派生，setup 与模块顶层不访问任何浏览器 API；当前步解析、状态派生（item--finish/process/waiting/error 修饰类）、aria-current="step"、clickable 下的 button/disabled 输出全部随 SSR 渲染，客户端水合后契约一致。',
  performance:
    '无监听器、无测量、无定时器；状态派生为 O(1) 纯函数（statusFor/canSelect），无内部状态；动效仅 color/background-color/border-color 过渡（--ui-motion-fast + --ui-ease-out），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：状态色 --ui-accent/--ui-on-accent/--ui-success/--ui-success-soft/--ui-danger/--ui-danger-soft、文本 --ui-text-1/2/3、连线 --ui-border/--ui-border-strong、节点圆直径取 --ui-space-5（border-radius: calc(var(--ui-space-5)/2)，同 Avatar/Radio 圆形先例）、间距 --ui-space-1/2/3、字号 --ui-text-md（继承根）/--ui-text-sm、字重 --ui-font-weight-*、数字 --ui-numeric、动效 --ui-motion-fast/--ui-ease-out。无全局 CSS 引入；结构性重置（列表盒模型清零、border:none、background:transparent）不承担视觉取值。结构性细线 1px（连接线/节点描边）无 --ui-border-width token，需求已提出。',
  examples: [
    "<Stepper v-model=\"current\" :steps=\"[\n  { title: '账号信息' },\n  { title: '公司信息', description: '选填' },\n  { title: '完成' },\n]\" />",
    "<Stepper v-model=\"current\" clickable :steps=\"steps\" @change=\"onChanged\" />（clickable：可回退到已完成步骤）",
    "<Stepper v-model=\"current\" status=\"error\" :steps=\"steps\" />（当前步出错态）",
    "<Stepper v-model=\"current\" direction=\"vertical\" :steps=\"steps\">（纵向步骤条）</Stepper>",
  ],
  agent: {
    keywords: ['stepper', 'steps', '步骤条', '分步', '向导', 'wizard', '流程', '进度', 'aria-current', 'step', 'clickable', 'direction'],
    selectionHints: [
      '有序流程的进度与回退 → Stepper；平行视图切换 → Tabs；数据页跳转 → Pagination',
      '受控用 v-model（modelValue 当前步索引，0 起始）；组件不持有内部步状态，务必在父层接住 update:modelValue',
      '每步内容由使用方按 modelValue 条件渲染，Stepper 只负责进度与切换',
      '需要让用户回退修正时开 clickable；默认只读展示进度',
    ],
    commonTasks: ['分步表单进度条', '结算/配置向导', 'onboarding 引导进度'],
    generationNotes: [
      'steps 以数组 prop 配置（{ title, description?, disabled? }），无 Step 子组件；title 必填',
      'clickable 只允许回退到已完成步骤：当前步与未到步（waiting）不可点击，向导语义防跳步',
      '当前步状态覆盖用 status="error"；已完成步恒为 finish、未到步恒为 waiting',
      'icon/description 为作用域插槽（{ step, index, status }）；无描述内容时不渲染描述容器',
      '连接线完成段转 --ui-success；错误节点用 --ui-danger，勿在组件外另写状态色',
    ],
  },
}
