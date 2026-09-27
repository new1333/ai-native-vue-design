---
title: Image 图片
---

<script setup>
import { imageMeta } from '@ui/components'
import Basic from '@docs-demos/image/Basic.vue'
import basicSrc from '@docs-demos/image/Basic.vue?raw'
import Status from '@docs-demos/image/Status.vue'
import statusSrc from '@docs-demos/image/Status.vue?raw'
import Fallback from '@docs-demos/image/Fallback.vue'
import fallbackSrc from '@docs-demos/image/Fallback.vue?raw'
import Lazy from '@docs-demos/image/Lazy.vue'
import lazySrc from '@docs-demos/image/Lazy.vue?raw'
import Preview from '@docs-demos/image/Preview.vue'
import previewSrc from '@docs-demos/image/Preview.vue?raw'
</script>

# Image 图片

<ComponentDoc :meta="imageMeta" dir="image">
  <Demo
    title="基础用法"
    anchor="basic"
    description="fit 控制成框（约束宽高）后的填充方式：contain 完整收纳、cover 裁剪铺满、fill 拉伸铺满（默认）。alt 缺省为空字符串（装饰图语义），内容图必须显式传入。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="加载状态机"
    anchor="status"
    description="src 变化或重挂载会重置 loading → loaded 状态机；加载期占位用 placeholder 插槽自定义（此处放 Skeleton），load / error 事件实时回显。"
    :src="statusSrc"
  >
    <Status />
  </Demo>

  <Demo
    title="失败回退"
    anchor="fallback"
    description="配置 fallback 时主源失败自动回落备用图；未配置时展示默认失败视图（danger 软面 + 文案），也可用 error 插槽放自定义失败引导（如重试按钮）。"
    :src="fallbackSrc"
  >
    <Fallback />
  </Demo>

  <Demo
    title="懒加载"
    anchor="lazy"
    description="lazy 开启后进入视口（IntersectionObserver）前不渲染 img、不发请求，首屏外图片按需加载；占位可用 placeholder 插槽覆盖。"
    :src="lazySrc"
  >
    <Lazy />
  </Demo>

  <Demo
    title="大图预览"
    anchor="preview"
    description="preview 开启后图片包裹于原生按钮（加载完成前禁用），点击打开全屏浮层：Esc / 点击遮罩 / 关闭按钮关闭，Tab 在浮层内圈定，关闭后焦点回归触发器。"
    :src="previewSrc"
  >
    <Preview />
  </Demo>
</ComponentDoc>
