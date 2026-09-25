import { test, expect } from '../fixtures'
import type { Locator } from '@playwright/test'
import type { PlaygroundPage } from '../pages/playground.page'

/**
 * Select 下拉选择 E2E（计划 §5.2 P0 / §6.3 规约）。
 *
 * 载体：playground「表单 Inputs」分区「Select 下拉选择（可交互）」卡片——
 * 可交互 Select（placeholder「选择部门」，clearable；选项 产品/工程/设计/运营（不可选，disabled））
 * + 联动文案「当前选择：{value}」（注意回填的是 value 而非 label）
 * + 整只禁用 Select（选中值 design，触发器显示「设计」）+ 空选项集 Select。
 *
 * 定位说明（分区内共 3 个 combobox，一律以「inputs 分区 + 卡片标题」双重收窄）：
 * - 弹层 Teleport 到 body，listbox / option / 清空按钮以全局 role 定位（同一时刻只有一个弹层打开）；
 * - 触发器不能用 getByRole('combobox', { name })：ARIA 规范中 combobox 为 name-from-author
 *   （不从内容取名），组件触发器未设 aria-label，Playwright role 引擎计算出的可访问名为空
 *   （实测任何 name 匹配均为 0 命中）。故按 App.vue 源序以 .ui-select 根 + 触发器类定位，
 *   并先用 toHaveText 锁定占位文案证位。该命名缺口已在任务结果中如实上报。
 *
 * 断言以源码真实 DOM 契约为准：active 高亮 = 触发器 aria-activedescendant（`…-option-{index}`）
 * + 选项 ui-select__option--active 类；键盘状态机（↓/↑/Home/End/Enter/Space/Esc）见 useSelect.ts。
 */

/** Select 卡片作用域：inputs 分区 + 卡片标题双重收窄（分区内共 3 个 combobox） */
function selectCard(playground: PlaygroundPage): Locator {
  return playground.inputsSection.locator('.ui-card', { hasText: 'Select 下拉选择（可交互）' })
}

/** 卡片内 3 个 Select 根（App.vue 源序）：nth(0) 可交互 / nth(1) 整只禁用 / nth(2) 空选项集 */
function selectRoot(card: Locator, index: 0 | 1 | 2): Locator {
  return card.locator('.ui-select').nth(index)
}

