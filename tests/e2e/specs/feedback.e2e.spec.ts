/**
 * Feedback 家族 E2E —— Toast / Alert / Avatar / Badge（集成计划 §5.2 / §6.3）。
 *
 * - Toast 为程序式触发、Teleport 到 body：所有断言收窄在 role=region「通知」内；
 *   Alert 在 feedback 分区、Avatar / Badge 在 general 分区作用域内定位。
 * - Toast 计时行为用 page.clock 伪造（install 必须在导航之前，保证条目
 *   onMounted 起表时用的已是假 setTimeout；快进用 fastForward），禁止 waitForTimeout。
 * - 定位优先 getByRole；Badge 为无语义纯展示 span，按规约回退 ui-* 根类。
 */
import { test, expect } from '../fixtures'

test('Toast：四个变体均可触发并渲染', async ({ page, playground }) => {
  await page.goto('/')
  const section = playground.feedbackSection
  const region = page.getByRole('region', { name: '通知' })

  for (const variant of ['success', 'error', 'info', 'warning'] as const) {
    await section.getByRole('button', { name: variant, exact: true }).click()
    await expect(region.getByText(`这是一条 ${variant} 提示`)).toBeVisible()
  }
  // 默认 4000ms 内四条同时堆叠在宿主中
  await expect(region.locator('.ui-toast__item')).toHaveCount(4)

  // role 契约：error 需立即播报（role=alert），其余为 polite（role=status）
  await expect(region.getByRole('alert').filter({ hasText: '这是一条 error 提示' })).toBeVisible()
  await expect(region.getByRole('status').filter({ hasText: '这是一条 success 提示' })).toBeVisible()
})

test('Toast：默认时长到点自动关闭（page.clock 快进，无硬等待）', async ({ page, playground }) => {
  // 伪造 setTimeout / Date：必须在导航前安装，条目 onMounted 起表才是假计时器
  await page.clock.install()
  await page.goto('/')

  const section = playground.feedbackSection
  const region = page.getByRole('region', { name: '通知' })

  await section.getByRole('button', { name: 'success', exact: true }).click()
  const message = region.getByText('这是一条 success 提示')
  await expect(message).toBeVisible()

  // 快进 5s（默认 duration = 4000ms）：到期计时器触发移除，条目卸载
  await page.clock.fastForward(5000)
  await expect(message).toBeHidden()
})

test('Toast：duration 0 常驻不自动关闭，「立即移除」后消失', async ({ page, playground }) => {
  await page.clock.install()
  await page.goto('/')

  const section = playground.feedbackSection
  const region = page.getByRole('region', { name: '通知' })

  await section.getByRole('button', { name: '常驻提示（duration 0）' }).click()
  const sticky = region.getByText('常驻提示：不会自动关闭')
  await expect(sticky).toBeVisible()

  // 快进远超默认 4000ms：duration ≤ 0 不起表，条目仍常驻
  await page.clock.fastForward(20_000)
  await expect(sticky).toBeVisible()

  await section.getByRole('button', { name: '立即移除', exact: true }).click()
  await expect(sticky).toBeHidden()
})

test('Toast：条目关闭按钮可手动移除', async ({ page, playground }) => {
  await page.goto('/')
  const section = playground.feedbackSection
  const region = page.getByRole('region', { name: '通知' })

  await section.getByRole('button', { name: 'info', exact: true }).click()
  const message = region.getByText('这是一条 info 提示')
  await expect(message).toBeVisible()

  // 条目自带关闭按钮（aria-label=关闭通知），与超时共用同一条移除路径
  await region.getByRole('button', { name: '关闭通知' }).click()
  await expect(message).toBeHidden()
})

test('Alert：warning closable 关闭后出现「恢复可关闭警告」，点击恢复', async ({ page, playground }) => {
  await page.goto('/')
  const section = playground.feedbackSection

  // 四条 Alert 均渲染；danger 契约为 role=alert（其余 severity 为 status）
  for (const title of ['已开启自动保存', '文档已同步', '网络连接中断', '有 2 位协作者正在编辑']) {
    await expect(section.getByText(title)).toBeVisible()
  }
  await expect(section.getByRole('alert')).toContainText('网络连接中断')

  const warning = section.getByRole('status').filter({ hasText: '有 2 位协作者正在编辑' })
  await warning.getByRole('button', { name: '关闭', exact: true }).click()

  await expect(warning).toBeHidden()
  const restore = section.getByRole('button', { name: '恢复可关闭警告' })
  await expect(restore).toBeVisible()
  await restore.click()
  await expect(
    section.getByRole('status').filter({ hasText: '有 2 位协作者正在编辑' }),
  ).toBeVisible()
})

test('Avatar：文字与图片头像正常渲染（真实图片已解码）', async ({ page, playground }) => {
  await page.goto('/')
  const section = playground.generalSection

  // 纯文字头像（无 src）：首字母回退态，根元素 role=img 以 alt 命名
  for (const alt of ['林晚照的头像', '沈砚的头像', '顾清桐的头像']) {
    await expect(section.getByRole('img', { name: alt })).toBeVisible()
  }

  // data URI 图片头像：img 元素可见，且真实浏览器解码成功（naturalWidth > 0）
  const photo = section.getByRole('img', { name: '王英的头像' })
  await expect(photo).toBeVisible()
  await expect(photo).toHaveAttribute('src', /^data:image\//)
  await expect
    .poll(async () => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0)
})

test('Avatar：404 图片回退首字母（真实网络失败路径）', async ({ page, playground, consoleGuards }) => {
  // 预期失败资源：赵芸头像指向故意 404 的 /playground/missing-avatar.png（App.vue 内建演示）。
  // 「Failed to load resource: 404」类资源错误守卫已默认豁免；此处再按 URL 精确豁免该
  // 资源可能产生的其他加载期 console error（如加载中断），不放过任何无关运行时错误。
  consoleGuards.allowConsoleError(
    (msg) => msg.location().url.includes('/playground/missing-avatar.png'),
  )

  await page.goto('/')
  const section = playground.generalSection

  // 失败后根元素转入回退态：role=img + aria-label（alt），内部 img 已卸载
  const failed = section.getByRole('img', { name: '头像加载失败回退首字母' })
  await expect(failed).toBeVisible()
  // 首字母推导：赵芸（无空格单词）→ 赵
  await expect(failed.locator('.ui-avatar__fallback')).toHaveText('赵')
})

test('Badge：根类与内容冒烟（变体 + dot 形态）', async ({ page, playground }) => {
  await page.goto('/')
  const section = playground.generalSection

  // 五个变体的文案与 ui-badge--* 修饰类
  for (const variant of ['neutral', 'success', 'warning', 'danger', 'info'] as const) {
    const badge = section.locator('.ui-badge', { hasText: variant })
    await expect(badge).toBeVisible()
    await expect(badge).toHaveClass(new RegExp(`ui-badge--${variant}`))
  }

  // dot 形态：文案可见，且装饰小圆点挂载（aria-hidden，仅查 DOM）
  for (const label of ['在线', '待审核', '已过期']) {
    await expect(section.getByText(label, { exact: true })).toBeVisible()
  }
  const dotted = section.locator('.ui-badge', { hasText: '在线' })
  await expect(dotted.locator('.ui-badge__dot')).toBeAttached()
})
