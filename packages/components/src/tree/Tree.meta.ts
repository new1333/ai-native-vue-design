/**
 * Tree 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Tree.types.ts 保持一致；states 与 Tree.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-tree',
  version: '0.1.0',
  identity: {
    name: 'Tree',
    package: '@ui/components',
    export: 'Tree',
    category: 'data',
    description: '纸面树形层级控件：嵌套 data 渲染 role=tree/treeitem 扁平可见模型、展开/折叠（受控 expandedKeys 或非受控）、单/多选（modelValue）、级联勾选（checkable + check 事件）、loading 骨架与空态，键盘 ↑↓←→/Home/End/Enter/Space 全路径。',
  },
  intent: {
    what: '以嵌套 data 渲染树形层级：节点可展开折叠、单/多选、级联勾选；扁平可见节点模型 + roving tabindex 提供完整键盘路径。',
    when: [
      '文件目录、组织架构、分类目录等层级数据的浏览与定位',
      '需要从层级中选择一项（单选）或多项（multiple）作为表单值',
      '需要按节点批量勾选（checkable，父子级联，如授权范围选择）',
      '异步加载期间需要骨架占位、数据为空需要空态兜底',
    ],
    whenNot: [
      '万级节点需要虚拟滚动：本组件全量渲染可见节点，请组合 VirtualList（不在本版范围）',
      '子节点懒加载/逐层异步展开不内置：本版需整棵传入 data',
      '拖拽排序、右键菜单、type-ahead 首字母定位不在本版范围',
      '受控勾选（checkedKeys 双向绑定）不内置：勾选为组件内状态，经 check 事件同步全量快照',
    ],
    userTask: '用户需要浏览层级结构并对节点进行展开、选中或批量勾选',
  },
  api: {
    props: [
      { name: 'data', type: 'TreeNode[]', required: true, description: '嵌套树数据：{ key, title, children?, disabled?, icon? }；key 须全树唯一字符串。icon 仅经 #node 插槽作用域透出，默认渲染不消费。' },
      { name: 'modelValue', type: 'string | string[]', default: 'undefined', description: '选中值（受控）：单选为 string、multiple 为 string[]；不传为非受控（初始无选中，仍发 update:modelValue）。' },
      { name: 'expandedKeys', type: 'string[]', default: 'undefined', description: '展开键集合（受控）：传入后组件不改内部状态，展开折叠经 expand 事件同步（载荷含 expandedKeys 快照）；不传为非受控且初始展开全部父节点。' },
      { name: 'checkable', type: 'boolean', default: 'false', description: '显示勾选框：原生 checkbox + 级联（勾/取消传播到全部可用后代，祖先按可用子节点全勾回算，半选用 indeterminate）；勾选为组件内状态。' },
      { name: 'multiple', type: 'boolean', default: 'false', description: '多选：点击节点切换选中（无需修饰键），modelValue 为 string[]；缺省单选（string，重复点击已选节点不取消）。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：渲染 3 行骨架行（aria-hidden）并在 tree 上置 aria-busy="true"；骨架期不渲染数据与空态。' },
    ],
    slots: [
      { name: 'node', scope: '{ node, title, icon, level, hasChildren, expanded, selected, checked, indeterminate, disabled }', description: '按节点定制渲染（标题+图标自绘，icon 为 data 透出的字符串标识）；覆盖后失去内置标题文本，展开开关与勾选框仍由组件渲染。' },
      { name: 'empty', description: '空态内容；仅在非 loading 且 data 为空时出现，缺省渲染“暂无数据”。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string | string[]', description: '选中值变化：单选发 string，多选发 string[]；受控/非受控均发出。' },
      { name: 'select', payload: '{ key, node, selected }', description: '选中变化：点击节点或键盘 Enter/Space 选中时发出，selected 为事件后状态。' },
      { name: 'check', payload: '{ key, node, checked, checkedKeys }', description: '勾选变化：checkbox change 或键盘 Space（checkable）时发出；checkedKeys 为级联后全量快照（先序）。' },
      { name: 'expand', payload: '{ key, node, expanded, expandedKeys }', description: '展开折叠变化：toggle 按钮、点击箭头或键盘 ←/→ 时发出；expandedKeys 为快照（先序）。' },
    ],
    exposes: [],
  },
  constraints: {
    dependsOn: ['@ui/tokens/paper.css（使用方应用入口一次性引入）'],
  },
  composition: {
    patterns: ['Tree + #node 插槽自定义图标/徽标', 'Tree checkable 批量授权', 'Tree loading 骨架 + empty 空态', '受控 expandedKeys 实现「全部展开/折叠」工具条'],
    related: ['EmptyState', 'Skeleton', 'Checkbox', 'Table', 'TreeSelect'],
    preferred: ['选中值用 v-model:modelValue（单选 string / 多选 :multiple）', '受控展开时在 @expand 里用载荷的 expandedKeys 回写', '节点图标经 #node 插槽自绘（内联 SVG），data.icon 只作标识'],
  },
  states: {
    default: '无外框安静纸面；节点行 text-sm/text-1，展开箭头 text-3，勾选框 accent-color 走 token；层级缩进 (level-1) × --ui-space-4。',
    hover: '非禁用节点行 hover 转 sand 底（surface-muted）；箭头 hover 加深为 text-1。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css）；组件不改写 outline。roving tabindex：同一时刻仅一个节点 tabindex=0。',
    active: '原生 button/checkbox 的按压反馈交由浏览器默认；节点行无额外 transform。',
    disabled: 'aria-disabled="true" + 标题 text-3 + cursor: not-allowed；不可选中/勾选（checkbox 原生 disabled），不响应行 hover；仍可展开折叠；键盘导航跳过禁用节点（不落焦），焦点因点击落在其上时按键仍可移出。',
    loading: '渲染 3 行骨架行（sand 骨架条 + token 推导时长的呼吸动效，reduced-motion 归零即停），tree 置 aria-busy="true"，骨架行 aria-hidden。',
  },
  accessibility:
    'role=tree 的 ul 内按可见先序渲染 li[role=none] > div[role=treeitem]（扁平模型，层级由 aria-level 表达，另有 aria-posinset/aria-setsize）；父节点常驻 aria-expanded（true/false），每个 treeitem 常驻 aria-selected（true/false），禁用节点 aria-disabled="true"。roving tabindex：tabbable 节点（初始首个可见节点）tabindex=0，其余 -1；↑↓ 在可见序上移动焦点（跳过禁用节点，到边界即停不回绕），→ 展开折叠中的父节点或进入首个可用子节点，← 折叠已展开父节点或回到最近可用（非禁用）祖先，Home/End 跳首个/末个可用节点，Enter 选中，Space 在 checkable 时切换勾选否则选中；禁用节点不可选中/勾选（激活为 no-op），焦点因点击落在其上时导航键仍可移出；toggle 箭头为原生 button（tabindex=-1，aria-label=「展开/折叠「标题」」），勾选框为原生 input[type=checkbox]（tabindex=-1，aria-label=节点标题，半选用 indeterminate 属性），两者上的 Enter/Space 交由原生行为处理避免双触发。loading 时 aria-busy="true" 且骨架行 aria-hidden。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；焦点登记的模板 ref 函数与 .focus()/keydown 处理只存在于客户端；aria-expanded/selected/level/posinset/setsize、骨架与空态均随 SSR 输出（indeterminate 为 DOM 属性，不进 HTML 字符串）。',
  performance:
    '纯 computed 派生：nodeMeta/visibleNodes/indeterminateMap 均为单次 O(n) 树遍历，不改写传入 data；无监听器、无测量、无定时器；勾选/展开集合用 Set。全量渲染可见节点（折叠子树不渲染），千级节点可用，万级需配合虚拟化（本版未内置）。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：选中行 --ui-accent-soft + 标题 --ui-accent + --ui-font-weight-medium，hover --ui-surface-muted，禁用标题 --ui-text-3，箭头 --ui-text-3→text-1，勾选框 accent-color: var(--ui-accent)，骨架 --ui-surface-muted + --ui-radius-xs + calc(var(--ui-motion-default) * 5) 呼吸动效，间距 --ui-space-*、字号 --ui-text-sm、行圆角 --ui-radius-sm；层级缩进为 (level-1) × var(--ui-space-4) 的 calc 布局值。无全局 CSS 引入。',
  examples: [
    '<Tree :data="nodes" />',
    '<Tree v-model="selected" :data="nodes" multiple />',
    '<Tree :data="nodes" checkable @check="({ checkedKeys }) => onCheck(checkedKeys)" />',
    '<Tree :data="nodes" :expanded-keys="expanded" @expand="({ expandedKeys }) => expanded = expandedKeys" />',
    '<Tree :data="nodes" loading />\n<Tree :data="[]">\n  <template #empty>目录为空</template>\n</Tree>',
    '<Tree :data="nodes">\n  <template #node="{ title, icon, level }">\n    <span class="my-icon">{{ icon }}</span>{{ title }}（L{{ level }}）\n  </template>\n</Tree>',
  ],
  agent: {
    keywords: ['tree', '树', '树形', '层级', '目录', 'treeitem', '展开', '折叠', 'expand', 'collapse', '选中', '勾选', '级联', 'checkable', 'cascade', 'multiple', 'roving tabindex', 'aria-level', '组织架构'],
    selectionHints: [
      '层级数据浏览/选择 → Tree；无层级的长列表 → List；平铺多值勾选 → Checkbox 组',
      '需要勾选选值时用 checkable + @check 的 checkedKeys 快照；需要单/多选值时用 v-model（multiple）',
      '受控展开：:expanded-keys + @expand 回写载荷 expandedKeys；不传则默认展开全部父节点',
      '自定义节点外观用 #node 插槽（scope 含 title/icon/level/selected 等）',
    ],
    commonTasks: [
      '文件/分类目录树浏览（展开折叠 + 单选）',
      '授权/成员批量勾选（级联 checkable）',
      '受控「全部展开/折叠」交互',
      'loading 骨架 + 空态兜底',
    ],
    generationNotes: [
      'TreeNode.key 必须全树唯一（字符串），title 为显示文本；disabled 节点不可选/勾但可展开',
      '展开/选中支持受控（传 expandedKeys/modelValue）与非受控（不传）；勾选恒为组件内状态，经 check 事件同步',
      '单选重复点击已选节点不取消；多选点击切换（无需修饰键）',
      'icon 仅经 #node 插槽透出，默认渲染不显示图标；子节点懒加载/虚拟滚动本版不做',
    ],
  },
}
