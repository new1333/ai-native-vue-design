// 浮层三件套 E2E：Dialog / DropdownMenu / Tooltip（计划 §5.2 浮层家族键盘契约）。
// 浮层本体均 Teleport 到 body 下，浮层断言用全局 getByRole 定位；
// 触发器等常驻元素用 overlay 分区作用域收窄。断言一律 web-first，禁 waitForTimeout。
import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'

/** 焦点是否圈定在对话框内（document.activeElement 属于 [role="dialog"]）。 */
function focusInsideDialog(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]')
    return dialog !== null && dialog.contains(document.activeElement)
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Dialog 对话框', () => {
  test('打开后 aria-modal 生效且焦点移入对话框', async ({ page, playground }) => {
    const section = playground.overlaySection
    await section.getByRole('button', { name: '打开对话框', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toContainText('发布确认')
    // 打开即把焦点移入对话框（activate → 首个可聚焦元素）
    await expect.poll(() => focusInsideDialog(page)).toBe(true)
  })

  test('连按 Tab 12 次焦点循环不出对话框', async ({ page, playground }) => {
    const section = playground.overlaySection
    await section.getByRole('button', { name: '打开对话框', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      // Tab 循环圈定：面板内首尾环绕，任何一次按键后焦点都不逃逸出对话框
      await expect
        .poll(() => focusInsideDialog(page), { message: `第 ${i + 1} 次 Tab 后焦点仍在对话框内` })
        .toBe(true)
    }
  })

  test('Esc 关闭对话框且焦点还原到打开前元素', async ({ page, playground }) => {
    const section = playground.overlaySection
    const openButton = section.getByRole('button', { name: '打开对话框', exact: true })
    await openButton.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(openButton).toBeFocused()
  })

  test('确认发布后关闭对话框并出现成功 toast', async ({ page, playground }) => {
    const section = playground.overlaySection
    await section.getByRole('button', { name: '打开对话框', exact: true }).click()

    // footer 按钮 Teleport 到 body，须以 dialog 为作用域（分区作用域定位不到）
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByText('已发布到团队空间')).toBeVisible()
  })
})

test.describe('DropdownMenu 下拉菜单', () => {
  test('Button 单元素插槽触发器：aria-haspopup / aria-expanded 属性合并正确', async ({
    page,
    playground,
  }) => {
    const trigger = playground.overlaySection.getByRole('button', { name: '文档操作', exact: true })

    // 回归 a5478c2 缺陷类别：组件触发器时 DropdownMenu 的 aria 属性必须
    // 透传合并到 Button 根元素上（而非丢失或包一层内建触发器）
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // 打开时 aria-controls 关联的正是当前 menu 浮层本体
    const controlsId = await trigger.getAttribute('aria-controls')
    if (controlsId === null) throw new Error('菜单打开后触发器应携带 aria-controls')
    await expect(menu).toHaveAttribute('id', controlsId)

    // Esc 关闭后 expanded 复位
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('↓ 打开、↑↓ 环绕导航跳过禁用项、Esc 关闭还原焦点', async ({ page, playground }) => {
    const trigger = playground.overlaySection.getByRole('button', { name: '文档操作', exact: true })
    await trigger.focus()

    // ↓ 打开：焦点移到首个启用项
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const item = (name: string) => menu.getByRole('menuitem', { name, exact: true })
    await expect(item('重命名')).toBeFocused()

    // ↓ 前进：复制链接
    await page.keyboard.press('ArrowDown')
    await expect(item('复制链接')).toBeFocused()

    // ↓ 再次前进：跳过禁用项「归档（禁用）」直达「删除文档」
    await expect(item('归档（禁用）')).toBeDisabled()
    await page.keyboard.press('ArrowDown')
    await expect(item('删除文档')).toBeFocused()

    // ↓ 环绕回首项
    await page.keyboard.press('ArrowDown')
    await expect(item('重命名')).toBeFocused()

    // ↑ 反向环绕：再次跳过禁用项回到末项
    await page.keyboard.press('ArrowUp')
    await expect(item('删除文档')).toBeFocused()

    // Esc 关闭：焦点还原触发器、expanded 复位
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('菜单项 Enter 选中并触发回调、关闭后焦点还原触发器', async ({ page, playground }) => {
    const trigger = playground.overlaySection.getByRole('button', { name: '文档操作', exact: true })
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: '重命名', exact: true })).toBeFocused()

    await page.keyboard.press('Enter')
    // 选中回调：playground 以 toast 回显选中 key
    await expect(page.getByText('菜单选中：rename')).toBeVisible()
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('禁用项点击不可激活：菜单保持打开且无选中回调', async ({ page, playground }) => {
    const trigger = playground.overlaySection.getByRole('button', { name: '文档操作', exact: true })
    await trigger.click()
    const menu = page.getByRole('menu')
    const archive = menu.getByRole('menuitem', { name: '归档（禁用）', exact: true })
    await expect(archive).toBeVisible()

    // 原生 disabled 语义：真实指针点击落在禁用项上也不得派发激活
    const box = await archive.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)

    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('菜单选中：archive')).toBeHidden()
  })

  test('点击浮层外部关闭菜单', async ({ page, playground }) => {
    const section = playground.overlaySection
    const trigger = section.getByRole('button', { name: '文档操作', exact: true })
    await trigger.click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()

    // 点在分区标题（触发器与浮层之外）：外点关闭，expanded 复位
    await section.getByRole('heading', { name: '浮层 Overlay' }).click()
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('Tooltip 气泡提示', () => {
  test('hover 触发器显示提示、移开后消失', async ({ page, playground }) => {
    const section = playground.overlaySection
    const tooltip = page.getByRole('tooltip')

    // top 方向
    await section.getByRole('button', { name: '方向 top', exact: true }).hover()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('悬浮或聚焦后出现的纯提示（top）')

    // 移开指针立即隐藏
    await page.mouse.move(0, 0)
    await expect(tooltip).toBeHidden()

    // right 方向
    await section.getByRole('button', { name: '方向 right', exact: true }).hover()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('纯提示不承载交互（right）')

    await page.mouse.move(0, 0)
    await expect(tooltip).toBeHidden()
  })

  test('Tab 聚焦触发按钮显示提示、移焦后消失', async ({ page, playground }) => {
    const section = playground.overlaySection
    const tooltip = page.getByRole('tooltip')
    // 定位到「方向 top」的前一个可聚焦元素（同分区 DropdownMenu 触发器），
    // 焦点进入 tooltip 触发器本身由真实 Tab 按键完成（键盘路径）
    await section.getByRole('button', { name: '文档操作', exact: true }).focus()

    await page.keyboard.press('Tab')
    await expect(section.getByRole('button', { name: '方向 top', exact: true })).toBeFocused()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('悬浮或聚焦后出现的纯提示（top）')

    // Tab 移到下一个触发按钮：top 提示失焦隐藏，right 提示聚焦显示
    await page.keyboard.press('Tab')
    await expect(section.getByRole('button', { name: '方向 right', exact: true })).toBeFocused()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('纯提示不承载交互（right）')

    // 再 Tab 焦点离开浮层分区：失焦立即隐藏
    await page.keyboard.press('Tab')
    await expect(tooltip).toBeHidden()
  })
})
