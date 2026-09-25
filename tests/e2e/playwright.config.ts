import { defineConfig, devices } from '@playwright/test'

const PORT = 5300
const BASE_URL = `http://localhost:${PORT}`
const isCI = Boolean(process.env.CI)

// E2E_SERVER=preview：生产构建 + vite preview（CI / 视觉回归用，产物确定性，顺带覆盖构建路径回归）；
// 默认 dev：本地秒级启动，且 reuseExistingServer 可复用手工开启的服务。
const command =
  process.env.E2E_SERVER === 'preview'
    ? 'pnpm -C apps/playground build && pnpm -C apps/playground preview'
    : 'pnpm -C apps/playground dev'

export default defineConfig({
  // testDir 留在包根，用 testMatch 同时圈定 specs/ 与（阶段 3 的）visual/ 目录。
  testDir: '.',
  testMatch: ['specs/**/*.spec.ts', 'visual/**/*.visual.spec.ts'],
  timeout: 15_000,
  // 视觉回归（visual/）截图确定性选项（1.48 起这三项即匹配器默认值，显式声明便于阅读）：
  // - animations: 'disabled' —— 截图瞬间停用 CSS 动画/过渡（无限动画取消回初始态）；
  // - caret: 'hide' —— 隐藏输入光标，focus-visible 截图不受光标闪烁相位影响；
  // - 快照目录用 Playwright 默认模板 {testFileDir}/{testFileName}-snapshots/，
  //   文件名自带平台后缀（如 -darwin），macOS 本地基线与 CI(Linux) 基线天然隔离。
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    // 失败保留 trace 与截图，便于离线诊断
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command,
    url: BASE_URL,
    cwd: '../..', // 相对配置文件目录（tests/e2e）回到仓库根执行
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