function triggerOf(root: Locator): Locator {
  return root.locator('.ui-select__trigger')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Select：点击触发器开合弹层，aria-expanded 双向翻转', async ({ page, playground }) => {
  const card = selectCard(playground)
  const trigger = triggerOf(selectRoot(card, 0))
  const listbox = page.getByRole('listbox')

  // 占位文案证位（可交互 Select；联动文案初始为未选择）
  await expect(trigger).toHaveText('选择部门')
  await expect(card.getByText('当前选择：未选择')).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(listbox).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  for (const name of ['产品', '工程', '设计', '运营（不可选）']) {
    await expect(page.getByRole('option', { name, exact: true })).toBeVisible()
  }

  // 再次点击触发器关闭：弹层 Teleport v-if 卸载（脱离 DOM 即隐藏）
  await trigger.click()
  await expect(listbox).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('Select：打开后 ↑↓ 移动 active 项，Enter 选中并回填触发器与联动文案', async ({
  page,
  playground,
}) => {
  const card = selectCard(playground)
  const trigger = triggerOf(selectRoot(card, 0))
  const optionProduct = page.getByRole('option', { name: '产品', exact: true })
  const optionEngineering = page.getByRole('option', { name: '工程', exact: true })
  const optionDesign = page.getByRole('option', { name: '设计', exact: true })

  await trigger.click()
  // 打开落位：首个可选选项（产品）即 active，触发器 aria-activedescendant 指向它（option-0）
  await expect(optionProduct).toHaveClass(/ui-select__option--active/)
  await expect(trigger).toHaveAttribute('aria-activedescendant', /-option-0$/)

  // ↓：产品 → 工程
  await page.keyboard.press('ArrowDown')
  await expect(optionEngineering).toHaveClass(/ui-select__option--active/)
  await expect(trigger).toHaveAttribute('aria-activedescendant', /-option-1$/)

  // ↓：工程 → 设计
  await page.keyboard.press('ArrowDown')
  await expect(optionDesign).toHaveClass(/ui-select__option--active/)

  // ↑：设计 → 回到工程
  await page.keyboard.press('ArrowUp')
  await expect(optionEngineering).toHaveClass(/ui-select__option--active/)
  await expect(optionDesign).not.toHaveClass(/ui-select__option--active/)

  // Enter 选中当前 active（工程）：弹层关闭、触发器回填 label、联动文案回填 value
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(trigger).toHaveText('工程')
  await expect(card.getByText('当前选择：engineering')).toBeVisible()
})

test('Select：disabled 选项鼠标点击不可选中，触发器与联动文案不变', async ({
  page,
  playground,
}) => {
  const card = selectCard(playground)
  const trigger = triggerOf(selectRoot(card, 0))
  await trigger.click()

  const disabledOption = page.getByRole('option', { name: '运营（不可选）', exact: true })
  await expect(disabledOption).toHaveAttribute('aria-disabled', 'true')

  // 点击 disabled 选项：不选中、弹层保持打开（select 对 disabled 选项直接忽略）。
  // 该选项带 aria-disabled="true"，Playwright 可点性检查会拒绝普通 click，
  // 以 force 越过检查发出真实指针序列——验证的正是组件自身对 disabled 点击的拦截。
  await disabledOption.click({ force: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveText('选择部门')
  await expect(card.getByText('当前选择：未选择')).toBeVisible()

  // Esc 关闭收尾
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('Select：disabled 选项键盘路径不可达（导航跳过并夹住），Enter 不会选中它', async ({
  page,
  playground,
}) => {
  const card = selectCard(playground)
  const trigger = triggerOf(selectRoot(card, 0))
  const disabledOption = page.getByRole('option', { name: '运营（不可选）', exact: true })
  const optionDesign = page.getByRole('option', { name: '设计', exact: true })

  // ↑ 打开：落位末个「可选」选项（设计）——键盘导航只在可选集合内移动，直接跳过 disabled 的运营
  await trigger.focus()
  await page.keyboard.press('ArrowUp')
  await expect(optionDesign).toHaveClass(/ui-select__option--active/)
  await expect(disabledOption).not.toHaveClass(/ui-select__option--active/)

  // 末尾继续 ↓：两端夹住，不落到 disabled 项；aria-activedescendant 永不指向它（option-3）
  await page.keyboard.press('ArrowDown')
  await expect(optionDesign).toHaveClass(/ui-select__option--active/)
  await expect(disabledOption).not.toHaveClass(/ui-select__option--active/)
  await expect(trigger).not.toHaveAttribute('aria-activedescendant', /-option-3$/)

  // Enter 只作用于当前可选高亮项（设计）：选中合法项而非 disabled 项
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(trigger).toHaveText('设计')
  await expect(card.getByText('当前选择：design')).toBeVisible()
})

test('Select：clearable 选中后出现清空按钮，清空后回退占位与联动文案', async ({
  page,
  playground,
}) => {
  const card = selectCard(playground)
  const trigger = triggerOf(selectRoot(card, 0))
  const clearButton = card.getByRole('button', { name: '清空', exact: true })

  // 无已选值时不出清空按钮
  await expect(clearButton).toBeHidden()

  // 鼠标选中「产品」（value = product，联动文案回填 value）
  await trigger.click()
  await page.getByRole('option', { name: '产品', exact: true }).click()
  await expect(trigger).toHaveText('产品')
  await expect(card.getByText('当前选择：product')).toBeVisible()
  await expect(clearButton).toBeVisible()

  // 清空：触发器回占位、联动回「未选择」、清空按钮消失
  await clearButton.click()
  await expect(trigger).toHaveText('选择部门')
  await expect(card.getByText('当前选择：未选择')).toBeVisible()
  await expect(clearButton).toBeHidden()
})

test('Select：空选项集打开显示 empty-text 且无选项；整只禁用 Select 不可交互', async ({
  page,
  playground,
}) => {
  const card = selectCard(playground)

  // 空选项集 Select（占位文案「空选项集」，empty-text「暂无可选项」）
  const emptyTrigger = triggerOf(selectRoot(card, 2))
  await expect(emptyTrigger).toHaveText('空选项集')
  await emptyTrigger.click()
  const listbox = page.getByRole('listbox')
  await expect(emptyTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox).toBeVisible()
  await expect(listbox).toContainText('暂无可选项')
  await expect(listbox.getByRole('option')).toHaveCount(0)

  // 整只禁用 Select（选中值 design → 触发器显示「设计」）：原生 disabled，不可打开
  const disabledTrigger = triggerOf(selectRoot(card, 1))
  await expect(disabledTrigger).toHaveText('设计')
  await expect(disabledTrigger).toBeDisabled()
  await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false')
})
