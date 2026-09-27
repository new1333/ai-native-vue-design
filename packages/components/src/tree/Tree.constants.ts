/**
 * tree/ —— 逻辑常量收口（键盘键名、骨架行数、默认文案与 aria 措辞；
 * 不是视觉值，视觉只走 --ui-* token）。
 */

/** 空态默认文案（empty 插槽缺省值；文案常量非视觉值）。 */
export const TREE_EMPTY_TEXT_DEFAULT = '暂无数据'

/** loading 时的骨架行数（与 Table 家族一致的占位密度）。 */
export const TREE_SKELETON_ROWS = 3

/** 骨架行的层级轮廓：1 个一级节点 + 2 个二级节点（缩进给出自然层次）。 */
export const TREE_SKELETON_LEVELS: readonly number[] = [1, 2, 2]

/** 树的导航键（WAI-ARIA Tree View：↑↓ 移动、←→ 折叠/展开、Home/End 跳转）。 */
export const TREE_NAVIGATION_KEYS: readonly string[] = [
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
]

/**
 * 节点激活键：与 table/ 的 Table 同一策略——keydown 阶段 preventDefault 后
 * 走组件自身语义（Enter=选中，Space=勾选/选中），Space 不滚动页面。
 * 仅当事件目标是 treeitem 本身时生效；toggle 按钮 / checkbox 上的激活由原生行为处理。
 */
export const TREE_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/** toggle 按钮的 aria-label 措辞（配合节点标题）。 */
export const TREE_EXPAND_LABEL = '展开'
export const TREE_COLLAPSE_LABEL = '折叠'
