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
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
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
