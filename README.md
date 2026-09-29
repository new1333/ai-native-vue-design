# 纸面 (Paper) —— AI-native Vue 3 组件库

「纸面」是一套 AI-native 的 Vue 3 Design System monorepo：以 TypeScript strict 全类型、SSR 安全、无障碍正确、token-only 视觉为硬约束，让使用方（人与生成代理）都能发现组件、判断适用场景、正确组合并验证结果。

- **`@ui/tokens`** —— `--ui-*` 设计 token 与 Paper 视觉 Profile（`paper.css`）。使用方在应用入口一次性引入，组件包自身不携带任何全局 CSS。
- **`@ui/components`** —— 组件库。每个组件带 `api / behavior / a11y / ssr` 四类测试与机器可读 meta 契约（`ComponentDefinition`）。
- **`apps/playground`** —— 最小 Vite + Vue + TS 演示应用（消费方）。
- **`tooling/`** —— 确定性工具：视觉裸值静态审计（`audit.mjs`）与组件 registry CLI（`cli/ui.mjs`）。

组件职责、何时用/不该用、完整 API 与最小用例见文档站组件页（全量 65 个组件，源码在 [`apps/docs`](apps/docs/)，部署于 <https://new1333.github.io/ai-native-vue-design/>）；[`docs/components/`](docs/components/) 保留初版 25 个组件的手写契约文档。系统设计基线见根目录《AI-native-Vue-Design-System-设计方案 .md》，组件编写规约见 [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)。

## 环境

- Node ≥ 20.19，pnpm ≥ 10（禁止使用 npm/yarn 生成锁文件）。

## 安装

```bash
pnpm install
```

## 使用方式

在使用方应用入口一次性引入 token 与组件库（参考 `apps/playground/src/main.ts`）：

```ts
import { createApp } from 'vue'
// 视觉 token：--ui-* CSS 变量（必须在使用方应用入口引入一次）
import '@ui/tokens/paper.css'
// 组件库公共入口（组件均从 @ui/components 按名导入）
import '@ui/components'
import App from './App.vue'

createApp(App).mount('#app')
```

组件内按需导入，例如：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog } from '@ui/components'

const open = ref(false)
</script>

<template>
  <Button variant="primary" @click="open = true">打开</Button>
  <Dialog v-model="open" title="示例">内容</Dialog>
