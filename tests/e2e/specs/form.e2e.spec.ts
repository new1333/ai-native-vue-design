import { test, expect } from '../fixtures'
import type { Locator } from '@playwright/test'

/**
 * Form / FormField · 两字段校验卡片（表单 Inputs 分区）：
 * 字段 姓名 / 邮箱；空值报「请输入姓名」/「请输入邮箱」；
 * 提交按钮文案「提交」（type=submit），pending 800ms 后 toast.success('表单提交成功')。
 */
const FORM_CARD_HEADER = 'Form / FormField · 两字段校验'

/** Form 演示卡片作用域：inputs 分区内按卡片头文字收窄，避免与其他卡片重名 */
function formCard(inputsSection: Locator): Locator {
  return inputsSection.locator('.ui-card', { hasText: FORM_CARD_HEADER })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('空提交：两条字段错误文案可见', async ({ playground }) => {
  const card = formCard(playground.inputsSection)

  await card.getByRole('button', { name: '提交', exact: true }).click()

  await expect(card.getByText('请输入姓名')).toBeVisible()
  await expect(card.getByText('请输入邮箱')).toBeVisible()
  // 语义契约：字段出错时控件带 aria-invalid（meta.accessibility 契约的持续验证）
  await expect(card.getByRole('textbox', { name: '姓名' })).toHaveAttribute('aria-invalid', 'true')
  await expect(card.getByRole('textbox', { name: '邮箱' })).toHaveAttribute('aria-invalid', 'true')
})

test('Enter 隐式提交：输入框聚焦时按 Enter 等价于点击提交', async ({ page, playground }) => {
  const card = formCard(playground.inputsSection)
  const submit = card.getByRole('button', { name: '提交', exact: true })

  await card.getByRole('textbox', { name: '姓名' }).fill('林晚照')
  await card.getByRole('textbox', { name: '邮箱' }).fill('you@example.com')
  await card.getByRole('textbox', { name: '邮箱' }).focus()

  // 真实按键：焦点在文本输入框内按 Enter，依赖原生 form 隐式提交语义
  await page.keyboard.press('Enter')

  // 等价于点击提交：按钮进入 loading 态（aria-busy），随后 success toast 出现
  await expect(submit).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByText('表单提交成功')).toBeVisible()
})

test('合法提交：按钮 loading 态出现，随后 success toast 出现', async ({ page, playground }) => {
  const card = formCard(playground.inputsSection)
  const submit = card.getByRole('button', { name: '提交', exact: true })

  await card.getByRole('textbox', { name: '姓名' }).fill('沈砚')
  await card.getByRole('textbox', { name: '邮箱' }).fill('shen@example.com')
  await submit.click()

  await expect(submit).toHaveAttribute('aria-busy', 'true')
  // Toast 渲染在页面级 ToastHost（body 下），不在 inputs 分区内，全局定位
  await expect(page.getByText('表单提交成功')).toBeVisible()
  await expect(page.locator('.ui-toast__item').first()).toBeVisible()
})
