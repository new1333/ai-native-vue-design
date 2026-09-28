<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import HeroShowcase from './components/HeroShowcase.vue'
import NotFound from './components/NotFound.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 覆盖默认英文 404:dev 与客户端路由下的未知路径渲染中文 404
         (静态托管仍由 src/zh/404.md 构建出的 404.html 兜底,文案一致) -->
    <template #not-found>
      <NotFound />
    </template>
    <!-- 首页 hero 右列：活组件演示(仅桌面双栏显示,见 paper-theme.css) -->
    <template #home-hero-image>
      <HeroShowcase />
    </template>
  </DefaultTheme.Layout>
</template>
