/**
 * Pagination 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Pagination.types.ts 保持一致；states 与 Pagination.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-pagination',
  version: '0.1.0',
  identity: {
    name: 'Pagination',
    package: '@ui/components',
    export: 'Pagination',
    category: 'data',
    description: '纸面数据分页：v-model:page 受控的页码导航，总页数少时全显、多时首尾+滑动窗口+省略号，上一页/下一页边界禁用。',
  },
  intent: {
    what: '把一组按 pageSize 切分的数据页暴露为可跳转的页码导航：v-model:page 受控、total/pageSize 推导总页数、siblingCount 控制当前页两侧窗口宽度。',
    when: [
      '表格 / 列表 / 卡片流底部的分页条',
      '数据总量已知（total）且服务端或前端按页取数',
      '需要当前页语义暴露给读屏（aria-current="page"）',
      '长列表需要折叠页码（首尾 + 窗口 + 省略号）保持宽度稳定',
    ],
    whenNot: [
      '无限滚动 / 加载更多：没有离散页概念时用 Scroll 类方案',
      '只有一页且不会增长的数据：Pagination 仍会渲染（可用 v-if 在使用方隐藏）',
      '步骤向导（有先后依赖的流程）用 Steps：Pagination 只表达平等的数据页',
      '面包屑 / 标签页等导航语义用 Breadcrumb / Tabs',
    ],
    userTask: '用户需要知道数据有多少页、当前在哪页，并跳到目标页',
  },
  api: {
    props: [
      { name: 'page', type: 'number', default: '1', description: '当前页（1 起始，v-model:page）；超出 [1, pageCount] 时展示层收敛（clamp）后渲染，组件自身不持有页状态。' },
      { name: 'total', type: 'number', default: '0', description: '数据总条数；与 pageSize 共同推导总页数（负值按 0 处理）。' },
      { name: 'pageSize', type: 'number', default: '10', description: '每页条数；≤0 按 1 处理避免除零。' },
      { name: 'siblingCount', type: 'number', default: '1', description: '当前页两侧保留的页码数；总页数 ≤ siblingCount*2+5（默认 7）时全量展开，否则首尾+窗口+省略号。' },
    ],
    slots: [],
    events: [
      { name: 'update:page', payload: 'number', description: 'v-model:page 更新：点击页码/上一页/下一页后发出，载荷为目标页码（已收敛进 [1, pageCount]；与当前页相同不发出）。' },
    ],
    exposes: [],
  },
  constraints: {
    conflicts: ['无限滚动/加载更多（无离散页概念）', 'Steps（流程步骤语义）'],
    dependsOn: ['@ui/tokens/paper.css（使用方在应用入口引入）'],
  },
  composition: {
    patterns: ['Table/DataTable 底部分页条', '工具栏筛选 + 列表分页（筛选变化后重置 page=1）', '与 EmptyState 配合：无数据时由使用方隐藏分页条'],
    related: ['Table', 'DataTable', 'EmptyState', 'Select'],
    preferred: ['受控使用 v-model:page，父层校验页码', '页码变更后滚动回列表顶部由使用方处理', '每页条数切换器（Select）与 Pagination 并排，切换后重置 page'],
  },
  states: {
    default: '非当前页/翻页按钮透明底 + text-2（页码数字 tabular-nums 等宽对齐）；当前页 accent 实底 + on-accent 文字 medium 字重；省略号为 text-3 的 aria-hidden 占位；nav 携带 aria-label="分页"。',
    hover: '非当前页/翻页按钮转 sand 底（--ui-surface-muted）+ text-1；当前页 hover 加深为 --ui-accent-hover；disabled（边界翻页钮）不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline、不设 tabindex；当前页按钮同样可聚焦。',
    active: '按压不引入缩放/位移；非当前页维持 hover 的 sand 底，当前页按压即随受控更新切换高亮；目标页与当前页相同（网关去重）不发出 update:page。',
    disabled: '上一页在第 1 页、下一页在末页为原生 disabled（text-3 + not-allowed，留在布局中但移出可交互状态）；省略号与页码按钮不使用 disabled 语义。',
  },
  accessibility:
    '根为 <nav aria-label="分页">，内为 <ul>/<li> 列表语义；上一页/下一页为原生 <button type="button"> 且仅图标，必须携带 aria-label="上一页"/"下一页"，chevron svg aria-hidden="true"；当前页按钮 aria-current="page"，其余页码按钮以自身数字为可读名，不额外写 role/tabindex；省略号为 <span aria-hidden="true"> 的非聚焦占位；键盘 Tab 逐按钮可达，Enter/Space 走平台原生激活（组件不劫持 keydown/preventDefault）；边界禁用用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：窗口计算为纯函数，setup 与模块顶层不访问任何浏览器 API；page/total/pageSize/siblingCount 推导的页码序列、aria-label、aria-current、disabled、省略号占位全部随 SSR 输出。',
  performance:
    '无监听器、无测量、无定时器；仅 computed 派生 pageCount/safePage/items/边界态（窗口算法 O(pageCount) 全显或 O(1) 窗口项）；动效仅 background-color/color 过渡（--ui-motion-fast + --ui-ease-out），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：数字 --ui-numeric（tabular-nums）、页码钮等宽 --ui-space-6（min-width，复用间距档）、圆角 --ui-radius-sm、字号 --ui-text-sm、间距 --ui-space-1/2、色 --ui-accent/--ui-on-accent/--ui-accent-hover/--ui-surface-muted/--ui-text-2/--ui-text-3、动效 --ui-motion-fast/--ui-ease-out。无全局 CSS 引入；结构性重置（border:none、background:transparent、列表盒模型清零）不承担视觉取值。',
  examples: [
    "<Pagination v-model:page='page' :total='total' :page-size='20' />",
    "<Pagination :page='page' :total='total' :page-size='size' :sibling-count='2' @update:page='page = $event' />",
    "<Pagination v-model:page='page' :total='0' v-if='total > 0' />（无数据时由使用方隐藏）",
    "<div class='toolbar'><Pagination v-model:page='page' :total='total' /></div>（表格底部：筛选变化后 page 置 1）",
  ],
  agent: {
    keywords: ['pagination', '分页', '页码', 'page', 'total', 'pageSize', '每页条数', '上一页', '下一页', 'prev', 'next', 'siblingCount', '省略号', 'ellipsis', 'aria-current', '跳页'],
    selectionHints: [
      '离散数据页导航 → Pagination；无限滚动 → 加载更多/滚动加载',
      '已知 total 才能用 Pagination；total 未知时先改用游标/滚动方案',
      '与 Select 组合实现「每页 N 条」：切换 pageSize 后把 page 重置为 1',
    ],
    commonTasks: ['表格底部分页条', '列表/卡片流分页', '大页数折叠（首尾+窗口+省略号）'],
    generationNotes: [
      'v-model:page 为受控用法；组件不持有内部页状态，点击只发 update:page',
      '总页数 ≤ siblingCount*2+5（默认 7）全显，省略号是非聚焦的 aria-hidden 占位',
      'page 越界（如 total 变小）展示层自动 clamp，但需使用方自行把 page 修正回范围内',
      '点击当前页不产生 update:page；上一页/下一页在首/尾页为原生 disabled',
    ],
  },
}
