# AI-native Vue Design System —— 「纸面」组件库独立完整设计方案

> **文档状态：可独立使用 / Architecture Baseline / 2026**
>
> 本文是一份完整的项目设计与工程执行基线。阅读、拆解任务、初始化仓库、派发 Agent、实现组件、建立文档、接入 CLI/MCP、运行测试与验收，都不依赖其他说明文件。

---

## 0. 文档定位与总原则

### 0.1 这份文档解决什么问题

本项目不是“再做一个 Vue 组件库”，而是构建一套 **AI-native Vue Design System**：

```text
Design Language
      ↓
Design Tokens
      ↓
Component Contracts
      ↓
Vue Components / Headless Logic
      ↓
Patterns
      ↓
Blocks
      ↓
AI-readable Registry
      ↓
CLI / MCP / Codegen
      ↓
Validation / Benchmark
```

它同时服务四类使用者：

| 使用者          | 核心诉求                         | 系统提供                            |
| --------------- | -------------------------------- | ----------------------------------- |
| 产品设计师      | 稳定、可扩展的视觉语言           | Tokens / Themes / Profiles          |
| 前端开发者      | 类型安全、低心智负担             | Components / Composables / Docs     |
| AI Coding Agent | 可检索、可判断、可生成的 UI 知识 | Metadata / Registry / Recipes / MCP |
| 工程与质量团队  | 可验证的运行质量                 | Tests / Audit / Benchmarks          |

### 0.2 核心设计命题

> **UI 不应该只是“代码 + 样式”，而应该是一个拥有契约、知识、组合关系和验证机制的工程对象。**

一个组件从设计到交付，必须同时定义：

```text
What it is
When to use
When not to use
How to compose
What it accepts
What it emits
How it behaves
How it is styled
How it behaves under SSR
How it satisfies A11y
What it costs at runtime
How an Agent should generate it
How the system verifies it
```

### 0.3 目标与非目标

**目标**：

- Modern：面向现代 SaaS、AI 产品、Dashboard、Developer Tool、移动 Web 与数据型应用。
- Beautiful：建立克制、有层次、可扩展的视觉系统。
- Fast：从 Bundle、Runtime、SSR 到大数据渲染都建立预算。
- Type-safe：类型是公共 API，不是附属文档。
- Composable：从 Primitive 到 Block 逐层组合。
- Accessible：A11y 属于组件正确性。
- SSR-friendly：SSR 与 Hydration 从底层设计。
- AI-friendly：Agent 可发现、理解、选择、组合、生成、验证。
- Customizable：换主题不复制组件。
- Excellent DX：安装、导入、补全、检查、组合、迁移都尽量低摩擦。

**非目标**：

- 不以“组件数量最多”为核心竞争指标。
- 不为了 AI 增加只有概念没有真实价值的 API。
- 不把所有能力塞进单一巨型组件。
- 不通过复制组件实现不同视觉主题。
- 不允许文档、Metadata、运行时代码各自维护一套 API 事实。

### 0.4 四条最高优先级原则

```text
1. Contract First     —— 先定义事实，再写实现
2. Token First        —— 先定义视觉约束，再写样式
3. Metadata First     —— Agent 先读机器知识，再生成代码
4. Proof First        —— 能自动证明的问题，不交给模型猜
```

# 1. 产品定位

## 1.1 产品名称层级

建议产品内部采用四层命名：

```text
Brand
└── UI Design System
    ├── Core        —— Token / Primitive / Utility / A11y
    ├── Components  —— Button / Input / Table / Dialog ...
    ├── Patterns    —— SearchPanel / DataToolbar / SettingsSection ...
    ├── Blocks      —— Login / Dashboard / Billing / AI Workspace ...
    └── Intelligence
        ├── Metadata
        ├── Registry
        ├── Recipes
        ├── CLI
        └── MCP
```

## 1.2 产品承诺

对人：

> 看懂 API、写出 UI、组合复杂页面、覆盖状态、处理 A11y，不需要大量额外心智负担。

对 Agent：

> 能发现组件、判断适用场景、理解约束、选择组合、生成代码、验证结果、修复错误。

对产品团队：

> 同一套设计语言贯穿单组件、Pattern、Block 和页面。

对工程团队：

> Tree-shaking、SSR、Hydration、类型安全、可观测性能从架构层得到保证。

---

# 2. 核心竞争力

## 2.1 第一竞争力：AI 可理解，而不仅是 AI 可读取

传统组件库提供：

```text
Props → Type → Docs
```

本系统提供：

```text
Intent
  ↓
What / When / When Not
  ↓
Component Selection
  ↓
Constraints / Dependencies
  ↓
Composition Pattern
  ↓
Code Recipe
  ↓
Validation
```

Agent 必须能够回答组件是什么、何时使用、何时不该使用、Props/Slots/Events、互斥关系、依赖关系、推荐组合、A11y、SSR、Hydration 和迁移方式。

因此 Metadata 不能只有属性表，而必须表达 **决策知识**。

## 2.2 第二竞争力：Design Token 是工程基础设施

视觉系统把色彩、字体、间距、圆角、描边、阴影、尺寸、动效、z-index 等全部定义成有限档位，不留下未定义的自由空间。

这应升级为代码层的 Token Contract：

```text
Token Source
   ↓
CSS Variables
   ↓
Theme Definitions
   ↓
Component Styles
   ↓
Docs / Playground
   ↓
Visual Audit
```

## 2.3 第三竞争力：Pattern / Block 优先

系统的产品抽象不是只有 Components，而是：

```text
Components + Patterns + Blocks
```

典型 Pattern / Block 包括 SearchPanel、FilterBar、DataToolbar、AIChatPanel、DashboardCard 等。

所以产品指标不应只统计“有多少组件”，而应统计：

```text
Time to First UI
Time to Build Page
AI Code Generation Success Rate
Bundle Cost
Runtime Cost
Type Coverage
A11y Coverage
SSR Compatibility
Customization Cost
Migration Cost
```

这些指标构成系统的核心产品度量。

---

# 3. 架构总览

## 3.1 六层架构

