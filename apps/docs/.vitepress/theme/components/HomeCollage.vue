<script setup lang="ts">
import { ref } from 'vue'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Input,
  Progress,
  Switch,
  Table,
  ToastHost,
  toast,
} from '@ui/components'
import type { TableColumn } from '@ui/components'

interface DeployRow {
  name: string
  env: string
  score: number
}

const keyword = ref('')
const autoSync = ref(true)
const columns: TableColumn<DeployRow>[] = [
  { key: 'name', label: '服务' },
  { key: 'env', label: '环境' },
  { key: 'score', label: '健康度', align: 'right' },
]
const rows: DeployRow[] = [
  { name: 'paper-web', env: '生产', score: 98 },
  { name: 'paper-api', env: '预发', score: 86 },
  { name: 'paper-worker', env: '生产', score: 91 },
]

function greet(): void {
  toast.success('纸面已就绪：token 驱动，a11y / SSR 安全')
}
</script>

<template>
  <div class="ui-docs-collage">
    <div class="ui-docs-collage__section">
      <Alert severity="info" title="为什么是「纸面」">
        克制的纸感视觉：全部颜色、间距、圆角、动效收敛为 --ui-* 设计 token，组件不写死任何视觉值。
      </Alert>
    </div>

    <div class="ui-docs-collage__grid">
      <section class="ui-docs-collage__card">
        <h3>动作</h3>
        <div class="ui-docs-collage__row">
          <Button variant="primary" @click="greet">开始使用</Button>
          <Button>查看组件</Button>
          <Button variant="danger">删除</Button>
          <Button variant="ghost" loading>加载中</Button>
        </div>
      </section>

      <section class="ui-docs-collage__card">
        <h3>表单</h3>
        <Input v-model="keyword" placeholder="搜索组件…" />
        <label class="ui-docs-collage__switch">
          <Switch v-model="autoSync" />
          <span>自动同步 token</span>
        </label>
      </section>

      <section class="ui-docs-collage__card">
        <h3>身份与状态</h3>
        <div class="ui-docs-collage__row">
          <Avatar name="纸面" alt="纸面" />
          <Badge variant="success" dot>运行中</Badge>
          <Badge variant="warning" dot>预发</Badge>
        </div>
        <Progress :value="72" />
      </section>
    </div>

    <section class="ui-docs-collage__card">
      <h3>数据</h3>
      <Table :columns="columns" :data="rows" row-key="name" />
    </section>

    <ToastHost />
  </div>
</template>

<style scoped>
.ui-docs-collage__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--ui-space-4);
}

.ui-docs-collage__section {
  margin-bottom: var(--ui-space-4);
}

.ui-docs-collage__card {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-4) var(--ui-space-5);
  margin-top: var(--ui-space-4);
  box-shadow: var(--ui-shadow-rest);
}

.ui-docs-collage__card h3 {
  margin: 0 0 var(--ui-space-3);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-docs-collage__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-docs-collage__switch {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  width: fit-content;
  cursor: pointer;
}
</style>
