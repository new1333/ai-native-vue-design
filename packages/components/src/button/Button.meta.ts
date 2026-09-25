/**
 * Button 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Button.types.ts 保持一致；states 与 Button.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-button',
  version: '0.1.0',
  identity: {
    name: 'Button',
    package: '@ui/components',
    export: 'Button',
    category: 'general',
    description: '纸面按钮：承载一次即时动作的原生 button，四档视觉（primary/secondary/ghost/danger）、三档尺寸，含 loading/disabled 语义。',
  },
  intent: {
    what: '触发一次即时动作（提交、保存、取消、删除等）的按钮，视觉与交互语义齐全且无样式根可单独取用。',
    when: [
      '表单提交 / 保存 / 取消等即时动作',
      '对话框、卡片、工具栏中的确认与操作入口',
      '需要 loading 挡截重复点击的异步动作',
      '危险操作（删除、注销）用 variant="danger"',
    ],
    whenNot: [
      '仅图标、无文本的动作用 IconButton：Button 的默认插槽应始终有可读文本 label，不要清空文本只留 icon 插槽',
      '站内导航或外链用 <a>/<RouterLink>：Button 不渲染 href，没有导航语义，链接应保持中键新开、右键菜单等原生行为',
      '开/关或选中状态的持续表达用 Switch/Checkbox/Radio：Button 表达即时动作，不承载选中态',
      '只读信息展示或富内容排版用 Typography/Card 类组件，不要用按钮包裹',
    ],
    userTask: '用户需要触发一个动作并得到即时反馈',
  },
  api: {
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: 'secondary', description: '视觉档位：primary 实底强调、secondary 描边常规、ghost 无底安静、danger 危险操作（柔底，hover 转实底）。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: '尺寸档位；ButtonGroup 内未显式声明时跟随组 size。' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: 'button', description: '原生 button type；表单提交需显式传 "submit"。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：显示旋转指示、置 aria-busy="true"，点击与 Enter/Space 激活一律不触发 click，但保持可聚焦。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序）+ 拦截一切激活路径。' },
      { name: 'block', type: 'boolean', default: 'false', description: '块级铺满容器宽度。' },
    ],
    slots: [
      { name: 'default', description: '按钮文本/内容；应始终提供可读 label（图标化操作改用 IconButton）。' },
      { name: 'icon', description: '左侧图标；传内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），尺寸由组件按 size 统一约束为 16/20/24。loading 时让位于加载指示。' },
      { name: 'iconRight', description: '右侧图标，约束同 icon。' },
    ],
    events: [
      { name: 'click', payload: 'MouseEvent', description: '点击激活；仅在非 disabled/loading 时触发，键盘 Enter/Space 激活走同一路径。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦根按钮元素（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['IconButton（仅图标动作）', '<a>/<RouterLink>（导航与链接语义）'],
  },
  composition: {
    patterns: ['ButtonGroup 连排（组内共享 size、首尾圆角）', 'Dialog/Footer 动作区（确认 + 取消）', '表单提交 + loading 挡截重复提交'],
    related: ['IconButton', 'Form', 'Dialog', 'Toast'],
    preferred: ['一屏 primary 强调动作 ≤1', '危险动作用 danger 且需二次确认'],
  },
  states: {
    default: '各 variant 静止态：primary 松绿实底/纸白文字；secondary 白底描边 ink 文字；ghost 透明底 text-2；danger clay 柔底 clay 文字。',
    hover: 'primary 转 --ui-accent-hover；secondary 转 sand 底 + 深描边；ghost 转 sand 底 + text-1；danger 转实底 danger + 纸白文字。disabled 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不改 tabindex。',
    active: '在 hover 基础上 transform: scale(0.98)（≤2% 缩放，180ms 内 token 动效）；disabled 无按压反馈。',
    disabled: '统一灰化：sand 底 + line 描边 + text-3 文字 + not-allowed 光标，原生 disabled 属性使其移出 Tab 序。',
    loading: '左图标让位于旋转指示（16/20/24 随 size），aria-busy="true"，点击与 Enter/Space 均不触发 click，元素保持可聚焦。',
  },
  accessibility:
    '原生 <button>（隐式 role=button），Tab 自然进入/移出，Enter/Space 激活；keydown 阶段统一 preventDefault 后由元素 .click() 触发，保证各环境单次激活且 Space 不滚动页面。loading 时 aria-busy="true" 且不置 disabled（保持焦点与读屏可达）；disabled 用原生 disabled 而非 aria-disabled。加载指示 svg aria-hidden="true"。图标化使用必须有可读文本或改用 IconButton。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；.click()/focus() 仅出现在客户端事件回调与暴露方法内；aria-busy、disabled、type 均随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生 class 与 aria。加载动画为纯 CSS transform 旋转，prefers-reduced-motion 下随 --ui-motion-* 归零立即停止。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：颜色走 semantic/component 层、间距 --ui-space-*、圆角 --ui-button-radius、字号 --ui-text-*、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；深层定制走 ButtonRoot（无样式交互根）+ 自行叠加 class。',
  examples: [
    "<Button variant='primary' @click='save'>保存</Button>",
    "<Button :loading='saving' :disabled='!dirty' @click='submit'>提交</Button>",
    "<Button variant='danger' type='button' @click='remove'>删除</Button>\n<Button type='button' @click='cancel'>取消</Button>",
    "<ButtonGroup size='sm'>\n  <Button>复制</Button>\n  <Button>编辑</Button>\n  <Button variant='danger'>删除</Button>\n</ButtonGroup>",
    "<Button size='lg'>\n  <template #icon><svg viewBox='0 0 24 24'><!-- … --></svg></template>\n  开始分析\n  <template #iconRight><svg viewBox='0 0 24 24'><!-- … --></svg></template>\n</Button>",
  ],
  agent: {
    keywords: ['button', '按钮', 'click', '点击', 'loading', '加载中', 'disabled', '禁用', 'danger', '危险操作', '按钮组', 'button group', 'submit', '提交'],
    selectionHints: [
      '动作触发 → Button；仅图标 → IconButton；导航/链接 → a/RouterLink',
      '异步动作配 :loading 防重复触发；破坏性动作用 variant="danger"',
      '多个并列操作 → ButtonGroup 包裹并统 size',
    ],
    commonTasks: [
      '表单提交按钮 + loading',
      '对话框确认/取消对',
      '工具栏动作组',
    ],
    generationNotes: [
      'type 默认 "button"，表单内提交须显式 type="submit"',
      '默认插槽始终写可读文本；图标走 #icon/#iconRight 内联 SVG',
      '不要用 disabled 表达 loading（loading 保持可聚焦）',
      '视觉定制优先换 variant/size；极端定制用 ButtonRoot + useButton',
    ],
  },
}
