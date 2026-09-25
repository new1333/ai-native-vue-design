# 快速开始

三步接入一个 Vue 3 应用：引入 token、在组件中按需引入、挂载命令式服务的 Host。

## 1. 应用入口

```ts
// src/main.ts
import { createApp } from 'vue'
// 视觉 token：一次性引入，获得全部 --ui-* 变量（含焦点环与 reduced-motion 约定）
import '@ui/tokens/paper.css'
import App from './App.vue'

createApp(App).mount('#app')
```

组件库没有全局注册插件，入口无需（也不应）引入 `@ui/components`：组件样式随各自的 scoped style 注入，不存在需要提前加载的全局 CSS。

## 2. 在组件中按需引入

组件一律从公共入口具名导入，天然 tree-shaking（这也是唯一的使用方式）：

```vue
<script setup lang="ts">
import { Button } from '@ui/components'
</script>

<template>
  <Button variant="primary" @click="save">保存</Button>
</template>
```

## 3. 挂载命令式服务 Host

`toast` 是程序式单例，但渲染需要一个常驻 Host（`Teleport` 到 `body`）。在应用根组件挂载一次：

```vue
<!-- App.vue -->
<script setup lang="ts">
import { Button, ToastHost, toast } from '@ui/components'
</script>

<template>
  <Button variant="primary" @click="toast.success('已保存')">保存</Button>
  <ToastHost />
</template>
```

## 下一步

- 浏览[组件总览](/components/general/button)，每个组件页都有可交互示例与源码；
- 阅读[主题与 Token](/guide/theming) 了解三层 token 与 Profile 切换；
- 在 [Token 总览](/tokens/)查阅全部可用变量。
