---
title: Breadcrumb 面包屑
---

<script setup>
import { breadcrumbMeta } from '@ui/components'
import Basic from '@docs-demos/breadcrumb/Basic.vue'
import basicSrc from '@docs-demos/breadcrumb/Basic.vue?raw'
import Collapse from '@docs-demos/breadcrumb/Collapse.vue'
import collapseSrc from '@docs-demos/breadcrumb/Collapse.vue?raw'
import Disabled from '@docs-demos/breadcrumb/Disabled.vue'
import disabledSrc from '@docs-demos/breadcrumb/Disabled.vue?raw'
import Custom from '@docs-demos/breadcrumb/Custom.vue'
import customSrc from '@docs-demos/breadcrumb/Custom.vue?raw'
</script>

# Breadcrumb 面包屑

<ComponentDoc :meta="breadcrumbMeta" dir="breadcrumb">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items 数据驱动：有 href 的项渲染为原生 <a>（链接语义优先），无 href 的项渲染为 <button type=&quot;button&quot;>；末项视为当前页并自动标记 aria-current=&quot;page&quot;。itemClick 在原生 click 阶段发出，携带 { item, index, event }，<a> 项可在 handler 内 preventDefault 取消跳转。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="中间项折叠 maxCount"
    anchor="collapse"
    description="items 超出 maxCount 时折叠为「首项 + … + 末尾 (maxCount − 2) 项」：可见槽位数恰为 maxCount（省略号占位计入），末项永远保留；maxCount 小于 3 收敛为 3。折叠随 items / maxCount 响应式重算。"
    :src="collapseSrc"
  >
    <Collapse />
  </Demo>

  <Demo
    title="禁用项"
    anchor="disabled"
    description="disabled 的项渲染为 aria-disabled=&quot;true&quot; 的 span：链接不做假禁用，不可聚焦、点击与键盘激活都不发出 itemClick。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="分隔符与项插槽"
    anchor="custom"
    description="分隔符三档：缺省内联 chevron 图标 → separator 文本 → #separator 插槽（容器 aria-hidden）；#item 插槽整体接管项渲染（作用域 item / index / isCurrent），此时原生交互语义与 aria-current 由使用方保证。"
    :src="customSrc"
  >
    <Custom />
  </Demo>
</ComponentDoc>
