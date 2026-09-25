# AGENTS.md —— 仓库协作协议

本仓库是「纸面 (Paper)」AI-native Vue 3 组件库的 monorepo。设计文档：根目录《AI-native-Vue-Design-System-设计方案 .md》（按需查阅）。任何 agent 在本仓库动手前，必须先读完本文与 [docs/CONVENTIONS.md](docs/CONVENTIONS.md)。

## 仓库地图

```text
.
├── pnpm-workspace.yaml        # workspace：packages/* 与 apps/*
├── tsconfig.base.json         # TS 严格基线（strict / bundler / ES2022）
├── AGENTS.md                  # 本协议
├── docs/CONVENTIONS.md        # 组件编写规约（目录/样式/meta/SSR/测试）
├── packages/
│   ├── tokens/                # @ui/tokens：--ui-* 设计 token 与 Paper Profile（paper.css）
│   └── components/            # @ui/components：组件库（本协议主要工作区）
└── apps/
    └── playground/            # 最小 Vite+Vue+TS 演示应用（消费方）
```

## 环境与命令

- 包管理器：pnpm ≥10（Node ≥20.19）。禁止使用 npm/yarn 生成锁文件。
- 组件工作区命令（在仓库根执行）：
  - `pnpm install` —— 安装依赖
  - `pnpm -C packages/components typecheck` —— vue-tsc --noEmit
  - `pnpm -C packages/components test` —— vitest run（happy-dom）
  - `pnpm -C packages/components build` —— vite build（lib 模式）
  - `pnpm dev` —— 启动 playground

## 组件开发协议（硬性流程，按序执行）

1. **侦察**：读任务要求与设计文档相关章节（组件职责、Paper 视觉 Profile、a11y 要求），明确组件所属家族与 API 面。不要凭记忆臆造设计决策。
2. **读规约**：通读 `docs/CONVENTIONS.md`。规约与任务冲突、或规约未覆盖且影响公共契约时，如实说明并升级提问，不得自行变通。
3. **找同家族样板**：在 `packages/components/src/` 下寻找同类别（如同为 form、feedback、ai 系）的既有组件作为样板，对齐文件结构、命名与测试写法。**只允许参考同家族组件；禁止复制无关组件的实现或样式。**
4. **最小实现**：只实现任务要求的 API 面与状态，遵循 CONVENTIONS 的目录结构、类型公共导出、SSR 纪律、a11y 与 token-only 视觉约束。
5. **确定性校验**：运行 `pnpm -C packages/components typecheck` 与 `pnpm -C packages/components test`，必须全绿且退出码 0。禁止跳过、缩小检查范围或伪造结果。
6. **组件测试**：四个 spec（api / behavior / a11y / ssr）全部通过；每个交互行为必须有 behavior 断言，每条键盘路径必须有 a11y 断言。
7. **总结契约变更**：在任务结果中如实报告：新增/修改的公共导出、meta 契约要点、依赖的 `--ui-*` token（发现 token 缺值时提出需求，严禁在组件内写死裸值）。

## 硬性禁令

- **禁止修改 `packages/components/src/index.ts`**：公共入口由「入口汇总」任务统一维护；组件只在自身目录的 `index.ts` 导出。
- **禁止改动其他组件目录**与任务无关文件（含 tsconfig / vitest 配置、无关 package.json）。
- **禁止裸视觉值**：组件包内一切颜色、字号、间距、圆角、阴影、动效时长、z-index 必须使用 `var(--ui-*)` token；`#fff`、`13px`、`0.3s`、`z-index: 999` 等一律禁止。
- **禁止在组件包引入全局 CSS**；由使用方在其应用入口一次性引入 `@ui/tokens/paper.css`。
- **浏览器 API（window / document 等）只允许出现在 `onMounted`**；`setup` 顶层禁止访问。
- **禁止为通过门禁而注释/删除断言、放宽配置或空跑命令**；无法满足时如实说明并升级。

## 如实报告

所有校验必须真实运行，并在结果中给出命令与退出码/输出摘要。门禁无法满足、任务与规约冲突时：说明 + 升级，绝不绕过或伪造通过。
