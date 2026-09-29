---
title: 定价页 Pricing
description: 月付 / 年付切换与三档方案对比的营销定价页
---

<script setup>
import PricingBlock from '@docs-blocks/PricingBlock.vue'
import pricingSrc from '@docs-blocks/PricingBlock.vue?raw'
</script>

# 定价页 Pricing

SaaS 定价页的标准形态：计费周期切换 + 三档方案卡，推荐档以品牌色描边与「最受欢迎」徽标突出。价格随周期联动（年付 8 折按月折算展示）。

<p class="block-try"><span class="block-try__label">试试</span>切换「按月 / 按年」观察三档价格与账单说明联动；点各档 CTA 按钮。</p>

<BlockPreview :src="pricingSrc">
  <PricingBlock />
</BlockPreview>

## 组成

| 区域 | 组件 |
| --- | --- |
| 周期切换 | [ToggleGroup](/components/inputs/toggle-group)（`items` 声明式 + segmented 样式） |
| 方案卡 | [Card](/components/general/card) 家族（推荐档 `shadow="rest"` + accent 描边） |
| 徽标 | [Badge](/components/general/badge)（`variant="success"` 折扣、`variant="info"` 推荐档） |
| 行为按钮 | [Button](/components/general/button)（`block`，主推档 `variant="primary"`） |
| 反馈 | [Toast](/components/feedback/toast) |

## 复制使用

- 依赖：`@ui/tokens/paper.css` + `@ui/components`；
- 「复制源码」保存为 `src/blocks/PricingBlock.vue`；
- 方案数据集中在 `plans` 数组：增删档位、改功能清单都只动数据；
- 折扣与年付折算逻辑在 `perMonth()`，替换为你的计费口径；
- CTA 接入真实下单 / 跳转。
