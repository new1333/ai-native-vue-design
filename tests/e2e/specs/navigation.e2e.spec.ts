import { test, expect } from '../fixtures'

// 「导航 Navigation」分区 Tabs 卡片（apps/playground/src/App.vue）：
// tabs 为 预览（初始选中）/ 源码 / 历史（禁用），联动文案「当前激活：{{ activeTab }}」。
// 组件契约（packages/components/src/tabs/）：
// - roving tabindex：仅激活 trigger 留在 Tab 序（不渲染 tabindex 属性），其余 trigger
//   一律 tabindex="-1"（含禁用项）；
// - tablist 键盘导航：←→↑↓ 在非 disabled trigger 间循环移动，移动即激活（select + focus）；
// - 面板仅渲染激活项（v-if），tabindex=0，位于 tablist 之后——是 tablist 最近的
//   Tab 序后继元素，用它双向遍历可确定性验证「Tab 进入 tabs 的落点」。

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Tabs：roving tabindex —— Tab 进入落在选中项，焦点随选中项移动', async ({ page, playground }) => {
  const section = playground.navigationSection
  const tablist = section.getByRole('tablist')
  const previewTab = tablist.getByRole('tab', { name: '预览', exact: true })
  const codeTab = tablist.getByRole('tab', { name: '源码', exact: true })
  const historyTab = tablist.getByRole('tab', { name: '历史（禁用）', exact: true })
  const panel = section.getByRole('tabpanel')

  // 初始「预览」选中：唯一留在 Tab 序；未选中（含禁用）tab 一律 tabindex=-1
  await expect(previewTab).toHaveAttribute('aria-selected', 'true')
  await expect(previewTab).not.toHaveAttribute('tabindex', '-1')
  await expect(codeTab).toHaveAttribute('tabindex', '-1')
  await expect(historyTab).toHaveAttribute('tabindex', '-1')

  // Tab 进入 tabs 的落点：面板（tablist 之后最近的 Tab 序元素）Shift+Tab 反向回到
  // tabs——焦点落在选中项「预览」，tabindex=-1 的「源码」「历史」被跳过
  await panel.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(previewTab).toBeFocused()

  // → 把选中移到「源码」：焦点随选中项移动（activeElement 即新选中 tab），
  // roving tabindex 落点同步转移
  await page.keyboard.press('ArrowRight')
  await expect(codeTab).toBeFocused()
  await expect(codeTab).toHaveAttribute('aria-selected', 'true')
  await expect(codeTab).not.toHaveAttribute('tabindex', '-1')
  await expect(previewTab).toHaveAttribute('tabindex', '-1')

  // 落点转移后再走一遍进入路径：从面板 Shift+Tab 落到新选中项「源码」；
  // 正向 Tab 从「源码」离开 tabs 进入面板（tabindex=-1 的「历史」被跳过）
  await panel.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(codeTab).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()
})

test('Tabs：← → 切换面板，面板内容与联动文案更新', async ({ page, playground }) => {
  const section = playground.navigationSection
  const tablist = section.getByRole('tablist')
  const previewTab = tablist.getByRole('tab', { name: '预览', exact: true })
  const codeTab = tablist.getByRole('tab', { name: '源码', exact: true })

  // 初始「预览」面板与联动文案
  await expect(section.getByRole('tabpanel')).toContainText('预览面板：渲染文档的成品视图')
  await expect(section).toContainText('当前激活：preview')

  // 真实按键序列：聚焦选中 tab 后按 →，切换到「源码」面板
  await previewTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(codeTab).toHaveAttribute('aria-selected', 'true')
  await expect(section.getByRole('tabpanel')).toContainText('源码面板：查看并编辑 Markdown 源码')
  await expect(section).toContainText('当前激活：code')

  // 反向 ← 切回「预览」面板
  await page.keyboard.press('ArrowLeft')
  await expect(previewTab).toHaveAttribute('aria-selected', 'true')
  await expect(section.getByRole('tabpanel')).toContainText('预览面板：渲染文档的成品视图')
  await expect(section).toContainText('当前激活：preview')
})

test('Tabs：禁用 tab 不可激活，键盘导航循环跳过', async ({ page, playground }) => {
  const section = playground.navigationSection
  const tablist = section.getByRole('tablist')
  const previewTab = tablist.getByRole('tab', { name: '预览', exact: true })
  const codeTab = tablist.getByRole('tab', { name: '源码', exact: true })
  const historyTab = tablist.getByRole('tab', { name: '历史（禁用）', exact: true })

  // 「历史（禁用）」：原生 disabled（不可聚焦 / 不可点击激活），不在 Tab 序
  await expect(historyTab).toBeDisabled()
  await expect(historyTab).toHaveAttribute('tabindex', '-1')

  // 键盘导航只在非 disabled trigger 间移动：「预览」→ 不落在「历史」而是「源码」
  await previewTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(codeTab).toBeFocused()

  // 「源码」→ 再按 → 循环回到「预览」，跳过「历史」
  await page.keyboard.press('ArrowRight')
  await expect(previewTab).toBeFocused()
  await expect(previewTab).toHaveAttribute('aria-selected', 'true')

  // 「预览」← 反向循环到「源码」，同样跳过「历史」；「历史」始终未被激活
  await page.keyboard.press('ArrowLeft')
  await expect(codeTab).toBeFocused()
  await expect(historyTab).toHaveAttribute('aria-selected', 'false')
  await expect(section).toContainText('当前激活：code')
})
