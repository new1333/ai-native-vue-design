import { createApp } from 'vue'
// 视觉 token：使用方（本应用）在入口一次性引入 paper.css，获得全部 --ui-* 变量。
import '@ui/tokens/paper.css'
// @ui/components 公共入口（组件样式随组件注册注入，无全局 CSS）。
import '@ui/components'
import App from './App.vue'

createApp(App).mount('#app')
