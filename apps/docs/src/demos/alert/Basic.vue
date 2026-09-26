<script setup lang="ts">
import { Alert } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Alert severity="info" title="维护计划">
      服务将于本周日 02:00–04:00 例行维护，期间可能出现短暂不可用。
    </Alert>
    <Alert severity="success" title="已保存">变更已同步到全部设备。</Alert>
    <Alert severity="warning" title="额度即将用尽">本月 API 额度已使用 90%，超出后将按用量计费。</Alert>
    <Alert severity="danger" title="保存失败">网络中断，请重试；若持续失败请检查代理设置。</Alert>
    <Alert severity="info">不带标题也可以：直接放一段正文说明。</Alert>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}
</style>
