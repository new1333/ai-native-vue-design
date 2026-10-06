/**
 * Popconfirm 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Popconfirm.types.ts 保持一致；states 与 Popconfirm.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-popconfirm',
  version: '0.2.0',
  identity: {
    name: 'Popconfirm',
    package: '@ui/components',
    export: 'Popconfirm',
    category: 'overlay',
    description:
      '纸面气泡确认框：轻量二次确认，锚定于触发元素（trigger 插槽、无包装 DOM）。点击触发元素弹出确认气泡（title/description + 取消/确认两个原生按钮），点击确认/取消先发出对应事件再关闭并焦点回归触发元素；Esc、再次点击触发元素、点击气泡之外区域同样关闭。确认按钮支持 loading（旋转指示 + 拦截重复点击）。danger=true 时确认按钮走 destructive token 标记危险动作。',
  },
  intent: {
    what: '在触发元素旁弹出一个轻量的二次确认气泡：一句话标题（可选描述）加「取消/确认」两个动作按钮，确认后由应用执行相应逻辑。',
    when: [
      '执行不可逆或有副作用的操作前二次确认（删除、撤销、移除成员）',
      '表单提交等需要用户再次确认意图的就地确认',
      '比 Dialog 更轻的确认：不打断页面其余交互、不圈定焦点',
    ],
    whenNot: [
      '需要承载表单/链接等开放内容 → Popover：Popconfirm 气泡内只有 title/description 与确认/取消两个动作',
      '非确认类的悬停说明 → Tooltip：纯提示、无动作按钮、hover/focus 驱动',
      '必须阻断流程的模态确认 → Dialog：Popconfirm 非模态、不圈定焦点、不设 aria-modal',
      '无受控显隐（不提供 modelValue/v-model）：显隐由组件内部管理，应用经 confirm/cancel 事件获知结果；需要完全接管显隐请用 Popover',
      '不做视口碰撞翻转：placement 固定四方向，需要翻转/跟随请在上层方案解决',
    ],
    userTask: '用户点击一个动作后，就地确认「真的要执行吗」，确认或取消后立即回到原上下文',
  },
  api: {
    props: [
      { name: 'title', type: 'string', description: '确认气泡的标题（一句话）；与 description 至少提供一个，否则点击不弹层。' },
      { name: 'description', type: 'string', description: '可选的补充说明文字（展示在标题下方，语义上经 aria-describedby 关联）。' },
      { name: 'confirmText', type: 'string', default: '确认', description: '确认按钮文案。' },
      { name: 'cancelText', type: 'string', default: '取消', description: '取消按钮文案。' },
      { name: 'danger', type: 'boolean', default: 'false', description: '危险动作：确认按钮走 destructive token（--ui-danger-soft 柔底 → hover 实底 --ui-danger），内建图标转 --ui-danger。' },
      { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: 'top', description: '气泡相对触发元素的方向；打开期间切换会按新方向重排（不做视口碰撞翻转）。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '确认进行中：确认按钮渲染旋转指示（currentColor，token 时长）并挂 aria-busy="true"，取消按钮挂 aria-disabled="true"，确认/取消点击被拦截（不发 confirm/cancel、不关闭气泡）；由使用方在异步完成后置回 false 或经外部路径关闭气泡。' },
    ],
    slots: [
      { name: 'trigger', description: '唯一触发元素（单个元素/组件 vnode 时直接作为触发元素，克隆合并 click/Esc 监听与 aria-expanded/aria-controls/id，并透传写在 <Popconfirm> 上的 attrs；文本/多根/空插槽回退内建原生 button 触发器）。' },
      { name: 'icon', description: '标题左侧的图标；未提供时渲染内建警示图标（装饰性、aria-hidden，颜色 --ui-warning / danger 时 --ui-danger）。' },
    ],
    events: [
      { name: 'confirm', description: '点击确认按钮：先发出事件，组件随后关闭气泡并把焦点还原到触发元素；loading=true 期间不发出。' },
      { name: 'cancel', description: '点击取消按钮：先发出事件，组件随后关闭气泡并把焦点还原到触发元素；loading=true 期间不发出。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: [
      'Popover（开放内容容器：表单、链接、任意交互内容、受控显隐）',
      'Tooltip（纯提示、无动作按钮、hover/focus 驱动）',
      'Dialog（模态确认：阻断交互、圈定焦点）',
    ],
    dependsOn: [],
  },
  composition: {
    patterns: [
      'Button(variant=danger) + Popconfirm(danger)：删除等危险操作的二次确认',
      '列表行操作 + Popconfirm：就地确认，不跳模态框',
      '表单提交按钮 + Popconfirm：提交前确认意图',
    ],
    related: ['Button', 'Popover', 'Tooltip', 'Dialog'],
    preferred: [
      'title 保持一句话以内，细节放 description',
      '触发元素保持原生交互语义（button/a…）且始终有可读文本',
      '危险操作同时给触发按钮（variant=danger）与气泡（danger=true）危险语义',
    ],
  },
  states: {
    default: '关闭态只渲染触发元素（根 ui-popconfirm 行内锚点），不渲染气泡；title 与 description 均为空时点击不弹层。',
    hover: '悬停确认/取消按钮变色：常规确认 --ui-accent → --ui-accent-hover；danger 确认 --ui-danger-soft 柔底 → --ui-danger 实底白字；取消 --ui-surface → --ui-surface-muted。气泡打开期间触发元素悬停态不受影响。',
    focusVisible: '打开后初始焦点落在「取消」按钮（破坏性最小动作，Tab 即达「确认」）；焦点环由全局 :focus-visible 约定提供；Esc 关闭并把焦点还原到触发元素。',
    active: '确认/取消按钮按压态与 hover 同色（Button 同款策略）；气泡无缩放/位移按压效果。',
    disabled: '组件级无 disabled：触发元素自身 disabled（如原生 button）时不响应点击与焦点，气泡自然不会弹出。',
    loading: 'loading=true：确认按钮前置渲染旋转指示（currentColor 随确认/危险档文字色，token 推导时长）并挂 aria-busy="true"，取消按钮挂 aria-disabled="true"；确认/取消点击均被拦截（不发事件、不关闭），气泡保持打开等待异步结果。',
  },
  accessibility:
    '气泡 role="dialog"（非模态，无 aria-modal），aria-labelledby 指向标题元素 id（无 title 时指向触发元素 id），有 description 时 aria-describedby 指向描述元素 id；触发元素恒挂 aria-expanded、打开时挂 aria-controls 指向气泡 id。气泡 Teleport 至 body 尾部、Tab 序不自然经过，故打开时把初始焦点移入气泡（落在「取消」这一破坏性最小动作），关闭（确认/取消/Esc，或外部点击时焦点在气泡内）把焦点还原到触发元素。确认/取消为原生 button（Enter/Space 原生语义），Esc 在触发元素与气泡内均可关闭；loading=true 时确认按钮挂 aria-busy="true"（Button 家族 loading 语义）、取消按钮挂 aria-disabled="true"，二者点击均被拦截（不用原生 disabled，避免打断焦点保持）。内建警示图标与旋转指示均 aria-hidden 装饰化。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；renderToString 输出根锚点与触发元素（含 aria-expanded="false"），不渲染气泡、不输出 aria-controls 与确认/取消按钮；Teleport、rect 测量与 document/window 监听（mousedown 外部关闭、scroll/resize 跟随）全部推迟到客户端 onMounted，卸载时移除。',
  performance:
    '无显示延迟与计时器：点击即开、路径即时；打开期间 scroll（capture）/resize 跟随重排，关闭后监听仍在但回调以 isOpen 短路；定位为单段测量（触发元素 rect + 结构性 translate），无需测量气泡自身尺寸；入场动效为 token 时长的 opacity 动画，prefers-reduced-motion 下随 --ui-motion-fast 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：气泡 surface 底 + 1px 结构性细线描边（--ui-border，无 --ui-border-width token，已在任务结果中提出需求）+ md 圆角 + pop 阴影，z-index 走 --ui-z-popover（body 级非模态弹层档，高于 drawer/modal、低于 toast），间距/字号/字重/动效全 token；常规确认按钮 primary 观感（--ui-accent/--ui-on-accent），danger 确认走 destructive token（--ui-danger-soft → --ui-danger），取消为 secondary 观感（--ui-surface/--ui-border/--ui-text-1）；内建图标色 --ui-warning（danger 时 --ui-danger），loading 旋转指示 currentColor + token 推导时长。组件包不引入全局 CSS。',
  examples: [
    "<Popconfirm title='删除这条评论？' description='删除后不可恢复。' danger @confirm='remove(item)'>\n  <template #trigger>\n    <Button variant='danger'>删除</Button>\n  </template>\n</Popconfirm>",
    "<Popconfirm title='确定发布吗？' confirm-text='发布' cancel-text='再想想' @confirm='publish'>\n  <template #trigger>\n    <Button variant='primary'>发布</Button>\n  </template>\n</Popconfirm>",
    "<Popconfirm placement='bottom' title='提交这份表单？'>\n  <template #trigger>\n    <button type='button'>提交</button>\n  </template>\n</Popconfirm>",
  ],
  agent: {
    keywords: ['popconfirm', '气泡确认', '确认框', '二次确认', 'confirm', 'cancel', '危险操作', '删除确认', 'overlay', '浮层', 'destructive'],
    selectionHints: [
      '轻量就地二次确认 → Popconfirm；需要开放内容/受控显隐 → Popover；必须阻断流程 → Dialog',
      '危险操作给 danger=true：确认按钮走 destructive token、内建图标转 --ui-danger',
      '气泡内只会渲染 title/description 与确认/取消两个按钮，不要试图塞入表单或链接',
    ],
    commonTasks: ['删除/撤销前的就地确认', '提交前确认意图', '列表行危险操作的二次确认'],
    generationNotes: [
      'trigger 插槽必须是单个可交互元素（原生 button/Button 等）；组件克隆合并监听与 aria 状态，不产生包装 DOM；文本/多根插槽回退内建触发器',
      'confirm/cancel 只在点击对应按钮且非 loading 时发出；Esc、外部点击、再次点击触发元素只关闭不发事件',
      '关闭路径：确认、取消、Esc、再次点击触发元素、点击气泡之外区域（焦点在气泡内时焦点回归触发元素）',
      'title 与 description 都未提供时不弹层（hasContent 守卫）',
      '无受控模式（无 modelValue）：显隐内部管理；打开后初始焦点在「取消」按钮',
      '异步确认：confirm 发出后异步未完成时置 loading=true（确认/取消点击被拦截、确认按钮前置旋转指示），完成后置回 false 收尾；loading 只影响气泡内动作按钮，Esc/外部点击关闭路径不受拦截',
    ],
  },
}
