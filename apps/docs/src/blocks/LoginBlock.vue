<script setup lang="ts">
/**
 * 登录页构建块：居中卡片 + 邮箱密码校验（Form）+ 记住我 + 第三方登录。
 * 自包含单文件：仅依赖 @ui/components，视觉全部走 --ui-* token。
 */
import { reactive, ref } from 'vue'
import {
  Button,
  Checkbox,
  Divider,
  Form,
  FormField,
  IconButton,
  Input,
  toast,
  ToastHost,
} from '@ui/components'
import type { FormRules } from '@ui/components'

const form = reactive({ email: '', password: '' })

const rules: FormRules = {
  email: [
    (value) => (String(value).trim() !== '' ? true : '请输入邮箱'),
    (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()) ? true : '邮箱格式不正确'),
  ],
  password: [
    (value) => (String(value) !== '' ? true : '请输入密码'),
    (value) => (String(value).length >= 8 ? true : '密码至少 8 位'),
  ],
}

const remember = ref(true)
const passwordVisible = ref(false)
const signingIn = ref(false)

function onSubmit(): void {
  signingIn.value = true
  // 演示用假请求：真实项目替换为登录接口调用
  window.setTimeout(() => {
    signingIn.value = false
    toast.success(`欢迎回来：${form.email}`)
  }, 1200)
}
</script>

<template>
  <div class="ui-block-login">
    <main class="ui-block-login__card">
      <header class="ui-block-login__brand">
        <span class="ui-block-login__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 3 10.5 13.5" />
            <path d="M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
          </svg>
        </span>
        <h2 class="ui-block-login__title">回到纸面</h2>
        <p class="ui-block-login__subtitle">登录以继续使用你的 AI 工作台</p>
      </header>

      <Form :model="form" :rules="rules" @submit="onSubmit">
        <FormField name="email" label="邮箱" required>
          <template #default="{ controlAttrs }">
            <Input
              v-bind="controlAttrs"
              v-model="form.email"
              type="text"
              placeholder="name@example.com"
              autocomplete="email"
            />
          </template>
        </FormField>

        <FormField name="password" label="密码" required>
          <template #default="{ controlAttrs }">
            <Input
              v-bind="controlAttrs"
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="至少 8 位"
              autocomplete="current-password"
            >
              <template #suffix>
                <button
                  type="button"
                  class="ui-block-login__eye"
                  :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
                  @click="passwordVisible = !passwordVisible"
                >
                  <svg v-if="passwordVisible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="m4 4 16 16" />
                    <path d="M10.5 5.3c.5-.1 1-.2 1.5-.2 6 0 9.5 6.9 9.5 6.9a17.4 17.4 0 0 1-2.9 3.8M6.1 6.1C3.4 8 2.5 12 2.5 12S6 18.7 12 18.7c1.4 0 2.7-.3 3.8-.9" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                  </svg>
                </button>
              </template>
            </Input>
          </template>
        </FormField>

        <div class="ui-block-login__row">
          <Checkbox v-model="remember" label="记住我" />
          <a class="ui-block-login__link" href="#" @click.prevent>忘记密码？</a>
        </div>

        <Button type="submit" variant="primary" block :loading="signingIn">登 录</Button>
      </Form>

      <Divider>
        <template #label>或</template>
      </Divider>

      <div class="ui-block-login__social">
        <IconButton variant="outline" aria-label="使用 GitHub 登录" @click="toast.info('GitHub 登录演示')">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </IconButton>
        <IconButton variant="outline" aria-label="使用 Google 登录" @click="toast.info('Google 登录演示')">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </IconButton>
      </div>

      <p class="ui-block-login__signup">
        还没有账号？<a class="ui-block-login__link" href="#" @click.prevent>立即注册</a>
      </p>
    </main>

    <footer class="ui-block-login__foot">
      <span>© 2026 纸面 Paper</span>
      <a class="ui-block-login__link" href="#" @click.prevent>服务条款</a>
      <a class="ui-block-login__link" href="#" @click.prevent>隐私政策</a>
    </footer>

    <ToastHost />
  </div>
</template>

<style scoped>
.ui-block-login {
  min-height: calc(var(--ui-space-8) * 9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6) var(--ui-space-4);
  background: var(--ui-bg);
}

.ui-block-login__card {
  width: calc(var(--ui-space-8) * 6);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-pop);
}

.ui-block-login__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ui-space-1);
  text-align: center;
}

.ui-block-login__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--ui-space-8) - var(--ui-space-4));
  height: calc(var(--ui-space-8) - var(--ui-space-4));
  margin-bottom: var(--ui-space-1);
  border-radius: var(--ui-radius-md);
  background: var(--ui-accent-soft);
  color: var(--ui-accent);
}

.ui-block-login__mark svg {
  width: 20px;
  height: 20px;
}

.ui-block-login__title {
  margin: 0;
  font-size: var(--ui-text-xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-login__subtitle {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.ui-block-login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
}

.ui-block-login__link {
  font-size: var(--ui-text-sm);
  color: var(--ui-accent);
  text-decoration: none;
}

.ui-block-login__link:hover {
  color: var(--ui-accent-hover);
}

.ui-block-login__eye {
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

.ui-block-login__eye:hover {
  color: var(--ui-text-1);
}

.ui-block-login__eye svg {
  width: 16px;
  height: 16px;
}

.ui-block-login__social {
  display: flex;
  justify-content: center;
  gap: var(--ui-space-3);
}

.ui-block-login__signup {
  margin: 0;
  text-align: center;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.ui-block-login__foot {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}
</style>
