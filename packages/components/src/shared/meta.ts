/**
 * shared/meta.ts —— 组件契约元数据的公共接口。
 *
 * 全部组件共用；由基建/首个组件任务创建，之后只增不改字段语义
 * （见 docs/CONVENTIONS.md §3）。每个组件的 Name.meta.ts 导出
 * 符合该接口的 `meta` 常量，并从组件目录 index.ts 一并导出。
 */
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
