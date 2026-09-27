---
title: ScrollArea 滚动区域
---

<script setup>
import { scrollAreaMeta } from '@ui/components'
import Basic from '@docs-demos/scroll-area/Basic.vue'
import basicSrc from '@docs-demos/scroll-area/Basic.vue?raw'
import TypeModes from '@docs-demos/scroll-area/TypeModes.vue'
import typeModesSrc from '@docs-demos/scroll-area/TypeModes.vue?raw'
import Horizontal from '@docs-demos/scroll-area/Horizontal.vue'
import horizontalSrc from '@docs-demos/scroll-area/Horizontal.vue?raw'
</script>

# ScrollArea 滚动区域

<ComponentDoc :meta="scrollAreaMeta" dir="scroll-area">
  <Demo
    title="基础用法"
    anchor="basic"
    description="真实滚动发生在原生可聚焦的 viewport 上（Tab 进入后方向键 / PageUp / PageDown 原生滚动），装饰滚动条按 type='auto'（默认）在悬停或滚动时淡入。使用方必须给定确定高度（如 height 或 flex 拉伸），viewport 以 height:100% 填充容器。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="显隐档位"
    anchor="type-modes"
    description="type 四档对比：always 溢出期间恒定可见；hover 仅悬停时可见；scroll 仅滚动中可见、静默 1s 后隐藏；auto（默认）悬停或滚动中可见。显隐过渡统一走 --ui-motion-default + --ui-ease-out。"
    :src="typeModesSrc"
  >
    <TypeModes />
  </Demo>

  <Demo
    title="横向滚动与 scroll 事件"
    anchor="horizontal"
    description="direction='both' 两个方向均可滚动、均渲染装饰条（被排除方向的溢出会被裁剪且不出条）；@scroll 转发原生事件，从 event.currentTarget 读取 scrollLeft / scrollTop 实时回显。内容尺寸在挂载后变化且 ResizeObserver 覆盖不到时，可调用暴露的 update() 手动重测。"
    :src="horizontalSrc"
  >
    <Horizontal />
  </Demo>
</ComponentDoc>
