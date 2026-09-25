import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // Windows 上 5076–5275 被 Hyper-V/WinNAT 动态保留，默认端口 5173 绑定时报
    // EACCES（且自动递增的 5174–5275 同样在保留区间内），故固定用区间外的端口。
    port: 5300,
  },
})
