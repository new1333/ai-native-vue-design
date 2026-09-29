<script setup lang="ts">
/**
 * 定价页构建块：计费周期切换（ToggleGroup）+ 三档方案卡片，
 * 推荐档高亮；价格随周期联动。仅依赖 @ui/components 与 --ui-* token。
 */
import { computed, ref } from 'vue'
import { Badge, Button, Card, CardBody, toast, ToggleGroup, ToastHost } from '@ui/components'
import type { ToggleValue } from '@ui/components'

interface Plan {
  key: string
  name: string
  description: string
  monthly: number
  hot: boolean
  cta: string
  features: Array<{ label: string; included: boolean }>
}

const plans: Plan[] = [
  {
    key: 'free',
    name: '免费版',
    description: '个人尝鲜与小型项目',
    monthly: 0,
    hot: false,
    cta: '免费开始',
    features: [
      { label: '1 个工作区', included: true },
      { label: '每月 50 次 AI 调用', included: true },
      { label: '社区支持', included: true },
      { label: '团队协作', included: false },
      { label: '私有模型接入', included: false },
    ],
  },
  {
    key: 'pro',
    name: '专业版',
    description: '独立开发者的日常生产力',
    monthly: 29,
    hot: true,
    cta: '升级专业版',
    features: [
      { label: '5 个工作区', included: true },
      { label: '每月 2,000 次 AI 调用', included: true },
      { label: '优先邮件支持', included: true },
      { label: '团队协作（最多 5 人）', included: true },
      { label: '私有模型接入', included: false },
    ],
  },
  {
    key: 'team',
    name: '团队版',
    description: '成长型团队的完整能力',
    monthly: 99,
    hot: false,
    cta: '联系销售',
    features: [
      { label: '不限工作区', included: true },
      { label: '不限 AI 调用量', included: true },
      { label: '专属支持与 SLA', included: true },
      { label: '团队协作（不限人数）', included: true },
      { label: '私有模型接入', included: true },
    ],
  },
]

const period = ref<ToggleValue>('monthly')
const isYearly = computed(() => period.value === 'yearly')

/** 年付按月折算价（8 折）；billed 为年付整年金额 */
function perMonth(monthly: number): number {
  return isYearly.value ? Math.round(monthly * 0.8) : monthly
}

const PERIOD_OPTIONS = [
  { value: 'monthly', label: '按月付费' },
  { value: 'yearly', label: '按年付费' },
]

function onCta(plan: Plan): void {
  toast.success(`已选择「${plan.name}」——此处接入真实下单流程`)
}
</script>

<template>
  <div class="ui-block-pricing">
    <header class="ui-block-pricing__head">
      <h2 class="ui-block-pricing__title">选择适合你的方案</h2>
      <p class="ui-block-pricing__subtitle">所有方案均可随时升降级，按用量比例折算</p>
      <div class="ui-block-pricing__period">
        <ToggleGroup v-model="period" :items="PERIOD_OPTIONS" aria-label="计费周期" />
        <Badge variant="success">年付立省 20%</Badge>
      </div>
    </header>

    <div class="ui-block-pricing__grid">
      <Card
        v-for="plan in plans"
        :key="plan.key"
        class="ui-block-pricing__plan"
        :class="{ 'ui-block-pricing__plan--hot': plan.hot }"
        :shadow="plan.hot ? 'rest' : 'none'"
      >
        <CardBody>
          <div class="ui-block-pricing__plan-head">
            <h3 class="ui-block-pricing__plan-name">{{ plan.name }}</h3>
            <Badge v-if="plan.hot" variant="info">最受欢迎</Badge>
          </div>
          <p class="ui-block-pricing__plan-desc">{{ plan.description }}</p>

          <p class="ui-block-pricing__price">
            <span class="ui-block-pricing__num">¥{{ perMonth(plan.monthly) }}</span>
            <span class="ui-block-pricing__per">/ 月</span>
          </p>
          <p class="ui-block-pricing__bill">
            {{ isYearly ? `年付 ¥${perMonth(plan.monthly) * 12} / 年` : '月付，随时取消' }}
          </p>

          <ul class="ui-block-pricing__features">
            <li
              v-for="feature in plan.features"
              :key="feature.label"
              class="ui-block-pricing__feature"
              :class="{ 'ui-block-pricing__feature--off': !feature.included }"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path v-if="feature.included" d="m5 13 4 4L19 7" />
                <path v-else d="M6 12h12" />
              </svg>
              <span>{{ feature.label }}</span>
            </li>
          </ul>

          <Button
            block
            :variant="plan.hot ? 'primary' : 'secondary'"
            @click="onCta(plan)"
          >
            {{ plan.cta }}
          </Button>
        </CardBody>
      </Card>
    </div>

    <p class="ui-block-pricing__note">价格均为人民币含税 · 教育与非营利组织可申请公益名额</p>

    <ToastHost />
  </div>
</template>

<style scoped>
.ui-block-pricing {
  padding: var(--ui-space-6) var(--ui-space-4);
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}

.ui-block-pricing__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ui-space-2);
  text-align: center;
}

.ui-block-pricing__title {
  margin: 0;
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-pricing__subtitle {
  margin: 0;
  font-size: var(--ui-text-md);
  color: var(--ui-text-2);
}

.ui-block-pricing__period {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-2);
}

.ui-block-pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--ui-space-4);
  align-items: stretch;
  max-width: calc(var(--ui-space-8) * 13);
  width: 100%;
  margin-inline: auto;
}

.ui-block-pricing__plan--hot {
  border-color: var(--ui-accent);
}

.ui-block-pricing__plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
}

.ui-block-pricing__plan-name {
  margin: 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-block-pricing__plan-desc {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.ui-block-pricing__price {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-1);
  margin: var(--ui-space-4) 0 0;
}

.ui-block-pricing__num {
  font-size: var(--ui-text-3xl);
  font-weight: var(--ui-font-weight-semibold);
  font-variant-numeric: var(--ui-numeric);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-pricing__per {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.ui-block-pricing__bill {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  min-height: var(--ui-text-lg);
}

.ui-block-pricing__features {
  list-style: none;
  margin: var(--ui-space-4) 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.ui-block-pricing__feature {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}

.ui-block-pricing__feature svg {
  width: 16px;
  height: 16px;
  flex: none;
  color: var(--ui-success);
}

.ui-block-pricing__feature--off {
  color: var(--ui-text-3);
}

.ui-block-pricing__feature--off svg {
  color: var(--ui-text-3);
}

.ui-block-pricing__note {
  margin: 0;
  text-align: center;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}
</style>
