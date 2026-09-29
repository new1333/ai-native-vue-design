import { fileURLToPath } from 'node:url'
import { defineConfigWithTheme, type DefaultTheme } from 'vitepress'
import { buildHomeDirectory, buildSidebar, type HomeDirectoryData } from './sidebar'
import { buildLocalSearchOptions } from './search-extra'
import { emitLlmsArtifacts } from './llms'

// 默认主题配置 + 首页目录注入（themeConfig.homeDirectory，见 sidebar.ts）：
// defineConfigWithTheme 用交叉类型放行该自定义键，客户端以 useData 泛型对齐。
type SiteThemeConfig = DefaultTheme.Config & { homeDirectory: HomeDirectoryData }

export default defineConfigWithTheme<SiteThemeConfig>({
  // GitHub Project Pages 部署在子路径 https://new1333.github.io/ai-native-vue-design/ 下，
  // 静态资源与站内链接必须带该前缀（本地 dev/preview 也工作于同一子路径）。
  // 与 .github/workflows/docs-pages.yml 的 artifact 路径约定：勿单侧改动仓库名。
  base: '/ai-native-vue-design/',
  title: '纸面 Paper',
  description: '为 AI 协作而设计的 Vue 3 组件库 —— token 驱动、a11y / SSR 就绪、meta 即契约',
  lang: 'zh-CN',
  // 暗色切换：nav 右上角外观按钮，初始档跟随系统偏好。
  // 深色 Profile（夜纸）由 @ui/tokens 提供：VitePress 挂 html.dark 即命中
  // :root.dark 档，--vp-* → --ui-* 映射为活引用，全站自动跟随，无站内胶水。
  appearance: true,
  lastUpdated: true,
  // 构建完成后从 registry/*.json（meta 契约）生成 llms.txt / llms-full.txt /
  // 逐页 .md 写入 outDir（仅 build 生效，dev 不触发）。
  buildEnd: emitLlmsArtifacts,
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
        // 页面构建块源码（srcDir 之外，不产生页面路由；单文件自包含 SFC）
        '@docs-blocks': fileURLToPath(new URL('../src/blocks', import.meta.url)),
        // 组件包源码：源码查看（?raw）与类型引用
        '@comp-src': fileURLToPath(new URL('../../../packages/components/src', import.meta.url)),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/components/general/button', activeMatch: '/components/' },
      { text: '构建块', link: '/blocks/', activeMatch: '/blocks/' },
      { text: '设计 Token', link: '/tokens/', activeMatch: '/tokens/' },
    ],
    sidebar: buildSidebar(),
    // 首页「组件家族」目录数据：与侧边栏同源（见 sidebar.ts 的 buildHomeDirectory），
    // 经 themeConfig 序列化进客户端站点数据，由首页 ComponentDirectory 消费。
    homeDirectory: buildHomeDirectory(),
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
