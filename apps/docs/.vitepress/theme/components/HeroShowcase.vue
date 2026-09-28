<script setup lang="ts">
/**
 * 首页 hero 右列的「活组件」演示（Layout.vue 的 home-hero-image 插槽）。
 *
 * 一个微型 agent 排障片段：AgentStatus / Reasoning / ToolCallCard / StreamingText
 * 全部是 @ui/components 的真实组件，非截图。纯装饰性示意（完整可交互版
 * 在首页下方的 AiWorkbench），故整体对辅助技术隐藏，避免 live region 噪音。
 */
import { AgentStatus, Reasoning, StreamingText, ToolCallCard } from '@ui/components'
</script>

<template>
  <div class="ui-hero-showcase" aria-hidden="true">
    <div class="ui-hero-showcase__head">
      <span class="ui-hero-showcase__title">paper-assistant</span>
      <AgentStatus status="streaming" />
    </div>

    <Reasoning
      :duration="3.2"
      content="错误集中在 14:31–14:33，先沿支付回调链路查证书与超时。"
    />

    <ToolCallCard name="search_logs" status="completed" :duration="1240" />

    <StreamingText
      content="定位到：下游支付网关证书 14:31 过期，回调 TLS 握手批量失败。已生成修复 PR #218。"
    />

    <p class="ui-hero-showcase__foot">
      ↑ 全部为纸面活组件，非截图 —— 见下方完整工作台
    </p>
  </div>
</template>

<style scoped>
.ui-hero-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  width: 360px;
  max-width: 100%;
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-hover);
  text-align: left;
}

.ui-hero-showcase__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  padding-bottom: var(--ui-space-2);
  border-bottom: 1px solid var(--ui-border);
}

.ui-hero-showcase__title {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-hero-showcase__foot {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}
</style>
