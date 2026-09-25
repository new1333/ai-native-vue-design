/**
 * 文档站主题：VitePress 默认主题 + 纸面 token 覆盖 + 文档渲染组件全局注册。
 *
 * paper.css 在此引入一次（文档站即「使用方」，与 playground 的消费方式一致）；
 * 组件页的 API / 何时用 / 状态等区块由各渲染组件消费组件包导出的 meta 生成。
 */
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@ui/tokens/paper.css'
import './paper-theme.css'

import AgentHints from './components/AgentHints.vue'
import ApiTables from './components/ApiTables.vue'
import ComponentDoc from './components/ComponentDoc.vue'
import Demo from './components/Demo.vue'
import HomeCollage from './components/HomeCollage.vue'
import MetaComposition from './components/MetaComposition.vue'
import MetaIntent from './components/MetaIntent.vue'
import MetaNotes from './components/MetaNotes.vue'
import MetaStates from './components/MetaStates.vue'
import SourceViewer from './components/SourceViewer.vue'
import TokenBoard from './components/TokenBoard.vue'
import TokenPlayground from './components/TokenPlayground.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  // 包装默认 Layout,填充 not-found 插槽(未知路径的中文 404 落地组件)
  Layout,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
    app.component('ComponentDoc', ComponentDoc)
    app.component('MetaIntent', MetaIntent)
    app.component('ApiTables', ApiTables)
    app.component('MetaStates', MetaStates)
    app.component('MetaNotes', MetaNotes)
    app.component('MetaComposition', MetaComposition)
    app.component('AgentHints', AgentHints)
    app.component('SourceViewer', SourceViewer)
    app.component('TokenBoard', TokenBoard)
    app.component('TokenPlayground', TokenPlayground)
    app.component('HomeCollage', HomeCollage)
  },
} satisfies Theme
