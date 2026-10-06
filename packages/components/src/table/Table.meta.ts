/**
 * Table 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Table.types.ts 保持一致；states 与 Table.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-table',
  version: '0.2.0',
  identity: {
    name: 'Table',
    package: '@ui/components',
    export: 'Table',
    category: 'data',
    description: '纸面泛型数据表格：语义 table/thead/tbody、token 化表头与行 hover、可排序列（aria-sort + 循环 asc/desc/none，支持自定义比较器与 remote 远程档）、行选择列（rowSelection + v-model:selectedRowKeys，全选含半选）、loading 骨架行、空态与 cell-/header- 动态插槽。',
  },
  intent: {
    what: '以声明式 columns + data 渲染结构化行列数据，泛型 T 贯穿列定义与行数据，内置轻量排序（本地/远程）、行选择与加载/空态。',
    when: [
      '后台列表页、分析结果、键值明细等中等量级结构化数据展示',
      '需要按列点击排序（升/降/复位三态循环）的只读表格；服务端排序场景用 remote 档',
      '需要多选行（批量操作、跨页保持选中）的列表',
      '异步加载需要骨架行占位的数据区',
      '部分列需要自定义渲染（状态徽标、操作按钮等 cell-<key> 插槽）',
    ],
    whenNot: [
      '万行级数据用 VirtualTable/DataGrid（windowing + DOM 复用），本组件全量渲染 DOM 行',
      '行内编辑、列宽拖拽、单元格聚焦漫游等电子表格语义用 DataGrid',
      '无列结构的长列表用 List/虚拟滚动，不要拿 Table 装排版',
    ],
    userTask: '用户需要浏览、按需排序并按需勾选一组结构化数据',
  },
  api: {
    props: [
      { name: 'columns', type: 'TableColumn<T>[]', required: true, description: '列定义：key（取值与插槽名）、label、width?（number 视为 px）、align?（left|right，right 自动 tabular-nums）、sortable?（true 内置比较器 / (a,b)=>number 自定义比较器 / false 缺省不可排序且无排序 UI）。' },
      { name: 'data', type: 'T[]', required: true, description: '行数据；本地排序只作用于内部渲染副本，不改写传入数组；remote 档下渲染顺序恒等于 data 顺序（使用方负责排序）。' },
      { name: 'rowKey', type: 'keyof T | ((row: T, index: number) => string | number)', required: true, description: '行键（stable key）：字段名或函数；字段值非 string/number 时回落行下标。行选择与排序均基于该键。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：tbody 渲染 3 行骨架行（aria-hidden）并在 table 上置 aria-busy="true"；骨架期不渲染数据行与空态。' },
      { name: 'rowSelection', type: 'TableRowSelection<T>', description: '行选择配置：传入（非 undefined）即启用行选择列——checkbox 列自动作为首列（表头为全选，含半选态）。getCheckboxProps(row, index) 可按行返回 { disabled }（禁用行不可勾选且被全选跳过）。' },
      { name: 'selectedRowKeys', type: '(string | number)[]', default: '[]', description: '已选行键集合（受控，v-model:selectedRowKeys）：基于 rowKey 键而非行引用，data 更新/翻页后历史键保持（跨页保持选中）；组件不持有内部选中副本。' },
      { name: 'remote', type: 'boolean', default: 'false', description: '远程排序：true 时点击排序表头只发出 sort 事件（载荷不变，aria-sort 照常流转），组件不做本地排序、渲染保持 data 原序；使用方监听 sort 后自行请求/排序并回填 data。' },
    ],
    slots: [
      { name: 'cell-<key>', scope: '{ row: T, value: unknown, column: TableColumn<T>, index: number }', description: '按列定制的单元格插槽（如 #cell-status）；缺省渲染 String(row[key])（null/undefined/对象为空串）。' },
      { name: 'header-<key>', scope: '{ column: TableColumn<T>, label: string }', description: '按列定制的表头插槽（如 #header-name）；覆盖后该列失去内置排序按钮与 aria-sort，自定义时需自行补齐排序交互。' },
      { name: 'empty', description: '空态内容；仅在非 loading 且 data 为空时出现，缺省渲染“暂无数据”（colspan 跨全列，选择列启用时含选择列）。' },
    ],
    events: [
      { name: 'sort', payload: '{ key: string, order: "asc" | "desc" | "none" }', description: '排序变化：点击可排序列表头按钮（或键盘 Enter/Space 激活）时发出。remote=false 组件内部已按新状态本地排序；remote=true 只发事件、不改行序（使用方自行排序回填 data）。' },
      { name: 'update:selectedRowKeys', payload: '(string | number)[]', description: '行选择变化（v-model:selectedRowKeys）：载荷为勾选后的完整行键数组——含不在当前 data 内的历史键（跨页保持以键为准）；选中行对象由使用方按键回查 data。' },
    ],
    exposes: [
      { name: 'clearSort', type: '() => void', description: '复位排序状态到 none（不发 sort 事件）。' },
    ],
  },
  constraints: {
    dependsOn: ['@ui/tokens/paper.css（使用方应用入口一次性引入）'],
  },
  composition: {
    patterns: [
      'Table + Pagination 分页列表（rowSelection 跨页保持选中）',
      'Table + loading 骨架异步加载',
      'cell-<key> 插槽内嵌 Badge/Button 行操作',
      'Table remote + 服务端排序：sort 事件驱动请求，data 回填新序',
    ],
    related: ['Pagination', 'EmptyState', 'Skeleton', 'VirtualTable', 'Checkbox'],
    preferred: [
      '数字列声明 align="right" 以获得 tabular-nums 对齐',
      '本地排序重计算交给组件，外部仅监听 sort 同步筛选条件；服务端排序声明 remote 让组件退化为纯受控',
      '行选择用 v-model:selectedRowKeys 持有键集合，批量操作按键回查行数据',
    ],
  },
  states: {
    default: '白底表格、sand（surface-muted）表头、line 边框行分隔；文字 text-sm/text-1，表头 medium/text-2。',
    hover: '数据行 hover 转 sand 底（surface-muted）；骨架行与空态行不响应 hover。',
    focusVisible: '排序按钮与选择列 checkbox 焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。',
    active: '排序按钮为原生 button，按压反馈交由浏览器默认；无额外 transform。',
    disabled: '无整体禁用态；不可排序列表头不渲染按钮、无 aria-sort、光标默认。行选择：getCheckboxProps 返回 disabled 的行 checkbox 原生 disabled（移出 Tab 序、不可勾选）且被表头全选跳过；无可选行（空数据/全禁用）时表头全选 checkbox 禁用。',
    loading: 'tbody 渲染 3 行骨架行（sand 骨架条 + token 推导时长的呼吸动效，reduced-motion 归零即停），table 置 aria-busy="true"，骨架行 aria-hidden（选择列同样渲染骨架格）。',
  },
  accessibility:
    '语义 <table>/<thead>/<tbody>，th scope="col"（选择列 th 同样带 scope）；可排序列 th 常驻 aria-sort（ascending/descending/none，remote 档照常流转），非排序列不写该属性；排序入口为原生 <button type="button">，Tab 自然进入，Enter/Space 在 keydown 统一 preventDefault 后由元素 .click() 单次激活（Space 不滚动页面）；排序指示 svg aria-hidden，按钮可读名即列 label。行选择复用 Checkbox：原生 input[type=checkbox]（checked/disabled 语义原生表达，不书 role/aria-checked），Tab 进入、Space 原生切换；表头全选 aria-label="全选"、行 checkbox aria-label="选择此行"，半选经 DOM indeterminate property 暴露给读屏（客户端同步，SSR 无法表达该 property）；loading 时 aria-busy="true" 且骨架行 aria-hidden；空态为普通 td（colspan 全列）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；.click() 仅出现在客户端 keydown 回调内；骨架/空态/aria-sort/选择列（表头全选与行 checkbox、选中与禁用态）均随 SSR 输出，仅 indeterminate property 为客户端语义。',
  performance:
    '纯 computed 派生（排序为浅拷贝排序，不改写 props.data；选中态为受控 keys 的 Set 派生）；无监听器、无测量、无定时器；行使用 rowKey stable key。全量渲染 DOM 行，千行级可用，万行级应改用 VirtualTable。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：表头 --ui-surface-muted、分隔线 --ui-border、行 hover --ui-surface-muted、数字列 font-variant-numeric: var(--ui-numeric)、选择列宽度 --ui-space-6、间距 --ui-space-*、字号 --ui-text-sm、圆角 --ui-radius-sm、动效 --ui-motion-*/--ui-ease-out。列宽 width 为用户数据驱动的内联样式；选择列视觉复用 Checkbox 组件（不自绘方块）。无全局 CSS 引入。',
  examples: [
    "<Table\n  :columns=\"[\n    { key: 'name', label: '名称' },\n    { key: 'score', label: '得分', align: 'right', sortable: true },\n  ]\"\n  :data=\"rows\"\n  row-key=\"id\"\n/>",
    "<Table\n  v-model:selected-row-keys=\"selected\"\n  :columns=\"columns\"\n  :data=\"pageRows\"\n  row-key=\"id\"\n  :row-selection=\"{ getCheckboxProps: (row) => ({ disabled: row.locked }) }\"\n/>",
    "<Table :columns=\"columns\" :data=\"rows\" row-key=\"id\" remote @sort=\"fetchSorted\" />",
    "<Table :columns=\"columns\" :data=\"rows\" row-key=\"id\" loading />",
    "<Table :columns=\"columns\" :data=\"[]\" row-key=\"id\">\n  <template #empty>还没有记录</template>\n</Table>",
    "<Table :columns=\"columns\" :data=\"rows\" row-key=\"id\" @sort=\"onSort\">\n  <template #cell-status=\"{ row }\">\n    <Badge>{{ row.status }}</Badge>\n  </template>\n  <template #header-name=\"{ label }\">{{ label }}（必填）</template>\n</Table>",
  ],
  agent: {
    keywords: ['table', '表格', '数据表', 'data table', '列', 'column', '行', 'row', '排序', 'sort', 'sortable', 'remote', '远程排序', '服务端排序', 'loading', '骨架', '空态', 'empty', 'rowKey', '行键', 'tabular-nums', '行选择', 'row selection', 'selectedRowKeys', '全选', '半选', 'indeterminate', 'checkbox', '多选'],
    selectionHints: [
      '结构化行列数据 + 轻量排序 → Table；万行级/虚拟滚动 → VirtualTable；电子表格语义 → DataGrid',
      '自定义单元格用 #cell-<key>，自定义表头用 #header-<key>（覆盖即失去内置排序）',
      '数字列声明 align="right"',
      '需要勾选行（批量操作/跨页保持）传 rowSelection + v-model:selectedRowKeys；服务端排序声明 remote 并监听 sort',
    ],
    commonTasks: [
      '带排序列的只读数据表（内置或自定义比较器）',
      '多选行 + 跨页保持选中 + 表头全选（半选态自动呈现）',
      'remote 服务端排序表格（sort 事件驱动请求）',
      'loading 骨架 + 空态兜底',
      '单元格内嵌操作按钮/徽标',
    ],
    generationNotes: [
      'rowKey 必填：优先传唯一字段名，无唯一字段时传 (row) => string|number；行选择以该键为准（跨页保持选中，不持行引用）',
      '排序循环 asc → desc → none；sort 事件载荷 { key, order }；remote=true 只发事件不做本地排序，切回 false 会按当前排序状态本地重排',
      'sortable 传 (a, b) => number 用自定义比较器；sortable: false（或缺省）不渲染排序 UI',
      '行选择严格受控：组件不持有选中副本，update:selectedRowKeys 载荷为完整键数组（含当前 data 外的历史键）；选中行对象由使用方按键回查',
      'getCheckboxProps 返回 disabled 的行不可勾选且被全选跳过；表头全选在无可选行时禁用',
      'header-<key> 插槽会替换内置排序按钮，自定义表头需自行实现排序交互',
      '本组件全量渲染 DOM 行，大数据量换 VirtualTable',
    ],
  },
}
