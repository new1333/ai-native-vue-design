# tests/e2e —— Playwright E2E 规约（@ui/e2e）

本包承载组件库在**真实浏览器**中的集成验证：交互 E2E、axe 无障碍扫描、视觉回归基线。规约源自 [docs/e2e-integration-plan.md](../../docs/e2e-integration-plan.md) §4 / §6.3，经任务 01–12 全量实践后定稿；**与计划草案有出入处一律以本文件（实际落地）为准**，出入点均已逐条注明。组件包内的 vitest 用例规约见 [docs/CONVENTIONS.md](../../docs/CONVENTIONS.md) §7，两者互引、互不越界。

## 1. 分层职责（E2E 不越界）

| 层 | 工具 | 负责验证 | 明确不负责 |
| --- | --- | --- | --- |
| 组件单测 | vitest + happy-dom（`packages/components`，见 CONVENTIONS §7） | props 默认值 / emits / slots、组件内状态逻辑、renderToString SSR | 真实布局、定位、焦点、跨组件集成 |
| 交互 E2E | Playwright（本包 `specs/`） | 真浏览器集成：浮层开合与定位、焦点圈定与流转、键盘全路径、图片 404 回退、Toast 计时、console 零错误 | props 矩阵、组件内部实现细节 |
| 视觉回归 | Playwright screenshots（本包 `visual/`） | 交互态视觉基线（default / hover / focus-visible / disabled / loading / error / open） | 行为逻辑判断 |
| a11y 机器扫描 | @axe-core/playwright（本包 `specs/a11y.spec.ts`） | 真实页面 axe 规则零违例（含 best-practice 全量口径） | 键盘行为（归 E2E 用例） |

**分工原则**：一个断言若 happy-dom 能可靠验证，就留在组件 spec；只有依赖真实浏览器能力的断言才进 E2E。E2E 用例数求「关键路径全、总数克制」。

## 2. 目录结构（实际落地）

```text
tests/e2e/
├── package.json              # @ui/e2e（private，不依赖任何 workspace 包，只打 URL）
├── tsconfig.json             # 继承 tsconfig.base.json
├── playwright.config.ts      # chromium 单项目；E2E_SERVER 切换 webServer；快照确定性选项
├── fixtures/
│   ├── index.ts              # 守卫 fixture：console error / [Vue warn] / pageerror 违例即失败（auto）；豁免 API
│   └── visual.ts             # 视觉确定性 fixture：reduced-motion + --ui-motion-* 归零 + 1280×720 + settle
├── pages/
│   └── playground.page.ts    # 页面对象：7 个分区 locator + 25 组件 ui-* 根类清单
├── specs/                    # 冒烟 + 7 个家族交互 spec + axe 扫描
│   ├── smoke.spec.ts
│   ├── form.e2e.spec.ts      # Form / FormField
│   ├── inputs.e2e.spec.ts    # Input / Textarea / Checkbox / Radio / Switch
│   ├── select.e2e.spec.ts
│   ├── table.e2e.spec.ts     # Table / Pagination / Progress / Skeleton / EmptyState
│   ├── feedback.e2e.spec.ts  # Alert / Toast / Avatar / Badge
│   ├── overlay.e2e.spec.ts   # Dialog / DropdownMenu / Tooltip
│   ├── navigation.e2e.spec.ts# Tabs
│   └── a11y.spec.ts          # axe 分区扫描 + 豁免登记（含过期检测）
└── visual/                   # 7 个 *.visual.spec.ts 与 <spec 文件名>-snapshots/ 基线目录
```

命名：交互用例 `<family>.e2e.spec.ts`；视觉用例 `<family>.visual.spec.ts`；冒烟 `smoke.spec.ts`；axe 扫描 `a11y.spec.ts`。`playwright.config.ts` 的 `testMatch` 圈定 `specs/**/*.spec.ts` 与 `visual/**/*.visual.spec.ts` 两个目录。

**页面对象维护纪律**：`pages/playground.page.ts` 中的 `COMPONENT_ROOT_CLASSES` 逐一镜像 `packages/components/src/<dir>/` 各 SFC 根元素的 `ui-*` class（含复合子组件；冒烟断言恰好 25 个目录，防漂移）。**组件根类变更时必须同步维护该清单**。浮层类（`ui-dialog` / `ui-tooltip` / `ui-toast__item`）Teleport + 按需挂载，不在初始 DOM，由 overlay / feedback 用例交互后单独断言（`INTERACTION_GATED_ROOT_CLASSES`）。

## 3. 常用命令