建议采用下面的核心架构：

```text
Layer 6  —— Blocks / Page Composition
              ↑
Layer 5  —— Patterns
              ↑
Layer 4  —— Styled Components
              ↑
Layer 3  —— Composables / Headless Logic
              ↑
Layer 2  —— Primitives
              ↑
Layer 1  —— Design Tokens / A11y Contracts

横向贯穿：
Metadata / Registry / Docs / CLI / MCP / Tests / Benchmarks
```

核心架构采用 Design Tokens → Primitives → Headless Logic → Composables → Styled Components → Patterns → Page-level Blocks。

## 3.2 最重要的架构决策：逻辑与视觉彻底解耦

以 Button 为例：

```text
ButtonPrimitive
    │
    ├── interaction state
    ├── keyboard behavior
    ├── disabled semantics
    ├── loading semantics
    └── aria contract
          ↓
useButton()
          ↓
ButtonRoot
          ↓
Button theme adapter
          ↓
<Button />
```

高级使用者可以停留在 `<Button>`。

复杂场景可以直接使用 `useButton()`。

极端定制场景可以使用 Primitive。

Button 同时提供 `<Button>`、`useButton()` 与 `ButtonPrimitive` 三种使用层级。

---

# 4. Monorepo 设计

推荐仓库：

```text
repo/
├── apps/
│   ├── docs/                 # VitePress / 文档站
│   ├── playground/           # 组件实验场
│   ├── registry/             # machine-readable registry 服务/静态站
│   └── benchmark/            # benchmark runner / dashboard
│
├── packages/
│   ├── core/                 # 基础 Vue runtime / utilities
│   ├── tokens/               # Design Tokens
│   ├── primitives/           # 无视觉 Primitive
│   ├── components/           # Styled Vue components
│   ├── composables/          # Headless composables
│   ├── patterns/             # Pattern components
│   ├── blocks/               # Page-level blocks
│   ├── ai-components/        # AI UI components
│   ├── icons/                # SVG icon system
│   ├── metadata/             # Metadata schema + loaders
│   ├── registry/             # Component registry
│   ├── theme/                # Theme compiler/runtime
│   └── vue-nuxt/              # Nuxt adapter / module
│
├── tooling/
│   ├── cli/                  # ui CLI
│   ├── eslint/               # project lint rules
│   ├── prettier/             # formatter config
│   ├── style-audit/          # visual/token static audit
│   ├── a11y-audit/           # accessibility checker
│   ├── benchmark/            # benchmark infrastructure
│   ├── metadata-gen/          # TS → metadata generation
│   └── codegen/               # code generation engine
│
├── schemas/
│   ├── component.schema.json
│   ├── pattern.schema.json
│   ├── recipe.schema.json
│   ├── token.schema.json
│   └── registry.schema.json
│
├── docs/
│   ├── architecture/
│   ├── concepts/
│   ├── components/
│   ├── patterns/
│   ├── recipes/
│   ├── migration/
│   └── ai/
│
├── tests/
│   ├── unit/
│   ├── component/
│   ├── e2e/
│   ├── a11y/
│   ├── ssr/
│   ├── hydration/
│   ├── visual/
│   └── ai-generation/
│
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 4.0 技术栈

技术栈以“类型安全、构建速度、Tree-shaking、SSR、Agent 可理解性”为选型标准。版本号不在架构文档中冻结；发布时统一选择各工具的兼容稳定版本，并通过 lockfile 固化。

| 领域              | 选择                           | 设计要求                            |
| ----------------- | ------------------------------ | ----------------------------------- |
| Package Manager   | pnpm                           | workspace 原生、依赖隔离、速度稳定  |
| Monorepo          | Turborepo                      | task graph、缓存、并行构建          |
| UI Runtime        | Vue 3                          | Composition API、SSR、TypeScript    |
| Build             | Vite                           | ESM、library mode、开发体验         |
| Framework Adapter | Nuxt                           | SSR / SSG / hydration / module 集成 |
| Docs              | VitePress                      | Markdown + Vue + 静态生成           |
| Type System       | TypeScript                     | strict、泛型组件、类型级 API 契约   |
| Unit              | Vitest                         | 快速、Vite 原生                     |
| Component Test    | Vue Test Utils                 | Vue 行为测试                        |
| Browser / E2E     | Playwright                     | 真浏览器验证、视觉回归、键盘测试    |
| A11y              | axe + keyboard scenarios       | 机器检测 + 行为检测                 |
| Styling           | CSS Variables + Cascade Layers | Token 驱动、低 runtime 成本         |
| Icons             | Inline SVG                     | 无额外图片依赖、currentColor        |
| Schema            | JSON Schema + Zod              | 机器校验 + TS 使用体验              |
| Release           | Changesets                     | 包版本与 changelog 管理             |
| CLI               | Node.js                        | 与 monorepo 工具链统一              |
| MCP               | MCP server                     | 对外提供 Registry 能力              |

**原则**：运行时依赖尽量少；AI、Docs、Registry、CLI 属于 tooling / knowledge 层，不反向污染核心 runtime。

### 4.1 包依赖规则

必须保持单向依赖：

```text
@ui/tokens
    ↓
@ui/primitives
    ↓
@ui/composables
    ↓
@ui/components
    ↓
@ui/patterns
    ↓
@ui/blocks
```

而：

```text
metadata / registry / docs / cli
```

只能读取上述包暴露的信息，不反向进入运行时组件依赖。

这样可以避免“AI 能力反过来把 runtime 包做大”。

---

# 5. Component Architecture

## 5.1 每个组件由 7 个事实组成

不要把组件实现视为一个 `.vue` 文件，而是定义为：

```text
Component
├── API Contract
├── Behavior Contract
├── Accessibility Contract
├── Visual Contract
├── SSR Contract
├── Performance Contract
└── AI Knowledge Contract
```

## 5.2 推荐组件目录

```text
packages/components/src/button/
├── Button.vue
├── ButtonRoot.vue
├── ButtonGroup.vue
├── useButton.ts
├── button.types.ts
├── button.constants.ts
├── button.tokens.ts
├── button.meta.ts
├── button.spec.ts
├── button.a11y.spec.ts
├── button.ssr.spec.ts
├── button.visual.spec.ts
└── index.ts
```

### 5.3 组件必须有明确 Public Surface

公开 API 只暴露：

```ts
export type ButtonProps
export type ButtonEmits
export type ButtonSlots
export type ButtonInstance
export const Button
export const ButtonGroup
export const useButton
```

内部 helper 不进入公共 registry。

---

# 6. Design Token Architecture

## 6.1 三层 Token

```text
Primitive Tokens
    ↓
