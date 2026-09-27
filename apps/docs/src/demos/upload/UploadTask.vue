<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@ui/components'
import type { UploadFile } from '@ui/components'

const files = ref<UploadFile[]>([])
const flaky = ref<UploadFile[]>([])

/**
 * 使用方实现的上传任务：beforeUpload 返回的 Promise 即任务本体——
 * 文件先以「上传中」入列，任务期间通过受控列表推进 percent（进度条实时呈现），
 * resolve 落定成功（percent → 100）。
 */
function uploadTask(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    let percent = 0
    const timer = window.setInterval(() => {
      percent = Math.min(100, percent + 10)
      const item = files.value.find((entry) => entry.raw === file)
      if (item) item.percent = percent
      if (percent >= 100) {
        window.clearInterval(timer)
        resolve(true)
      }
    }, 150)
  })
}

/** 模拟不稳定网络： rejects 即上传失败，条目转 error 并出现重试按钮。 */
function flakyTask(): Promise<boolean> {
  return new Promise((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('网络中断，上传失败'))
    }, 900)
  })
}
</script>

<template>
  <div class="demo-stack">
    <Upload v-model="files" multiple accept="image/*,.pdf" :before-upload="uploadTask" />
    <p class="demo-hint">
      beforeUpload 返回 Promise = 上传任务本身：先以「上传中 N%」入列（进度条复用 progress 视觉，
      aria 按 progressbar 契约暴露 valuenow），resolve 落定成功；accept 在点击与拖拽两条路径上用同一规则过滤。
    </p>

    <Upload v-model="flaky" :before-upload="flakyTask" />
    <p class="demo-hint">
      reject 落定失败：条目描边转 danger、展示原因文案并出现重试按钮——
      重试会把条目重置为上传中并重跑 beforeUpload。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
