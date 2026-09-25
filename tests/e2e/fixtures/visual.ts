import { test as guardedTest, expect } from './index'
import type { Locator, Page } from '@playwright/test'

/**
 * 视觉回归专用 fixture（计划 §5.4 / 票 #10）。
 *
 * 在共享守卫 fixture（console / pageerror / Vue 警告 + playground）之上叠加确定性环境，
 * 保证「同平台、同 server 模式」两次运行像素级零 diff：
 * - prefers-reduced-motion: reduce（emulateMedia，标准机制）
 * - 全部 --ui-motion-* token 覆盖为 0s（页面脚本运行前注入 <style>，标准 token 覆盖；
 *   不给组件加任何测试专用 props / 类名）
 * - 固定视口 1280×720、固定亮色配色（见文件底部 test.use）
 *
 * 字体策略（决策记录）：不覆盖 font-family。token 字体栈
 * （'Noto Sans SC', system-ui, sans-serif）不含 webfont，playground 也未引入任何
 * @font-face / 字体 CDN，全部命中本机系统字体；同机同浏览器渲染位图恒定，
 * 强行覆盖反而会让基线偏离真实视觉。
 */
export const MOTION_TOKENS_OFF_CSS =
  ':root{--ui-motion-fast:0ms !important;--ui-motion-default:0ms !important;}'

/** 视觉基线操作收口：导航、卡片定位、截图断言、键盘焦点态 */
export class VisualBaseline {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** 导航到 playground 并等待确定性就绪（字体 / 图片 / 双 rAF） */
  async goto(): Promise<void> {
    await this.page.goto('/')
    // toHaveScreenshot 不等待字体与图片解码：data-URI 头像与 404 图的
    // 完成时机必须显式收敛，否则首帧截图可能缺图。
    await this.page.evaluate(() => {
      const settleImage = (img: HTMLImageElement): Promise<void> =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
      return Promise.all([
        document.fonts.ready.then(() => undefined),
        ...Array.from(document.images).map(settleImage),
      ])
    })
    // 双 rAF：等 Vue 挂载后的首帧布局彻底落定
    await this.page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    )
  }

  /**
   * playground 卡片定位：以 CardHeader 文案为锚（27 张卡的头部文案互不为子串），
   * 返回整张 .play-card，作为截图对象（每张 Card 一个基线）。
   */
  card(header: string): Locator {
    return this.page
      .locator('.play-card')
      .filter({ has: this.page.locator('.ui-card__header', { hasText: header }) })
  }

  /** 截图基线断言（卡片元素或浮层元素均可） */
  async expectSnapshot(target: Locator, name: string): Promise<void> {
    await expect(target).toHaveScreenshot(`${name}.png`)
  }

  /** 悬停交互态：指针移到目标上（保持悬停直到截图完成） */
  async hover(target: Locator): Promise<void> {
    await target.hover()
  }

  /**
   * 断言目标当前处于真实键盘焦点（:focus-visible 匹配）。
   * 供「按键序列已经把焦点放到目标上」的场景使用（如 ↓ 打开菜单聚焦首项）。
   */
  async assertFocusVisible(target: Locator): Promise<void> {
    const focused = await target.evaluate(
      (el) => el === document.activeElement && el.matches(':focus-visible'),
    )
    if (!focused) {
      throw new Error(
        '目标元素未进入 :focus-visible（键盘模态未生效或焦点不在目标上），' +
          '截图会丢失焦点环——这是 focus-visible 基线的兜底断言，禁止跳过。',
      )
    }
  }

  /**
   * 键盘焦点交互态：element.focus() 在 Chromium 通常不触发 :focus-visible，
   * 这里先按一次真实 Tab 键让焦点启发式进入键盘模态，再聚焦目标——
   * 得到与「Tab 一路到达」完全相同的最终状态，随后断言 :focus-visible 真实生效。
   */
  async focusVisible(target: Locator): Promise<void> {
    await this.page.keyboard.press('Tab')
    await target.focus()
    await this.assertFocusVisible(target)
  }
}

export interface VisualFixtures {
  /** 视觉回归页面对象：确定性导航 + 截图基线断言 + 交互态 helper */
  visual: VisualBaseline
}

export const test = guardedTest.extend<VisualFixtures>({
  visual: async ({ page }, use) => {
    // 1) 标准机制停用动效：paper.css 的 token 归零分支与组件自身的
    //    @media 停用分支（skeleton shimmer / progress 扫描 / toast 入场）立即生效
    await page.emulateMedia({ reducedMotion: 'reduce' })
    // 2) token 级归零保险：任何尚未接入 prefers-reduced-motion 分支的动效，
    //    只要消费 --ui-motion-* 就会被压成 0s（!important 抵御注入顺序早于 head 内样式）。
    //    init script 执行时 documentElement 可能尚未解析（null.appendChild 即 pageerror），
    //    因此等 DOMContentLoaded 后再落 <style>（截图远晚于该时机，不影响确定性）。
    await page.addInitScript(
      (css) => {
        const inject = (): void => {
          const style = document.createElement('style')
          style.setAttribute('data-e2e-visual', 'motion-off')
          style.textContent = css
          ;(document.head || document.documentElement).appendChild(style)
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', inject, { once: true })
        } else {
          inject()
        }
      },
      MOTION_TOKENS_OFF_CSS,
    )
    await use(new VisualBaseline(page))
  },
})

// 视觉基线统一视口与配色（colorScheme 影响 --ui-* 亮暗 token，显式钉死）
test.use({ viewport: { width: 1280, height: 720 }, colorScheme: 'light' })

export { expect }