Semantic Tokens
    ↓
Component Tokens
```

### Primitive

```text
color.green.600
space.4
radius.2
font.size.15
```

### Semantic

```text
color.bg.page
color.text.primary
color.surface.default
color.action.primary
color.state.danger
```

### Component

```text
button.height.md
button.radius
button.primary.bg
button.primary.fg
input.border.focus
```

视觉 Profile 的具体值应落在 Semantic Token 层，而不是散落到组件 CSS 中。

## 6.2 首期默认 Visual Profile：Paper

首期建立一个完整、可执行的 **Paper** 视觉 Profile。它是系统的默认视觉合同：组件只能使用 Profile 暴露的 Token；需要新的视觉表达时，创建新的 Profile，而不是修改组件内部裸值。

### 色彩 Token

| Token           | Value               | 用途                               |
| --------------- | ------------------- | ---------------------------------- |
| `bg`            | `#F7F6F2`           | 页面背景                           |
| `surface`       | `#FFFFFF`           | 卡片、输入框、面板                 |
| `surface-muted` | `#F1EFE9`           | 次级容器、表头、代码块             |
| `border`        | `#E6E3DB`           | 默认 1px 边框                      |
| `border-strong` | `#D5D1C6`           | hover / active 加深                |
| `text-1`        | `#2C2A25`           | 主文字                             |
| `text-2`        | `#6E6A60`           | 次级文字                           |
| `text-3`        | `#8B8679`           | 弱文字、帮助、脚注                 |
| `accent`        | `#33594A`           | 主行动、链接、选中、焦点、关键数字 |
| `accent-hover`  | `#2A4A3D`           | 强调色 hover                       |
| `accent-soft`   | `#EDF1EC`           | 选中柔底                           |
| `on-accent`     | `#FFFFFF`           | 强调色上的文字                     |
| `success`       | `#3E7C57`           | 成功                               |
| `success-soft`  | `#EAF2EC`           | 成功柔底                           |
| `warning`       | `#B8863B`           | 警示                               |
| `warning-soft`  | `#F5EEDF`           | 警示柔底                           |
| `danger`        | `#A9503C`           | 危险、不可逆操作                   |
| `danger-soft`   | `#F6EAE6`           | 危险柔底                           |
| `info`          | `#8A9BA8`           | 中性信息                           |
| `info-soft`     | `#ECF0F2`           | 信息柔底                           |
| `tooltip`       | `#26262A`           | Tooltip 背景                       |
| `scrim`         | `rgba(28,27,23,.4)` | 浅色 Dialog / Drawer 遮罩          |

**强调色白名单**：主按钮、链接与文字按钮、选中态、焦点环、关键数字、未读点、图表主序列。单屏强调色元素 ≤3 处，总面积 ≤10%。

### Typography Token

- 字体：`Noto Sans SC, system-ui, sans-serif`。刊物式标题、引文、大号数字可使用 `Noto Serif SC`。全站最多两种字体。
- 字阶：`12 / 13 / 15 / 17 / 20 / 24 / 30px`。
- 字重：`400 / 500 / 600`。
- 行高：12–13px 使用 1.5；15px 正文使用 1.7、UI 使用 1.5；17–20px 使用 1.5；24–30px 使用 1.3。
- 正文阅读栏建议 `640–672px`，单行正文不超过约 38 个汉字。
- 默认左对齐；居中仅用于空状态、404、登录卡等明确场景。
- 数字使用 `font-variant-numeric: tabular-nums`；表格数字右对齐；统一千分位、小数位与单位口径；中文与数字之间保留一个空格。

### Spacing / Layout Token

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px
```

| 用途         | 规则                       |
| ------------ | -------------------------- |
| 相邻区块     | ≥48px，移动端 ≥32px        |
| 表单字段     | 字段间 24px，字段组间 48px |
| Card 内边距  | 16 / 24 / 32px             |
| 应用框架     | 1120px                     |
| 阅读栏       | 672px                      |
| 表单栏       | 420–480px                  |
| 页面边距     | ≥24px，375px 时 ≥16px      |
| Desktop Grid | 12 列 / 24px gap           |
| Mobile Grid  | 4 列 / 16px gap            |

### Shape / Elevation Token

- 圆角只允许 `6 / 12 / 16px`：6 用于控件，12 用于卡片 / Popover，16 用于 Dialog / 大容器。
- `2px` 只允许用于进度条端头等明确的形状细节。
- 默认描边为 1px；普通场景禁止 2px 以上实线和虚线分隔。
- 静止面默认不使用阴影；Card 可选一档静止阴影。

```text
rest   0 1px 2px rgba(28,27,23,.05)
hover  0 1px 3px rgba(28,27,23,.06)
pop    0 4px 12px rgba(28,27,23,.08)
modal  0 8px 24px rgba(28,27,23,.12)
```

### Motion Token

- 默认时长 180ms，允许范围 150–200ms。
- 入场使用 ease-out。
- 动画属性白名单：`opacity`、颜色、背景色、边框色、`transform`。
- 位移 ≤4px，缩放 ≤2%。
- 禁止弹簧、反弹和与交互无关的无限循环动画；加载状态除外。
- `prefers-reduced-motion: reduce` 时立即切换。

### Focus Token

```css
:focus-visible {
  outline: 2px solid var(--ui-accent);
  outline-offset: 2px;
}
```

### Z-index Token

```text
sticky   10
dropdown 100
drawer   200
modal    300
toast    400
tooltip  500
```

### Icon Token

- 仅使用内联 SVG。
- `viewBox="0 0 24 24"`、`stroke="1.5"`、`stroke-linecap="round"`、`currentColor`。
- 尺寸仅 `16 / 20 / 24px`。
- 禁止位图、Emoji、填充式双色图标。

### 默认视觉气质

界面应呈现安静、克制、温润的纸面感：暖白底、晨墨般的文字、细线结构、非常克制的阴影，以及只承担信息层级职责的强调色。任何新增装饰都必须能够回答“它传递了什么信息”。

## 6.3 Token 不允许裸值蔓延

组件源码禁止：

```css
padding: 13px;
border-radius: 9px;
transition: 260ms;
```

要求：

```css
padding: var(--ui-space-3);
border-radius: var(--ui-radius-md);
transition: color var(--ui-motion-default) var(--ui-ease-out);
```

并由 static audit 检查。

这种“数值档位 + 审计”的方式用于约束 AI 生成和人工实现的视觉漂移。

---

# 7. Visual Profile Architecture

视觉系统必须与运行时组件解耦，并通过 **Visual Profile** 管理不同产品气质。首期采用克制、温润的 Paper Profile，同时保留 Dark、Editorial、Technical 等扩展空间。每个 Profile 独立定义 Token、允许集与禁用集。

### Profile 机制

不同视觉风格不得通过复制组件代码实现，而应通过 Token 与 Profile 实现：

```text
Design System Core
├── token schema
├── component contracts
├── behavior
├── a11y
├── SSR
└── performance

