// 视觉回归基线 · 导航 Navigation（计划 §5.4 / 票 #10）。
// 覆盖 Tabs 卡片：default / hover / focus-visible / 选中切换四态。
import { test, expect } from '../fixtures/visual'

test.describe('Navigation 视觉基线', () => {
  test('Tabs 卡片默认态（含禁用 tab）', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Tabs 标签页（键盘 ←→ 可切换）'), 'tabs-default')
  })

  test('Tabs 触发器 hover 态', async ({ visual }) => {
    await visual.goto()
    const tabsCard = visual.card('Tabs 标签页（键盘 ←→ 可切换）')
    await visual.hover(tabsCard.getByRole('tab', { name: '源码' }))
    await visual.expectSnapshot(tabsCard, 'tabs-hover')
  })

  test('Tabs 触发器 focus-visible 态（真实键盘焦点环）', async ({ visual }) => {
    await visual.goto()
    const tabsCard = visual.card('Tabs 标签页（键盘 ←→ 可切换）')
    await visual.focusVisible(tabsCard.getByRole('tab', { name: '源码' }))
    await visual.expectSnapshot(tabsCard, 'tabs-focus-visible')
  })

  test('Tabs 选中切换态（点击源码后面板切换）', async ({ visual }) => {
    await visual.goto()
    const tabsCard = visual.card('Tabs 标签页（键盘 ←→ 可切换）')
    await tabsCard.getByRole('tab', { name: '源码' }).click()
    await expect(tabsCard).toContainText('源码面板：查看并编辑 Markdown 源码。')
    await visual.expectSnapshot(tabsCard, 'tabs-selected-code')
  })
})
