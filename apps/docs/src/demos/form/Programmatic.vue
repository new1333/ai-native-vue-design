<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button, Form, FormField, Input } from '@ui/components'
import type { FormInstance, FormRules } from '@ui/components'

const form = reactive({ username: '', bio: '' })
const report = ref('尚未主动校验')

const rules: FormRules = {
  username: [(value) => (String(value).trim() !== '' ? true : '用户名不能为空')],
  bio: [(value) => (String(value).length <= 20 ? true : '简介不超过 20 字')],
}

const formRef = ref<FormInstance | null>(null)

async function runValidate(): Promise<void> {
  const instance = formRef.value
  if (!instance) return
  const errors = await instance.validate()
  report.value =
    Object.keys(errors).length === 0
      ? '校验通过：返回空对象'
      : `校验失败：${JSON.stringify(errors)}`
}

function onReset(): void {
  formRef.value?.resetValidation()
  report.value = '已清空校验状态（model 值不变）'
}
</script>

<template>
  <Form ref="formRef" :model="form" :rules="rules">
    <FormField name="username" label="用户名" required>
      <template #default="{ controlAttrs }">
        <Input v-bind="controlAttrs" v-model="form.username" placeholder="请输入用户名" />
      </template>
    </FormField>
    <FormField name="bio" label="简介" help="选填，不超过 20 字">
      <template #default="{ controlAttrs }">
        <Input v-bind="controlAttrs" v-model="form.bio" placeholder="一句话介绍自己" />
      </template>
    </FormField>
    <div class="demo-actions">
      <Button size="sm" variant="secondary" @click="runValidate">主动校验 validate()</Button>
      <Button size="sm" variant="ghost" @click="onReset">清空校验 resetValidation()</Button>
    </div>
    <p class="demo-hint">最近一次结果：{{ report }}（validate() 返回的错误集合同步驱动各 FormField 展示）</p>
  </Form>
</template>

<style scoped>
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
