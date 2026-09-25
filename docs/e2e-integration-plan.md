# 「纸面 Paper」E2E 测试集成计划书

> 状态：草案（待评审） · 起草日期：2026-09-25 · 适用范围：本仓库 monorepo 全域
> 上游依据：《AI-native-Vue-Design-System-设计方案》§4.0（Browser/E2E → Playwright）、§27（6 维测试矩阵）；`docs/CONVENTIONS.md` §7（现有四类组件用例）

---

## 1. 背景与动机

### 1.1 现状

- 组件层测试已落地：`packages/components` 内每个组件有 api / behavior / a11y / ssr 四类 vitest 用例（happy-dom 环境）。
- **E2E 完全缺失**：无 Playwright/Cypress、无 CI、无视觉回归。仓库内 lockfile 中的 `playwright` 字样仅为 vitest 浏览器模式的可选 peer，实际未安装。
- 演示载体已具备：`apps/playground` 是覆盖全部 25 个组件、含丰富交互演示（表单校验、浮层、Toast、表格排序等）的单页应用，dev server 固定端口 5300。

### 1.2 为什么现有测试覆盖不到（以最近提交 a5478c2 为证据）

最近一次提交修复的问题，暴露了 happy-dom 组件测试的系统性盲区：

| 修复内容 | 缺陷类别 | happy-dom 为何抓不到 |
| --- | --- | --- |
| Input 聚焦「双描边」 | 视觉 / 布局 | 无真实布局与样式合成，computed style 断言不可信 |
| Progress 布局与响应式 | 视觉 / 布局 | 同上 |
| DropdownMenu 触发器单元素插槽（ARIA 属性与事件合并） | 真实 DOM 渲染 / 属性合并 | 测试环境 DOM 行为与浏览器存在差异 |
| Form Enter 隐式提交 | 真实表单 / 键盘集成 | 隐式提交依赖真实 form 语义与焦点位置 |
| Table 中文拼音排序 | 环境相关 Intl | 排序正确性依赖浏览器 ICU / Collator 环境 |
| Select / Button 行为补测 | 交互 | 补的是单测断言，但同类问题（浮层定位、真实焦点流转）仍无真浏览器验证 |

结论：**happy-dom 组件测试管「逻辑对不对」，管不了「真浏览器里对不对」**——浮层定位、焦点圈定与流转、真实键盘事件序列、图片加载失败回退、布局与视觉态、console 运行时错误。这些正是设计文档 §27 要求的 E2E + Visual 两个维度（目前 6 维中只落地了 4 维）。

---

## 2. 目标与非目标

### 2.1 目标

1. 建立 Playwright E2E 基础设施（workspace 包 + dev server 接入 + 根脚本），一条命令可跑。
2. 以 playground 为载体，为全部 25 个组件建立真浏览器用例：交互组件覆盖关键路径与**每条键盘路径**，静态组件纳入冒烟。
3. 接入 console / pageerror 守卫：Vue 运行时警告与未捕获错误使测试失败。
4. 接入 axe-core 真实页面无障碍扫描。
5. 建立视觉回归基线（截图对比），覆盖 focus-visible、hover 等视觉态——直接针对「双描边」这类缺陷。
6. 接入 CI（GitHub Actions），PR 门禁化。

### 2.2 非目标（明确不做）

- **不替代**组件四类 vitest 用例；props 矩阵、emits 细节仍归组件包。
- 不做性能 / Benchmark 维度（设计文档 §28，独立任务）。
- 不做 Nuxt SSR / hydration 集成测试（设计文档有规划，独立任务）。
- 不在本计划内重构 playground；仅允许为其补 `preview.port` 等最小配置。

---

## 3. 选型与结构决策

### 3.1 工具：Playwright（不做二选一评审）

