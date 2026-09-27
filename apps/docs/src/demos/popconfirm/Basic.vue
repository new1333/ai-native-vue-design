<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popconfirm } from '@ui/components'

const lastAction = ref('（尚未操作）')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popconfirm
        title="确定提交这份表单吗？"
        description="提交后将通知所有协作者。"
        @confirm="lastAction = 'confirm'"
        @cancel="lastAction = 'cancel'"
      >
        <template #trigger>
          <Button variant="primary">提交表单</Button>
        </template>
      </Popconfirm>

      <Popconfirm
        title="使用自定义文案"
        description="确认与取消按钮的文字都可以替换。"
        confirm-text="就这么办"
        cancel-text="再想想"
        @confirm="lastAction = 'confirm（自定义文案）'"
        @cancel="lastAction = 'cancel（自定义文案）'"
      >
        <template #trigger>
          <Button variant="secondary">自定义按钮文案</Button>
        </template>
      </Popconfirm>

      <span class="demo-log">最近动作：{{ lastAction }}</span>
    </div>
    <p class="demo-hint">
      点击触发元素弹出确认气泡；点击确认/取消发出 <code>confirm</code> / <code>cancel</code>
      事件并自动关闭，Esc、再次点击触发元素或点击气泡之外区域也会关闭（不发出事件）。
      触发元素恒挂 <code>aria-expanded</code>，打开时挂 <code>aria-controls</code> 指向气泡。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-log {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
