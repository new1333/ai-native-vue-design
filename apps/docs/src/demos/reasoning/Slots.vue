<script setup lang="ts">
import { Reasoning } from '@ui/components'

const THINKING_TEXT =
  '识别用户意图：这是投诉，先共情再给方案；查询订单状态：已发货、在途第 2 天；可给选项：补偿优惠券 or 加急催派；语气保持平稳，不承诺具体送达时间。'
</script>

<template>
  <Reasoning :content="THINKING_TEXT" :duration="3.2">
    <template #header="{ expanded, streaming }">
      <span class="demo-header">{{ streaming ? '正在推理' : expanded ? '收起推理过程' : '查看推理过程' }}</span>
    </template>
    <template #content="{ content }">
      <!-- 实际项目中可在此接外部 Markdown 渲染器 -->
      <p class="demo-reasoning-text">{{ content }}</p>
    </template>
  </Reasoning>
</template>

<style scoped>
.demo-header {
  font-variant-numeric: var(--ui-numeric);
}

.demo-reasoning-text {
  margin: 0;
  font-family: var(--ui-font-serif);
  line-height: var(--ui-leading-body);
}
</style>
