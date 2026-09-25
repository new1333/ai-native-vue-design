# 安装

## 前置要求

- Node ≥ 20.19，pnpm ≥ 10
- Vue ^3.5（`@ui/components` 的唯一 peer 依赖）

## 在 monorepo 中安装

「纸面」当前以私有 workspace 包形态发布在仓库内，通过 pnpm workspace 依赖引入：

```jsonc
// 你的应用 package.json
{
  "dependencies": {
    "vue": "^3.5.0",
    "@ui/tokens": "workspace:*",
    "@ui/components": "workspace:*"
  }
}
```

组件库消费方只需要这两个包：`@ui/tokens` 提供视觉 token，`@ui/components` 提供组件。

## 包结构

| 包 | 内容 |
| --- | --- |
| `@ui/tokens` | `--ui-*` 设计 token 与 Paper Profile（`paper.css`），无 JS 运行时 |
| `@ui/components` | 全部组件、composable 与公共类型；组件样式随 SFC scoped style 注入，无全局 CSS |

::: tip 源码直连
`@ui/components` 的入口当前指向源码（`src/index.ts`），workspace 内应用（如 playground、本文档站）无需预构建即可消费，Vite 会按需编译。
:::

安装依赖：

```bash
pnpm install
```

就绪后前往[快速开始](/guide/quickstart)接入应用入口。