Visual Profiles
├── Paper        ← 首期 reference profile
├── Studio Dark
├── Editorial
├── Technical
└── Future Profiles
```

Paper 是第一套 **严格审美 Profile**。它的视觉禁令只约束自身 Profile，不限制系统未来增加其他 Profile。

这样可以让视觉 Profile 独立演进，同时保持组件实现与视觉规则解耦。

---

# 8. AI Metadata Architecture

## 8.1 Metadata 必须成为一级 API

`ComponentDefinition` 至少覆盖 name、description、category、props、slots、events、exposes、patterns、useCases、antiPatterns、accessibility、performance、ssr、examples、relatedComponents 等信息。

正式系统建议升级为：

```ts
interface ComponentDefinition {
  id: string;
  version: string;

  identity: {
    name: string;
    package: string;
    export: string;
    category: string;
    description: string;
  };

  intent: {
    what: string;
    when: string[];
    whenNot: string[];
    userTask: string;
  };

  api: {
    props: PropDefinition[];
    slots: SlotDefinition[];
    events: EventDefinition[];
    exposes: ExposeDefinition[];
  };

  constraints: {
    requires: Constraint[];
    conflicts: Constraint[];
    dependsOn: Constraint[];
  };

  composition: {
    patterns: string[];
    related: string[];
    preferred: string[];
  };

  examples: {
    basic: ExampleRef[];
    production: ExampleRef[];
    antiPatterns: ExampleRef[];
  };

  accessibility: AccessibilityDefinition;
  ssr: SSRDefinition;
  performance: PerformanceDefinition;
  styling: StylingDefinition;
  migration: MigrationDefinition[];

  states: {
    default: boolean;
    hover: boolean;
    focusVisible: boolean;
    active: boolean;
    disabled: boolean;
    loading?: boolean;
    error?: boolean;
  };

  agent: {
    keywords: string[];
    selectionHints: string[];
    commonTasks: string[];
    generationNotes: string[];
  };
}
```

## 8.2 Metadata 的核心不是字段多，而是关系可计算

例如：

```json
{
  "name": "Switch",
  "constraints": {
    "conflicts": [
      {
        "with": "Checkbox",
        "reason": "Checkbox expresses selection; Switch expresses immediate state change"
      }
    ]
  }
}
```

Agent 就能够做“选择”，而不是只做“查字段”。

## 8.3 Metadata Source of Truth

不允许：

```text
.vue 文件写一份
docs 写一份
metadata.json 再手写一份
MCP 再写一份
```

推荐：

```text
component.meta.ts
      ↓
Schema validation
      ↓
┌─────┼─────┬─────┬─────┐
↓     ↓     ↓     ↓     ↓
Docs  JSON  MCP   CLI   IDE
```

这样可以避免文档/API 漂移。

---

# 9. Machine-readable Knowledge Architecture

最终仓库应该存在：

```text
registry/
├── components.json
├── patterns.json
├── blocks.json
├── recipes.json
├── tokens.json
├── themes.json
├── migrations.json
└── index.json
```

机器知识层统一提供 components、patterns、blocks、recipes、tokens、themes、migrations 与 registry 等机器可读资源。

### 建议增加一个统一入口

```json
{
  "schemaVersion": "1",
  "components": "./components.json",
  "patterns": "./patterns.json",
  "blocks": "./blocks.json",
  "recipes": "./recipes.json",
  "tokens": "./tokens.json",
  "themes": "./themes.json"
}
```

这就是 AI / CLI / MCP / Code Generator 的入口。

---

## 9.1 Component Registry Schema（最小完整定义）

Registry 中的组件记录至少遵循以下结构：

```ts
interface ComponentRecord {
  id: string;
  version: string;

  identity: {
    name: string;
    package: string;
    export: string;
    category: string;
    description: string;
  };

  intent: {
    what: string;
    when: string[];
    whenNot: string[];
    userTask: string;
  };

  api: {
    props: PropDefinition[];
    slots: SlotDefinition[];
    events: EventDefinition[];
    exposes: ExposeDefinition[];
  };

  constraints: {
    requires?: Constraint[];
    conflicts?: Constraint[];
    dependsOn?: Constraint[];
  };

  composition: {
    patterns: string[];
    related: string[];
    preferred: string[];
  };

  states: {
    default: boolean;
    hover: boolean;
    focusVisible: boolean;
    active: boolean;
    disabled: boolean;
    loading?: boolean;
    error?: boolean;
  };

  accessibility: AccessibilityDefinition;
  ssr: SSRDefinition;
  performance: PerformanceDefinition;
  styling: StylingDefinition;

