<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button, Form, FormField, Input } from '@ui/components'
import type { FormRules } from '@ui/components'

const form = reactive({ workspace: '' })
const submitted = ref('')

/** 已占用名单（模拟远端唯一性检查的数据源）。 */
const takenNames = ['paper', 'admin', 'root']

/** 异步校验函数：返回 Promise（约 1.2s 后 resolve true 或错误文案）。 */
function checkName(value: unknown): Promise<true | string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        takenNames.includes(String(value).trim().toLowerCase())
          ? '该名称已被占用，换一个试试'
          : true,
      )
    }, 1200)
  })
}

const rules: FormRules = {
  workspace: [
    (value) => (String(value).trim() !== '' ? true : '请输入工作区名称'),
    (value) => checkName(value),
  ],
}

function onCreate(): void {
  submitted.value = form.workspace
}
</script>

<template>
  <Form :model="form" :rules="rules" @submit="onCreate">
    <template #default="{ pending }">
      <FormField name="workspace" label="工作区名称" required help="创建后可修改；paper / admin / root 已被占用">
        <template #default="{ controlAttrs }">
          <Input v-bind="controlAttrs" v-model="form.workspace" placeholder="如 paper-team" />
        </template>
      </FormField>
      <div class="demo-actions">
        <Button type="submit" variant="primary" :loading="pending">
          {{ pending ? '校验中…' : '创建' }}
        </Button>
      </div>
      <p class="demo-hint">
        返回 Promise 的校验函数即异步校验：进行中作用域 pending=true，提交被拦截、按钮可接 loading；
        resolve 错误文案则流入对应 FormField（danger 色 + aria-invalid 联动）。
        <span v-if="submitted">（submit 已触发：{{ submitted }}）</span>
      </p>
    </template>
  </Form>
</template>

<style scoped>
.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