```bash
pnpm install                                   # 首次：安装依赖
pnpm -C tests/e2e exec playwright install chromium   # 首次：安装浏览器二进制

pnpm e2e                                       # 跑全部（dev server 自动拉起，复用已开服务）
pnpm e2e specs/overlay.e2e.spec.ts             # 只跑一个文件（文件名作过滤器）
pnpm -C tests/e2e e2e --project=chromium visual # 只跑 visual/ 目录（CI 基线生成步同款）
E2E_SERVER=preview pnpm e2e                    # 生产构建 + vite preview（CI 同款；产物确定性更强）
pnpm e2e:update-snapshots                      # 本地更新视觉基线（--update-snapshots）
pnpm -C tests/e2e e2e:ui                       # Playwright UI 模式（仅包内脚本）
pnpm -C tests/e2e e2e:report                   # 打开 HTML 报告
pnpm -C tests/e2e typecheck                    # tsc --noEmit（根 pnpm typecheck 亦会带上）
```

**服务器策略**：`playwright.config.ts` 以 `E2E_SERVER` 环境变量切换——默认 `pnpm -C apps/playground dev`（秒级启动，`reuseExistingServer` 复用手工服务）；`E2E_SERVER=preview` 走 `build && preview`。两者统一探测 `http://localhost:5300`。

**脚本命名纪律（勿改）**：本包脚本一律 `e2e` 前缀、**没有 `test` 脚本**——根 `pnpm test`（`pnpm -r --if-present run test`）不会误拉起 E2E（无浏览器环境必挂），CI 用独立 workflow 跑，不与组件单测合流。

## 4. 用例书写规约

以下条目对应计划 §6.3 全部六条；标注「实践修订」处为落地后对草案的修正。

### 4.1 定位器优先级

1. `getByRole`（带 name）> `getByLabelText` / `getByText` > CSS `ui-*` 类。**禁用 `data-testid`**——语义定位本身即对组件 meta.accessibility 契约的持续验证。
2. 选择器必须用分区 locator（`playground.section('family-*')`）或卡片头文案收窄作用域，避免跨卡片重名。
3. **实践细化（浮层）**：Dialog / DropdownMenu 菜单 / Tooltip / Toast 条目等浮层本体 Teleport 到 `body`，分区选择器定位不到——浮层断言用全局 `getByRole('dialog')` / `getByRole('menu')` / `getByRole('tooltip')` / `getByRole('region', { name: '通知' })`，同一时刻只有一个浮层打开，全局唯一；触发器等常驻元素仍用分区收窄。
4. **实践细化（无名控件回退）**：个别触发器无法语义命名时（如 Select 的 `combobox` 为 name-from-author 且演示未传 `aria-label`，Playwright role 引擎算出的可访问名为空），按规约回退 `ui-*` 根类，并先用 `toHaveText`（占位文案）证位——见 `specs/select.e2e.spec.ts` 头注。该类命名缺口须在任务结果中如实上报，而不是沉淀为惯例。

### 4.2 断言与等待

1. 断言一律 web-first（`expect(locator).toBeVisible()` / `toBeHidden()` / `toBeFocused()` / `toHaveAttribute()` / `toContainText()` 等）；**禁止 `waitForTimeout` 硬等待**。轮询式检查用 `expect.poll()`（如焦点圈定）。
2. 时间行为（Toast 自动关闭等）用 `page.clock` 伪造。**实践修订（以实际落地为准）**：`@playwright/test` 1.48 只有 `page.clock.fastForward()`（无 `runForward`，那是更高版本 API）；`page.clock.install()` **必须在计时器创建之前**——即 `page.goto()` 之前调用，保证组件 `onMounted` 起表用的已是假 `setTimeout`。示例见 `specs/feedback.e2e.spec.ts`。

```ts
await page.clock.install()   // 先装假时钟（导航之前）
await page.goto('/')
await trigger.click()
await page.clock.fastForward(5_000)  // 快进超过 duration
await expect(message).toBeHidden()
```

3. E2E 只测真实浏览器集成路径：不设组件 props 矩阵（那是组件 api spec 的职责），用例以 playground 现成演示为载体。

### 4.3 键盘路径：真实按键序列

每条键盘路径用例以**真实按键序列**断言（`page.keyboard.press('Tab' | 'Escape' | 'ArrowDown' | 'Space' | …)` 或 `locator.pressSequentially()`），不断言中间实现细节。焦点类断言用 `toBeFocused()`；焦点圈定（Tab 循环不出对话框）用 `expect.poll` 检查 `document.activeElement` 归属。浮层家族（Dialog / DropdownMenu / Select / Tabs / Tooltip）的每条键盘路径必须有 E2E 键盘断言；其余组件键盘路径由组件 a11y spec 覆盖、E2E 抽查。

