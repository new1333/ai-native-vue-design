import { test, expect } from '../fixtures'

/**
 * Data 家族 E2E —— Table / Pagination / Progress / Skeleton / EmptyState（计划 §5.2）。
 *
 * 作用域：全部选择器经 playground.dataSection 收窄；
 * 定位优先级 getByRole（table / columnheader / button / navigation / progressbar），
 * aria-hidden 装饰元素（骨架行 / Skeleton）回退 ui-* CSS 类。
 * console / pageerror 守卫由 fixture 默认注入，本文件无需显式豁免。
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

/* ── Table ─────────────────────────────────────────────────── */

test('Table：评分列升序首行为陆知遥（61 分），再点降序首行为苏行舟（95 分）', async ({ playground }) => {
  const section = playground.dataSection
  const table = section.getByRole('table')
  const firstRow = table.locator('tbody').getByRole('row').first()
  const scoreHeader = section.getByRole('columnheader', { name: '评分' })
  const scoreSort = scoreHeader.getByRole('button')

  // 排序循环 none → asc → desc：首次点击为升序
  await scoreSort.click()
  await expect(scoreHeader).toHaveAttribute('aria-sort', 'ascending')
  await expect(firstRow).toContainText('陆知遥')
  await expect(firstRow.getByRole('cell', { name: '61', exact: true })).toBeVisible()
  // @sort 事件联动卡片文案（payload key=score / order=asc）
  await expect(section.getByText('排序事件：排序列「score」方向 asc')).toBeVisible()

  // 第二次点击切换为降序
  await scoreSort.click()
  await expect(scoreHeader).toHaveAttribute('aria-sort', 'descending')
  await expect(firstRow).toContainText('苏行舟')
  await expect(firstRow.getByRole('cell', { name: '95', exact: true })).toBeVisible()
  await expect(section.getByText('排序事件：排序列「score」方向 desc')).toBeVisible()
})

test('Table：姓名列拼音排序，升序首行为程既白（Chromium ICU Collator 实测固化）', async ({ playground }) => {
  const section = playground.dataSection
  const nameHeader = section.getByRole('columnheader', { name: '姓名' })

  await nameHeader.getByRole('button').click()
  await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

  // 拼音序依赖浏览器 ICU 环境（计划 §8 风险项）：真浏览器实测
  // Intl.Collator('zh-Hans-CN') 序首行为「程既白」（cheng < gu < jiang < lin < lu < shen < su < wen）；
  // 按 §5.2 只断首行、不断全量序，避免不同 ICU 数据版本的脆弱性。
  const firstRow = section.getByRole('table').locator('tbody').getByRole('row').first()
  await expect(firstRow).toContainText('程既白')
})

test('Table：「模拟加载」切换骨架行与 aria-busy，停止后数据行恢复', async ({ playground }) => {
  const section = playground.dataSection
  const table = section.getByRole('table')

  await section.getByRole('button', { name: '模拟加载', exact: true }).click()
  await expect(table).toHaveAttribute('aria-busy', 'true')
  // loading 实现为骨架行（aria-hidden 装饰行，回退 CSS 类定位），数据行整体卸载
  await expect(table.locator('.ui-table__row--skeleton').first()).toBeVisible()
  await expect(table.getByText('林晚照')).toBeHidden()

  // 按钮文案随状态切换为「停止加载」，再点恢复数据行
  await section.getByRole('button', { name: '停止加载', exact: true }).click()
  await expect(table).not.toHaveAttribute('aria-busy')
  await expect(table.getByText('林晚照')).toBeVisible()
  await expect(table.locator('.ui-table__row--skeleton')).toHaveCount(0)
})

test('Table：状态列以 Badge 渲染且变体联动（启用 success / 停用 danger）', async ({ playground }) => {
  const table = playground.dataSection.getByRole('table')

  await expect(table.locator('.ui-badge').first()).toBeVisible()
  await expect(table.locator('.ui-badge--success').filter({ hasText: '启用' }).first()).toBeVisible()
  await expect(table.locator('.ui-badge--danger').filter({ hasText: '停用' })).toBeVisible()
})

