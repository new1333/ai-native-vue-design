<script setup lang="ts">
import { Divider } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <p class="demo-text">使用账号密码登录。</p>
    <Divider>
      <template #label>或</template>
    </Divider>
    <p class="demo-text">使用访客链接继续。</p>
    <Divider>
      <template #label>高级设置</template>
    </Divider>
    <p class="demo-text">更多选项说明文字。</p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
}

.demo-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
</style>
