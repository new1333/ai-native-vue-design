import { defineConfig } from 'vite'

// @ui/tokens 构建配置：库模式打包 src/index.ts。
// CSS（paper.css）按 exports 直接以源文件路径提供给使用方引入。
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
})