/* ── Pagination ────────────────────────────────────────────── */

test('Pagination：翻页与「当前第 X / 9 页」文案联动，当前页携带 aria-current', async ({ playground }) => {
  const section = playground.dataSection
  const nav = section.getByRole('navigation', { name: '分页' })

  // 初始第 2 页（total 88 / pageSize 10 → 9 页）
  await expect(section.getByText('当前第 2 / 9 页')).toBeVisible()
  await expect(nav.getByRole('button', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page')

  await nav.getByRole('button', { name: '上一页' }).click()
  await expect(section.getByText('当前第 1 / 9 页')).toBeVisible()
  await expect(nav.getByRole('button', { name: '1', exact: true })).toHaveAttribute('aria-current', 'page')

  await nav.getByRole('button', { name: '下一页' }).click()
  await expect(section.getByText('当前第 2 / 9 页')).toBeVisible()
})

test('Pagination：边界页（第 1 / 9 页）上一页、下一页按钮 disabled 态', async ({ playground }) => {
  const section = playground.dataSection
  const nav = section.getByRole('navigation', { name: '分页' })
  const prev = nav.getByRole('button', { name: '上一页' })
  const next = nav.getByRole('button', { name: '下一页' })

  // 初始第 2 页：两侧均可用
  await expect(prev).toBeEnabled()
  await expect(next).toBeEnabled()

  // 首页：上一页 disabled、下一页可用
  await prev.click()
  await expect(section.getByText('当前第 1 / 9 页')).toBeVisible()
  await expect(prev).toBeDisabled()
  await expect(next).toBeEnabled()

  // 末页：下一页 disabled、上一页可用（直接点页码 9 跳转）
  await nav.getByRole('button', { name: '9', exact: true }).click()
  await expect(section.getByText('当前第 9 / 9 页')).toBeVisible()
  await expect(next).toBeDisabled()
  await expect(prev).toBeEnabled()
})

/* ── Progress ──────────────────────────────────────────────── */

test('Progress：确定态数值标签（42% / 70%）渲染，indeterminate 省略 aria-valuenow', async ({ playground }) => {
  const section = playground.dataSection
  const bars = section.getByRole('progressbar')

  await expect(bars).toHaveCount(3)
  // DOM 序：42%（md）→ 70%（sm）→ indeterminate
  await expect(bars.nth(0)).toHaveAttribute('aria-valuenow', '42')
  await expect(bars.nth(0)).toContainText('42%')
  await expect(bars.nth(1)).toHaveAttribute('aria-valuenow', '70')
  await expect(bars.nth(1)).toContainText('70%')
  // indeterminate 表示进度未知，按 ARIA 省略 aria-valuenow 且无数值标签
  await expect(bars.nth(2)).not.toHaveAttribute('aria-valuenow')
  await expect(bars.nth(2)).not.toContainText('%')
})

/* ── Skeleton ──────────────────────────────────────────────── */

test('Skeleton：line 三行占位与 circle / rect 形状渲染（aria-hidden 装饰冒烟）', async ({ playground }) => {
  const section = playground.dataSection

  await expect(section.locator('.ui-skeleton')).toHaveCount(3)
  await expect(section.locator('.ui-skeleton--line .ui-skeleton__line')).toHaveCount(3)
  await expect(section.locator('.ui-skeleton--circle')).toBeVisible()
  await expect(section.locator('.ui-skeleton--rect')).toBeVisible()
})

/* ── EmptyState ────────────────────────────────────────────── */

test('EmptyState：action「新建文档」触发 toast「已创建草稿（演示）」', async ({ page, playground }) => {
  const section = playground.dataSection
  const empty = section.locator('.ui-empty-state')

  await expect(empty).toContainText('暂无草稿')
  await empty.getByRole('button', { name: '新建文档', exact: true }).click()
  // toast 条目 Teleport 到 body，用 page 作用域断言
  await expect(page.getByText('已创建草稿（演示）')).toBeVisible()
})