  examples: ExampleRef[];
  recipes: string[];
  migrations: string[];

  agent: {
    keywords: string[];
    selectionHints: string[];
    commonTasks: string[];
    generationNotes: string[];
  };
}
```

### Schema 设计要求

1. `id` 全局唯一且稳定，显示名称变化不能导致 ID 漂移。
2. `version` 用于 API 与 Metadata 的兼容判断。
3. 所有 Props / Slots / Events / Exposes 必须可以追溯到实际 TypeScript public API。
4. `conflicts` / `dependsOn` / `requires` 必须结构化，禁止只写自然语言。
5. `patterns` / `recipes` 使用稳定 ID 引用，避免重复内容。
6. Metadata 允许扩展，但新增字段不得破坏既有 Registry consumer。
7. Schema 必须在 CI 中执行严格校验。

### Constraint 示例

```json
{
  "conflicts": [
    {
      "with": "Checkbox",
      "reason": "表达即时生效状态时使用 Switch，而非 Checkbox"
    }
  ]
}
```

# 10. Documentation Architecture

文档必须分成三层：

```text
Human Docs
   ↓
Developer Docs
   ↓
Machine Docs
```

文档系统采用 Human / Developer / Machine 三层结构。

## 10.1 Human Documentation

回答：

- 这是什么
- 为什么存在
- 什么时候用
- 什么时候不要用

## 10.2 Developer Documentation

回答：

- Props
- Emits
- Slots
- Expose
- Types
- Theme
- SSR
- A11y
- Performance
- Migration

## 10.3 Machine Documentation

必须做到：

```text
不需要阅读整篇 Markdown
Agent 就能知道如何使用组件
```

因此机器文档应支持：

```bash
ui inspect Button
ui docs Button --machine
ui search "date range filter"
```

---

# 11. Component 分类与实施优先级

不要按照“传统组件库目录”简单搬运。

建议分为 8 个产品族：

```text
01 Foundations
02 Inputs
03 Data
04 Feedback
05 Navigation
06 Overlays
07 Patterns
08 AI UI
```

## 11.1 Foundations

第一阶段：

```text
Button
IconButton
Typography
Divider
Badge
Avatar
Card
```

## 11.2 Inputs

```text
Input
Textarea
Select
Checkbox
Radio
Switch
Form
FormField
```

## 11.3 Data

```text
Table
DataTable
Pagination
KPI
EmptyState
Skeleton
Progress
ChartContainer
```

## 11.4 Feedback / Overlay

```text
Alert
Toast
Dialog
Drawer
Popover
DropdownMenu
Tooltip
```

## 11.5 Navigation

```text
Sidebar
Topbar
Tabs
Breadcrumb
Steps
CommandPalette
```

## 11.6 Advanced Data

第二阶段重点：

```text
Tree
TreeSelect
DatePicker
DateRangePicker
Cascader
VirtualList
VirtualTable
DataGrid
```

复杂组件的重点投入对象包括 Form、Table、Tree、TreeSelect、DatePicker、Cascader、VirtualList、CommandPalette、DataGrid。

---

# 12. 第一阶段核心组件

MVP 不追求数量，建议只做约 15–20 个真正能组成完整 SaaS 页面的一组：

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Radio
Switch
Form
Card
Badge
Avatar
Table
Dialog
DropdownMenu
Toast
Tooltip
Tabs
Pagination
EmptyState
```

同时同步完成：

```text
Tokens
Themes
Metadata
Docs
A11y
SSR
Visual Audit
CLI inspect/docs/search
```

也就是说：

> **MVP 的目标不是“20 个组件”，而是“20 个拥有完整系统能力的组件”。**

MVP 不以组件数量为目标，而以可完成真实任务的系统能力为目标。

---

# 13. 第二阶段高级组件

第二阶段不继续平铺大量低价值组件，而应进入复杂交互领域：

```text
Form Engine
├── nested field
├── array field
├── dependency
├── conditional
├── async validation
└── schema driven

Data Engine
├── virtual rows
├── sort
├── filter
├── grouping
├── pinning
├── resize
├── reorder
├── keyboard navigation
└── server data
```

表单与数据表的能力边界直接定义为系统级复杂组件契约。

---

# 14. AI-native Components

AI 组件应该成为独立产品族，而不是把普通 ChatMessage 换个名字。

建议分三层：

## 14.1 Interaction

```text
PromptInput
AIInput
AIComposer
ModelSelector
CommandPalette
```

## 14.2 Response

```text
StreamingText
AIResponse
ThinkingBlock
Reasoning
Citation
Artifact
```

## 14.3 Agent Runtime UI

```text
ToolCall
AgentStatus
TokenUsage
Conversation
WorkflowStep
RunTimeline
```

AI UI 产品族包括 PromptInput、AIComposer、StreamingText、ChatMessage、Reasoning、ToolCall、Citation、Artifact、AgentStatus、TokenUsage、ModelSelector、AIResponse、ThinkingBlock 等。

### 核心原则

AI UI 不应该表达“模型很酷”，而应该表达真实状态：

```text
queued
running
streaming
waiting-for-tool
tool-running
completed
failed
cancelled
```

也就是说 AI-native 的重点是 **state semantics**，不是视觉特效。

---

# 15. Pattern / Block Architecture

## 15.1 Pattern

Pattern 是可复用的交互解决方案：

```text
SearchPanel
FilterBar
DataToolbar
SettingsSection
NotificationCenter
ActivityTimeline
```

## 15.2 Block

Block 是页面级组合：

```text
LoginBlock
PricingBlock
BillingBlock
DashboardBlock
OnboardingBlock
AIWorkspaceBlock
```

## 15.3 Pattern / Block 也要有 Metadata

```text
PatternMeta
├── purpose
├── trigger
├── components
├── composition rules
├── variants
├── responsive behavior
├── accessibility
└── examples
```

这样 Agent 才能直接完成：

> “生成一个带筛选、排序、分页的数据页。”

而不是只会生成：

> `<Button /> + <Input /> + <Table />`

---