设计文档 §4.0 / §27.1 已裁定 E2E 与 Visual 均用 Playwright。其内置能力恰好覆盖本项目痛点：`webServer` 直连 Vite dev server、trace/screenshot 失败产物、`toHaveScreenshot` 视觉对比、`page.clock` 时间伪造（Toast 自动关闭）、多浏览器项目矩阵。Cypress / WebdriverIO 不再评估。

**备选记录**：vitest browser mode（`@vitest/browser-playwright`）适合「组件级真浏览器单测」，作为 happy-dom 单测盲区的未来补充选项，不承担 E2E 编排职责，本计划不引入。

### 3.2 落位：新增 `tests/e2e` 工作区包

- `pnpm-workspace.yaml` 的 `packages` 增加 `'tests/*'`，新建 `tests/e2e`（包名 `@ui/e2e`，private）。
- 理由：对齐设计文档 §3 的目标结构（`tests/{unit,e2e,a11y,ssr,visual,...}`），并为后续 `tests/visual`、`tests/perf` 留位；放 `apps/e2e` 会污染「apps = 可运行应用」的语义。
- 该包**不依赖**任何 workspace 包（只打 URL），依赖最小化：`@playwright/test`、`@axe-core/playwright`（阶段 2 起）、`typescript` / `vue-tsc`（typecheck 对齐）。

### 3.3 被测目标与服务器策略

| 场景 | 启动方式 | 说明 |
| --- | --- | --- |
| 本地开发 | `pnpm -C apps/playground dev`（端口 5300） | 秒级启动，`reuseExistingServer` 复用已开的服务 |
| CI / 视觉回归 | `vite build && vite preview` | 产物确定性，顺带覆盖「生产构建路径」回归 |

- playground 的 `vite.config.ts` 需补 `preview.port: 5300`（当前只配了 `server.port`，为 Windows 端口保留区间问题特意固定，沿用同端口）。
- `playwright.config.ts` 用 `E2E_SERVER` 环境变量在两种 command 间切换，`url: 'http://localhost:5300'` 统一探测。

### 3.4 浏览器矩阵

- 阶段 1–2：仅 **chromium**（快速建立覆盖）。
- 阶段 3：加 **webkit**、**firefox** 项目；移动视口（`devices['iPhone 13']` 等）按需后置。

---

## 4. 分层职责划分（E2E 不越界）

| 层 | 工具 | 负责验证 | 明确不负责 |
| --- | --- | --- | --- |
| 组件单测（现有） | vitest + happy-dom | props 默认值 / emits / slots、组件内状态逻辑、renderToString SSR | 真实布局、定位、焦点、跨组件集成 |
| **E2E（本计划）** | Playwright | 真浏览器集成：浮层开合与定位、焦点圈定与流转、键盘全路径、图片 404 回退、Toast 计时、console 零错误 | props 矩阵、组件内部实现细节 |
| 视觉回归（阶段 3） | Playwright screenshots | 交互态视觉基线（default / hover / focus-visible / disabled / loading / error） | 行为逻辑判断 |
| a11y 机器扫描（阶段 2） | @axe-core/playwright | 真实页面 axe 规则零违例 | 键盘行为（归 E2E 用例） |
| Performance / Benchmark | — | 设计文档 §28，独立任务 | — |

**分工原则**：一个断言若 happy-dom 能可靠验证，就留在组件 spec；只有依赖真实浏览器能力的断言才进 E2E。E2E 用例数求「关键路径全、总数克制」，目标 chromium 单跑 < 90s。

---

## 5. 测试范围与用例清单

### 5.1 冒烟（阶段 0）

- 页面加载成功：7 个产品族分区（排版 / 通用 / 表单 / 数据 / 反馈 / 浮层 / 导航）h2 标题齐全。
- 25 个组件 `ui-*` 根类全部出现在 DOM（清单维护在页面对象内；后续可改为从 `registry/components.json` 派生，对齐 AI-native 方向）。
- console 无 error、无 Vue 警告、无 pageerror（守卫 fixture 默认启用）。

