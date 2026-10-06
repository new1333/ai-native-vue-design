/**
 * Rating 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Rating.types.ts 保持一致；states 与 Rating.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-rating',
  version: '0.1.0',
  identity: {
    name: 'Rating',
    package: '@ui/components',
    export: 'Rating',
    category: 'inputs',
    description:
      '纸面星级评分：radiogroup 语义的单值选择控件，每档一枚 role="radio" 的原生 button（aria-checked 表达选中），支持半星步进、悬停预览、可清除与只读展示。',
  },
  intent: {
    what: '星级单值评分：count 颗星、v-model 数值（1..count，allowHalf 时以 0.5 为粒度），悬停预览 + 点击/键盘步进选中，readonly 作纯展示。',
    when: [
      '让用户对单一维度给出 1..N 星评分（商品、服务、难度等）',
      '需要半星粒度（allowHalf，点击与键盘步进均为 0.5）',
      '只读展示既有评分（readonly，如详情页/列表页评分摘要）',
      '想替换星形符号（icon 插槽：心形、灯泡等，作用域携带填充态）',
    ],
    whenNot: [
      '连续数值或区间输入：Rating 只有离散星档，请用 Input 等表单控件承载具体数值',
      '多维度分别打分：每组 Rating + FormField 各承载一维，单个 Rating 不表达多维',
      '纯装饰性星星图形（无评分语义）：直接内联 SVG 即可，不必引入 radiogroup 交互语义',
      '二值开关或单选组：用 Switch / Radio+RadioGroup',
    ],
    userTask: '用户需要给出或查看星级评分：点星或方向键选定档位，只读态仅作展示',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'number', default: 'undefined', description: 'v-model 当前评分（受控）；undefined 表示未评分。' },
      { name: 'count', type: 'number', default: '5', description: '星星总数（正整数）；非正数不渲染任何星。' },
      { name: 'allowHalf', type: 'boolean', default: 'false', description: '支持半星：点击与 ←→ 步进以 0.5 为粒度，每颗星拆为左右两个半档 radio。' },
      { name: 'readonly', type: 'boolean', default: 'false', description: '只读：仅展示评分，禁一切交互（指针/键盘/悬停），aria-readonly="true" 且档位移出 Tab 序。' },
      { name: 'clearable', type: 'boolean', default: 'false', description: '可清除：再次点击当前评分档位、或档位聚焦后按 Delete/Backspace 清除为 undefined（生效值归 0 = 全空星；Backspace 已 preventDefault，不触发浏览器后退）。' },
    ],
    slots: [
      {
        name: 'icon',
        scope: 'RatingIconScope { index: number; value: number; state: RatingIconState }',
        description: '自定义星形图标（整体替换默认 SVG）；作用域携带星序号 index（1 起）、该星满值 value（= index）与填充态 state（full / half / empty）。half 的呈现方式由插槽内容自行决定（默认实现为左半裁切）。',
      },
    ],
    events: [
      { name: 'update:modelValue', payload: 'number | undefined', description: '选中/键盘步进后的评分值；clearable 清除时为 undefined。' },
      { name: 'hoverChange', payload: 'number | undefined', description: '悬停预览变化：进入某档为其值，离开组件为 undefined；只读态不触发。' },
    ],
    exposes: [
      { name: 'focus', type: '(options?: FocusOptions) => void', description: '聚焦当前 roving tabindex 落点（已选档或首档；只读态为空操作）。' },
      { name: 'blur', type: '() => void', description: '移除焦点（仅客户端有意义）。' },
    ],
  },
  constraints: {
    requires: ['可读名称：使用方经 attrs 提供 aria-label（如 aria-label="满意度"，落在 role="radiogroup" 根容器）'],
    conflicts: [],
  },
  composition: {
    patterns: [
      '表单中的单维度星级评分（可配 FormField 提供 label 与校验反馈）',
      'readonly 展示聚合评分（列表页/详情页 4.5 星摘要）',
      'icon 插槽自定义评分符号（心形、灯泡等）',
      'clearable 允许撤销评分（再次点击当前档位清为未评分）',
    ],
    related: ['FormField', 'Radio', 'RadioGroup', 'Switch', 'Input'],
    preferred: [
      '必须受控使用：v-model 或 :model-value + @update:model-value（无 v-model 时点击不改变视觉）',
      '必须经 attrs 提供 aria-label（radiogroup 无可读名称时读屏无法达意）',
      'count 建议不超过 10：档位过多时键盘步进路径变长',
    ],
  },
  states: {
    default: '空星为 --ui-text-3 描边星形；已选档位以 --ui-warning 填充（半星以 clip-path 裁切出左半填充）。',
    hover: '悬停档位即时预览填充（预览值 = 悬停档），并发出 hoverChange；离开组件复位为 undefined；只读态不响应悬停。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），绘制在当前档位 button 上（半星档即半星宽的焦点框）；组件不改写 outline 与 tabindex 规则。',
    active: '无按压位移反馈；选中/步进后填充随受控值以 opacity 过渡切换（--ui-motion-fast）。',
    disabled: '无独立 disabled prop；只读（readonly）承担不可交互态：光标 default、悬停/点击/键盘路径全部守卫、全档 tabindex=-1 并置 aria-readonly="true"，视觉保持原色（展示语义优先于灰化）。',
    error: '无内建 error 态：校验反馈由外层 FormField 承担。',
  },
  accessibility:
    '根 role="radiogroup"（attrs 的 aria-label 等落根容器）；每档一枚原生 <button type="button"> 承载 role="radio"、aria-checked（true/false 常驻）与 aria-label（档位值 + 星）。Roving tabindex：已选档（未选或越界时首档）tabindex=0、其余 -1。←→↑↓ 步进到相邻档并选中（焦点随动、preventDefault，边界为空操作）；Enter/Space 走原生 button 激活路径，组件不拦截；clearable 时 Delete/Backspace 清空为未评分态（preventDefault 阻断浏览器后退，已未评分则空操作）。readonly：aria-readonly="true" + 全档 tabindex=-1 + 交互守卫。图标层 aria-hidden，评分值由 radio 语义承载。',
  ssr:
    'renderToString 无异常：不访问任何浏览器 API（档位元素登记 Map 仅在客户端 ref 回调填充）；radiogroup/radio/aria-checked/aria-label/tabindex/aria-readonly 与星形 SVG 随受控值完整输出；悬停预览不参与 SSR。focus()/blur() 仅客户端暴露方法。',
  performance:
    '无测量、无定时器、无全局监听；仅模板事件（click/keydown/mouseenter/mouseleave）与 computed 派生（档位、填充态、roving 落点）。动效只有填充层 opacity 过渡（--ui-motion-fast token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：填充 --ui-warning、空星 --ui-text-3、星形尺寸 --ui-space-5、星间距 --ui-space-1、动效 --ui-motion-fast/--ui-ease-out。结构性例外：图标与档位覆盖层的 100%/inset 定位为结构性取值；半星 clip-path inset(0 50% 0 0) 的 50% 为半星语义的结构性裁切（非视觉参数）。',
  examples: [
    "<Rating v-model='score' aria-label='满意度' />",
    "<Rating v-model='score' allow-half clearable aria-label='口味' />",
    "<Rating :model-value='4.5' allow-half readonly aria-label='平台评分' />",
    "<Rating v-model='score' aria-label='收藏指数'>\n  <template #icon='{ state }'>\n    <svg viewBox='0 0 24 24' :fill=\"state === 'empty' ? 'none' : 'currentColor'\" stroke='currentColor' stroke-width='1.5' />\n  </template>\n</Rating>",
  ],
  agent: {
    keywords: ['rating', 'rate', '评分', '星级', '打分', 'star', 'stars', '半星', 'allowHalf', '只读', 'readonly', 'score', '评星'],
    selectionHints: [
      '用户打分（1..N 星，可半星）→ Rating',
      '只读评分摘要 → Rating + readonly',
      '二值开关 → Switch；多选一 → Radio + RadioGroup',
    ],
    commonTasks: ['商品/服务评分表单项', '列表页只读星级摘要', '自定义评分符号', '可撤销的评分（clearable）'],
    generationNotes: [
      '受控组件：必须绑定 v-model（或 :model-value + @update:model-value），否则点击不改变视觉',
      '必须经 attrs 提供 aria-label；attrs 全部落 role="radiogroup" 根容器',
      'clearable 清除以 undefined 发出，消费方需把 undefined 视为未评分',
      'icon 插槽接管星形绘制：half 态如何呈现由插槽内容自行决定',
      '无 disabled / loading prop：不可交互态只有 readonly',
    ],
  },
}
