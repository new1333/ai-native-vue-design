<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button, Form, FormField, Input } from '@ui/components'
import type { FormRules } from '@ui/components'

const form = reactive({ nickname: '', email: '' })
const submitted = ref('')

const rules: FormRules = {
  nickname: [
    (value) => (String(value).trim() !== '' ? true : '请输入昵称'),
    (value) =>
      String(value).trim().length >= 2 && String(value).trim().length <= 20
        ? true
        : '昵称需 2-20 个字符',
  ],
  email: [(value) => (String(value).includes('@') ? true : '请输入合法邮箱地址')],
}

function onSave(): void {
  submitted.value = `${form.nickname}（${form.email}）`
}
</script>

<template>
  <Form :model="form" :rules="rules" @submit="onSave">
    <template #default="{ valid, pending, errors }">
      <FormField name="nickname" label="昵称" required help="对外展示的名称，2-20 个字符">
        <template #default="{ controlAttrs }">
          <Input v-bind="controlAttrs" v-model="form.nickname" placeholder="请输入昵称" />
        </template>
      </FormField>
      <FormField name="email" label="邮箱" required>
        <template #default="{ controlAttrs }">
          <Input v-bind="controlAttrs" v-model="form.email" placeholder="name@example.com" />
        </template>
      </FormField>
      <div class="demo-actions">
        <Button type="submit" variant="primary" :loading="pending">保存</Button>
        <span class="demo-hint">
          valid = {{ valid }}；errors =
          {{ Object.keys(errors).length === 0 ? '{}' : JSON.stringify(errors) }}
        </span>
      </div>
      <p v-if="submitted" class="demo-hint">
        submit 已触发：{{ submitted }}（全量校验通过才 emit submit；原生 submit 已 preventDefault）
      </p>
    </template>
  </Form>
</template>

<style scoped>
.demo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
