<script setup lang="ts">
/**
 * 首页「组件家族」目录：数据来自 themeConfig.homeDirectory（config.ts 构建期
 * 经 sidebar.ts 的 buildHomeDirectory 生成），与侧边栏永远同源，不存在单侧漂移。
 */
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import type { HomeDirectoryData } from '../../sidebar'

const { theme } = useData<{ homeDirectory?: HomeDirectoryData }>()

const EMPTY: HomeDirectoryData = { groups: [], families: 0, total: 0, blocks: 0 }
const directory = computed<HomeDirectoryData>(() => theme.value.homeDirectory ?? EMPTY)

const groups = computed(() => directory.value.groups)
const total = computed(() => directory.value.total)
const families = computed(() => directory.value.families)
const heading = computed(() => {
  const parts = [`${families.value} 个家族`, `${total.value} 个组件`]
  if (directory.value.blocks > 0) parts.push(`${directory.value.blocks} 个页面构建块`)
  return parts.join('，')
})
</script>

<template>
  <section class="ui-directory">
    <header class="ui-directory__head">
      <h2>{{ heading }}</h2>
      <p>
        每个组件都附带结构化 meta（props / slots / events / 何时用 / 何时不用）与
        api · behavior · a11y · ssr 四类测试——本站的 API 文档全部由 meta 自动渲染。
      </p>
    </header>

    <div class="ui-directory__grid">
      <section
        v-for="group in groups"
        :key="group.label"
        class="ui-directory__card"
      >
        <header class="ui-directory__card-head">
          <h3>{{ group.label }}</h3>
          <span class="ui-directory__count">{{ group.items.length }}</span>
        </header>
        <div class="ui-directory__chips">
          <a
            v-for="item in group.items"
            :key="item.link"
            :href="withBase(item.link)"
          >
            {{ item.label }}
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.ui-directory {
  margin-top: var(--ui-space-8);
}

.ui-directory__head h2 {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  letter-spacing: -0.4px;
}

.ui-directory__head p {
  margin: 0 0 var(--ui-space-5);
  font-size: var(--ui-text-md);
  color: var(--ui-text-2);
  max-width: 640px;
}

.ui-directory__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--ui-space-4);
}

.ui-directory__card {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  padding: var(--ui-space-4);
}

.ui-directory__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-3);
}

.ui-directory__card-head h3 {
  margin: 0;
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-directory__count {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  padding: 0 var(--ui-space-1);
}

.ui-directory__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.ui-directory__chips a {
  padding: var(--ui-space-1) var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-bg);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  text-decoration: none;
  transition:
    border-color var(--ui-motion-fast) var(--ui-ease-out),
    background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-directory__chips a:hover {
  border-color: var(--ui-border-strong);
  background: var(--ui-surface-muted);
}
</style>
