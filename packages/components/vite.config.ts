import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// @ui/components 库模式构建：入口 src/index.ts，external vue。
// SFC scoped style 由 lib 模式聚合抽取出 dist/components.css（--ui-* token 值由使用方
// 从 @ui/tokens/paper.css 获得）；vite-plugin-dts 以 src 为 entryRoot 逐目录产出 .d.ts，
// 保证 dist/index.d.ts 存在且可被 TS 解析。
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
      outDirs: ['dist'],
      // 不为测试与构建配置文件产出声明：发布物只含运行时 API 类型。
      exclude: ['**/*.spec.ts', 'vite.config.ts', 'vitest.config.ts'],
    }),
  ],
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
