---
layout: home

hero:
  name: 纸面
  text: Paper
  tagline: 为 AI 协作而设计的 Vue 3 组件库 —— token 驱动 · a11y / SSR 就绪 · meta 即契约
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quickstart
    - theme: alt
      text: 安装
      link: /guide/installation
    - theme: alt
      text: 设计 Token
      link: /tokens/

features:
  - icon: 🎨
    title: Token 驱动的纸感视觉
    details: 颜色、间距、圆角、阴影、动效全部收敛为 --ui-* 设计 token；组件内零裸视觉值，换 Profile 即换肤。
  - link: /guide/theming
    title: 分层 token 体系
    details: primitive → semantic → component 三层结构，paper.css 一次引入，全局焦点环与 reduced-motion 内建。
    icon: 🧱
  - icon: ♿
    title: 无障碍一等公民
    details: 原生标签、WAI-ARIA 模式、键盘路径逐条落地；每个组件都有 a11y spec 兜底。
  - icon: 🧊
    title: SSR 安全
    details: 浏览器 API 只允许出现在 onMounted；每个组件在 node 环境 renderToString 下有 ssr spec 断言。
  - icon: 🤖
    title: meta 即契约
    details: 每个组件的 props / slots / events / 何时用 / 状态 / agent 提示都是结构化 meta，本页 API 表格即由其生成。
  - icon: 🧩
    title: 命令式服务
    details: toast 等以单例 + Host 形态提供程序式 API，SSR 安全、恰好一次的回调语义。
---

<div class="ui-docs-home-collage">
  <HomeCollage />
</div>

<style>
.ui-docs-home-collage {
  margin-top: var(--ui-space-5);
}
</style>
