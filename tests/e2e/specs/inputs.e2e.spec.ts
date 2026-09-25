import { test, expect } from '../fixtures'
import type { Locator } from '@playwright/test'
import type { PlaygroundPage } from '../pages/playground.page'

/**
 * Inputs 家族 E2E：Input / Textarea / Checkbox / Radio / Switch（计划 §5.2）。
 * 定位规约（计划 §6.3）：getByRole 优先，无名控件（无 label / placeholder）按卡片
 * 收窄后使用 ui-* 类；Form / Select 卡片归兄弟任务，本文件不涉及。
 */

/** 分区内按卡片头文案收窄（各卡片头唯一，避免跨卡片重名控件） */
function card(playground: PlaygroundPage, header: string): Locator {
  return playground.inputsSection.locator('.play-card').filter({ hasText: header })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

// ─────────────────────── Input ───────────────────────

test('Input：clearable —— 输入后清空按钮出现，点击清空并归还焦点', async ({ playground }) => {
  const inputCard = card(playground, 'Input 输入框')
  // Input 无关联 label，可访问名回退到 placeholder（accName 回退链末端）
  const clearable = inputCard.getByRole('textbox', { name: '可清空 + 前缀图标' })
  const clearButton = inputCard.getByRole('button', { name: '清空', exact: true })

  // 空值时清空按钮不在 DOM（v-if）
  await expect(clearable).toHaveValue('')
  await expect(clearButton).toBeHidden()

  await clearable.fill('纸面设计')
  await expect(clearButton).toBeVisible()

  await clearButton.click()
  await expect(clearable).toHaveValue('')
  // 清空后焦点归还输入框：键盘用户可立即继续输入（真实浏览器焦点行为）
  await expect(clearable).toBeFocused()
  await expect(clearButton).toBeHidden()
})

test('Input：readonly 不可输入 / disabled 不可聚焦输入 / error 态 aria-invalid', async ({ page, playground }) => {
  const inputCard = card(playground, 'Input 输入框')

  // readonly：原生属性 + 真实按键序列不改变值（fill 会因不可编辑被拒，故用按键路径）
  const readonlyInput = inputCard.locator('.ui-input--readonly').getByRole('textbox')
  await expect(readonlyInput).toHaveValue('只读内容')
  await expect(readonlyInput).not.toBeEditable()
  await readonlyInput.pressSequentially('XYZ')
  await expect(readonlyInput).toHaveValue('只读内容')

  // error：aria-invalid 表达校验失败（危险描边属视觉态，归视觉回归票）
  const errorInput = inputCard.locator('.ui-input--error').getByRole('textbox')
  await expect(errorInput).toHaveValue('非法字符**')
  await expect(errorInput).toHaveAttribute('aria-invalid', 'true')

  // disabled：不可聚焦、点击与键盘输入均不落地
  const disabledInput = inputCard.getByRole('textbox', { name: '禁用状态' })
  await expect(disabledInput).toBeDisabled()

  // programmatic focus() 不夺取焦点：焦点保持在此前聚焦的可用输入框上（activeElement 不变）
  const defaultInput = inputCard.getByRole('textbox', { name: '默认输入框' })
  await defaultInput.focus()
  await expect(defaultInput).toBeFocused()
  await disabledInput.evaluate((el) => (el as HTMLInputElement).focus())
  await expect(disabledInput).not.toBeFocused()
  await expect(defaultInput).toBeFocused()

  // 点击后键盘输入不落地：force 跳过 Playwright 自身的 enabled 等待以模拟真实用户点击
  // （浏览器不向 disabled 表单控件派发事件，也不聚焦）
  await defaultInput.blur()
  await disabledInput.click({ force: true })
  await page.keyboard.type('abc')
  await expect(disabledInput).toHaveValue('')
  await expect(disabledInput).not.toBeFocused()
})

// ─────────────────────── Textarea ───────────────────────

test('Textarea：show-count 计数随输入更新，超 maxlength 输入被截断', async ({ playground }) => {
  const textareaCard = card(playground, 'Textarea 多行输入')
  // show-count 文案挂在容器（x/y 格式）；带计数器的 textarea 无 placeholder，按容器收窄
  const count = textareaCard.locator('.ui-textarea__count')
  const counted = textareaCard.locator('.ui-textarea:has(.ui-textarea__count)').getByRole('textbox')

  // 初值「纸面设计系统」= 6 字 → 6/120
  await expect(counted).toHaveValue('纸面设计系统')
  await expect(count).toHaveText('6/120')

  await counted.fill('一二三四五六七八')
  await expect(count).toHaveText('8/120')

  // 整段插入超长文本：浏览器编辑管线按原生 maxlength 截断在 120 字
  await counted.fill('超'.repeat(150))
  await expect(counted).toHaveValue('超'.repeat(120))
  await expect(count).toHaveText('120/120')

  // error 态：aria-invalid 表达校验失败
  await expect(textareaCard.locator('.ui-textarea--error').getByRole('textbox')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
})

// ─────────────────────── Checkbox ───────────────────────

test('Checkbox：半选态点击后变为选中且半选清除；Space 键盘切换', async ({ page, playground }) => {
  const checkboxCard = card(playground, 'Checkbox 复选框')
  const semi = checkboxCard.getByRole('checkbox', { name: '全选（半选演示：点击后清除半选）' })

  // 半选：未选中 + indeterminate DOM property。
  // 原生 checkbox 的该 property 即浏览器映射为 aria-checked="mixed" 的来源
  // （Playwright 1.48 的 getByRole 尚不支持 checked: 'mixed'，故断言等效 DOM property）
  await expect(semi).not.toBeChecked()
  await expect(semi).toHaveJSProperty('indeterminate', true)

  // 点击：变为选中且半选清除（联动回调清除 indeterminate）
  await semi.click()
  await expect(semi).toBeChecked()
  await expect(semi).toHaveJSProperty('indeterminate', false)

  // 键盘路径抽查：Space 切换普通勾选框（默认选中 → 取消）
  const plain = checkboxCard.getByRole('checkbox', { name: '默认选中' })
  await plain.focus()
  await expect(plain).toBeFocused()
  await page.keyboard.press('Space')
  await expect(plain).not.toBeChecked()
})

// ─────────────────────── Radio ───────────────────────

test('Radio：禁用项不可聚焦、点击与键盘均不可选中，方向键跳过禁用项轮转', async ({ page, playground }) => {
  const radioCard = card(playground, 'Radio / RadioGroup 单选')
  const pro = radioCard.getByRole('radio', { name: '专业版', exact: true })
  const disabledRadio = radioCard.getByRole('radio', { name: '旗舰版（禁用）', exact: true })

  // 初始选中专业版；联动文案显示原始值（当前选择：pro）
  await expect(pro).toBeChecked()
  await expect(radioCard.getByText('当前选择：pro')).toBeVisible()
  await expect(disabledRadio).toBeDisabled()

  // programmatic focus() 对 disabled 控件无效：焦点仍留在 body
  await disabledRadio.evaluate((el) => (el as HTMLInputElement).focus())
  await expect(disabledRadio).not.toBeFocused()
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY')

  // 点击（force 模拟真实点击；浏览器不向 disabled 表单控件派发事件）不可选中
  await disabledRadio.click({ force: true })
  await expect(disabledRadio).not.toBeChecked()
  await expect(radioCard.getByText('当前选择：pro')).toBeVisible()

  // 键盘：原生方向键轮转——↓ 专业版→团队版；再 ↓ 跳过禁用的旗舰版环绕到基础版
  await pro.focus()
  await expect(pro).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(radioCard.getByRole('radio', { name: '团队版', exact: true })).toBeChecked()
  await expect(radioCard.getByText('当前选择：team')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await expect(radioCard.getByRole('radio', { name: '基础版', exact: true })).toBeChecked()
  await expect(radioCard.getByText('当前选择：basic')).toBeVisible()
  await expect(disabledRadio).not.toBeChecked()
})

// ─────────────────────── Switch ───────────────────────

test('Switch：loading 态拦截点击与键盘切换', async ({ page, playground }) => {
  const switchCard = card(playground, 'Switch 开关')
  const loading = switchCard.getByRole('switch', { name: '加载中（拦截切换）' })

  // loading 不落原生 disabled：保持可聚焦，aria-busy 表达忙态，aria-checked 常驻 false
  await expect(loading).toBeEnabled()
  await expect(loading).toHaveAttribute('aria-checked', 'false')
  await expect(loading).toHaveAttribute('aria-busy', 'true')

  // 阳性对照：正常开关点击即切换（排除「点击未生效」的假阴性）
  const bt = switchCard.getByRole('switch', { name: '蓝牙（sm）' })
  await bt.click()
  await expect(bt).toHaveAttribute('aria-checked', 'true')

  // loading 拦截鼠标点击：状态保持关闭
  await loading.click()
  await expect(loading).toHaveAttribute('aria-checked', 'false')

  // loading 拦截键盘路径（真实按键序列：Space 激活 button）
  await loading.focus()
  await expect(loading).toBeFocused()
  await page.keyboard.press('Space')
  await expect(loading).toHaveAttribute('aria-checked', 'false')
})
