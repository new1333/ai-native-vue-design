// 视觉回归基线 · 通用 General（计划 §5.4 / 票 #10）。
// 覆盖 Button / ButtonGroup、IconButton、Badge、Avatar、Divider、Card×2 七张卡片。
// disabled / loading 态卡片内已有现成实例（Button 禁用·加载中、IconButton 禁用·加载中），
// default 截图即覆盖；交互态叠加 hover / focus-visible。
import { test } from '../fixtures/visual'

test.describe('General 视觉基线', () => {
  test('七张卡片默认态（含 disabled / loading / Avatar 图片回退现成实例）', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Button 按钮 · ButtonGroup'), 'button-default')
    await visual.expectSnapshot(visual.card('IconButton 图标按钮'), 'icon-button-default')
    await visual.expectSnapshot(visual.card('Badge 徽标'), 'badge-default')
    // Avatar：等待 data-URI 解码 + 404 图失败收敛（visual.goto 已 settle）
    await visual.expectSnapshot(visual.card('Avatar 头像'), 'avatar-default')
    await visual.expectSnapshot(visual.card('Divider 分隔线'), 'divider-default')
    await visual.expectSnapshot(visual.card('Card 卡片 · shadow=none（默认）'), 'card-none-default')
    await visual.expectSnapshot(visual.card('Card 卡片 · shadow=rest'), 'card-rest-default')
  })

  test('Button / IconButton hover 态', async ({ visual }) => {
    await visual.goto()
    const buttonCard = visual.card('Button 按钮 · ButtonGroup')
    await visual.hover(buttonCard.getByRole('button', { name: '主要操作', exact: true }))
    await visual.expectSnapshot(buttonCard, 'button-hover')

    const iconButtonCard = visual.card('IconButton 图标按钮')
    // aria-label 定位（IconButton 无可见文案），outline 变体为默认视觉代表
    await visual.hover(iconButtonCard.getByRole('button', { name: '搜索文档', exact: true }).first())
    await visual.expectSnapshot(iconButtonCard, 'icon-button-hover')
  })

  test('Button / IconButton focus-visible 态（真实键盘焦点环）', async ({ visual }) => {
    await visual.goto()
    const buttonCard = visual.card('Button 按钮 · ButtonGroup')
    await visual.focusVisible(buttonCard.getByRole('button', { name: '主要操作', exact: true }))
    await visual.expectSnapshot(buttonCard, 'button-focus-visible')

    const iconButtonCard = visual.card('IconButton 图标按钮')
    await visual.focusVisible(iconButtonCard.getByRole('button', { name: '搜索文档', exact: true }).first())
    await visual.expectSnapshot(iconButtonCard, 'icon-button-focus-visible')
  })
})
