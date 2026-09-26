---
title: Alert 警示条
---

<script setup>
import { alertMeta } from '@ui/components'
import Basic from '@docs-demos/alert/Basic.vue'
import basicSrc from '@docs-demos/alert/Basic.vue?raw'
import Closable from '@docs-demos/alert/Closable.vue'
import closableSrc from '@docs-demos/alert/Closable.vue?raw'
import Icon from '@docs-demos/alert/Icon.vue'
import iconSrc from '@docs-demos/alert/Icon.vue?raw'
</script>

# Alert 警示条

<ComponentDoc :meta="alertMeta" dir="alert">
  <Demo
    title="基础用法"
    anchor="basic"
    description="severity 四档语义柔底：info / success / warning / danger（danger 为 role=alert、其余 role=status）；标题写结论、正文写细节，两者都可选。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="可关闭"
    anchor="closable"
    description="closable 渲染原生关闭按钮（aria-label 为「关闭」），点击仅 emit close——组件不自行隐藏，显隐（v-if）由使用方据此外理。"
    :src="closableSrc"
  >
    <Closable />
  </Demo>

  <Demo
    title="自定义图标"
    anchor="icon"
    description="缺省按 severity 渲染内建语义图标；通过 #icon 插槽覆盖为内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），颜色仍随 severity 语义色。"
    :src="iconSrc"
  >
    <Icon />
  </Demo>
</ComponentDoc>
