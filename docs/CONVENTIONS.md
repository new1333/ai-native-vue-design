# 组件编写规约（CONVENTIONS）

适用范围：`packages/components` 下所有组件。实现与本文冲突时，以本文为准；本文未覆盖处遵循根目录设计文档与 TypeScript strict 默认。动手前先读 `AGENTS.md`。

## 1. 目录结构

每个组件位于 `packages/components/src/<kebab-name>/`，完整结构如下：

```text
packages/components/src/button/
├── index.ts                  # 目录唯一公共出口：导出组件、composable、类型
├── Button.vue                # 单文件组件实现
├── Button.types.ts           # Props / Emits / Slots / Expose 等公共类型
├── Button.meta.ts            # 组件契约元数据（ComponentDefinition）
├── Button.api.spec.ts        # api 测试：props 默认值 / emits 声明 / slots 渲染
├── Button.behavior.spec.ts   # 交互测试：trigger 事件后的行为
├── Button.a11y.spec.ts       # 无障碍测试：role / aria / 键盘序列
└── Button.ssr.spec.ts        # SSR 测试（文件首行必须是 @vitest-environment node 注释）
```

复杂组件（含状态机、跨 DOM 逻辑、可复用交互逻辑）**另加**：

- `useButton.ts` —— composable：复杂状态管理与键盘逻辑收口于此，保持 SFC 薄；
- `Button.constants.ts` —— 常量收口（键名、状态名等逻辑常量；**不是**视觉值，视觉值只走 token）。

规则：

- 目录名 `kebab-case`；文件名中组件部分 `PascalCase`。
- 目录内 `index.ts` 是唯一公共出口，导出组件、composable、公共类型（`export { Button } from './Button.vue'`、`export * from './Button.types'` 等）；未来的 `src/index.ts` 汇总只从各目录 `index.ts` 引入。
- **组件任务严禁修改 `packages/components/src/index.ts`**（由汇总任务维护），**严禁改动其他组件目录**。

## 2. 样式

- 样式写在 SFC `<style scoped>` 中；class 一律以 `ui-` 前缀命名（如 `ui-button`、`ui-button__icon`、`ui-button--primary`），根元素必须带 `ui-<kebab>` 根类（ssr 测试以它断言）。
- 组件包内一切**颜色、字号、间距、圆角、阴影、动效时长、z-index** 只能使用 `var(--ui-*)` token，禁止任何裸值：

```css
/* 禁止 */
padding: 13px;
border-radius: 9px;
color: #2c2a25;
transition: 260ms;
z-index: 999;

/* 要求 */
padding: var(--ui-space-3);
border-radius: var(--ui-radius-md);
color: var(--ui-text-1);
transition: color var(--ui-motion-default) var(--ui-ease-out);
z-index: var(--ui-z-dropdown);
```

- 组件包自身**不引入任何全局 CSS**（无 import css、无全局 reset/字体设定）；`--ui-*` 变量由使用方在其应用入口一次性引入 `@ui/tokens/paper.css` 获得。发现 token 缺值时在结果中提出需求，不得写死。
- 图标只用内联 SVG（`viewBox="0 0 24 24"`、`stroke-width="1.5"`、`currentColor`，尺寸 16/20/24），遵循设计文档 Icon Token。

## 3. meta 契约

`packages/components/src/shared/meta.ts` 定义并导出 `ComponentDefinition` 接口（全部组件共用；该文件由基建/首个组件任务创建，之后只增不改字段语义）：

```ts
export interface ComponentDefinition {
  id: string
  version: string
  identity: {
    name: string
    package: string
    export: string
    category: string
    description: string
  }
  intent: {
    what: string
    when: string[]
    whenNot: string[]
    userTask: string
  }
  api: {
    props: Array<{
      name: string
      type: string
      default?: string
      required?: boolean
      description: string
    }>
    slots: Array<{ name: string; scope?: string; description: string }>
    events: Array<{ name: string; payload?: string; description: string }>
    exposes: Array<{ name: string; type: string; description: string }>
  }
  constraints: { requires?: string[]; conflicts?: string[]; dependsOn?: string[] }
  composition: { patterns: string[]; related: string[]; preferred: string[] }
  states: {
    default: string
    hover: string
    focusVisible: string
    active: string
    disabled: string
    loading?: string
    error?: string
  }
  accessibility: string
  ssr: string
  performance: string
  styling: string
  examples: string[]
  agent: {
    keywords: string[]
    selectionHints: string[]
    commonTasks: string[]
    generationNotes: string[]
  }
}
```

