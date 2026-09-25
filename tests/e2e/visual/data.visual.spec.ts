// 视觉回归基线 · 数据 Data（计划 §5.4 / 票 #10）。
// 覆盖 Table / Pagination / Progress / Skeleton / EmptyState 五张卡片。
// loading / indeterminate 态的处理：Progress indeterminate 与 Skeleton shimmer 在
// reduced-motion 下均显式停用（静态半填充 / 静态骨架），default 截图即确定性覆盖；
// Table loading 通过「模拟加载」按钮触发后单独截图。
import { test, expect } from '../fixtures/visual'

test.describe('Data 视觉基线', () => {
  test('五张卡片默认态（含 indeterminate 静态降级 / 徽标单元格）', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Table 表格 · 8 行示例数据'), 'table-default')
    await visual.expectSnapshot(visual.card('Pagination 分页'), 'pagination-default')
    await visual.expectSnapshot(visual.card('Progress 进度条'), 'progress-default')
    await visual.expectSnapshot(visual.card('Skeleton 骨架屏'), 'skeleton-default')
    await visual.expectSnapshot(visual.card('EmptyState 空态'), 'empty-state-default')
  })

  test('Table 排序表头 / Pagination 页码 hover 态', async ({ visual }) => {
    await visual.goto()
    const tableCard = visual.card('Table 表格 · 8 行示例数据')
    await visual.hover(tableCard.getByRole('button', { name: '姓名', exact: true }))
    await visual.expectSnapshot(tableCard, 'table-sort-hover')

    const paginationCard = visual.card('Pagination 分页')
    await visual.hover(paginationCard.getByRole('button', { name: '3', exact: true }))
    await visual.expectSnapshot(paginationCard, 'pagination-hover')
  })

  test('Table / Pagination / EmptyState focus-visible 态（真实键盘焦点环）', async ({ visual }) => {
    await visual.goto()
    const tableCard = visual.card('Table 表格 · 8 行示例数据')
    await visual.focusVisible(tableCard.getByRole('button', { name: '姓名', exact: true }))
    await visual.expectSnapshot(tableCard, 'table-sort-focus-visible')

    const paginationCard = visual.card('Pagination 分页')
    await visual.focusVisible(paginationCard.getByRole('button', { name: '3', exact: true }))
    await visual.expectSnapshot(paginationCard, 'pagination-focus-visible')

    const emptyStateCard = visual.card('EmptyState 空态')
    await visual.focusVisible(emptyStateCard.getByRole('button', { name: '新建文档', exact: true }))
    await visual.expectSnapshot(emptyStateCard, 'empty-state-focus-visible')
  })

  test('Table loading 态（骨架行）', async ({ visual }) => {
    await visual.goto()
    const tableCard = visual.card('Table 表格 · 8 行示例数据')
    await tableCard.getByRole('button', { name: '模拟加载', exact: true }).click()
    // aria-busy 由组件契约驱动，web-first 等待 loading 态落地后再截图
    await expect(tableCard.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    await visual.expectSnapshot(tableCard, 'table-loading')
  })
})
