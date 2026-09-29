<script setup lang="ts">
/**
 * 数据仪表盘构建块：统计卡（Statistic）+ 筛选（Select / Input）+
 * 可排序表格（Table，状态列 Badge）+ 分页（Pagination）+ 用量配额（Progress）。
 * 仅依赖 @ui/components 与 --ui-* token。
 */
import { computed, ref, watch } from 'vue'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Progress,
  Select,
  Skeleton,
  Statistic,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@ui/components'
import type { SelectOption, TableColumn } from '@ui/components'

type ServiceStatus = 'running' | 'maintaining' | 'stopped' | 'error'

interface ServiceRow {
  id: number
  name: string
  env: 'production' | 'staging'
  status: ServiceStatus
  requests: number
  errorRate: number
  latency: number
}

const STATUS_META: Record<ServiceStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  running: { label: '运行中', variant: 'success' },
  maintaining: { label: '维护中', variant: 'warning' },
  stopped: { label: '已停止', variant: 'neutral' },
  error: { label: '异常', variant: 'danger' },
}

const BASE_NAMES = ['paper-api', 'paper-web', 'gateway', 'agent-worker', 'docs-site', 'billing', 'search', 'notify']

/** 确定性生成 23 行数据（无随机数，SSR / 客户端渲染一致） */
const allServices: ServiceRow[] = Array.from({ length: 23 }, (_, i) => {
  const statusPool: ServiceStatus[] = ['running', 'running', 'running', 'running', 'maintaining', 'stopped', 'error']
  return {
    id: i + 1,
    name: `${BASE_NAMES[i % BASE_NAMES.length]}-${String(Math.floor(i / BASE_NAMES.length) + 1).padStart(2, '0')}`,
    env: i % 3 === 0 ? 'staging' : 'production',
    status: statusPool[i % statusPool.length],
    requests: 21034 + i * 3617 + ((i * i * 97) % 4000),
    errorRate: i % 7 === 6 ? 2.1 + (i % 5) * 0.3 : (i * 13 % 60) / 100,
    latency: 122 + ((i * 29) % 180),
  }
})

const PAGE_SIZE = 8

const tab = ref('services')
const env = ref<string | null>(null)
const keyword = ref('')
const page = ref(1)
const refreshing = ref(false)

const ENV_OPTIONS: SelectOption[] = [
  { label: '全部环境', value: 'all' },
  { label: '生产', value: 'production' },
  { label: '预发', value: 'staging' },
]

const RANGE_OPTIONS: SelectOption[] = [
  { label: '近 24 小时', value: '24h' },
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
]

const timeRange = ref<string | null>('24h')

const filtered = computed(() =>
  allServices.filter((row) => {
    if (env.value !== null && env.value !== 'all' && row.env !== env.value) return false
    if (keyword.value.trim() !== '' && !row.name.includes(keyword.value.trim())) return false
    return true
  }),
)

const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// 筛选变化后停留在越界页没有意义，回到第一页
watch([env, keyword], () => {
  page.value = 1
})

function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const columns: TableColumn<ServiceRow>[] = [
  { key: 'name', label: '服务' },
  { key: 'env', label: '环境' },
  { key: 'status', label: '状态' },
  { key: 'requests', label: '请求数', align: 'right', sortable: true },
  { key: 'errorRate', label: '错误率', align: 'right', sortable: true },
  { key: 'latency', label: '平均延迟', align: 'right', sortable: true },
]

function refresh(): void {
  if (refreshing.value) return
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
  }, 900)
}

const QUOTAS = [
  { label: 'AI 调用次数', value: 42, detail: '8,420 / 20,000 次' },
  { label: '对象存储', value: 68, detail: '336 / 500 GB' },
  { label: '出口带宽', value: 81, detail: '1.62 / 2.00 TB' },
]
</script>

