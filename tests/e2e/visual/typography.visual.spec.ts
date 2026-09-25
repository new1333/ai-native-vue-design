// 视觉回归基线 · 排版 Typography（计划 §5.4 / 票 #10）。
// 纯展示组件：仅 default 态，覆盖 Heading / Text 两张卡片（25 组件中的 typography）。
import { test } from '../fixtures/visual'

test.describe('Typography 视觉基线', () => {
  test('Heading / Text 卡片默认态', async ({ visual }) => {
    await visual.goto()
    await visual.expectSnapshot(visual.card('Heading 标题'), 'heading-default')
    await visual.expectSnapshot(visual.card('Text 正文'), 'text-default')
  })
})