### 4.4 禁用控件：真实指针序列

**实践修订（以实际落地为准）**：Playwright 的 `click()` 会拒点 disabled 元素（actionability 等待永不满足）。验证「禁用态组件自身拦截交互」时须发出**真实指针序列**绕过 Playwright 的 enabled 检查：

- 表单类原生 disabled 控件：`locator.click({ force: true })`——浏览器不向 disabled 表单控件派发事件，随后断言值 / 焦点 / 选中态不变（见 `specs/inputs.e2e.spec.ts`）；
- 非表单禁用项（如菜单禁用项）：`page.mouse.click(x, y)` 按坐标实点，断言无激活回调、状态不变（见 `specs/overlay.e2e.spec.ts`）。

配套佐证：programmatic `focus()` 对 disabled 控件无效，可用 `locator.evaluate(el => el.focus())` + `not.toBeFocused()` 断言不可聚焦。

### 4.5 守卫与豁免纪律（fixtures/index.ts）

`consoleGuards` 为 auto fixture，默认生效，用例结束后汇总违例，任一命中即整条用例失败：

- console **error**；
- console warning 中文本含 **`[Vue warn]`**；
- **pageerror**（未捕获异常）。

豁免纪律（**实践修订，以实际落地为准**）：

1. **默认仅豁免一类噪音**：`Failed to load resource: … 404` 资源加载失败文本（favicon 自动请求与 playground 故意 404 的 Avatar 演示图属网络噪音 / 演示数据，非运行时缺陷；404 → 首字母回退行为另有专门用例验证）。除此之外零放行。
2. 用例内豁免必须**精确**且**注释原因**：`consoleGuards.allowConsoleError()` 收文本正则或拿整个 `ConsoleMessage` 的谓词（优先按 `msg.location().url` 精确到资源），`allowVueWarn(pattern)` / `allowPageError(pattern)` 同理。示例：Avatar 404 用例在默认豁免之外，再按 URL 谓词放行该资源可能产生的其他加载期 error，其余运行时错误照常失败。
3. 禁止宽泛豁免（如 `/^/` 或整类放行），禁止把豁免上提到 fixture 全局。

### 4.6 禁测试专用钩子

禁止为可测性给组件加测试专用 props / 类名 / data 属性；如需禁用动画等配合，一律走标准机制（`prefers-reduced-motion`、`--ui-motion-*` token 覆盖样式注入）——视觉 fixture 即按此实现，组件侧零改动。

## 5. axe 扫描与豁免登记（specs/a11y.spec.ts）

- 按 7 个产品族分区逐一扫描（include 作用域与页面对象 `section()` 选择器同源），断言 violations 为空；**不做 withTags 收窄**，跑 axe 默认全量规则（含 best-practice），保持最严口径。
- 无法立即修复的违例走**豁免登记**（文件内 `EXEMPTIONS` 常量）：精确到「分区 + axe 规则 id + 元素选择器范围（RegExp）」，逐条注明 tag、根因归属（组件 / 演示 / token 层）、原因与建议修复（followUp）。禁止整页跳过、禁止静默忽略。
- **过期检测**：登记的豁免必须被真实命中——违例消失（问题已修复）后未删除登记，测试以「过期豁免」直接失败，防止豁免清单随修复演变为静默跳过。新增豁免照抄该模式。

## 6. 视觉回归（visual/ + fixtures/visual.ts）

### 6.1 确定性环境

视觉 fixture（`fixtures/visual.ts`，叠加在守卫 fixture 之上）保证「同平台、同 server 模式」两次运行像素级零 diff：

- `prefers-reduced-motion: reduce`（`emulateMedia`，标准机制）+ 全部 `--ui-motion-*` token 覆盖为 `0ms`（`addInitScript` 注入 `<style>`，`!important` 抵御注入顺序；token 归零保险覆盖尚未接入 reduced-motion 分支的动效）；
- 固定视口 **1280×720**、`colorScheme: 'light'`（影响 `--ui-*` 亮暗 token，显式钉死）；
- `toHaveScreenshot` 配置 `animations: 'disabled'` + `caret: 'hide'`（隐藏输入光标，focus-visible 截图不受光标闪烁相位影响），`maxDiffPixelRatio: 0.01`；
- **字体策略（决策记录）**：不覆盖 font-family——token 字体栈不含 webfont、playground 无 `@font-face` / 字体 CDN，全部命中本机系统字体；同机同浏览器渲染位图恒定，强行覆盖反而让基线偏离真实视觉；
- **settle 等待**：`visual.goto()` 显式等 `document.fonts.ready` + 全部 `<img>` 完成（data-URI 头像与 404 图的完成时机必须收敛，`toHaveScreenshot` 不等图片解码）+ 双 rAF 等 Vue 挂载后首帧布局落定。

