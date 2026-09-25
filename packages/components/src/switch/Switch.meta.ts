/**
 * Switch 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Switch.types.ts 保持一致；states 与 Switch.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-switch',
  version: '0.1.0',
  identity: {
    name: 'Switch',
    package: '@ui/components',
    export: 'Switch',
    category: 'inputs',
    description: '纸面开关：button[role=switch] + aria-checked 的即时生效控件，loading（aria-busy + 拦截切换、保持可聚焦）、disabled、sm/md 两档尺寸，选中转 accent 底 on-accent 圆点。',
  },
  intent: {
    what: '表达「开/关」双态且切换即时生效的控件：受控 v-model(boolean)、loading 异步护栏、禁用与可读名称；一次点击立即改变状态。',
    when: [
      '设置项的即时生效开关（通知、免打扰、自动保存等，无需提交按钮）',
      '切换后立即触发副作用的场景（配 loading 表达进行中的异步）',
      '两态且结果立即可见的功能启用/停用',
    ],
    whenNot: [
      '勾选语义（多选、批量选择、随表单提交）用 Checkbox：即时生效用 Switch，勾选用 Checkbox——Switch 表达状态开关，Checkbox 表达选中集合',
      '多选一用 Radio / RadioGroup：Switch 只有两态',
      '需要点「保存」才生效的偏好设置用 Checkbox/表单 + Button，不要用 Switch',
      '触发一次动作（如「立即同步」）用 Button：Switch 表达持续状态，不是动作按钮',
    ],
    userTask: '用户需要立刻开启或关闭某个功能，并看到当前处于哪一态',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: 'v-model 绑定值；受控，点击/键盘激活后以 !modelValue 发出 update:modelValue。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：置 aria-busy="true"、圆点让位旋转指示，点击与键盘激活一律不切换；保持可聚焦（不落原生 disabled）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：原生 disabled 属性（移出 Tab 序），一切切换路径无效。' },
      { name: 'label', type: 'string', description: '可读名称；与默认插槽等价，插槽优先（根为 label 元素，点击文本即切换）。' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '尺寸档位：sm（32×20）/ md（40×24），轨道与圆点尺寸全部由 --ui-space-* token 推导。' },
    ],
    slots: [
      { name: 'default', description: '可读名称内容（优先于 label prop）；也可承载带辅助说明的富文本。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：仅非 disabled 且非 loading 时发出，载荷为切换后的布尔值。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦开关按钮（仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Checkbox（勾选语义：即时生效用 Switch，勾选用 Checkbox）', 'RadioGroup（多选一）', 'Button（动作触发）'],
  },
  composition: {
    patterns: [
      '设置列表行内：label 文案 + Switch，改动即保存（配 loading 反馈异步）',
      '与 FormField 组合：字段级开关 + 描述/校验文案（attrs 透传 aria-describedby 到 button）',
      '工具栏快速启停某能力（size="sm" 紧凑档）',
    ],
    related: ['Checkbox', 'RadioGroup', 'Button', 'FormField'],
    preferred: [
      '必须提供可读名称（label prop / 默认插槽 / attrs aria-label 至少其一）',
      '异步切换：点击 → 置 loading → 完成后回写 modelValue，不要在 loading 中连续派发',
      '即时生效才用 Switch；随表单一起提交的布尔项用 Checkbox',
    ],
  },
  states: {
    default: '未选：中性灰轨道（--ui-border-strong 底）+ surface 圆点；选中：accent 实底轨道 + on-accent 圆点（右移一档行程）。',
    hover: '未选轨道加深一档中性灰（--ui-text-3 灰阶 token）；选中轨道转 --ui-accent-hover；disabled/loading 不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），落在原生 button 上；组件不改写 outline 与 tabindex。',
    active: '无按压位移/缩放反馈；切换即时生效——圆点以 translateX 平移一档行程（--ui-motion-default + --ui-ease-out）。',
    disabled: '轨道灰化（--ui-surface-muted）、圆点去投影、label 转 --ui-text-3 + not-allowed 光标；原生 disabled 移出 Tab 序，一切切换路径无效。',
    loading: '圆点内腔让位旋转指示（aria-hidden svg，时长由 --ui-motion-* token 推导）；aria-busy="true" 且不落 disabled（保持可聚焦），点击/键盘激活一律不切换，label 提示进行中。',
  },
  accessibility:
    '原生 <button type="button"> 承载 role="switch"（恒定）与 aria-checked="true"/"false"（常驻，不缺省）；键盘 100% 原生：Tab 进入、Enter/Space 激活（浏览器原生 click 路径，组件不绑定 keydown、不改写 tabindex）。loading 置 aria-busy="true" 且不落 disabled（读屏可聚焦感知）；disabled 用原生 disabled 而非 aria-disabled。旋转指示 svg aria-hidden；根为 label 元素，点击文本即切换；无 label 时必须经 attrs 提供 aria-label（attrs 直达 button）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅客户端暴露方法内。role="switch"、aria-checked、aria-busy（loading 时）、disabled、尺寸类与 label 均随 SSR 输出；loading 指示为纯 CSS 动画，SSR 只输出静态 svg。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生根类与 aria。动效只有轨道背景色、圆点 transform/背景色过渡与旋转指示（时长均由 --ui-motion-* token 推导），prefers-reduced-motion 下 token 归零：过渡即时完成、旋转自动停止。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：轨道未选底 --ui-border-strong、hover 加深 --ui-text-3（中性灰阶）、选中底 --ui-accent/--ui-accent-hover、圆点 --ui-surface/--ui-on-accent、禁用底 --ui-surface-muted、投影 --ui-shadow-rest、间距 --ui-space-*、字号 --ui-text-md、动效 --ui-motion-default/--ui-ease-out。结构性例外：border: none 为结构性重置（非色相取值）；圆形半径取 calc(var(--ui-space-*) / 2)（无圆形半径 token，已提出需求）；轨道/圆点尺寸由 --ui-space-* token 经 calc 推导（sm 32×20、md 40×24、行程 12/16px）。',
  examples: [
    "<Switch v-model='enabled' label='消息通知' />",
    "<Switch :model-value='syncing' :loading='saving' label='自动同步' @update:model-value='save' />",
    "<Switch v-model='dark' size='sm' />",
    "<Switch :model-value='false' disabled label='仅企业版可用' />",
    "<Switch v-model='muted' aria-label='静音' />",
  ],
  agent: {
    keywords: ['switch', '开关', '切换', 'toggle', '启用', '停用', '开启', '关闭', 'loading', '加载中', 'disabled', '禁用', 'aria-checked', 'role=switch', '设置项', '即时生效', 'label'],
    selectionHints: [
      '即时生效的开/关 → Switch；勾选/多选/随表单提交 → Checkbox（即时生效用 Switch，勾选用 Checkbox）',
      '多选一 → RadioGroup；触发一次动作 → Button',
      '切换有异步请求时配 loading（aria-busy + 拦截切换，保持可聚焦）',
    ],
    commonTasks: [
      '设置页功能开关（即时保存 + loading 反馈）',
      '列表/卡片上的紧凑启停控制（size="sm"）',
      '带权限差异的禁用开关（disabled + 说明）',
    ],
    generationNotes: [
      'v-model 为 boolean；组件是纯受控：点击只发 update:modelValue，状态由使用方回写',
      'loading 期间点击/键盘激活均不切换；完成后由使用方把 loading 置回 false',
      'label prop 与默认插槽等价（插槽优先）；都没有时用 attrs 提供 aria-label',
      'id / aria-describedby / aria-label 等原生属性经 attrs 直达内部 button',
    ],
  },
}
