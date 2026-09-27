<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@ui/components'

const code = ref('')
const verifying = ref(false)

function verify(): void {
  if (code.value.length !== 6) return
  verifying.value = true
  // 模拟提交校验：校验期间以 disabled 锁定输入（组件不内置 loading，属业务侧职责）。
  setTimeout(() => {
    verifying.value = false
  }, 1500)
}
</script>

<template>
  <div class="demo-stack">
    <InputOtp v-model="code" :disabled="verifying" aria-label="受控验证码" @complete="verify" />
    <div class="demo-actions">
      <button type="button" class="demo-button" @click="code = '123456'">受控回填 123456</button>
      <button type="button" class="demo-button" @click="code = ''">清空</button>
      <span v-if="verifying" class="demo-verifying">校验中，输入已禁用…</span>
    </div>
    <p class="demo-hint">
      受控 v-model（string）：外部改值立即回落各格；填满触发 complete 后模拟提交，
      校验期间以 disabled 锁定（原生 disabled 移出 Tab 序、拦截输入 / 粘贴 / 键盘路径）。
      组件不内置发送倒计时 / loading / 自动提交（meta 何时不用已声明），均为业务侧职责。
    </p>
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
  align-items: center;
  gap: var(--ui-space-2);
  flex-wrap: wrap;
}

.demo-button {
  border: 1px solid var(--ui-border); /* 描边宽度 1px 为结构性细线（无 --ui-border-width token） */
  border-radius: var(--ui-button-radius);
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  padding: var(--ui-space-1) var(--ui-space-3);
  cursor: pointer;
  transition:
    color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-button:hover {
  color: var(--ui-text-1);
  border-color: var(--ui-border-strong);
}

.demo-verifying {
  font-size: var(--ui-text-sm);
  color: var(--ui-warning);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
