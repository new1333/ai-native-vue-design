import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildSidebar } from './sidebar'
import { buildLocalSearchOptions } from './search-extra'

export default defineConfig({
  // GitHub Project Pages 部署在子路径 https://new1333.github.io/ai-native-vue-design/ 下，
  // 静态资源与站内链接必须带该前缀（本地 dev/preview 也工作于同一子路径）。
  // 与 .github/workflows/docs-pages.yml 的 artifact 路径约定：勿单侧改动仓库名。
  base: '/ai-native-vue-design/',
  title: '纸面 Paper',
  description: '为 AI 协作而设计的 Vue 3 组件库 —— token 驱动、a11y / SSR 就绪、meta 即契约',
  lang: 'zh-CN',
  // tokens 目前只有 paper 浅色 Profile：禁用暗色切换，避免露出未设计的深色页面。
  appearance: false,
  lastUpdated: true,
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
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
    editLink: {
      pattern: 'https://github.com/new1333/ai-native-vue-design/edit/main/apps/docs/src/zh/:path',
      text: '在 GitHub 上编辑此页',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/new1333/ai-native-vue-design' },
    ],
    footer: {
      message: '纸面 Paper · 为 AI 协作而设计的 Vue 3 组件库',
      copyright: '开发阶段 · 许可证待定',
    },
    search: {
      provider: 'local',
      // _render 为内部钩子，其类型已在 search-extra.ts 用交叉类型补齐，
      // 此处直接赋值即可、无需断言；下划线 key 不会被序列化进客户端。
      options: buildLocalSearchOptions(),
    },
  },
})
