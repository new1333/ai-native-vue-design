<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popover } from '@ui/components'

const open = ref(false)
const note = ref('')
const saved = ref('')

function save(): void {
  saved.value = note.value
  open.value = false
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popover v-model="open">
        <template #trigger>
          <Button>填写订单备注</Button>
        </template>
        <form class="demo-form" @submit.prevent="save">
          <p class="demo-card-title">订单备注</p>
          <label class="demo-field">
            <span class="demo-field-label">备注内容</span>
            <input v-model="note" type="text" class="demo-input" placeholder="例如：放前台" />
          </label>
          <div class="demo-actions">
            <Button variant="ghost" @click="open = false">取消</Button>
            <Button type="submit">保存并关闭</Button>
          </div>
        </form>
      </Popover>
      <span v-if="saved" class="demo-saved">已保存备注：{{ saved }}</span>
    </div>
    <p class="demo-hint">
      Popover 的典型场景：就地展开小型表单。输入与按钮正常交互，提交后由应用关闭（v-model 置 false）。
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

.demo-form {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-card-title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.demo-field {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.demo-field-label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-input {
  box-sizing: border-box;
  padding: var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}

.demo-input:focus {
  border-color: var(--ui-input-border-focus);
}

.demo-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-2);
}

.demo-saved {
  font-size: var(--ui-text-sm);
  color: var(--ui-success);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
