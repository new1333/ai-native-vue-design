<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button, Form, FormField, Input } from '@ui/components'
import type { FormRules } from '@ui/components'

const form = reactive({ title: '' })
const saving = ref(false)
const savedTitle = ref('')

const rules: FormRules = {
  title: [(value) => (String(value).trim() !== '' ? true : '请输入标题')],
}

/** 模拟异步提交：约 2s 后完成。 */
function onSave(): void {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    savedTitle.value = form.title
  }, 2000)
}
</script>

<template>
  <Form :model="form" :rules="rules" :pending="saving" @submit="onSave">
    <template #default="{ pending }">
      <FormField name="title" label="标题" required>
        <template #default="{ controlAttrs }">
          <Input v-bind="controlAttrs" v-model="form.title" placeholder="草稿标题" />
        </template>
      </FormField>
      <div class="demo-actions">
        <Button type="submit" variant="primary" :loading="pending">保存草稿</Button>
      </div>
      <p class="demo-hint">
        异步提交进行中传受控 :pending="saving"：此间再次提交一律被拦截（不校验、不 emit submit），
        提交按钮经插槽作用域 pending 置 loading，天然防重复提交。
        <span v-if="savedTitle">（最近一次保存：{{ savedTitle }}）</span>
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
