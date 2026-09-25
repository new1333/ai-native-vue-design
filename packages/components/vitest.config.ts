import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 组件测试：happy-dom 环境；用例为 src/**/*.spec.ts。
// SSR 用例文件首行用 `// @vitest-environment node` 覆盖为 node 环境。
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
})
