---
title: Toast 全局提示
---

<script setup>
import { toastMeta } from '@ui/components'
import Basic from '@docs-demos/toast/Basic.vue'
import basicSrc from '@docs-demos/toast/Basic.vue?raw'
import Control from '@docs-demos/toast/Control.vue'
import controlSrc from '@docs-demos/toast/Control.vue?raw'
</script>

# Toast 全局提示

<ComponentDoc :meta="toastMeta" dir="toast">
  <Demo
    title="基础用法"
    description="应用根组件挂载一次 <ToastHost />，随后随处调用 toast.success / error / info / warning；堆叠自上而下按推入顺序渲染。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="常驻提示与手动移除"
    description="duration: 0 表示不自动关闭；toast.remove(id) 手动移除。onClose 无论何种关闭路径都恰好触发一次。"
    :src="controlSrc"
  >
    <Control />
  </Demo>
</ComponentDoc>
