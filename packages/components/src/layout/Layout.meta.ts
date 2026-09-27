/**
 * Layout 的组件契约元数据（ComponentDefinition）。
 * Layout 为复合组件：Layout/LayoutHeader/LayoutSider/LayoutContent/LayoutFooter
 * 组装使用，api 字段以「组件名.成员」限定命名；与 Layout.types.ts 保持一致。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-layout',
  version: '0.1.0',
  identity: {
    name: 'Layout',
    package: '@ui/components',
    export: 'Layout',
    category: 'general',
    description:
      '纸面页面骨架：Layout + LayoutHeader + LayoutSider + LayoutContent + LayoutFooter 组成 SaaS 页面框架，语义 landmark（header/aside/main/footer），侧栏可折叠（触发器 / 受控 / 响应式断点）。',
  },
  intent: {
    what: '页面级骨架容器：顶栏 / 侧栏 / 主内容 / 页脚四个区域组件按语义标签组装，侧栏可折叠并可按视口断点自动收起。',
    when: [
      'SaaS 后台的整页框架（侧边导航 + 顶栏 + 内容区 + 页脚）',
      '内容型页面的纵向骨架（顶栏 + 正文 + 页脚）',
      '需要侧栏在小屏自动收起（breakpoint）、或由使用方受控折叠（collapsed + sider-collapse）的页面',
    ],
    whenNot: [
      '内容分组面板用 Card：Layout 是页面框架，不是有边界的卡片容器',
      '局部视图切换用 Tabs / Steps：Layout 不承载互斥切换语义',
      '单个区块内的排版节奏用 Space / Divider：Layout 只做区域级骨架',
      '浮层式侧栏（抽屉导航）用 Drawer：LayoutSider 是常驻文档流区域，不浮起',
    ],
    userTask: '用户需要一个稳定的页面框架，让导航与内容各归其位',
  },
  api: {
    props: [
      { name: 'LayoutSider.collapsible', type: 'boolean', default: 'false', description: '是否显示折叠触发器（侧栏底部的原生 button，键盘可达）。' },
      { name: 'LayoutSider.breakpoint', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", description: '响应式断点：客户端挂载后按视口宽度接线（matchMedia），低于断点自动折叠、回到以上自动展开；挂载时已在断点以下则立即折叠。缺省不监听。' },
      { name: 'LayoutSider.collapsed', type: 'boolean', description: '受控折叠态：传入后组件不写内部状态，折叠变化仅发出 sider-collapse，由使用方回写。' },
      { name: 'LayoutSider.defaultCollapsed', type: 'boolean', default: 'false', description: '非受控初始折叠态。' },
    ],
    slots: [
      { name: 'Layout.default', description: '区域组件的组装位置：LayoutHeader / LayoutSider / LayoutContent / LayoutFooter。LayoutSider 应为直接子节点（或经 v-if/v-for 片段）以触发横向 has-sider 布局。' },
      { name: 'LayoutHeader.default', description: '顶栏内容：品牌、主导航、用户区等。' },
      { name: 'LayoutSider.default', description: '侧栏内容：导航菜单、品牌区等；折叠时容器收窄并裁剪溢出。' },
      { name: 'LayoutContent.default', description: '主内容区。' },
      { name: 'LayoutFooter.default', description: '页脚内容：版权、辅助链接等。' },
    ],
    events: [
      { name: 'sider-collapse', payload: 'boolean', description: 'LayoutSider 折叠态变化：点击折叠触发器、断点跨越（含挂载时视口已在断点以下）时发出；同值不重复发出。受控模式下仅通知，需使用方回写 collapsed。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['LayoutSider 须为 <Layout> 的直接子节点（或经 v-if/v-for 片段）才能触发横向 has-sider 布局'],
    conflicts: ['Drawer（浮层式抽屉导航，非文档流常驻侧栏）'],
    dependsOn: ['@ui/tokens：--ui-* 视觉 token（使用方引入 paper.css）'],
  },
  composition: {
    patterns: [
      'Layout > LayoutHeader + LayoutContent + LayoutFooter（纵向骨架）',
      'SaaS 壳：Layout > (LayoutSider + Layout > (LayoutHeader + LayoutContent + LayoutFooter))',
      'LayoutSider collapsible + breakpoint：小屏自动收起，触发器手动开合',
      'LayoutContent 内嵌 Card / Table / Form 等任意内容（插槽驱动）',
    ],
    related: ['LayoutHeader', 'LayoutSider', 'LayoutContent', 'LayoutFooter', 'Menu', 'Breadcrumb', 'Card'],
    preferred: [
      '区域语义交给区域组件：顶栏/侧栏/正文/页脚分别用 LayoutHeader/Sider/Content/Footer，不要裸 div 充当区域',
      '嵌套 Layout 表达「侧栏占满高、右侧纵向排布」的经典结构，而不是在根 Layout 上混排方向',
      '受控折叠用 :collapsed + @sider-collapse 回写；仅初始态用 default-collapsed',
    ],
  },
  states: {
    default: '纵向骨架：header/footer 为 surface 面 + 1px 分隔线，content 为 --ui-bg 底 + 24px 内边距；含 Sider 时根切横向，侧栏展开宽 256px（间距标尺推导）。',
    hover: '布局骨架无 hover 态；仅侧栏折叠触发器 hover 时图标颜色 text-2 → text-1（150ms token 动效）。',
    focusVisible: '折叠触发器焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline；区域元素不可聚焦、不参与 Tab 序。',
    active: '无按压反馈：骨架区块为静态容器；折叠触发器为原生 button，无自定义按压视觉。',
    disabled: '不适用：布局骨架无禁用语义；内部控件（菜单项、按钮等）的禁用由各控件自身表达。',
  },
  accessibility:
    '语义 landmark 由原生标签承担：LayoutHeader=<header>、LayoutSider=<aside>、LayoutContent=<main>、LayoutFooter=<footer>，Layout 根为泛型 div（无 role）。折叠触发器为原生 button（Enter/Space 平台级激活），带 aria-label="切换侧栏"、aria-expanded（当前展开/折叠态）与 aria-controls（指向 aside id，id 由 useId 实例级派生）。断点折叠依赖 matchMedia，仅客户端挂载后接线，SSR 输出与非受控初始态一致，水合稳定。侧栏 landmark 的可读名称可由使用方经 attrs 透传 aria-label。',
  ssr:
    'renderToString 无异常：setup/模块顶层不访问浏览器 API；has-sider 由直接子节点在渲染期静态推导（SSR 单遍即输出横向布局类），matchMedia 接线只在 onMounted 执行，断点与折叠类按非受控初始态随 SSR 输出，客户端水合结果一致。',
  performance:
    'has-sider 与折叠类均为 computed 派生；每个带 breakpoint 的 LayoutSider 在挂载后持有一个 matchMedia 监听，onBeforeUnmount 清理（含断点 prop 变更时的重接线）；宽度过渡走 --ui-motion-default token 动效，无定时器、无测量。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：header/footer/侧栏 --ui-surface 面、content --ui-bg 底、分隔线 --ui-border（1px 结构性细线）、文字 --ui-text-1/--ui-text-2、内边距 --ui-space-2/3/5、侧栏展开宽 calc(var(--ui-space-8) × 4)（间距标尺推导，无 sider 宽度 token，需求已提出）、折叠宽 var(--ui-space-8)、顶栏最小高 var(--ui-space-8)、动效 --ui-motion-*/--ui-ease-out、触发器图标 16px（Icon Token）。断点像素（576/768/992/1200/1600）为 matchMedia 行为常量，不是 CSS 视觉值。无全局 CSS 引入。',
  examples: [
    "<Layout>\n  <LayoutHeader>顶栏</LayoutHeader>\n  <LayoutContent>主内容</LayoutContent>\n  <LayoutFooter>© 2026</LayoutFooter>\n</Layout>",
    "<Layout>\n  <LayoutSider collapsible breakpoint=\"md\" @sider-collapse=\"onCollapse\">\n    <Menu … />\n  </LayoutSider>\n  <Layout>\n    <LayoutHeader>顶栏</LayoutHeader>\n    <LayoutContent>主内容</LayoutContent>\n  </Layout>\n</Layout>",
    "<LayoutSider :collapsed=\"collapsed\" @sider-collapse=\"collapsed = $event\">…</LayoutSider>",
  ],
  agent: {
    keywords: ['layout', '布局', '页面骨架', 'sider', '侧栏', '侧边栏', 'header', '顶栏', 'footer', '页脚', 'content', '内容区', 'SaaS', '框架', '折叠', 'collapse', 'breakpoint', '响应式'],
    selectionHints: [
      '整页框架（顶栏/侧栏/正文/页脚）→ Layout 家族；内容分组面板 → Card；浮层侧栏 → Drawer',
      '侧栏要折叠：手动用 collapsible（自带触发器），小屏自动收起用 breakpoint，外部状态驱动用 :collapsed + @sider-collapse',
      '经典 SaaS 壳用嵌套 Layout：外层横向（Sider + 内层 Layout），内层纵向（Header/Content/Footer）',
    ],
    commonTasks: ['后台管理页骨架', '文档/控制台页面框架', '带响应式侧栏的仪表盘'],
    generationNotes: [
      'LayoutSider 必须是 <Layout> 的直接子节点（或经 v-if/v-for 片段）才触发横向布局；被真实元素包裹时不会触发',
      '不要给 Layout 根或区域组件添加交互态；交互交给内部组件（Menu/Button 等）',
      '断点值是行为常量（xs 576 / sm 768 / md 992 / lg 1200 / xl 1600，低于该宽度命中），断点折叠仅在客户端挂载后生效',
      '受控折叠时组件不改内部态：须在 @sider-collapse 里回写 :collapsed，否则视觉不动',
      '侧栏 landmark 的可读名称由使用方透传 aria-label（如 aria-label="主导航"）',
    ],
  },
}
