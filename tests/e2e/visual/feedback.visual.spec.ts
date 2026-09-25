// 视觉回归基线 · 反馈 Feedback（计划 §5.4 / 票 #10）。
// 覆盖 Alert 卡片与 Toast 卡片；Toast 浮层（Teleport 到 body 的条目）按需触发后
// 对条目 / 宿主容器单独截图：
// - 常驻条目（duration 0）不会自动消失，是最稳定的条目基线；
// - 四变体堆叠用默认 4s 时长窗口，入场动效已随 token 归零瞬时完成，截图耗时 << 4s。
import { test, expect } from '../fixtures/visual'

test.describe('Feedback 视觉基线', () => {
  test('Alert / Toast 卡片默认态', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Alert 提示条'), 'alert-default')
    await visual.expectSnapshot(
      visual.card('Toast 轻提示（程序式触发，ToastHost 全局挂载一次）'),
      'toast-card-default',
    )
  })

  test('Alert 关闭按钮 hover / focus-visible 态', async ({ visual }) => {
    await visual.goto()
    const alertCard = visual.card('Alert 提示条')
    await visual.hover(alertCard.getByRole('button', { name: '关闭', exact: true }))
    await visual.expectSnapshot(alertCard, 'alert-close-hover')

    await visual.focusVisible(alertCard.getByRole('button', { name: '关闭', exact: true }))
    await visual.expectSnapshot(alertCard, 'alert-close-focus-visible')
  })

  test('Toast 常驻条目（duration 0，不自动关闭）', async ({ visual }) => {
    await visual.goto()
    const card = visual.card('Toast 轻提示（程序式触发，ToastHost 全局挂载一次）')
    await card.getByRole('button', { name: '常驻提示（duration 0）' }).click()
    // Teleport 到 body 的条目以根类 + 文案定位（参照 smoke spec 的浮层定位方式）
    const item = visual.page.locator('.ui-toast__item', { hasText: '常驻提示：不会自动关闭' })
    await expect(item).toBeVisible()
    await visual.expectSnapshot(item, 'toast-item-default')
  })

  test('Toast 四变体堆叠（success / error / info / warning）', async ({ visual }) => {
    await visual.goto()
    const card = visual.card('Toast 轻提示（程序式触发，ToastHost 全局挂载一次）')
    for (const variant of ['success', 'error', 'info', 'warning'] as const) {
      await card.getByRole('button', { name: variant, exact: true }).click()
    }
    const region = visual.page.getByRole('region', { name: '通知' })
    await expect(region.locator('.ui-toast__item')).toHaveCount(4)
    await visual.expectSnapshot(region, 'toast-variants')
  })
})
