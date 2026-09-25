/**
 * Alert 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Alert.types.ts 保持一致；states 与 Alert.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-alert',
  version: '0.1.0',
  identity: {
    name: 'Alert',
    package: '@ui/components',
    export: 'Alert',
    category: 'feedback',
    description: '纸面页内警示条：柔底信息块（severity 语义图标 + 标题 + 正文 + 可选关闭按钮），danger 为 role=alert、其余为 role=status。',
  },
  intent: {
    what: '在页面内容流中就地展示一条需要被注意的状态信息（结果反馈、风险提示、系统说明），带 severity 语义色与图标。',
    when: [
      '操作结果就地反馈（保存成功、校验失败、额度不足等）',
      '表单/区块顶部的风险或约束提示（warning/danger）',
      '中性说明与公告（info，如功能灰度、维护计划）',
      '需要用户主动关闭的驻留提示（closable）',
    ],
    whenNot: [
      '瞬时通知（自动消失、跨页面存在）用 Toast：Alert 驻留在内容流中，不浮层',
      '模态阻塞确认用 Dialog：Alert 不拦截操作',
      '数据为空占位用 EmptyState：Alert 表达状态信息而非空态',
      '字段级校验错误用 FormField 的错误文案：Alert 承载区块级而非单字段信息',
    ],
    userTask: '用户需要看到并理解一条就地呈现的状态信息，并可决定是否将其关闭',
  },
  api: {
    props: [
      { name: 'severity', type: "'info' | 'success' | 'warning' | 'danger'", default: 'info', description: '语义档位：对应 --ui-{severity}/--ui-{severity}-soft 色与内建语义图标；同时决定 live region 角色（danger 为 alert，其余为 status）。' },
      { name: 'title', type: 'string', description: '一句话结论标题（text-1/medium）；详细说明放默认插槽正文。' },
      { name: 'closable', type: 'boolean', default: 'false', description: '渲染关闭按钮（原生 button、aria-label="关闭"）；点击仅 emit close，组件不自行隐藏。' },
    ],
    slots: [
      { name: 'default', description: '正文：详细说明、补充信息或富内容，渲染于标题之下（text-2）。' },
      { name: 'icon', description: '左侧图标覆盖：缺省时按 severity 渲染内建图标（内联 SVG，viewBox 0 0 24 24、stroke-width 1.5、currentColor、20px，颜色随 severity 语义色）。' },
    ],
    events: [
      { name: 'close', description: '点击关闭按钮后触发；显隐由使用方据此外理（如 v-if 移除）。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: ['Toast（瞬时浮层通知）', 'Dialog（模态阻塞）', 'EmptyState（空态占位）'],
  },
  composition: {
    patterns: [
      '表单提交失败：severity="danger" + 标题 + 正文错误清单',
      '保存成功就地反馈：severity="success" + closable，监听 close 后 v-if 移除',
      '页面顶部系统公告：severity="info" + closable',
    ],
    related: ['Toast', 'EmptyState', 'FormField', 'Button'],
    preferred: [
      'danger 仅用于需要立即被注意的失败/风险（role=alert 会打断读屏）',
      '标题写结论、正文写细节，避免大段文字堆在标题',
      'closable 的显隐归使用方，勿假设组件自动消失',
    ],
  },
  states: {
    default: '柔底信息条：--ui-{severity}-soft 底、{severity} 色语义图标（20px）、text-1 标题（15px/medium）、text-2 正文（13px）；圆角 --ui-radius-md。',
    hover: '容器无 hover 反馈；closable 时关闭按钮图标 text-3 → text-1（--ui-motion-fast 过渡）。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline，唯一可焦元素是 closable 的关闭按钮。',
    active: '容器与关闭按钮均无按压位移/缩放反馈。',
    disabled: '不适用：Alert 为静态反馈容器，无 disabled 语义（closable=false 时直接不渲染关闭按钮）。',
  },
  accessibility:
    '根为 live region：danger 用 role="alert"（隐式 aria-live=assertive，读屏立即播报），info/success/warning 用 role="status"（polite）。关闭按钮为原生 <button type="button">（Enter/Space 平台原生激活、Tab 自然进入），aria-label="关闭"，图标 svg aria-hidden="true"；点击仅 emit close，不抢焦点、不自行隐藏。标题与正文为根内普通文本，读屏随 live region 语义播报。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；无 onMounted 副作用。severity 柔底类名、role、标题/正文、closable 关闭按钮与 aria-label、内建图标 svg 均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生根 class、role 与图标 path。动效只有关闭按钮 color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：柔底 --ui-{severity}-soft、图标色 --ui-{severity}、文字 --ui-text-1/--ui-text-2、圆角 --ui-radius-md、间距 --ui-space-*、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；根类 ui-alert + ui-alert--{severity} 可供使用方定向覆盖。',
  examples: [
    "<Alert severity='success' title='已保存'>变更已同步到全部设备。</Alert>",
    "<Alert severity='danger' title='保存失败'>网络中断，请重试；若持续失败请检查代理设置。</Alert>",
    "<Alert severity='warning' title='额度即将用尽' closable @close='dismiss'>本月 API 额度已使用 90%。</Alert>",
    "<Alert severity='info'>\n  正文说明，不带标题。\n  <template #icon><svg viewBox='0 0 24 24'><!-- … --></svg></template>\n</Alert>",
  ],
  agent: {
    keywords: ['alert', '警示条', '警告', '提示条', '横幅', 'banner', 'severity', 'info', 'success', 'warning', 'danger', 'closable', '关闭', 'role=alert', 'role=status', '页内通知', '反馈'],
    selectionHints: [
      '页内驻留反馈 → Alert；自动消失的浮层通知 → Toast；模态确认 → Dialog',
      '失败/风险且需立即被读屏注意 → severity="danger"（role=alert）；普通提示保持默认 info（role=status）',
      '要有关闭入口 → closable 并监听 @close 自行移除',
    ],
    commonTasks: [
      '表单/操作结果的就地成败反馈',
      '页面顶部系统公告（可关闭）',
      '区块级风险提示（warning）',
    ],
    generationNotes: [
      'close 事件不改变组件渲染：显隐（v-if/动画）由使用方控制',
      'role 由 severity 推导：danger→alert，其余→status，勿手工覆盖',
      '标题与正文都可选；两者并存时间距为 --ui-space-1',
      '自定义图标走 #icon 内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor）',
    ],
  },
}