</template>
```

## 组件清单

组件库现有 **65 个组件**，按 7 个产品分类（inputs / general / data / overlay / navigation / feedback / typography）。全量组件文档见文档站；每个组件的机器可读契约见 `packages/components/src/<组件目录>/*.meta.ts`，亦可用 `node tooling/cli/ui.mjs inspect <Name>` 查看。

下表为初版 25 个组件的手写契约文档（`docs/components/<Name>.md`），内容已与实现对照核验；其余约 40 个组件暂无手写契约文档，以 meta 契约与文档站页面为准。

### 01 Foundations（7）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Button | [Button.md](docs/components/Button.md) | 即时动作按钮（含 ButtonGroup 连排容器） |
| IconButton | [IconButton.md](docs/components/IconButton.md) | 仅图标的即时动作按钮（aria-label 必填） |
| Typography（Text / Heading） | [Typography.md](docs/components/Typography.md) | 正文与标题的统一排版 |
| Divider | [Divider.md](docs/components/Divider.md) | 水平/垂直分隔线（可选居中标签） |
| Badge | [Badge.md](docs/components/Badge.md) | 五档语义 soft 底状态徽标 |
| Avatar | [Avatar.md](docs/components/Avatar.md) | 头像（图片失败回退首字母） |
| Card | [Card.md](docs/components/Card.md) | 卡片容器（Card / CardHeader / CardBody / CardFooter） |

### 02 Inputs（7）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Input | [Input.md](docs/components/Input.md) | 单行文本/密码输入（可清空、错误态） |
| Textarea | [Textarea.md](docs/components/Textarea.md) | 多行文本输入（字数统计、垂直拉伸） |
| Select | [Select.md](docs/components/Select.md) | 单选下拉（combobox + listbox 键盘契约） |
| Checkbox | [Checkbox.md](docs/components/Checkbox.md) | 勾选框（多选、半选态） |
| Radio | [Radio.md](docs/components/Radio.md) | 单选组（RadioGroup + Radio，方向键原生导航） |
| Switch | [Switch.md](docs/components/Switch.md) | 即时生效开关（loading/disabled） |
| Form | [Form.md](docs/components/Form.md) | 表单容器与字段容器（Form + FormField 声明式校验） |

### 03 Data（5）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Table | [Table.md](docs/components/Table.md) | 泛型数据表格（排序/loading 骨架/空态） |
| Pagination | [Pagination.md](docs/components/Pagination.md) | 页码导航（窗口折叠 + aria-current） |
| EmptyState | [EmptyState.md](docs/components/EmptyState.md) | 空态占位（图标 + 标题 + 行动） |
| Skeleton | [Skeleton.md](docs/components/Skeleton.md) | 加载骨架占位（line/circle/rect） |
| Progress | [Progress.md](docs/components/Progress.md) | 进度条（确定/不确定进度） |

### 04 Feedback（2）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Alert | [Alert.md](docs/components/Alert.md) | 页内警示条（severity 语义 + live region） |
| Toast | [ToastHost.md](docs/components/ToastHost.md) | 全局通知（toast 单例 + ToastHost 宿主） |

### 05 Navigation（1）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Tabs | [Tabs.md](docs/components/Tabs.md) | 页签切换（Tabs / TabsList / TabsTrigger / TabsContent） |

### 06 Overlays（3）

| 组件 | 文档 | 一句话 |
| --- | --- | --- |
| Dialog | [Dialog.md](docs/components/Dialog.md) | 模态对话框（焦点圈定/还原、Esc/遮罩关闭） |
| DropdownMenu | [DropdownMenu.md](docs/components/DropdownMenu.md) | 动作下拉菜单（WAI-ARIA menu 键盘契约） |
| Tooltip | [Tooltip.md](docs/components/Tooltip.md) | 纯文字提示浮层（hover/focus 驱动） |

### 关于原规划的 07 Patterns / 08 AI UI

设计方案原按 8 族规划；落地时组件按语义归入上述 7 个分类，未启用独立的 Patterns / AI UI 分类。原第二阶段规划的 AI 原生组件均已交付并归入现有分类：PromptInput / ModelSelector / Suggestion → inputs，Message / MessageList / StreamingText / ToolCallCard → data，Reasoning / AgentStatus → feedback，Artifact → overlay。

## CLI 用法

registry CLI（纯 Node，读取 registry JSON，不复制知识）：

```bash
# 列出全部组件（组件名 + 分类 + 一句话描述）
node tooling/cli/ui.mjs list

# 按关键词模糊搜索（匹配 name / description / keywords）
node tooling/cli/ui.mjs search 分页
node tooling/cli/ui.mjs search toast

# 查看单个组件的完整 JSON 摘要（intent、props、events、slots、a11y、ssr）
node tooling/cli/ui.mjs inspect Button
```

## 验证命令

```bash
pnpm install                              # 安装依赖

# 组件工作区（在仓库根执行）
pnpm -C packages/components typecheck     # vue-tsc --noEmit（strict 全类型）
pnpm -C packages/components test          # vitest run（api/behavior/a11y/ssr 四类 spec）
pnpm -C packages/components build         # vite build（lib 模式）

# 视觉裸值静态审计（组件内颜色/字号/间距/圆角/阴影/动效/z-index 只允许 var(--ui-*)）
node tooling/audit.mjs

# registry / CLI（registry 一致性、list/search/inspect）
node tooling/cli/ui.mjs list
node tooling/cli/ui.mjs search 分页
node tooling/cli/ui.mjs inspect Button

# 全仓递归与本地演示
pnpm typecheck && pnpm test && pnpm build # 根脚本：pnpm -r --if-present 递归执行
pnpm dev                                  # 启动 playground
```
