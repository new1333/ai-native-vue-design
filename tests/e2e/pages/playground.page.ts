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
 * 25 个组件目录 → 各 SFC 根元素 ui-* class 清单。
 * 逐一核对自 packages/components/src/<dir>/ 下每个 SFC 模板根元素的实际 class
 * （含复合组件导出的子组件，如 ButtonGroup / FormField / RadioGroup / TabsList 等；
 * ButtonRoot 为内部基座、无自有根类，不单列）。
 * 组件根类变更时必须同步维护本清单。
 */
export const COMPONENT_ROOT_CLASSES: Readonly<Record<string, readonly string[]>> = {
  alert: ['ui-alert'],
  avatar: ['ui-avatar'],
  badge: ['ui-badge'],
  button: ['ui-button', 'ui-button-group'],
  // CardHeader / CardBody / CardFooter 根元素为 BEM 结构类
  card: ['ui-card', 'ui-card__header', 'ui-card__body', 'ui-card__footer'],
  checkbox: ['ui-checkbox'],
  dialog: ['ui-dialog'],
  divider: ['ui-divider'],
  'dropdown-menu': ['ui-dropdown-menu'],
  'empty-state': ['ui-empty-state'],
  form: ['ui-form', 'ui-form-field'],
  'icon-button': ['ui-icon-button'],
  input: ['ui-input'],
  pagination: ['ui-pagination'],
  progress: ['ui-progress'],
  radio: ['ui-radio', 'ui-radio-group'],
  select: ['ui-select'],
  skeleton: ['ui-skeleton'],
  switch: ['ui-switch'],
  table: ['ui-table'],
  tabs: ['ui-tabs', 'ui-tabs-list', 'ui-tabs-trigger', 'ui-tabs-content'],
  textarea: ['ui-textarea'],
  toast: ['ui-toast', 'ui-toast__item'],
  tooltip: ['ui-tooltip'],
  typography: ['ui-heading', 'ui-text'],
}

/** 全部根类（扁平） */
export const ALL_ROOT_CLASSES: readonly string[] = Object.values(COMPONENT_ROOT_CLASSES).flat()

/**
 * 按需挂载的根类：Dialog / Tooltip 的浮层 Teleport + v-if 控制打开才渲染，
 * Toast 条目仅触发后出现。它们不在初始 DOM 中，
 * 冒烟在 overlay / feedback 分区用例里交互后单独断言。
 */
export const INTERACTION_GATED_ROOT_CLASSES: readonly string[] = ['ui-dialog', 'ui-toast__item', 'ui-tooltip']

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
