<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const password = ref('')
const visible = ref(false)
</script>

<template>
  <div class="demo-stack">
    <Input
      v-model="password"
      :type="visible ? 'text' : 'password'"
      placeholder="密码"
      autocomplete="new-password"
    >
      <template #suffix>
        <button
          type="button"
          class="demo-password-toggle"
          :aria-label="visible ? '隐藏密码' : '显示密码'"
          @click="visible = !visible"
        >
          <svg
            v-if="visible"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m4 4 16 16" />
            <path d="M10.5 5.3c.5-.1 1-.2 1.5-.2 6 0 9.5 6.9 9.5 6.9a17.4 17.4 0 0 1-2.9 3.8M6.1 6.1C3.4 8 2.5 12 2.5 12S6 18.7 12 18.7c1.4 0 2.7-.3 3.8-.9" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        </button>
      </template>
    </Input>
    <p class="demo-hint">
      type 支持 <code>'text' | 'password'</code>；显隐切换由使用方在 #suffix 内实现（meta 推荐组合）。
      当前值长度：<code>{{ password.length }}</code>
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  color: var(--ui-text-3);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-password-toggle:hover {
  color: var(--ui-text-1);
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
