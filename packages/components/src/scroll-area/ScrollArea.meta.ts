/**
 * ScrollArea 的组件契约元数据（ComponentDefinition）。
 * api 字段与 ScrollArea.types.ts 保持一致；states 与 ScrollArea.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-scroll-area',
  version: '0.1.0',
  identity: {
    name: 'ScrollArea',
    package: '@ui/components',
    export: 'ScrollArea',
    category: 'general',
    description: '滚动区域容器原语：viewport 承载原生滚动（wheel / 触摸 / 键盘），装饰滚动条统一滚动视觉；溢出时按 type 档位显隐，方向由 direction 约束。',
  },
  intent: {
    what: '给一块固定尺寸的区域套上统一视觉的滚动能力：内容在原生可聚焦的 viewport 中滚动，aria-hidden 的装饰滚动条按 type（auto/always/hover/scroll）显隐、按 direction（vertical/horizontal/both）约束方向。',
    when: [
      '侧栏、面板、卡片内长内容需要滚动，且不想要原生滚动条破坏纸面视觉',
      '同屏多个滚动区域需要统一的滚动条视觉与显隐节奏',
      '横向内容（时间轴、代码块、宽表格片段）需要横向滚动容器',
      '配合 Card 等容器给固定高度的内容区补齐滚动能力',
    ],
    whenNot: [
      '长列表性能敏感场景用 VirtualList：ScrollArea 不做虚拟化，全部内容常驻 DOM',
      '需要拖拽滚动条拇指或点击轨道定位：装饰条仅视觉指示（pointer-events:none），滚动由原生 wheel / 触摸 / 键盘完成',
      '弹层 / 下拉内部的滚动联动定位用 Popover / Select 等浮层组件自带的滚动处理',
      '文档级 body 滚动条定制：本组件是容器原语，不作用于文档级滚动',
    ],
    userTask: '用户需要在一块固定尺寸的纸面区域内浏览超出容量的内容',
  },
  api: {
    props: [
      {
        name: 'type',
        type: "'auto' | 'always' | 'hover' | 'scroll'",
        default: "'auto'",
        description: "装饰滚动条显隐档位：'auto' 溢出时悬停或滚动中可见（默认）；'always' 溢出期间恒定可见；'hover' 仅悬停时可见；'scroll' 仅滚动中可见，静默 1s 后隐藏。",
      },
      {
        name: 'direction',
        type: "'vertical' | 'horizontal' | 'both'",
        default: "'vertical'",
        description: "可滚动方向（默认 'vertical' 仅纵向）：被排除方向的溢出内容被裁剪，且不渲染对应装饰条。",
      },
    ],
    slots: [
      { name: 'default', description: '滚动内容：任意内容，常驻 DOM（不做虚拟化）；渲染于 viewport 内的内容包裹层中。' },
    ],
    events: [
      {
        name: 'scroll',
        payload: 'Event',
        description: 'viewport 原生 scroll 事件转发，载荷为原生 Event；读取滚动位置经 event.currentTarget（即 viewport）的 scrollTop / scrollLeft。',
      },
    ],
    exposes: [
      {
        name: 'update',
        type: '() => void',
        description: '手动重测：ResizeObserver 以 viewport 与内容包裹层的尺寸变化驱动重测，无法覆盖的内容变化（如挂载后横向内容变宽）可调用它立即刷新装饰条几何。',
      },
    ],
  },
  constraints: {},
  composition: {
    patterns: [
      'Card > CardBody > ScrollArea（固定高度）> 长日志 / 长列表',
      '侧栏导航容器：ScrollArea 包住长菜单，悬停显出滚动条',
      'direction="both" 的横向时间轴 / 代码块滚动区',
    ],
    related: ['Card', 'VirtualList', 'Table'],
    preferred: [
      '使用方必须给定确定高度（height 或 flex 拉伸）：viewport 以 height:100% 填充容器，容器无高度约束时不会产生滚动',
      '内容更新后装饰条未刷新（如挂载后内容变宽）时调用 update() 手动重测，而非依赖外部样式 hack',
      '滚动位置监听用 @scroll 事件并从 event.currentTarget 读 scrollTop / scrollLeft',
    ],
  },
  states: {
    default: 'viewport 承载内容原生滚动；内容未溢出（或方向被排除）时对应装饰条不渲染；溢出时按 type 档位决定可见时机，拇指默认色 --ui-border-strong、圆角 --ui-radius-xs。',
    hover: 'type="hover" / "auto" 下指针悬停于区域内时装饰滚动条淡入（--ui-motion-default + --ui-ease-out），移出淡出；悬停期间拇指加深为 --ui-text-3。',
    focusVisible: 'viewport 可聚焦（tabindex=0），键盘聚焦时享受全局 :focus-visible 焦点环（--ui-accent 2px + 2px 偏移）；装饰条与拇指不可聚焦。',
    active: '无按压反馈：滚动区域是容器原语，不承载 active 态；装饰条不承接指针交互。',
    disabled: '不适用：滚动是原生能力，ScrollArea 无禁用语义；需要冻结滚动时由使用方约束容器尺寸或内容。',
  },
  accessibility:
    '真实滚动发生在原生可聚焦的 viewport（div tabindex=0）上：键盘用户 Tab 进入后以方向键 / PageUp / PageDown 原生滚动，组件不监听也不拦截 keydown；装饰滚动条与拇指 aria-hidden="true" 且 pointer-events:none，仅作视觉指示，不产生 role="scrollbar" 的交互语义；viewport 保持泛型 div 语义，不劫持 landmark。',
  ssr:
    'renderToString 无异常：setup 顶层与模块顶层不访问任何浏览器 API；测量、ResizeObserver、滚动监听、隐藏定时器全部推迟到 onMounted 之后并在 onBeforeUnmount 清理；SSR 直出 viewport、默认插槽内容与两条 aria-hidden 装饰条骨架（溢出检测初始为 false，条是否可见由 CSS 决定）。',
  performance:
    '每次 scroll 做一次 O(1) 盒模型读取并同步刷新两个拇指的内联几何；ResizeObserver 观察 viewport 与内容包裹层驱动重测；type="scroll"/"auto" 的静默隐藏用单个可重置定时器；无虚拟化、无第三方依赖。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：装饰条宽 --ui-space-2、拇指色 --ui-border-strong（悬停 / 滚动中加深为 --ui-text-3）、圆角 --ui-radius-xs、最小拇指尺寸 --ui-space-2、显隐过渡 --ui-motion-default + --ui-ease-out、层级 --ui-z-sticky、文字 --ui-text-1 / --ui-font-sans。原生滚动条经 scrollbar-width:none 与 ::-webkit-scrollbar 隐藏；拇指的 top/height、left/width 百分比为运行时测量的内联几何值，非静态视觉值。无全局 CSS 引入。',
  examples: [
    "<ScrollArea class='log-pane'>\n  <p v-for='n in 50' :key='n'>第 {{ n }} 行日志…</p>\n</ScrollArea>\n/* 使用方需给定确定高度：.log-pane { height: 240px } */",
    "<ScrollArea type='always' direction='both'>\n  <div class='wide-row'>横向时间轴内容</div>\n</ScrollArea>",
    "<ScrollArea type='hover' @scroll='onScroll'>\n  <ArticleBody />\n</ScrollArea>",
  ],
  agent: {
    keywords: ['scroll', 'scrollarea', 'scrollbar', '滚动', '滚动条', '滚动区域', '溢出', 'overflow', '自定义滚动条'],
    selectionHints: [
      '固定区域内滚长内容且要统一滚动视觉 → ScrollArea；超长列表要虚拟化 → VirtualList',
      '默认 auto 档：悬停或滚动时才出现滚动条，最不打扰纸面；监控面板等需要常驻指示用 always',
      '横向滚动选 direction="horizontal" / "both"，被排除方向的溢出会被裁剪',
    ],
    commonTasks: ['侧栏长菜单滚动', '卡片内日志 / 长文滚动', '横向时间轴滚动容器'],
    generationNotes: [
      '必须给 ScrollArea 根元素确定高度（height 或 flex 拉伸），否则 viewport 不会产生滚动',
      '装饰滚动条不可拖拽、不承接指针事件：不要在其上绑定交互，滚动交互走原生 viewport',
      '监听滚动用 @scroll（载荷为原生 Event），不要试图在装饰条上挂事件',
      '内容尺寸在挂载后动态变化且 ResizeObserver 覆盖不到时调用暴露的 update() 重测',
    ],
  },
}
