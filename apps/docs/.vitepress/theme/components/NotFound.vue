<script setup lang="ts">
// withBase：站点部署在 base 子路径（/ai-native-vue-design/，本地 dev/preview 同），
// 手写 <a href> 不会像 markdown 链接那样自动带 base，必须显式包裹。
import { withBase } from 'vitepress'
</script>

<template>
  <!-- 覆盖默认主题的英文 404：dev 与客户端路由下的未知路径由此渲染；
       静态托管仍由 src/zh/404.md 构建出的 404.html 兜底，两处文案保持一致 -->
  <div class="ui-docs-notfound">
    <p class="ui-docs-notfound__code">404</p>
    <h1 class="ui-docs-notfound__title">这一页不在纸面上</h1>
    <p class="ui-docs-notfound__desc">可能已被移动或删除。</p>
    <nav class="ui-docs-notfound__links">
      <a :href="withBase('/')">首页</a>
      <a :href="withBase('/guide/quickstart')">快速开始</a>
      <a :href="withBase('/components/general/button')">组件文档</a>
    </nav>
  </div>
</template>

<style scoped>
.ui-docs-notfound {
  padding: var(--ui-space-8) var(--ui-space-4);
  text-align: center;
}

.ui-docs-notfound__code {
  font-size: var(--ui-text-3xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-docs-notfound__title {
  margin-top: var(--ui-space-3);
  font-size: var(--ui-text-xl);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-docs-notfound__desc {
  margin-top: var(--ui-space-2);
  font-size: var(--ui-text-md);
  color: var(--ui-text-2);
}

.ui-docs-notfound__links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  margin-top: var(--ui-space-5);
}

.ui-docs-notfound__links a {
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-1) var(--ui-space-4);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  text-decoration: none;
  transition: border-color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-notfound__links a:hover {
  border-color: var(--ui-accent);
  background: var(--ui-accent-soft);
}
</style>