每个组件的 `Name.meta.ts` 导出符合该接口的常量 `meta`，并从目录 `index.ts` 一并导出：

```ts
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-button',
  version: '0.1.0',
  identity: { name: 'Button', package: '@ui/components', export: 'Button', category: 'general', description: '…' },
  intent: { what: '…', when: ['…'], whenNot: ['…'], userTask: '…' },
  api: { props: [/* … */], slots: [/* … */], events: [/* … */], exposes: [/* … */] },
  constraints: {},
  composition: { patterns: [], related: [], preferred: [] },
  states: { default: '…', hover: '…', focusVisible: '…', active: '…', disabled: '…' },
  accessibility: '…',
  ssr: '…',
  performance: '…',
  styling: '…',
  examples: ['…'],
  agent: { keywords: [], selectionHints: [], commonTasks: [], generationNotes: [] },
}
```

字段语义：`identity` 定位组件；`intent` 说明何时该用/不该用（供 AI 选型）；`api` 与 `Name.types.ts` 必须一致；`states` 描述各交互态的视觉与行为；`accessibility/ssr/performance/styling` 为一段式契约描述；`examples` 为模板字符串用法示例；`agent.*` 面向生成代理的选型与生成提示。meta 是机器可读契约，字段必须真实、与实现同步。

## 4. TypeScript

- 全量 strict（继承 `tsconfig.base.json`）。
- `Props` / `Emits` / `Slots` / `Expose` 类型定义于 `Name.types.ts`，并从目录 `index.ts` 公共导出；`defineProps<Props>()`、`defineEmits<Emits>()` 等以类型方式声明。
- 公共类型必须显式导出；禁止隐式 `any`、禁止 `as any` 绕过检查。

## 5. SSR 纪律

- 浏览器 API（`window` / `document` / `navigator` / `localStorage` / `matchMedia` / `ResizeObserver` / `IntersectionObserver` 等）**只允许出现在 `onMounted` 回调内**（或仅由其调用的函数）。
- `setup` 顶层与模块顶层不得访问 `window` / `document`；组件在 node 环境 `renderToString` 下必须无异常。
- 尺寸测量、焦点管理、事件监听绑定等 DOM 副作用一律推迟到 mounted 阶段，并在 `onBeforeUnmount` 清理。

## 6. 无障碍

- 交互元素使用原生标签（`button` / `a` / `input`…），不得以 `div` + click 自造按钮。
- 正确的 `role` / `aria-*`（`aria-label`、`aria-expanded`、`aria-disabled` 等按 WAI-ARIA 模式使用）。
- 键盘可达：Tab / Enter / Space / Arrow / Esc 按 WAI-ARIA Authoring Practices；焦点环交给 `:focus-visible` 与 token。

## 7. 测试规范

vitest + `@vue/test-utils`；环境 happy-dom（`vitest.config.ts` 已配 `environment: 'happy-dom'`、`include: ['src/**/*.spec.ts']`）。四类用例与文件一一对应：

- **api（`Name.api.spec.ts`）**：测 props 默认值（不传时 DOM 表现）、emits 声明（`emitted()`）、slots 渲染（默认/具名插槽内容出现）。
- **behavior（`Name.behavior.spec.ts`）**：测交互——`trigger('click')`、`setValue()` 等之后 `emitted()` / DOM 变化的断言。
- **a11y（`Name.a11y.spec.ts`）**：测 role / aria 属性存在性与值；键盘序列（如 `trigger('keydown', { key: 'Enter' })`）后的行为断言。
- **ssr（`Name.ssr.spec.ts`）**：**文件首行必须是注释 `// @vitest-environment node`**；用 `@vue/server-renderer` 的 `renderToString` 渲染组件，断言：① 不抛异常；② 输出包含 `ui-` 根类。

示例（ssr）：

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { Button } from './Button.vue'

describe('Button ssr', () => {
  it('renderToString 无异常且包含 ui-button 根类', async () => {
    const html = await renderToString(Button as never, { props: {} } as never)
    expect(html).toContain('ui-button')
  })
})
```

## 8. 边界

- **组件不得修改 `packages/components/src/index.ts`**（由汇总任务维护），**不得改动其他组件目录**与共享配置。
- 需要新 token、新共享工具时：在任务结果中提出，不自行在组件内写死或跨目录添加。
