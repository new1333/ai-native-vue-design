<script setup lang="ts">
/**
 * 构建块目录卡片（blocks 首页「已有构建块」）：以可 hover 的链接卡呈现
 * 各页面级组合。条目为手写清单——与 sidebar / llms 的「页面 stem ↔ 源码
 * PascalBlock.vue」硬约定共用同一路径，新增块时在此追加一项即可。
 */
import { withBase } from 'vitepress'

interface BlockEntry {
  /** 页面路由（不含 base，经 withBase 拼接） */
  href: string
  name: string
  desc: string
  tag: string
}

const BLOCKS: BlockEntry[] = [
  {
    href: '/blocks/ai-workspace',
    name: 'AI 工作台',
    desc: '对话式 AI 页面：会话列表、模型选择、推理与工具卡审批、流式回复',
    tag: 'AI 对话',
  },
  {
    href: '/blocks/login',
    name: '登录页',
    desc: '居中卡片式登录：校验、记住我、密码显隐与第三方登录入口',
    tag: '表单',
  },
  {
    href: '/blocks/dashboard',
    name: '数据仪表盘',
    desc: '统计卡 + 筛选 + 可排序表格 + 分页 + 用量配额的运营总览',
    tag: '数据',
  },
  {
    href: '/blocks/pricing',
    name: '定价页',
    desc: '月 / 年计费切换与三档方案对比的营销页',
    tag: '营销',
  },
  {
    href: '/blocks/settings',
    name: '设置页',
    desc: '分区导航 + 分组表单，各分区独立保存并即时反馈',
    tag: '设置',
  },
]
</script>

<template>
  <div class="ui-block-gallery">
    <a
      v-for="entry in BLOCKS"
      :key="entry.href"
      class="ui-block-gallery__card"
      :href="withBase(entry.href)"
    >
      <div class="ui-block-gallery__card-head">
        <span class="ui-block-gallery__tag">{{ entry.tag }}</span>
        <svg
          class="ui-block-gallery__arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M7 17 17 7" />
          <path d="M8.5 7H17v8.5" />
        </svg>
      </div>
      <h3 class="ui-block-gallery__name">{{ entry.name }}</h3>
      <p class="ui-block-gallery__desc">{{ entry.desc }}</p>
    </a>
  </div>
</template>

<style scoped>
.ui-block-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--ui-space-4);
}

.ui-block-gallery__card {
  display: flex;
  flex-direction: column;
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  text-decoration: none;
  transition:
    border-color var(--ui-motion-fast) var(--ui-ease-out),
    box-shadow var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-block-gallery__card:hover {
  border-color: var(--ui-border-strong);
  box-shadow: var(--ui-shadow-hover);
}

.ui-block-gallery__card:hover .ui-block-gallery__arrow {
  color: var(--ui-accent);
  margin-left: var(--ui-space-1);
}

.ui-block-gallery__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-3);
}

.ui-block-gallery__tag {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  padding: 0 var(--ui-space-1);
}

.ui-block-gallery__arrow {
  width: 16px;
  height: 16px;
  color: var(--ui-text-3);
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    margin-left var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-block-gallery__name {
  margin: 0 0 var(--ui-space-1);
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-gallery__desc {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}
</style>
