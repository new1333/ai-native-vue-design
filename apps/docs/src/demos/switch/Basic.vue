<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@ui/components'

const notify = ref(true)
const autoSave = ref(false)
</script>

<template>
  <div class="demo-stack">
    <Switch v-model="notify" label="消息通知" />
    <Switch v-model="autoSave">
      自动保存
      <span class="demo-switch-note">改动立即写入本地草稿，无需手动提交</span>
    </Switch>
    <p class="demo-hint">
      当前值：通知 <code>{{ notify }}</code> · 自动保存 <code>{{ autoSave }}</code>
      （即时生效的开/关：role="switch" + aria-checked 常驻 true/false；label prop 与默认插槽等价、插槽优先，
      根为 label 元素，点击文本即切换；键盘 Tab 进入、Enter/Space 原生激活）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-switch-note {
  margin-left: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
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
