<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@ui/components'
import type { RadioValue } from '@ui/components'

const notify = ref<RadioValue | undefined>('all')
</script>

<template>
  <div class="demo-stack">
    <RadioGroup v-model="notify" name="notify" aria-label="通知范围">
      <Radio value="all">
        全部通知
        <span class="demo-radio-note">评论、@提及与系统公告都会推送</span>
      </Radio>
      <Radio value="mentions">
        仅 @提及
        <span class="demo-radio-note">只接收与我直接相关的消息</span>
      </Radio>
      <Radio value="off">
        暂不接收
        <span class="demo-radio-note">保留账号设置，停止一切推送</span>
      </Radio>
    </RadioGroup>
    <p class="demo-hint">
      默认插槽优先于 label prop，可承载富文本（辅助说明等）；根为 label 元素，点击文本即选中。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-radio-note {
  margin-left: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
