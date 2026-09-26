<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog, Input } from '@ui/components'

const open = ref(false)
const draft = ref('paper-web')
const savedName = ref('paper-web')

function openDialog(): void {
  draft.value = savedName.value
  open.value = true
}

function cancel(): void {
  open.value = false
}

function save(): void {
  savedName.value = draft.value
  open.value = false
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="openDialog">重命名服务</Button>
      <span class="demo-hint">当前：{{ savedName }}</span>
    </div>
    <p class="demo-hint">
      表单模式：<code>:close-on-scrim="false"</code> 拦截遮罩点击，关闭必须走
      footer 里的明确动作；Esc 仍会请求关闭。footer 插槽一旦提供即整体替换默认「关闭」按钮。
    </p>
    <Dialog v-model="open" title="重命名" size="sm" :close-on-scrim="false">
      <div class="demo-field">
        <span id="rename-field-label" class="demo-field__label">服务名</span>
        <Input v-model="draft" aria-labelledby="rename-field-label" placeholder="输入新的服务名" />
      </div>
      <template #footer>
        <Button @click="cancel">取消</Button>
        <Button variant="primary" :disabled="draft.trim() === ''" @click="save">保存</Button>
      </template>
    </Dialog>
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
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-field {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-field__label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