截图粒度：以 playground 卡片为单位（`visual.card(header)` 以 CardHeader 文案锚定整张 `.play-card`），浮层打开后对浮层元素本体单独截。当前 7 个 visual spec、65 张基线（截至 2026-09-25，均带平台后缀）。

### 6.2 focus-visible 基线必须真实键盘模态

**实践修订（以实际落地为准）**：`element.focus()` 在 Chromium 通常**不触发** `:focus-visible`，直接截屏会丢焦点环。`visual.focusVisible(target)` 的做法：先按一次真实 `Tab` 让焦点启发式进入键盘模态，再聚焦目标，随后**必须**断言 `el === document.activeElement && el.matches(':focus-visible')`（`visual.assertFocusVisible`，失败即抛错，禁止跳过）。「按键序列已把焦点放上目标」的场景（如 ↓ 打开菜单聚焦首项）同样走 `assertFocusVisible` 兜底。

### 6.3 基线管理与平台后缀

- 快照目录用 Playwright 默认模板：`visual/<spec 文件名>-snapshots/<name>-<project>-<platform>.png`（如 `input-default-chromium-darwin.png`）。平台后缀天然隔离本地（darwin）与 CI（linux）基线，互不干扰。
- 本地更新：`pnpm e2e:update-snapshots`（只影响本机平台后缀的基线）。

### 6.4 CI 基线策略（.github/workflows/e2e.yml）

- 本地 macOS 基线（`-chromium-darwin` 后缀）**不入 CI 比对**（平台后缀隔离）；CI 在 Linux 上**两步走**：
  1. **生成步**：`pnpm -C tests/e2e e2e --project=chromium visual`——缺失的 `-chromium-linux` 基线被写盘但用例判失败，该步退出码不作门禁（1.48 默认 `updateSnapshots: 'missing'` 行为：缺失即写盘即失败且不可重试）。刻意不用 `--update-snapshots`（布尔模式 'all' 会把已入库基线一并覆盖，生成步直接吞掉视觉回归）；
  2. **验证步**：`pnpm e2e` 全量严格比对，零 diff 才绿——真正的视觉门禁在这一步。
- Linux 基线经 `linux-visual-baselines` artifact 下载后**人工提交入库**（保留 `visual/<spec>-snapshots/` 目录层级整体拷回）；入库后生成步不再有缺失项，工作流零改动。当前仓库入库的是 darwin 基线，Linux 基线待首次 CI 产出后入库。

## 7. 浏览器矩阵：chromium-only（裁定记录）

**现状：仅 chromium 单项目**（`playwright.config.ts`）。

裁定记录：2026-09-25 维护者裁定 E2E 仅保留 chromium，多浏览器矩阵（webkit / firefox）裁撤——原计划 §3.4「阶段 3 加 webkit / firefox 项目」作废（任务票 11 已标记 cancelled；曾落地的 webkit 项目与平台差异修复已全部回退，chromium 全量用例绿）。恢复多浏览器需重新立项，不得在本包内私下加项目。

## 8. CI（.github/workflows/e2e.yml）

- 触发路径过滤：`packages/components/src/**`、`packages/tokens/**`（token 直接决定视觉输出）、`apps/playground/**`、`tests/e2e/**`、`pnpm-lock.yaml`、workflow 自身；docs 等其余变更不触发。
- runner：ubuntu-latest，`E2E_SERVER=preview`（生产构建 + preview，顺带覆盖 vite build 路径回归）；pnpm 11 + Node 22；Playwright 浏览器缓存 key 从 `@playwright/test` 精确版本派生。
- 失败产物：trace + 失败截图 + HTML 报告（`playwright-artifacts` artifact，7 天）；Linux 基线 artifact 14 天。
- 与 `playwright.config.ts` 的协作约定（勿单侧改动）：`CI=true` 自动关闭 `reuseExistingServer`、失败重试 1 次。

## 9. 与其他规约的关系

- 组件包 vitest 四类 spec（api / behavior / a11y / ssr）规约见 [docs/CONVENTIONS.md](../../docs/CONVENTIONS.md) §7；本文件不约束组件包内用例，§7 不约束本包。
- 背景与用例矩阵见 [docs/e2e-integration-plan.md](../../docs/e2e-integration-plan.md)；计划 §6.3 草案与本文冲突处以本文为准。
- 本包不依赖任何 workspace 包（只打 URL），不触碰 `packages/` 与 `apps/` 内文件；组件为通过 E2E 需要的任何改动（如可访问名缺口）走组件任务，不在 E2E 任务内顺手修改。