### 5.2 组件用例矩阵（P0 最近缺陷集中区 / P1 交互中等 / P2 静态为主冒烟）

| 优先级 | 组件 | E2E 关键断言（含键盘路径） |
| --- | --- | --- |
| **P0** | Form / FormField | 空提交→两条错误文案；Enter **隐式提交**；合法提交→按钮 loading→success toast |
| **P0** | Input | 输入后 clearable 按钮出现并清空；focus 单描边（视觉回归兜底）；readonly / disabled 态 |
| **P0** | Select | 点击开合 + `aria-expanded`；↑↓ 移动 active 项；Enter 选中回填；disabled 项不可选；clearable 清空；空选项集显示 empty-text |
| **P0** | Table | 评分列升 / 降序（断言首行数据）；**姓名列拼音排序**；loading 遮罩出现消失；状态列 Badge 渲染 |
| **P0** | Toast | 四变体触发；默认时长自动消失（`page.clock` 快进）；duration 0 常驻不消失；手动移除 |
| **P0** | Dialog | 打开后 `aria-modal`、焦点移入；**Tab 循环不出对话框**；Esc 关闭；确认→toast |
| **P0** | DropdownMenu | 触发器（Button 单元素插槽）上 `aria-haspopup` / `aria-expanded` 合并正确；↑↓ 导航；Enter 选中并回调；Esc 关闭；disabled 项不可点；点击外部关闭 |
| **P0** | Tooltip | **hover 显示** 与 **键盘聚焦显示** 两条路径；移开后消失 |
| **P1** | Tabs | roving tabindex（焦点随选中移动）；←→ 切换面板与联动文案 |
| **P1** | Checkbox | 半选态点击→选中且半选清除 |
| **P1** | Radio | 禁用项不可聚焦选中 |
| **P1** | Switch | loading 态拦截切换 |
| **P1** | Textarea | 输入后 show-count 计数正确；maxlength 截断 |
| **P1** | Pagination | 翻页→当前页文案联动；边界页按钮态 |
| **P1** | Alert | closable 关闭→「恢复」按钮出现→可恢复 |
| **P1** | Avatar | 正常图渲染；**404 图→首字母回退**（真实网络失败路径） |
| **P2** | Typography / Card / Divider / Badge / Skeleton / EmptyState / Progress / Button / IconButton | 冒烟：根类与关键内容渲染；EmptyState action→toast；Progress 数值标签；IconButton `aria-label` |

覆盖规则（对应 AGENTS.md「每条键盘路径必须有断言」的真浏览器延伸）：**浮层家族（Dialog / DropdownMenu / Select / Tabs / Tooltip）的每条键盘路径必须有 E2E 键盘断言**；其余组件键盘路径由组件 a11y spec 覆盖、E2E 抽查。

### 5.3 a11y 扫描（阶段 2）

`@axe-core/playwright` 按 7 个分区逐一扫描，断言 violations 为空；无法立即修复的违例登记豁免清单（tag + 原因 + issue 链接），禁止静默忽略。

### 5.4 视觉回归（阶段 3）

- 粒度：以 playground 卡片为单位的截图（每张 Card 一个 clip），叠加交互态（hover / focus-visible / disabled / loading）。
- 确定性：fixture 注入 `prefers-reduced-motion: reduce` 并覆盖 `--ui-motion-*` 为 0s；固定视口 1280×720；固定字体。
- 基线管理：基线在 **CI（Linux）** 生成并入库；本地更新用 `pnpm e2e:update-snapshots`（Playwright 快照名自带平台后缀，macOS 本地基线不用于 CI）。

---

## 6. 基础设施设计

### 6.1 目录结构