# 16. AI Agent Workflow

完整工作流设计为：

```text
User Intent
   ↓
Discover
   ↓
Understand
   ↓
Select
   ↓
Compose
   ↓
Generate
   ↓
Validate
   ↓
Repair
```

Agent 工作流固定为 discover → understand → select → compose → generate → validate。

## 16.1 Agent 不应该直接猜 API

推荐 Agent 使用：

```text
ui search
ui inspect
ui recipe
ui validate
```

先检索事实，再生成。

## 16.2 Agent Context 分层

```text
Level 0: registry/index
Level 1: component summary
Level 2: API + constraints
Level 3: patterns + recipes
Level 4: implementation details
Level 5: tests / benchmark / migration
```

这样可以显著减少 Agent 一次性读取全部文档的成本，并形成 Progressive Disclosure。

---

# 17. CLI Architecture

本设计建议的 CLI：

```bash
ui inspect Button
ui docs Button
ui search "date range filter"
ui example dashboard
ui generate form
ui generate table
ui doctor
ui migrate
ui explain
ui validate
```

这些命令应该正式设计成下面的能力：

## Discovery

```bash
ui search <intent>
ui list components
ui list patterns
ui list blocks
```

## Understanding

```bash
ui inspect Button
ui explain Button --why
ui docs Button --machine
```

## Generation

```bash
ui generate form
ui generate table
ui generate dashboard
```

## Validation

```bash
ui validate
ui doctor
ui a11y
ui benchmark
```

## Migration

```bash
ui migrate
ui migrate check
```

---

# 18. MCP Integration

建议把 Registry 直接暴露成 MCP Resources / Tools。

## Resources

```text
ui://components
ui://components/Button
ui://patterns/DataToolbar
ui://blocks/Dashboard
ui://recipes/table-filter
ui://tokens
```

## Tools

```text
search_components(intent)
inspect_component(name)
get_recipe(name)
find_pattern(intent)
validate_usage(code)
```

这里最关键的是：

> MCP 不复制知识，而是读取 Registry。

```text
Component Definition
        ↓
Registry
   ┌────┼─────┐
   ↓    ↓     ↓
 CLI  Docs   MCP
```

---

# 19. AGENTS.md 设计

根目录 `AGENTS.md` 不是代码规范大全，而是 **Agent 工作方式协议**。

建议固定为：

```text
1. Recon
2. Discover
3. Read metadata
4. Find analogue
5. Implement minimal change
6. Run deterministic validation
7. Run component tests
8. Run affected visual/a11y/SSR checks
9. Summarize changed contracts
10. Stop when acceptance criteria are met
```

对于组件新增任务，Agent 必须先找到：

```text
同家族组件
→ 对应 metadata
→ 对应测试
→ 对应 recipe
→ 对应 theme tokens
```

禁止直接从零复制另一个组件。

---

# 20. Performance Architecture

性能是架构原则：Tree-shaking、ESM-first、按组件/功能加载、轻量 runtime、有限响应式、SSR/Hydration、大数据虚拟化、Overlay、Animation、Lazy mounting、Async component，以及“能用 CSS 完成就不要用 JS”。

## 20.1 Runtime 原则

```text
Prefer CSS > DOM > lightweight composable > global state
```

禁止：

```text
每个组件一个 store
每个交互都 deep watch
每个状态都 computed
全局注册所有组件
```

## 20.2 Bundle 原则

目标：

```text
import { Button } from '@ui/components'
```

只进入 Button 相关代码。

不要：

```text
import '@ui/components/dist/index.css'
```

再让所有组件样式一并进入首包。

## 20.3 Data-heavy 组件

Table / VirtualTable 必须尽量避免：

```text
10000 rows × 每行几十个 Vue component instance
```

而要采用：

```text
windowing
DOM reuse
stable keys
shallow state
batched updates
```

---

# 21. Accessibility Architecture

A11y 不再是“组件完成以后补测试”，而是 Component Contract 的一部分。

A11y 合同覆盖 Keyboard Navigation、Focus Management、ARIA、Screen Reader、Focus Trap、Escape、Arrow Navigation、Reduced Motion、High Contrast。

## 21.1 每类组件定义 Keyboard Contract

例如 Select：

```text
ArrowUp / ArrowDown
Enter
Escape
Home / End（适用时）
```

Select、Dialog 等浮层类组件必须提供明确的键盘交互与焦点圈定行为。

## 21.2 A11y 自动化

每个组件至少：

```text
semantic role
keyboard test
focus test
aria test
screen reader semantics review
reduced motion test
```

---

# 22. SSR / Nuxt Architecture

系统以 Vue 3 + TypeScript 为核心，支持 Vue、Nuxt、Vite、SSR、SSG、Hydration、SPA，并禁止 `window`、`document`、`localStorage` 等浏览器 API 在 SSR 阶段直接执行。

## 22.1 组件分三种

```text
SSR-safe
SSR-aware
Client-only
```

Metadata 必须明确声明。

例如：

```ts
ssr: {
  supported: true,
  hydrationSafe: true,
  clientOnlyBehavior: false
}
```

## 22.2 DOM Side Effect 约束

浏览器 API 只能出现在：

```ts
onMounted()
if (import.meta.client)
```

并通过 lint rule 检查高风险调用。

## 22.3 Overlay SSR

Dialog / Drawer / Dropdown / Tooltip 必须有明确：

```text
Teleport strategy
SSR placeholder
Hydration behavior
Focus restore behavior
```

避免“SSR HTML 与客户端首屏结构不一致”。

---

# 23. TypeScript Architecture

TypeScript 本身就是产品体验的一部分；要求 Props、Emits、Slots、Expose、Generic Components，以及泛型 Table、Form、Select、Tree、Cascader。

## 23.1 类型原则

```text
Type inference > explicit config

Generic constraint > any

Discriminated union > boolean explosion
```

例如不要：

```ts
mode?: string
```

而是：

```ts
type SelectMode = "single" | "multiple";
```

## 23.2 API 类型与 AI Metadata 必须来自同源

