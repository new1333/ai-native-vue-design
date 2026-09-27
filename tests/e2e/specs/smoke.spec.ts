import { test, expect } from '../fixtures'
import { COMPONENT_ROOT_CLASSES, FAMILY_TITLES, FAMILY_IDS, ROOT_CLASSES_ON_LOAD } from '../pages/playground.page'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('七个产品族分区 h2 标题齐全', async ({ page, playground }) => {
  for (const id of FAMILY_IDS) {
    // 优先 role 定位：h2 的可访问名即分区标题，同时校验 id 锚点与分区作用域存在
    const h2 = page.getByRole('heading', { level: 2, name: FAMILY_TITLES[id] })
    await expect(h2).toHaveAttribute('id', id)
    await expect(playground.heading(id)).toBeVisible()
    await expect(playground.section(id)).toBeVisible()
  }
})

test('65 个组件 ui-* 根类全部出现在 DOM（初始加载部分）', async ({ playground }) => {
  // 清单完整性：必须恰好覆盖 65 个组件目录，防止后续漂移
  expect(Object.keys(COMPONENT_ROOT_CLASSES)).toHaveLength(65)
  // 浮层（Dialog / Drawer / Artifact / CommandPalette / Tooltip）与 Toast 条目按需挂载，
  // 在 overlay / feedback 用例中交互后断言
  for (const cls of ROOT_CLASSES_ON_LOAD) {
    await expect(playground.rootClass(cls)).toBeAttached()
  }
})

test('Typography：Heading / Text 关键内容渲染', async ({ playground }) => {
  const section = playground.typographySection
  await expect(section).toContainText('Heading 3xl')
  await expect(section).toContainText('Text md 正文默认档')
  await expect(section).toContainText('numeric 对齐数字：1,024.50 / 3,073.50')
})

test('Card / Divider / Button：关键内容渲染', async ({ playground }) => {
  const section = playground.generalSection
  await expect(section).toContainText('静止面默认无阴影，靠 1px 边界与留白分层')
  await expect(section).toContainText('协作区')
  await expect(section.getByRole('button', { name: '主要操作', exact: true })).toBeVisible()
  await expect(section.getByRole('button', { name: '禁用', exact: true })).toBeDisabled()
})

test('IconButton：图标按钮提供 aria-label', async ({ playground }) => {
  const button = playground.generalSection.getByRole('button', { name: '搜索文档', exact: true }).first()
  await expect(button).toBeVisible()
  await expect(button).toHaveAttribute('aria-label', '搜索文档')
})

test('Overlay：DropdownMenu 根类常驻，Tooltip / Dialog 打开后根类渲染', async ({ page, playground }) => {
  const section = playground.overlaySection

  // DropdownMenu：包裹根节点常驻 DOM（浮层列表按需挂载）
  await expect(section.locator('.ui-dropdown-menu').first()).toBeAttached()

  // Tooltip：键盘聚焦触发器显示（浮层 Teleport 到 body）
  await section.getByRole('button', { name: '方向 top', exact: true }).focus()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(playground.rootClass('ui-tooltip')).toBeAttached()

  // Dialog：打开后根类渲染（Teleport 到 body），Esc 关闭
  await section.getByRole('button', { name: '打开对话框', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  await expect(playground.rootClass('ui-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('Feedback：Toast 宿主常驻，触发后条目根类渲染', async ({ page, playground }) => {
  const section = playground.feedbackSection

  // ToastHost 全局挂载一次：region 常驻（含 ui-toast 根类）
  await expect(page.getByRole('region', { name: '通知' })).toBeAttached()
  await expect(playground.rootClass('ui-toast')).toBeAttached()

  // 触发一条 toast：条目根类与文案出现（Teleport 到 body）
  await section.getByRole('button', { name: 'success', exact: true }).click()
  await expect(page.getByText('这是一条 success 提示')).toBeVisible()
  await expect(playground.rootClass('ui-toast__item')).toBeVisible()
})

test('Navigation：Tabs 子组件根类渲染', async ({ playground }) => {
  const section = playground.navigationSection
  await expect(section.getByRole('tablist')).toBeAttached()
  await expect(section.getByRole('tab', { name: '预览' })).toBeAttached()
  await expect(section.getByRole('tabpanel')).toBeAttached()
})

test('Inputs / Data：关键交互控件在分区作用域内可见', async ({ playground }) => {
  const inputs = playground.inputsSection
  await expect(inputs.getByRole('textbox', { name: '姓名' })).toBeVisible()
  await expect(inputs.getByRole('combobox').first()).toBeAttached()

  const data = playground.dataSection
  await expect(data.getByRole('table')).toBeVisible()
  await expect(data.getByRole('navigation', { name: '分页' })).toBeAttached()
})