```text
tests/e2e/
├── package.json              # @ui/e2e：scripts = e2e / e2e:ui / e2e:report / e2e:update-snapshots / typecheck
├── tsconfig.json             # 继承 tsconfig.base.json
├── playwright.config.ts
├── fixtures/
│   └── index.ts              # 扩展 test：console/pageerror 守卫、reduced-motion、分区定位 helper
├── pages/
│   └── playground.page.ts    # 页面对象：7 个分区 locator（如 #family-overlay）+ 组件根类清单
├── specs/
│   ├── smoke.spec.ts
│   ├── form.e2e.spec.ts
│   ├── inputs.e2e.spec.ts        # Input / Textarea / Checkbox / Radio / Switch
│   ├── select.e2e.spec.ts
│   ├── table.e2e.spec.ts         # Table / Pagination / Progress / Skeleton / EmptyState
│   ├── feedback.e2e.spec.ts      # Alert / Toast / Avatar / Badge
│   ├── overlay.e2e.spec.ts       # Dialog / DropdownMenu / Tooltip
│   └── navigation.e2e.spec.ts    # Tabs
└── visual/                    # 阶段 3 新增：*.visual.spec.ts（对齐设计文档 27.2 命名）
```

命名：交互用例 `<family>.e2e.spec.ts`；视觉用例 `<family>.visual.spec.ts`；冒烟 `smoke.spec.ts`。

### 6.2 playwright.config.ts 骨架

```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 5300
const BASE_URL = `http://localhost:${PORT}`
const isCI = !!process.env.CI
// CI 用生产构建 + preview：确定性更强，且顺带覆盖构建路径回归
const command = process.env.E2E_SERVER === 'preview'
  ? 'pnpm -C apps/playground build && pnpm -C apps/playground preview'
  : 'pnpm -C apps/playground dev'

