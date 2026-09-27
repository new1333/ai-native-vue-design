<script setup lang="ts">
import { ref } from 'vue'
import { Button, Statistic } from '@ui/components'

/** 初始剩余秒数（受控数据源：变更即重置倒计时）。 */
const seconds = ref(90)

/** finish 已发出（每轮归零恰好一次；初始即 0 不发出）。 */
const finished = ref(false)

function onFinish(): void {
  finished.value = true
}

function restart(next: number): void {
  finished.value = false
  seconds.value = next
}
</script>

<template>
  <div class="demo-stack">
    <p class="demo-hint">
      根元素 role="timer"；归零停表并发出一次 finish；点击预设即受控重置（value 变更 →
      重新起表）。
    </p>
    <Statistic
      title="距离截止"
      :value="seconds"
      countdown
      suffix="后截止"
      @finish="onFinish"
    />
    <p class="demo-hint" role="status">
      {{ finished ? '已发出 finish：倒计时归零。' : '倒计时进行中……' }}
    </p>
    <div class="demo-actions">
      <Button size="sm" variant="primary" @click="restart(90)">90 秒</Button>
      <Button size="sm" variant="secondary" @click="restart(3661)">1 小时 01:01</Button>
      <Button size="sm" variant="secondary" @click="restart(0)">归零（不发 finish）</Button>
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
