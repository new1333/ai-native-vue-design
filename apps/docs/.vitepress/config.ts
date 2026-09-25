import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildSidebar } from './sidebar'

export default defineConfig({
  title: '纸面 Paper',
  description: '为 AI 协作而设计的 Vue 3 组件库 —— token 驱动、a11y / SSR 就绪、meta 即契约',
  lang: 'zh-CN',
  // tokens 目前只有 paper 浅色 Profile：禁用暗色切换，避免露出未设计的深色页面。
  appearance: false,
  srcDir: 'src/zh',
  markdown: {
    // 代码块统一深底浅字（与 Demo/源码面板一致）：固定单一 github-dark，
    // 避免 vp-adaptive-theme 在浅色模式下套用深色系 token 色。
    theme: 'github-dark',
  },
  vite: {
    resolve: {
      alias: {
        // demo 文件（srcDir 之外，不产生页面路由）
        '@docs-demos': fileURLToPath(new URL('../src/demos', import.meta.url)),
        // 组件包源码：源码查看（?raw）与类型引用
        '@comp-src': fileURLToPath(new URL('../../../packages/components/src', import.meta.url)),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/components/general/button', activeMatch: '/components/' },
      { text: '设计 Token', link: '/tokens/', activeMatch: '/tokens/' },
    ],
    sidebar: buildSidebar(),
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
  },
})