export default defineConfig({
  testDir: './specs',
  timeout: 15_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command,
    url: BASE_URL,
    cwd: '../..',                 # 仓库根执行
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
```

### 6.3 用例书写规约（E2E 版 CONVENTIONS，落地后回写文档）

1. **定位器优先级**：`getByRole` > `getByLabelText` / `getByText` > CSS `ui-*` 类；**禁用 `data-testid`**（语义定位本身即对 meta.accessibility 契约的持续验证）。选择器必须用分区 locator 收窄作用域，避免跨卡片重名。
2. **断言一律 web-first**（`expect(locator).toBeVisible()` 等）；**禁止 `waitForTimeout` 硬等待**。时间行为（Toast 自动关闭）用 `page.clock` 伪造。
3. 每文件顶部不设组件 props 矩阵——E2E 只测真实浏览器集成路径。
4. console / pageerror 守卫由共享 fixture 默认注入，违例即失败；确有预期错误（如 Avatar 404）在用例内显式豁免并注释原因。
5. 禁止为可测性给组件加测试专用 props / 类名；如需禁用动画等配合，一律走标准机制（`prefers-reduced-motion`、token 覆盖样式注入）。
6. 每条键盘路径用例以「真实按键序列」断言（`page.keyboard`），不断言中间实现细节。

### 6.4 用例风格示例

```ts
// specs/overlay.e2e.spec.ts（节选）
import { test, expect } from '../fixtures'

test('Dialog：焦点圈定在对话框内，Esc 关闭', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('#family-overlay')

  await section.getByRole('button', { name: '打开对话框' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
  await expect(dialog).toContainText(/取消|确认发布/)   // 焦点仍流转于对话框内控件

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
```

---

## 7. 分阶段实施（每阶段为一个可独立派发的任务，符合 AGENTS.md 工作流）

### 阶段 0：基建 + 冒烟（约 0.5 人日）

- 事项：`tests/e2e` 包与 workspace 注册；`playwright.config.ts`；playground 补 `preview.port`；根 `package.json` 增 `"e2e": "pnpm -C tests/e2e e2e"`；console 守卫 fixture；`smoke.spec.ts`。
- 验收：`pnpm install && pnpm e2e` 退出码 0；冒烟覆盖 7 分区 + 25 组件根类 + console 零错误；`pnpm typecheck` 仍全绿。

### 阶段 1：P0 高风险交互（约 1–1.5 人日）

- 事项：§5.2 中 8 个 P0 组件的用例（浮层四件套 + Form/Input + Select + Table/Toast）；键盘全路径断言。
- 验收：P0 用例全绿；每条浮层键盘路径有断言；chromium 单跑 < 90s。

### 阶段 2：P1/P2 补齐 + axe（约 1 人日）

- 事项：P1 / P2 全部用例；`@axe-core/playwright` 分区扫描；违例豁免清单（如有）。
- 验收：25 组件 E2E 覆盖清单（§5.2）全部勾销；axe 零违例或豁免已登记。

### 阶段 3：视觉回归 + 多浏览器 + CI（约 1–1.5 人日）

- 事项：visual specs 与 reduced-motion fixture；基线入库与更新脚本；webkit / firefox 项目；`.github/workflows/e2e.yml`（pnpm 缓存 + Playwright 浏览器缓存 + trace/截图产物上传 + 路径过滤：`packages/components/src/**`、`apps/playground/**`、`tests/e2e/**` 变更才跑）。
- 验收：PR 上 CI 全绿；基线可一条命令更新；失败产物（trace + 截图）可从 CI 下载。

---

## 8. 风险与对策

| 风险 | 对策 |
| --- | --- |
| Toast 计时 / 动画导致 flaky | `page.clock` 伪造时间；视觉断言前禁用动画（reduced-motion + token 覆盖） |
| 视觉基线跨平台差异 | 基线只在 CI（Linux）生成；Playwright 快照平台后缀天然隔离本地基线 |
| dev server 启动慢 / 端口冲突 | `webServer.url` 探测就绪；本地 `reuseExistingServer`；5300 已避开 Windows 保留区间 |
| 表格拼音排序依赖 ICU 环境 | Chromium 自带 ICU，CI 内一致；断言排序后首行姓名而非全量序 |
| Avatar 404 路径依赖 dev server 行为 | `/playground/missing-avatar.png` 为带扩展名的静态路径，dev / preview 均稳定 404（App.vue 已内建该演示） |
| `pnpm -r run test` 误拉起 E2E（无浏览器环境失败） | 包内脚本命名 `e2e` 而非 `test`，根 `test` 维持组件测试语义；CI 单独 job 跑 E2E |
| 用例漂移为「第二套单测」 | §4 分工原则写入规约；评审时删除 happy-dom 可验证的断言 |

---

## 9. 验收标准（整体 DoD）

1. `pnpm e2e` 与 `pnpm typecheck`、`pnpm -C packages/components test` 三者退出码 0。
2. §5.2 覆盖矩阵 25 组件全部落地；浮层家族键盘路径断言齐全。
3. console / pageerror 守卫默认生效；axe 扫描零违例（或豁免登记）。
4. CI 工作流在 PR 上运行并产出失败产物；视觉基线入库且有更新通道。
5. 规约沉淀：本计划 §6.3 回写进 `docs/CONVENTIONS.md`（新增「E2E 测试」一节）或独立 `tests/e2e/README.md`。

---

## 10. 与仓库协议（AGENTS.md）的适配说明

- 本计划属**基建任务**，允许变更：`pnpm-workspace.yaml`、根 `package.json`（仅增脚本）、`apps/playground/vite.config.ts`（仅 `preview.port`）、新增 `.github/`。**不触碰** `packages/components/src/index.ts` 与任何组件目录。
- 后续按阶段派发的 E2E 用例任务同样遵循「侦察 → 规约 → 样板 → 最小实现 → 确定性校验」流程；样板为 `tests/e2e` 既有 spec。
- E2E 包内定位/断言规约不与 CONVENTIONS §7 冲突（§7 只约束组件包内 vitest 用例）；落地后统一回写文档。
