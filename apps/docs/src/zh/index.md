---
layout: home

hero:
  name: 纸面
  text: Paper
  tagline: 为 AI 协作而设计的 Vue 3 组件库 —— AI 会话原语开箱即用，token 驱动视觉，a11y 与 SSR 从架构层保证。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quickstart
    - theme: alt
      text: 浏览全部组件
      link: /components/general/button
    - theme: alt
      text: 设计 Token
      link: /tokens/

features:
  - icon: 🧠
    title: AI 会话原语
    details: 会话界面不再需要手搓：MessageList / Reasoning / StreamingText / ToolCallCard / PromptInput / ModelSelector / Suggestion 覆盖 agent 界面的每个状态，流式输出、工具审批、多模型切换开箱即用。
    link: /components/data/message-list
    linkText: 查看 AI 系组件
  - icon: 🤖
    title: meta 即契约
    details: 每个组件的 props / slots / events、何时用 / 何时不用、组合模式与 a11y 都是结构化 meta——AI 可理解，而不仅仅是可读取；本站的 API 表格即由 meta 自动渲染。
    link: /components/general/button
    linkText: 看一个组件的契约
  - icon: 🎨
    title: token 驱动的纸感视觉
    details: 颜色、间距、圆角、阴影、动效全部收敛为 --ui-* 设计 token，组件内零裸视觉值；引入 paper.css 一次，换 Profile 即换肤。
    link: /tokens/
    linkText: 浏览设计 Token
  - icon: ♿
    title: 无障碍一等公民
    details: 原生标签、WAI-ARIA 模式、键盘路径逐条落地；每个组件都有 a11y spec 兜底，焦点环与 reduced-motion 由 token 全局内建。
    link: /components/overlay/dialog
    linkText: 看一个键盘路径示例
  - icon: 🧊
    title: SSR 安全
    details: 浏览器 API 只允许出现在 onMounted；每个组件在 node 环境 renderToString 下都有 ssr spec 断言，SSG / SSR 直接可用。
    link: /guide/installation
    linkText: 安装与接入
  - icon: 🧩
    title: 命令式服务
    details: toast 等以单例 + Host 形态提供程序式 API：SSR 安全、回调恰好一次；浮层、模态、列表导航共享同一套引擎。
    link: /components/feedback/toast
    linkText: 查看 Toast
---

<AiWorkbench />

<ComponentDirectory />
