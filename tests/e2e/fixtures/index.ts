import { test as base } from '@playwright/test'
import type { ConsoleMessage } from '@playwright/test'
import { PlaygroundPage } from '../pages/playground.page'

/** 单条守卫违例 */
interface GuardViolation {
  kind: 'console-error' | 'vue-warn' | 'pageerror'
  text: string
  url: string
}

/** 文本匹配模式：子串或正则 */
type TextPattern = string | RegExp

/**
 * console error 豁免器：
 * - 文本模式（子串 / 正则）按消息文本匹配；
 * - 谓词拿整个 ConsoleMessage，可按 msg.location().url 等上下文精确豁免
 *   （例如只放行 /playground/missing-avatar.png 这一个资源的加载失败）。
 */
type ConsoleErrorMatcher = TextPattern | ((msg: ConsoleMessage) => boolean)

function matchesText(text: string, patterns: readonly TextPattern[]): boolean {
  return patterns.some((pattern) => (typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text)))
}

/**
 * 默认豁免：网络层 404 资源加载失败。
 * 原因：浏览器对 /favicon.ico 的自动请求与 playground 中故意 404 的 Avatar 演示图
 * （/playground/missing-avatar.png）都会在 console 产生该类 error——它们是网络噪音 /
 * 演示数据，不是页面 JS 运行时缺陷；Avatar 的 404 → 首字母回退行为由专门用例验证。
 */
const RESOURCE_404_PATTERN = /Failed to load resource:.*\b404\b/

/** 每个用例一份的守卫状态：收集 console / pageerror，并维护用例内显式豁免 */
class ConsoleGuard {
  private readonly consoleMessages: ConsoleMessage[] = []
  private readonly pageErrors: Error[] = []
  private readonly consoleErrorExemptions: ConsoleErrorMatcher[] = []
  private readonly vueWarnExemptions: TextPattern[] = []
  private readonly pageErrorExemptions: TextPattern[] = []

  captureConsole(msg: ConsoleMessage): void {
    this.consoleMessages.push(msg)
  }

  capturePageError(err: Error): void {
    this.pageErrors.push(err)
  }

  /**
   * 豁免预期 console error（默认守卫外的唯一放行通道）。
   * 用法示例（Avatar 404 票）：被测路径若会产生 404 以外的预期资源错误，按 URL 精确豁免——
   *   consoleGuards.allowConsoleError(
   *     (msg) => msg.location().url.includes('/playground/missing-avatar.png'),
   *   )
   * 或按文本模式豁免：consoleGuards.allowConsoleError(/expected error text/)。
   */
  allowConsoleError(matcher: ConsoleErrorMatcher): void {
    this.consoleErrorExemptions.push(matcher)
  }

  /** 豁免预期 Vue 警告（如刻意触发的开发期告警），需注明具体警告片段 */
  allowVueWarn(pattern: TextPattern): void {
    this.vueWarnExemptions.push(pattern)
  }

  /** 豁免预期未捕获异常（如专门验证错误边界的用例） */
  allowPageError(pattern: TextPattern): void {
    this.pageErrorExemptions.push(pattern)
  }

  private isConsoleErrorExempt(msg: ConsoleMessage, text: string): boolean {
    if (RESOURCE_404_PATTERN.test(text)) return true
    return this.consoleErrorExemptions.some((matcher) =>
      typeof matcher === 'function' ? matcher(msg) : matchesText(text, [matcher]),
    )
  }

  /** 用例结束后汇总违例 */
  async violations(): Promise<GuardViolation[]> {
    const found: GuardViolation[] = []
    for (const msg of this.consoleMessages) {
      const text = await msg.text()
      const url = msg.location().url
      if (msg.type() === 'warning') {
        // Vue 运行时警告：console 类型为 warning 且文本含 [Vue warn]
        if (text.includes('[Vue warn]') && !matchesText(text, this.vueWarnExemptions)) {
          found.push({ kind: 'vue-warn', text, url })
        }
      } else if (msg.type() === 'error' && !this.isConsoleErrorExempt(msg, text)) {
        found.push({ kind: 'console-error', text, url })
      }
    }
    for (const err of this.pageErrors) {
      if (!matchesText(err.message, this.pageErrorExemptions)) {
        found.push({ kind: 'pageerror', text: `${err.name}: ${err.message}`, url: '' })
      }
    }
    return found
  }
}

export interface GuardFixtures {
  /**
   * 页面守卫（auto fixture，默认生效）：console error / pageerror / Vue 警告违例即用例失败。
   * 单个用例可通过 allowConsoleError / allowVueWarn / allowPageError 显式豁免预期错误。
   */
  consoleGuards: ConsoleGuard
  /** playground 页面对象：7 个分区 locator 与组件根类查询 */
  playground: PlaygroundPage
}

export const test = base.extend<GuardFixtures>({
  consoleGuards: [
    async ({}, use) => {
      const guard = new ConsoleGuard()
      await use(guard)
      const violations = await guard.violations()
      if (violations.length > 0) {
        const lines = violations.map((v) => `  - [${v.kind}] ${v.text}${v.url ? `（${v.url}）` : ''}`)
        throw new Error(
          `页面守卫发现 ${violations.length} 处违例（要求 console 零 error、零 [Vue warn]、零 pageerror）：\n${lines.join('\n')}`,
        )
      }
    },
    { auto: true },
  ],
  page: async ({ page, consoleGuards }, use) => {
    page.on('console', (msg) => consoleGuards.captureConsole(msg))
    page.on('pageerror', (err) => consoleGuards.capturePageError(err))
    await use(page)
  },
  playground: async ({ page }, use) => {
    await use(new PlaygroundPage(page))
  },
})

export { expect } from '@playwright/test'
