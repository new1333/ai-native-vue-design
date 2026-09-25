import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// @ui/components 库模式构建：入口 src/index.ts，external vue。
// 组件样式全部来自 SFC scoped style 与 --ui-* token，不产出全局 css。
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