```text
TS Type
   ↓
Metadata generator
   ↓
API docs
   ↓
AI registry
```

这样能防止：

> TypeScript 允许 A，AI 文档却告诉 Agent 只能 B。

---

# 24. Theme Architecture

## 24.1 Theme 不复制组件

```text
<Component>
      │
      ↓
semantic tokens
      │
 ┌────┼────┐
 ↓    ↓    ↓
Paper Dark Technical
```

换肤只修改 Token / CSS Variables，不复制组件；主题选择可以通过 `data-accent` / `data-theme` 等属性驱动。

## 24.2 Theme Contract

每套 Theme 都必须提供：

```text
color
surface
text
radius
border
shadow
motion
focus
semantic states
```

并经过：

```text
contrast audit
component visual audit
```

---

# 25. 文案系统

文案是视觉系统的一部分：以“你”称呼用户，单句 ≤20 字，按钮动词开头 4–6 字，禁感叹号与营销词，错误必须给出原因与补救，空状态必须给出下一步。

不要把它写成纯设计文案规则，而应变成 `copy` metadata：

```ts
copy: {
  tone: 'quiet-reliable',
  maxSentenceLength: 20,
  buttonVerbFirst: true,
  marketingTerms: 'forbidden'
}
```

这样未来 CLI / AI Agent 生成的 UI 也能自动遵守。

---

# 26. Visual Quality Architecture

视觉质量的关键工程化策略是：**把审美转化为确定性检查。**

`tools/audit.mjs` 应检查颜色白名单、字号、圆角、间距、z-index、动效时长等确定性规则；每屏强调色数量、状态矩阵、句长、数字对账和装饰判断交由语义/视觉审查。

本系统正式版应将它升级为：

```text
Deterministic Audit
├── token violations
├── forbidden CSS values
├── forbidden styles
├── z-index
├── motion duration
└── spacing/radius/type

Semantic Audit
├── states
├── copy
├── numeric consistency
├── component purpose
└── decorative noise

Browser Audit
├── screenshot
├── keyboard
├── overflow
├── focus
├── responsive
└── hydration
```

形成三级质量门：

```text
Code → Static Audit → Browser Audit → Human/Agent Review
```

---

# 27. Testing Architecture

每个组件必须有独立的 6 维测试矩阵：

```text
API
Behavior
A11y
SSR
Performance
Visual
```

测试统一覆盖 API / Behavior / A11y / SSR / Performance / Visual 六个维度。

## 27.1 Testing stack

推荐：

```text
Unit        → Vitest
Component   → Vue Test Utils
E2E         → Playwright
Visual      → Playwright screenshots
A11y        → axe + keyboard scenarios
SSR         → Vue SSR renderer / Nuxt test app
Type        → vue-tsc + type tests
Benchmark   → dedicated benchmark runner
```

## 27.2 Test naming

```text
button.api.spec.ts
button.behavior.spec.ts
button.a11y.spec.ts
button.ssr.spec.ts
button.performance.spec.ts
button.visual.spec.ts
```

---

# 28. Benchmark Architecture

不能只测 Bundle Size。

Benchmark 至少测量 Initial JS、Gzip Size、Runtime、Mount、Update、Memory、SSR Render、Hydration、1,000 rows、10,000 rows。

建议 benchmark 定义为：

```text
Benchmark Suite
├── import-cost
├── cold-start
├── mount
├── update
├── interaction
├── memory
├── ssr
├── hydration
├── 1k-table
├── 10k-table
└── virtual-table
```

并为每个组件定义预算：

```json
{
  "bundle": {
    "maxGzipBytes": 0
  },
  "mount": {
    "maxMs": 0
  }
}
```

具体阈值不要在架构阶段拍脑袋，应在第一轮 baseline 后冻结。

---

# 29. AI Code Generation Benchmark

这是整个项目最值得建立的专属指标。

AI Benchmark 应使用真实任务，例如“创建带筛选、分页、排序的数据表”，并统计首次生成成功率、编译成功率、类型错误率、视觉错误率、API 使用错误率、人工修改行数。

正式设计：

```text
AI Evaluation Tasks
├── create login
├── create settings form
├── create search page
├── create sortable table
├── create dashboard
├── create AI chat
└── migrate legacy page
```

每个 task 记录：

```text
compilePass
runtimePass
apiCorrect
visualPass
a11yPass
ssrPass
manualEditLines
iterations
```

最终指标：

```text
AI Task Success Rate
```

不是“模型觉得好不好”，而是 **代码是否真的可运行、可维护、符合组件契约**。

---

# 30. Registry / Codegen Architecture

所有自动化工具都建立在 Registry 上：

```text
Component Definition
        ↓
    Registry
  ┌────┼───────────┐
  ↓    ↓     ↓     ↓
Docs  CLI   MCP  Codegen
```

Code Generator 可以：

```text
Intent
 ↓
Recipe lookup
 ↓
Component selection
 ↓
Code skeleton
 ↓
Type validation
 ↓
Static audit
```

这比让 LLM 单纯生成任意 Vue template 更可靠。

---

# 31. 第一阶段开发顺序

不建议一开始让很多 Agent 同时造组件；应先建立 Tokens、审计器与样板组件，冻结第一版系统基线，再并行扩展。

推荐：

## Phase 0：System Foundation

```text
Token schema
Theme schema
Component schema
Registry schema
Audit engine
AGENTS.md
```

## Phase 1：定调样板

```text
00-tokens
Button
Input
Dialog
Table
```

先形成：

```text
视觉基线
API 基线
A11y 基线
SSR 基线
Metadata 基线
```

实施时先建立审计脚本，再完成 Tokens 与 Button 样板；零违规后冻结第一版视觉与 API 基线。

## Phase 2：基础组件扩展

按：

```text
Foundation
Input
Feedback
Navigation
```

并行派发。

组件生产采用基础、数据、反馈、导航、复合场景等类别并行；所有 Agent 边产出边运行确定性审计。

## Phase 3：Patterns

```text
DataToolbar
FilterBar
SearchPanel
SettingsSection
```

## Phase 4：AI UI

