/**
 * ToastHost（+ toast 单例）的组件契约元数据（ComponentDefinition）。
 * api 字段与 ToastHost.types.ts 保持一致；states 与 ToastItem.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-toast',
  version: '0.1.0',
  identity: {
    name: 'ToastHost',
    package: '@ui/components',
    export: 'ToastHost',
    category: 'feedback',
    description:
      '纸面全局通知：toast 单例（默认导出）程序式推入 success/error/info/warning 提示，ToastHost 挂载一次即 Teleport 到 body 右上角堆叠渲染；自动关闭计时 hover 暂停，z-index 走 --ui-z-toast。',
  },
  intent: {
    what: '无需用户处理、稍纵即逝的操作反馈：程序式调用推入全局堆栈，Host 集中渲染，超时自动消失（hover 暂停）。',
    when: [
      '保存/提交等异步操作成功或失败的即时确认',
      '后台任务完成、内容已复制等被动通知',
      '需要比 Alert 更轻、不打断当前任务的页面级反馈',
    ],
    whenNot: [
      '需要用户确认/取消才能继续的阻断性反馈用 Dialog：Toast 不收集输入且会自动消失',
      '页面正文内常驻的状态/上下文信息用 Alert：Toast 是全局浮层、有时效',
      '表单字段校验错误就地提示用 FormField：Toast 不定位到具体字段',
      '需要富内容（标题+正文+动作链接）的持久通知面板用 Drawer/Notification 类容器',
    ],
    userTask: '用户完成操作后获得轻量、自动消失的全局反馈',
  },
  api: {
    props: [], // ToastHost 无 props：位置（右上角）、层级（--ui-z-toast）与容器文案均为固定契约
    slots: [], // 无插槽：提示内容由 toast 单例的 message 文本承载
    events: [], // 无组件事件：关闭回调走 toast 单例的 options.onClose
    exposes: [
      // 以下为模块级 toast 单例的方法（经目录 index.ts 以 `toast` 命名导出 + 模块默认导出，非组件实例 expose）
      { name: 'toast.success', type: '(message: string, options?: ToastOptions) => ToastId', description: '推入成功提示（role=status），返回 id。' },
      { name: 'toast.error', type: '(message: string, options?: ToastOptions) => ToastId', description: '推入错误提示（role=alert，读屏立即播报），返回 id。' },
      { name: 'toast.info', type: '(message: string, options?: ToastOptions) => ToastId', description: '推入中性信息提示（role=status），返回 id。' },
      { name: 'toast.warning', type: '(message: string, options?: ToastOptions) => ToastId', description: '推入警告提示（role=status），返回 id。' },
      { name: 'toast.remove', type: '(id: ToastId) => boolean', description: '按 id 移除一条提示；命中返回 true 并触发其 onClose（恰好一次），未命中返回 false。' },
    ],
  },
  constraints: {
    requires: ['应用根挂载一次 <ToastHost />（否则提示不渲染、也不会自动关闭；计时器位于渲染单元内）'],
  },
  composition: {
    patterns: ['app 根挂载 Host + 任意事件处调用 toast.success/error/info/warning', '提交按钮 loading 完成后 toast.success / 失败 toast.error', '连续推入多条形成堆叠，按推入顺序自上而下排列'],
    related: ['Button', 'Dialog', 'Form'],
    preferred: ['同一事件只推一条 Toast；错误语义用 toast.error', 'onClose 只做无副作用清理，不承载业务分支'],
  },
  states: {
    default: 'surface 白底卡片、md 圆角、pop 阴影、变体 soft 底图标块；入场为 token 时长的 opacity/translateY 动画。',
    hover: '条目悬停暂停自动关闭计时（鼠标移出按剩余时长续表）；关闭按钮转 surface-muted 底 + text-1。',
    focusVisible: '关闭按钮为原生 button，焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移）；组件不改写 outline。',
    active: '关闭按钮按压沿用原生行为，无额外按压动效。',
    disabled: '不适用：Toast 无禁用态（被动通知，不承接输入）。',
  },
  accessibility:
    '容器 role="region" aria-label="通知"；每条提示 role="status"（隐式 aria-live=polite），error 变体 role="alert"（隐式 assertive，立即播报）。关闭按钮为原生 <button type="button"> 且带 aria-label（图标 svg aria-hidden）。键盘路径：关闭按钮自然进入 Tab 序，Enter/Space 按原生激活触发移除；不抢焦点（推入提示不改变文档焦点）。悬停暂停计时兼容读屏浏览（鼠标路径），纯键盘用户由计时兜底。',
  ssr:
    'SSR-safe：toast 单例与 Host 的模块/ setup 顶层不访问任何浏览器 API（node 环境可直接调用单例）；挂载前 Host 仅输出 hidden 的 ui-toast 占位，renderToString 无浮层/region/条目输出且稳定可水合；Teleport 与计时器全部推迟到客户端 onMounted 之后。',
  performance:
    '每条提示一个 setTimeout（默认 4000ms），hover 暂停只重算剩余时长不重建状态；入场动效仅 opacity/transform 且时长走 --ui-motion-*（prefers-reduced-motion 下 token 归零即静止）；无监听器、无测量。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：层级 --ui-z-toast、阴影 --ui-shadow-pop、圆角 --ui-radius-md/-sm、四变体色 --ui-{success|danger|info|warning}(-soft)、间距/字号全 token 化；条目宽度由 --ui-space-* 标尺推导（≈352px，无 toast 宽度 token，已提出需求）；描边宽度 1px 为结构性细线（无 --ui-border-width token，沿 Button 先例）。组件包不引入全局 CSS。',
  examples: [
    "// app 入口（挂载一次）\nimport { ToastHost } from '@ui/components'\ncreateApp(App).mount('#app')\n// App.vue 根模板：<ToastHost />",
    "import toast from '@ui/components/toast'\ntoast.success('已保存', { duration: 3000, onClose: () => console.log('closed') })",
    "const id = toast.error('保存失败，请重试')\n// …需要时手动移除\ntoast.remove(id)",
    "toast.info('已复制到剪贴板')\ntoast.warning('草稿将在 30 天后过期')",
  ],
  agent: {
    keywords: ['toast', '通知', '提示', 'notification', 'snackbar', '全局提示', '自动关闭', 'auto dismiss', 'hover 暂停', 'pause on hover', 'feedback', '轻提示', '程序式', 'imperative'],
    selectionHints: [
      '被动、会自动消失的反馈 → Toast；需要用户处理 → Dialog；页面内常驻 → Alert',
      '错误必须用 toast.error（role=alert 立即播报），不要用 info 冒充',
      '只在 app 根挂载一次 <ToastHost />，其余地方只调用 toast.*',
    ],
    commonTasks: ['保存成功/失败反馈', '异步任务完成通知', '复制/导出等轻操作确认', '批量操作结果汇总提示'],
    generationNotes: [
      '先确保 <ToastHost /> 已挂载，再调用 toast.*（未挂载时提示不渲染也不自动关闭）',
      'duration 传 0 表示不自动关闭，必须经关闭按钮或 toast.remove(id) 移除',
      'onClose 在超时/手动关闭/toast.remove 三种路径下都恰好触发一次',
      '不要在 SSR 阶段依赖 Toast 渲染（浮层只在客户端出现）',
    ],
  },
}
