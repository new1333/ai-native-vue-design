import type { Locator, Page } from '@playwright/test'

/**
 * playground 七个产品族分区（apps/playground/src/App.vue）：
 * 分区 h2 携带 #family-* id，section 以 aria-labelledby 关联该 id，
 * 因此分区作用域定位用 section[aria-labelledby="#family-*"]。
 */
export const FAMILY_TITLES = {
  'family-typography': '排版 Typography',
  'family-general': '通用 General',
  'family-inputs': '表单 Inputs',
  'family-data': '数据 Data',
  'family-feedback': '反馈 Feedback',
  'family-overlay': '浮层 Overlay',
  'family-navigation': '导航 Navigation',
} as const

export type FamilyId = keyof typeof FAMILY_TITLES

export const FAMILY_IDS: readonly FamilyId[] = Object.keys(FAMILY_TITLES) as FamilyId[]

/**
 * 65 个组件目录 → 各 SFC 根元素 ui-* class 清单。
 * 逐一核对自 packages/components/src/<dir>/ 下每个 SFC 模板根元素的实际 class
 * （含复合组件导出的子组件，如 ButtonGroup / FormField / RadioGroup / TabsList /
 * MenuItem / SubMenu / ToggleItem / SplitterPane / LayoutHeader 系列等；
 * ButtonRoot 为内部基座、无自有根类，不单列）。
 * 组件根类变更时必须同步维护本清单。
 */
export const COMPONENT_ROOT_CLASSES: Readonly<Record<string, readonly string[]>> = {
  accordion: ['ui-accordion'],
  'agent-status': ['ui-agent-status'],
  alert: ['ui-alert'],
  artifact: ['ui-artifact'],
  autocomplete: ['ui-autocomplete'],
  avatar: ['ui-avatar'],
  badge: ['ui-badge'],
  breadcrumb: ['ui-breadcrumb'],
  button: ['ui-button', 'ui-button-group'],
  // CardHeader / CardBody / CardFooter 根元素为 BEM 结构类
  card: ['ui-card', 'ui-card__header', 'ui-card__body', 'ui-card__footer'],
  cascader: ['ui-cascader'],
  checkbox: ['ui-checkbox'],
  'command-palette': ['ui-command-palette'],
  'date-picker': ['ui-date-picker'],
  dialog: ['ui-dialog'],
  divider: ['ui-divider'],
  drawer: ['ui-drawer'],
  'dropdown-menu': ['ui-dropdown-menu'],
  'empty-state': ['ui-empty-state'],
  form: ['ui-form', 'ui-form-field'],
  'hover-card': ['ui-hover-card'],
  'icon-button': ['ui-icon-button'],
  image: ['ui-image'],
  input: ['ui-input'],
  'input-number': ['ui-input-number'],
  'input-otp': ['ui-input-otp'],
  // LayoutHeader / LayoutSider / LayoutContent / LayoutFooter 根元素为 BEM 结构类
  layout: ['ui-layout', 'ui-layout__header', 'ui-layout__sider', 'ui-layout__content', 'ui-layout__footer'],
  menu: ['ui-menu', 'ui-menu-item', 'ui-menu-submenu'],
  message: ['ui-message'],
  'message-list': ['ui-message-list'],
  'model-selector': ['ui-model-selector'],
  pagination: ['ui-pagination'],
  popconfirm: ['ui-popconfirm'],
  popover: ['ui-popover'],
  progress: ['ui-progress'],
  'prompt-input': ['ui-prompt-input'],
  radio: ['ui-radio', 'ui-radio-group'],
  rating: ['ui-rating'],
  reasoning: ['ui-reasoning'],
  'scroll-area': ['ui-scroll-area'],
  select: ['ui-select'],
  skeleton: ['ui-skeleton'],
  slider: ['ui-slider'],
  space: ['ui-space'],
  spinner: ['ui-spinner'],
  // SplitterPane 根元素为 BEM 结构类
  splitter: ['ui-splitter', 'ui-splitter__pane-content'],
  statistic: ['ui-statistic'],
  stepper: ['ui-stepper'],
  'streaming-text': ['ui-streaming-text'],
  suggestion: ['ui-suggestion'],
  switch: ['ui-switch'],
  table: ['ui-table'],
  tabs: ['ui-tabs', 'ui-tabs-list', 'ui-tabs-trigger', 'ui-tabs-content'],
  tag: ['ui-tag'],
  textarea: ['ui-textarea'],
  timeline: ['ui-timeline'],
  toast: ['ui-toast', 'ui-toast__item'],
  'toggle-group': ['ui-toggle-group', 'ui-toggle-item'],
  'tool-call-card': ['ui-tool-call-card'],
  tooltip: ['ui-tooltip'],
  tree: ['ui-tree'],
  'tree-select': ['ui-tree-select'],
  typography: ['ui-heading', 'ui-text'],
  upload: ['ui-upload'],
  'virtual-list': ['ui-virtual-list'],
}

/** 全部根类（扁平） */
export const ALL_ROOT_CLASSES: readonly string[] = Object.values(COMPONENT_ROOT_CLASSES).flat()

/**
 * 按需挂载的根类：Dialog / Drawer / Artifact / CommandPalette 的浮层 Teleport 到 body
 * 且 v-if 控制打开才渲染（挂载前仅输出含根类的 hidden 占位，挂载后即不在 DOM），
 * Tooltip 浮层与 Toast 条目同样仅交互后出现。它们不在初始 DOM 中，
 * 冒烟在 overlay / feedback 分区用例里交互后单独断言。
 */
export const INTERACTION_GATED_ROOT_CLASSES: readonly string[] = [
  'ui-dialog',
  'ui-drawer',
  'ui-artifact',
  'ui-command-palette',
  'ui-toast__item',
  'ui-tooltip',
]

/** 页面初始加载即在 DOM 中的根类 */
export const ROOT_CLASSES_ON_LOAD: readonly string[] = ALL_ROOT_CLASSES.filter(
  (cls) => !INTERACTION_GATED_ROOT_CLASSES.includes(cls),
)

/** playground 页面对象：分区定位与根类查询收口 */
export class PlaygroundPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** 分区标题 h2 本体（#family-* id） */
  heading(id: FamilyId): Locator {
    return this.page.locator(`#${id}`)
  }

  /** 分区 section 作用域（选择器必须用它收窄，避免跨卡片重名） */
  section(id: FamilyId): Locator {
    return this.page.locator(`section[aria-labelledby="${id}"]`)
  }

  get typographySection(): Locator {
    return this.section('family-typography')
  }

  get generalSection(): Locator {
    return this.section('family-general')
  }

  get inputsSection(): Locator {
    return this.section('family-inputs')
  }

  get dataSection(): Locator {
    return this.section('family-data')
  }

  get feedbackSection(): Locator {
    return this.section('family-feedback')
  }

  get overlaySection(): Locator {
    return this.section('family-overlay')
  }

  get navigationSection(): Locator {
    return this.section('family-navigation')
  }

  /** 指定 ui-* 根类在整页 DOM 中的首个实例（浮层类会命中 body 下的 Teleport 内容） */
  rootClass(cls: string): Locator {
    return this.page.locator(`.${cls}`).first()
  }
}