```text
PromptInput
AIResponse
ToolCall
Citation
Artifact
```

## Phase 5：Agent Tooling

```text
CLI
MCP
Codegen
AI benchmark
```

---

# 32. MVP 范围

MVP 必须完成下面这条闭环：

```text
Install
 ↓
Import
 ↓
Autocomplete
 ↓
Component docs
 ↓
Theme
 ↓
Pattern
 ↓
AI discover
 ↓
Generate
 ↓
Validate
```

## MVP 必须具备

### Runtime

```text
15–20 核心组件
Vue 3
TS
Tree-shaking
SSR-safe
```

### Design

```text
Paper theme
Dark preview
Token system
Responsive
A11y
```

### AI

```text
component metadata
registry
recipes
CLI inspect/search/docs
MCP read/search
```

### Quality

```text
unit
component
a11y
SSR
visual
static audit
AI generation benchmark
```

---

# 33. 长期演进路线

## L1：Component System

目标：

```text
高质量基础组件
```

## L2：Data System

目标：

```text
Form Engine
DataGrid
Virtualization
```

## L3：Pattern System

目标：

```text
页面级通用交互模式
```

## L4：AI Interface System

目标：

```text
Chat
Agent
Workflow
Generative UI
```

## L5：AI Code Interface

目标：

```text
Registry
CLI
MCP
Codegen
Validation
```

## L6：Autonomous UI Engineering

最终形成：

```text
Issue / Intent
      ↓
AI discovers system
      ↓
selects components
      ↓
composes pattern
      ↓
generates code
      ↓
runs tests
      ↓
visual audit
      ↓
fixes violations
      ↓
opens PR
```

这一阶段，组件库已经不再只是 UI dependency，而成为 **AI 进行前端工程工作的“UI API”**。

---

# 34. 最重要的工程原则

## Principle 1：Metadata 与 Runtime 同源

不要人工维护两份 API。

## Principle 2：Token 是唯一视觉事实源

组件不能直接发明颜色、间距、圆角、动效值。

## Principle 3：Behavior、A11y、SSR 是组件正确性

不是 release 前补丁。

## Principle 4：Pattern 是一等公民

让 Agent 能直接复用页面级结构。

## Principle 5：CLI / MCP 只读取 Registry

不要形成第二套知识源。

## Principle 6：先建立基线，再并行生产

视觉和架构没有样板之前，大规模 Agent 并行会产生漂移。

## Principle 7：确定性问题用代码检查

例如颜色、间距、圆角、字号、动效时长、z-index。本设计的 `audit.mjs` 已经证明这条路径可行。

## Principle 8：LLM 负责判断，工具负责证明

```text
LLM：
“这个组合合理吗？”

Tool：
“这个颜色是否违规？”
“SSR 是否失败？”
“键盘是否可用？”
“10k rows 是否超预算？”
```

---

# 35. 推荐最终目录

```text
ui-system/
│
├── apps/
│   ├── docs/
│   ├── playground/
│   ├── registry/
│   └── benchmark/
│
├── packages/
│   ├── core/
│   ├── tokens/
│   ├── primitives/
│   ├── composables/
│   ├── components/
│   ├── patterns/
│   ├── blocks/
│   ├── ai-components/
│   ├── theme/
│   ├── metadata/
│   ├── registry/
│   └── nuxt/
│
├── tooling/
│   ├── cli/
│   ├── audit/
│   ├── a11y/
│   ├── visual/
│   ├── benchmark/
│   ├── metadata-gen/
│   └── codegen/
│
├── schemas/
│   ├── component.schema.json
│   ├── pattern.schema.json
│   ├── block.schema.json
│   ├── recipe.schema.json
│   ├── token.schema.json
│   └── registry.schema.json
│
├── registry/
│   ├── components.json
│   ├── patterns.json
│   ├── blocks.json
│   ├── recipes.json
│   ├── tokens.json
│   └── themes.json
│
├── tests/
│   ├── unit/
│   ├── component/
│   ├── a11y/
│   ├── ssr/
│   ├── hydration/
│   ├── visual/
│   ├── performance/
│   └── ai-generation/
│
├── docs/
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

# 36. 最终验收标准

## 36.1 单组件

```text
[ ] Public API 完整
[ ] TypeScript 完整
[ ] metadata 完整
[ ] What / When / When Not
[ ] Patterns / Anti-patterns
[ ] A11y
[ ] SSR
[ ] Performance notes
[ ] default / hover / focus / active / disabled
[ ] error / loading（适用时）
[ ] responsive
[ ] visual test
[ ] keyboard test
[ ] docs
```

所有交互组件至少具备 default / hover / focus-visible / active / disabled；输入组件增加 error；可等待组件增加 loading。

## 36.2 系统级

```text
[ ] Tree-shaking
[ ] SSR
[ ] Hydration
[ ] A11y
[ ] Bundle benchmark
[ ] Runtime benchmark
[ ] Visual audit
[ ] Token audit
[ ] AI generation benchmark
[ ] CLI
[ ] MCP
[ ] Registry
```

---

# 37. 一句话定义这个项目

> **它不是一个“有很多 Vue 组件的 npm 包”，而是一套让人和 AI 都能理解、组合、生成、验证、维护 UI 的机器可读 Design System。**

其中：

```text
Design Tokens
    = 视觉语言

Component Contracts
    = 行为语言

Metadata
    = AI 语言

Patterns / Blocks
    = 产品语言

CLI / MCP / Codegen
    = AI ↔ UI 的接口

Audit / Test / Benchmark
    = 系统的证明机制
```

最终闭环：

```text
           HUMAN
             │
             ▼
        Intent / Design
             │
             ▼
      AI-readable Registry
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
   Component Pattern Block
      │      │      │
      └──────┼──────┘
             ▼
         Codegen
             ▼
         Validation
      ┌──────┼──────┐
      ▼      ▼      ▼
     A11y   SSR    Perf
             │
             ▼
          UI / PR
```

最终目标是：**不是“更漂亮的 Element Plus”，而是让 AI 和人类都能高效理解、组合、生成和维护 UI。**
