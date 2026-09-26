<script setup lang="ts">
import { ref } from 'vue'
import { Button, FormField, Input } from '@ui/components'

/** 演示用的有效邀请码。 */
const INVITE_CODE = 'PAPER-2026'

const invite = ref('')
const inviteError = ref('')
const note = ref('')

function checkInvite(): void {
  const value = invite.value.trim()
  if (value === '') {
    inviteError.value = '邀请码不能为空'
  } else if (value.toUpperCase() === INVITE_CODE) {
    inviteError.value = ''
  } else {
    inviteError.value = '邀请码无效或已过期，请核对后重试'
  }
}
</script>

<template>
  <div class="demo-stack">
    <FormField
      name="invite"
      label="邀请码"
      required
      help="独立使用：错误由 error prop 控制，出现错误时 help 让位"
      :error="inviteError"
    >
      <template #default="{ id, invalid }">
        <Input
          :id="id"
          :status="invalid ? 'error' : 'default'"
          v-model="invite"
          placeholder="试试 PAPER-2026"
        />
      </template>
    </FormField>
    <div class="demo-actions">
      <Button size="sm" variant="secondary" @click="checkInvite">校验邀请码</Button>
    </div>
    <FormField name="note" label="备注" error="备注中不能包含联系方式">
      <template #default="{ controlAttrs }">
        <Input v-bind="controlAttrs" v-model="note" placeholder="选填" />
      </template>
      <template #error="{ error }">（#error 插槽自定义渲染）{{ error }}</template>
    </FormField>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}
</style>
