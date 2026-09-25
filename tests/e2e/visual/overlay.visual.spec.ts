// 视觉回归基线 · 浮层 Overlay（计划 §5.4 / 票 #10）。
// 覆盖 Dialog / DropdownMenu / Tooltip 三张卡片；浮层本体均 Teleport 到 body，
// 打开后对浮层元素单独截图；菜单项 focus-visible 用真实 ↓ 按键打开并聚焦首项
// （键盘路径天然匹配 :focus-visible）。
import { test, expect } from '../fixtures/visual'

test.describe('Overlay 视觉基线', () => {
  test('三张卡片默认态（浮层未打开）', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Dialog 对话框（可交互）'), 'dialog-card-default')
    await visual.expectSnapshot(visual.card('DropdownMenu 下拉菜单（可交互）'), 'dropdown-menu-card-default')
    await visual.expectSnapshot(visual.card('Tooltip 气泡提示（悬浮 / 键盘聚焦）'), 'tooltip-card-default')
  })

  test('Dialog / DropdownMenu 触发器 focus-visible 态（真实键盘焦点环）', async ({ visual }) => {
    await visual.goto()
    const dialogCard = visual.card('Dialog 对话框（可交互）')
    await visual.focusVisible(dialogCard.getByRole('button', { name: '打开对话框', exact: true }))
    await visual.expectSnapshot(dialogCard, 'dialog-trigger-focus-visible')

    const dropdownCard = visual.card('DropdownMenu 下拉菜单（可交互）')
    await visual.focusVisible(dropdownCard.getByRole('button', { name: '文档操作', exact: true }))
    await visual.expectSnapshot(dropdownCard, 'dropdown-menu-trigger-focus-visible')
  })

  test('Dialog 打开态（浮层面板本体）', async ({ visual }) => {
    await visual.goto()
    const dialogCard = visual.card('Dialog 对话框（可交互）')
    await dialogCard.getByRole('button', { name: '打开对话框', exact: true }).click()
    const dialog = visual.page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await visual.expectSnapshot(dialog, 'dialog-open')
  })

  test('DropdownMenu 打开态（菜单浮层本体）', async ({ visual }) => {
    await visual.goto()
    const dropdownCard = visual.card('DropdownMenu 下拉菜单（可交互）')
    await dropdownCard.getByRole('button', { name: '文档操作', exact: true }).click()
    const menu = visual.page.getByRole('menu')
    await expect(menu).toBeVisible()
    await visual.expectSnapshot(menu, 'dropdown-menu-open')
  })

  test('DropdownMenu 菜单项 focus-visible 态（真实 ↓ 按键打开并聚焦首项）', async ({ visual }) => {
    await visual.goto()
    const dropdownCard = visual.card('DropdownMenu 下拉菜单（可交互）')
    const trigger = dropdownCard.getByRole('button', { name: '文档操作', exact: true })
    await trigger.focus()
    await visual.page.keyboard.press('ArrowDown')
    const menu = visual.page.getByRole('menu')
    const firstItem = menu.getByRole('menuitem', { name: '重命名', exact: true })
    await expect(firstItem).toBeFocused()
    // 焦点来自真实按键：断言 :focus-visible 真实生效，保证基线含焦点环
    await visual.assertFocusVisible(firstItem)
    await visual.expectSnapshot(menu, 'dropdown-menu-item-focus-visible')
  })

  test('Tooltip hover 态与键盘聚焦态（气泡本体）', async ({ visual }) => {
    await visual.goto()
    const tooltipCard = visual.card('Tooltip 气泡提示（悬浮 / 键盘聚焦）')
    const tooltip = visual.page.getByRole('tooltip')

    await visual.hover(tooltipCard.getByRole('button', { name: '方向 top', exact: true }))
    await expect(tooltip).toBeVisible()
    await visual.expectSnapshot(tooltip, 'tooltip-hover')

    // 键盘聚焦触发器：tooltip 聚焦显示，同时触发按钮带 :focus-visible 焦点环
    await visual.focusVisible(tooltipCard.getByRole('button', { name: '方向 top', exact: true }))
    await expect(tooltip).toBeVisible()
    await visual.expectSnapshot(tooltip, 'tooltip-focus-visible')
  })
})
