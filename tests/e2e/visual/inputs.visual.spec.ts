// 视觉回归基线 · 表单 Inputs（计划 §5.4 / 票 #10）。
// 覆盖 Form / Input / Textarea / Select / Checkbox / Radio / Switch 七张卡片。
// error / disabled / readonly / loading 态卡片内已有现成实例（Input error·禁用、
// Textarea error·禁用、Select 禁用·空选项、Radio 禁用、Switch 禁用·加载中），
// default 截图即覆盖；交互态叠加 hover / focus-visible（Input focus 双描边
// 缺陷正是 input-focus-visible 基线要兜底的目标）+ 表单校验 error 态。
import { test, expect } from '../fixtures/visual'

test.describe('Inputs 视觉基线', () => {
  test('七张卡片默认态（含 error / disabled / readonly / loading 现成实例）', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Form / FormField · 两字段校验'), 'form-default')
    await visual.expectSnapshot(visual.card('Input 输入框'), 'input-default')
    await visual.expectSnapshot(visual.card('Textarea 多行输入'), 'textarea-default')
    await visual.expectSnapshot(visual.card('Select 下拉选择（可交互）'), 'select-default')
    await visual.expectSnapshot(visual.card('Checkbox 复选框'), 'checkbox-default')
    await visual.expectSnapshot(visual.card('Radio / RadioGroup 单选'), 'radio-default')
    await visual.expectSnapshot(visual.card('Switch 开关'), 'switch-default')
  })

  test('Input / Select / Checkbox / Radio / Switch hover 态', async ({ visual }) => {
    await visual.goto()
    const inputCard = visual.card('Input 输入框')
    await visual.hover(inputCard.getByPlaceholder('默认输入框'))
    await visual.expectSnapshot(inputCard, 'input-hover')

    const selectCard = visual.card('Select 下拉选择（可交互）')
    await visual.hover(selectCard.getByRole('combobox').first())
    await visual.expectSnapshot(selectCard, 'select-hover')

    // Checkbox / Radio / Switch 根为 label，悬停其文案即悬停热区（:hover 冒泡到根）
    const checkboxCard = visual.card('Checkbox 复选框')
    await visual.hover(checkboxCard.getByText('默认选中', { exact: true }))
    await visual.expectSnapshot(checkboxCard, 'checkbox-hover')

    const radioCard = visual.card('Radio / RadioGroup 单选')
    await visual.hover(radioCard.getByText('专业版', { exact: true }))
    await visual.expectSnapshot(radioCard, 'radio-hover')

    const switchCard = visual.card('Switch 开关')
    await visual.hover(switchCard.getByRole('switch', { name: 'Wi-Fi（md）' }))
    await visual.expectSnapshot(switchCard, 'switch-hover')
  })

  test('全家族 focus-visible 态（真实键盘焦点环；input-focus-visible 兜底双描边缺陷）', async ({ visual }) => {
    await visual.goto()
    const formCard = visual.card('Form / FormField · 两字段校验')
    await visual.focusVisible(formCard.getByRole('textbox', { name: '姓名' }))
    await visual.expectSnapshot(formCard, 'form-focus-visible')

    const inputCard = visual.card('Input 输入框')
    await visual.focusVisible(inputCard.getByPlaceholder('默认输入框'))
    await visual.expectSnapshot(inputCard, 'input-focus-visible')

    const textareaCard = visual.card('Textarea 多行输入')
    await visual.focusVisible(textareaCard.getByPlaceholder('默认：可垂直拉伸'))
    await visual.expectSnapshot(textareaCard, 'textarea-focus-visible')

    const selectCard = visual.card('Select 下拉选择（可交互）')
    await visual.focusVisible(selectCard.getByRole('combobox').first())
    await visual.expectSnapshot(selectCard, 'select-focus-visible')

    const checkboxCard = visual.card('Checkbox 复选框')
    await visual.focusVisible(checkboxCard.getByRole('checkbox', { name: '默认选中' }))
    await visual.expectSnapshot(checkboxCard, 'checkbox-focus-visible')

    const radioCard = visual.card('Radio / RadioGroup 单选')
    await visual.focusVisible(radioCard.getByRole('radio', { name: '专业版' }))
    await visual.expectSnapshot(radioCard, 'radio-focus-visible')

    const switchCard = visual.card('Switch 开关')
    await visual.focusVisible(switchCard.getByRole('switch', { name: 'Wi-Fi（md）' }))
    await visual.expectSnapshot(switchCard, 'switch-focus-visible')
  })

  test('Select 打开态（Teleport 到 body 的 listbox 浮层本体）', async ({ visual }) => {
    await visual.goto()
    const selectCard = visual.card('Select 下拉选择（可交互）')
    await selectCard.getByRole('combobox').first().click()
    const listbox = visual.page.getByRole('listbox')
    await visual.expectSnapshot(listbox, 'select-open')
  })

  test('Form 校验 error 态（空提交后两字段错误文案 + error 输入框）', async ({ visual }) => {
    await visual.goto()
    const formCard = visual.card('Form / FormField · 两字段校验')
    await formCard.getByRole('button', { name: '提交', exact: true }).click()
    await expect(formCard).toContainText('请输入姓名')
    await expect(formCard).toContainText('请输入邮箱')
    await visual.expectSnapshot(formCard, 'form-error')
  })
})