<template>
  <div class="ui-block-dashboard">
    <header class="ui-block-dashboard__head">
      <div>
        <h2 class="ui-block-dashboard__title">运营总览</h2>
        <p class="ui-block-dashboard__subtitle">工作区 paper-prod · 数据每 5 分钟汇总一次</p>
      </div>
      <div class="ui-block-dashboard__ops">
        <Select v-model="timeRange" :options="RANGE_OPTIONS" aria-label="时间范围" class="ui-block-dashboard__range" @update:model-value="refresh" />
        <Button variant="secondary" :loading="refreshing" @click="refresh">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </template>
          刷新
        </Button>
      </div>
    </header>

    <div class="ui-block-dashboard__stats">
      <Card v-for="stat in [
        { title: '总请求量', value: 1284306, trend: 'up' as const, suffix: ' 次' },
        { title: '活跃用户', value: 8642, trend: 'up' as const, suffix: ' 人' },
        { title: '错误率', value: 0.42, precision: 2, suffix: '%' },
        { title: '平均延迟', value: 238, suffix: 'ms' },
      ]" :key="stat.title" class="ui-block-dashboard__stat">
        <CardBody>
          <Statistic
            :title="stat.title"
            :value="stat.value"
            :precision="'precision' in stat ? stat.precision : undefined"
            :suffix="stat.suffix"
            :trend="'trend' in stat ? stat.trend : undefined"
          />
        </CardBody>
      </Card>
    </div>

    <Card>
      <CardBody class="ui-block-dashboard__panel">
        <Tabs v-model:value="tab">
          <div class="ui-block-dashboard__bar">
            <TabsList aria-label="数据视图">
              <TabsTrigger value="services">服务状态</TabsTrigger>
              <TabsTrigger value="quotas">用量与配额</TabsTrigger>
            </TabsList>
            <template v-if="tab === 'services'">
              <Select v-model="env" :options="ENV_OPTIONS" aria-label="环境筛选" class="ui-block-dashboard__filter" />
              <Input v-model="keyword" placeholder="搜索服务名…" class="ui-block-dashboard__filter" />
            </template>
          </div>

          <TabsContent value="services">
            <Table :columns="columns" :data="paged" row-key="id" :loading="refreshing">
              <template #cell-env="{ value }">
                <span class="ui-block-dashboard__env">{{ value === 'production' ? '生产' : '预发' }}</span>
              </template>
              <template #cell-status="{ value }">
                <Badge :variant="STATUS_META[value as ServiceStatus].variant" dot>
                  {{ STATUS_META[value as ServiceStatus].label }}
                </Badge>
              </template>
              <template #cell-requests="{ value }">{{ formatNumber(value as number) }}</template>
              <template #cell-errorRate="{ value }">
                <span class="ui-block-dashboard__rate" :class="{ 'ui-block-dashboard__rate--bad': (value as number) >= 1 }">
                  {{ ((value as number)).toFixed(2) }}%
                </span>
              </template>
              <template #cell-latency="{ value }">{{ value }} ms</template>
              <template #empty>
                <p class="ui-block-dashboard__empty">没有匹配「{{ keyword }}」的服务，试试更换关键词或环境</p>
              </template>
            </Table>
            <div class="ui-block-dashboard__pagination">
              <span class="ui-block-dashboard__count">共 {{ filtered.length }} 个服务</span>
              <Pagination v-model:page="page" :total="filtered.length" :page-size="PAGE_SIZE" />
            </div>
          </TabsContent>

          <TabsContent value="quotas">
            <div class="ui-block-dashboard__quotas">
              <div v-for="quota in QUOTAS" :key="quota.label" class="ui-block-dashboard__quota">
                <div class="ui-block-dashboard__quota-head">
                  <span>{{ quota.label }}</span>
                  <span class="ui-block-dashboard__quota-detail">{{ quota.detail }}</span>
                </div>
                <Progress :value="quota.value" :aria-label="quota.label" />
              </div>
              <div class="ui-block-dashboard__quota-skeleton">
                <p class="ui-block-dashboard__quota-title">即将上线：按模型维度的用量拆分</p>
                <Skeleton :lines="2" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardBody>
    </Card>
  </div>
</template>

<style scoped>
.ui-block-dashboard {
  padding: var(--ui-space-6) var(--ui-space-4);
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  max-width: calc(var(--ui-space-8) * 13);
  width: 100%;
  margin-inline: auto;
}

.ui-block-dashboard__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ui-space-4);
  flex-wrap: wrap;
}

.ui-block-dashboard__title {
  margin: 0;
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-dashboard__subtitle {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.ui-block-dashboard__ops {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-block-dashboard__range {
  width: calc(var(--ui-space-8) * 3);
}

.ui-block-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ui-space-3);
}

.ui-block-dashboard__panel {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.ui-block-dashboard__bar {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

.ui-block-dashboard__filter {
  width: calc(var(--ui-space-8) * 4);
}

.ui-block-dashboard__env {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.ui-block-dashboard__rate {
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-2);
}

.ui-block-dashboard__rate--bad {
  color: var(--ui-danger);
  font-weight: var(--ui-font-weight-medium);
}

.ui-block-dashboard__empty {
  margin: 0;
  color: var(--ui-text-3);
}

.ui-block-dashboard__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

.ui-block-dashboard__count {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.ui-block-dashboard__quotas {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
  max-width: calc(var(--ui-space-8) * 8);
}

.ui-block-dashboard__quota {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.ui-block-dashboard__quota-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}

.ui-block-dashboard__quota-detail {
  font-variant-numeric: var(--ui-numeric);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.ui-block-dashboard__quota-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  padding-top: var(--ui-space-3);
  border-top: 1px solid var(--ui-border);
}

.ui-block-dashboard__quota-title {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
