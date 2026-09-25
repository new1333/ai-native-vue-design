/**
 * Table 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Table.types.ts 保持一致；states 与 Table.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-table',
  version: '0.1.0',
  identity: {
    name: 'Table',
    package: '@ui/components',
    export: 'Table',
    category: 'data',
    description: '纸面泛型数据表格：语义 table/thead/tbody、token 化表头与行 hover、可排序列（aria-sort + 循环 asc/desc/none）、loading 骨架行、空态与 cell-/header- 动态插槽。',
  },
  intent: {
    what: '以声明式 columns + data 渲染结构化行列数据，泛型 T 贯穿列定义与行数据，内置轻量排序与加载/空态。',
    when: [
      '后台列表页、分析结果、键值明细等中等量级结构化数据展示',
      '需要按列点击排序（升/降/复位三态循环）的只读表格',
      '异步加载需要骨架行占位的数据区',
      '部分列需要自定义渲染（状态徽标、操作按钮等 cell-<key> 插槽）',
    ],
    whenNot: [
      '万行级数据用 VirtualTable/DataGrid（windowing + DOM 复用），本组件全量渲染 DOM 行',
      '行内编辑、列宽拖拽、单元格聚焦漫游等电子表格语义用 DataGrid',
      '无列结构的长列表用 List/虚拟滚动，不要拿 Table 装排版',
    ],
    userTask: '用户需要浏览并按需排序一组结构化数据',
  },
  api: {
    props: [
      { name: 'columns', type: 'TableColumn<T>[]', required: true, description: '列定义：key（取值与插槽名）、label、width?（number 视为 px）、align?（left|right，right 自动 tabular-nums）、sortable?。' },
      { name: 'data', type: 'T[]', required: true, description: '行数据；排序只作用于内部渲染副本，不改写传入数组。' },
      { name: 'rowKey', type: 'keyof T | ((row: T, index: number) => string | number)', required: true, description: '行键（stable key）：字段名或函数；字段值非 string/number 时回落行下标。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：tbody 渲染 3 行骨架行（aria-hidden）并在 table 上置 aria-busy="true"；骨架期不渲染数据行与空态。' },
    ],
    slots: [
      { name: 'cell-<key>', scope: '{ row: T, value: unknown, column: TableColumn<T>, index: number }', description: '按列定制的单元格插槽（如 #cell-status）；缺省渲染 String(row[key])（null/undefined/对象为空串）。' },
      { name: 'header-<key>', scope: '{ column: TableColumn<T>, label: string }', description: '按列定制的表头插槽（如 #header-name）；覆盖后该列失去内置排序按钮与 aria-sort，自定义时需自行补齐排序交互。' },
      { name: 'empty', description: '空态内容；仅在非 loading 且 data 为空时出现，缺省渲染“暂无数据”。' },
    ],
    events: [
      { name: 'sort', payload: '{ key: string, order: "asc" | "desc" | "none" }', description: '排序变化：点击可排序列表头按钮（或键盘 Enter/Space 激活）时发出；组件内部已按新状态排序渲染。' },
    ],
    exposes: [
      { name: 'clearSort', type: '() => void', description: '复位排序状态到 none（不发 sort 事件）。' },
    ],
  },
  constraints: {
    dependsOn: ['@ui/tokens/paper.css（使用方应用入口一次性引入）'],
  },
  composition: {
    patterns: ['Table + Pagination 分页列表', 'Table + loading 骨架异步加载', 'cell-<key> 插槽内嵌 Badge/Button 行操作'],
    related: ['Pagination', 'EmptyState', 'Skeleton', 'VirtualTable'],
    preferred: ['数字列声明 align="right" 以获得 tabular-nums 对齐', '排序重计算交给组件，外部仅监听 sort 同步筛选条件'],
  },
  states: {
    default: '白底表格、sand（surface-muted）表头、line 边框行分隔；文字 text-sm/text-1，表头 medium/text-2。',
    hover: '数据行 hover 转 sand 底（surface-muted）；骨架行与空态行不响应 hover。',
    focusVisible: '排序按钮焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。',
    active: '排序按钮为原生 button，按压反馈交由浏览器默认；无额外 transform。',
    disabled: '无整体禁用态；不可排序列表头不渲染按钮、无 aria-sort、光标默认。',
    loading: 'tbody 渲染 3 行骨架行（sand 骨架条 + token 推导时长的呼吸动效，reduced-motion 归零即停），table 置 aria-busy="true"，骨架行 aria-hidden。',
  },
  accessibility:
    '语义 <table>/<thead>/<tbody>，th scope="col"；可排序列 th 常驻 aria-sort（ascending/descending/none），激活方向随循环切换，非排序列不写该属性；排序入口为原生 <button type="button">，Tab 自然进入，Enter/Space 在 keydown 统一 preventDefault 后由元素 .click() 单次激活（Space 不滚动页面）；排序指示 svg aria-hidden，按钮可读名即列 label；loading 时 aria-busy="true" 且骨架行 aria-hidden；空态为普通 td（colspan 全列）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；.click() 仅出现在客户端 keydown 回调内；骨架/空态/aria-sort 均随 SSR 输出。',
  performance:
    '纯 computed 派生（排序为浅拷贝排序，不改写 props.data）；无监听器、无测量、无定时器；行使用 rowKey stable key。全量渲染 DOM 行，千行级可用，万行级应改用 VirtualTable。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：表头 --ui-surface-muted、分隔线 --ui-border、行 hover --ui-surface-muted、数字列 font-variant-numeric: var(--ui-numeric)、间距 --ui-space-*、字号 --ui-text-sm、圆角 --ui-radius-sm、动效 --ui-motion-*/--ui-ease-out。列宽 width 为用户数据驱动的内联样式。无全局 CSS 引入。',
  examples: [
    "<Table\n  :columns=\"[\n    { key: 'name', label: '名称' },\n    { key: 'score', label: '得分', align: 'right', sortable: true },\n  ]\"\n  :data=\"rows\"\n  row-key=\"id\"\n/>",
    "<Table :columns=\"columns\" :data=\"rows\" row-key=\"id\" loading />",
    "<Table :columns=\"columns\" :data=\"[]\" row-key=\"id\">\n  <template #empty>还没有记录</template>\n</Table>",
    "<Table :columns=\"columns\" :data=\"rows\" row-key=\"id\" @sort=\"onSort\">\n  <template #cell-status=\"{ row }\">\n    <Badge>{{ row.status }}</Badge>\n  </template>\n  <template #header-name=\"{ label }\">{{ label }}（必填）</template>\n</Table>",
  ],
  agent: {
    keywords: ['table', '表格', '数据表', 'data table', '列', 'column', '行', 'row', '排序', 'sort', 'sortable', 'loading', '骨架', '空态', 'empty', 'rowKey', '行键', 'tabular-nums'],
    selectionHints: [
      '结构化行列数据 + 轻量排序 → Table；万行级/虚拟滚动 → VirtualTable；电子表格语义 → DataGrid',
      '自定义单元格用 #cell-<key>，自定义表头用 #header-<key>（覆盖即失去内置排序）',
      '数字列声明 align="right"',
    ],
    commonTasks: [
      '带排序列的只读数据表',
      'loading 骨架 + 空态兜底',
      '单元格内嵌操作按钮/徽标',
    ],
    generationNotes: [
      'rowKey 必填：优先传唯一字段名，无唯一字段时传 (row) => string|number',
      '排序循环 asc → desc → none；sort 事件载荷 { key, order }，组件内部已同步排序',
      'header-<key> 插槽会替换内置排序按钮，自定义表头需自行实现排序交互',
      '本组件全量渲染 DOM 行，大数据量换 VirtualTable',
    ],
  },
}
